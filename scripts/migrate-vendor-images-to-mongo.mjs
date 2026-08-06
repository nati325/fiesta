/**
 * One-time migration: pull every live vendor image into fiesta.images and rewrite
 * the vendor fields to `/api/image/<sha256>`.
 *
 * No Cloudinary SDK — public HTTP URLs are fetched with plain fetch.
 *
 *   npm run migrate-images
 *   npm run migrate-images -- --dry-run
 */

import { readFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';
import {
  putImage,
  isStoredImageUrl,
  imagesCollectionBytes,
  contentTypeFromName,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
} from '../lib/imageStore.js';

const APP_ROOT = path.resolve(import.meta.dirname, '..');
const DRY = process.argv.includes('--dry-run');

async function readMongoUri() {
  for (const file of ['.env.local', '.env']) {
    try {
      const raw = await readFile(path.join(APP_ROOT, file), 'utf8');
      const line = raw.split(/\r?\n/).find((l) => l.startsWith('MONGODB_URI='));
      if (line) {
        return line.slice('MONGODB_URI='.length).trim().replace(/^["']|["']$/g, '');
      }
    } catch {
      // try next
    }
  }
  throw new Error('MONGODB_URI חסר');
}

function collectRefs(vendor) {
  const refs = [];
  const push = (field, value) => {
    const s = String(value || '').trim();
    if (!s || s === 'N/A' || s === 'nan' || s === '[stored]') return;
    if (/^\d+$/.test(s)) {
      refs.push({ field, value: s, skip: true, reason: 'ערך מספרי שבור' });
      return;
    }
    refs.push({ field, value: s });
  };

  push('image', vendor.image);
  push('agreementImage', vendor.agreementImage);
  (vendor.portfolio || []).forEach((item, i) => {
    push(`portfolio[${i}].image`, typeof item === 'string' ? item : item?.image);
  });
  (vendor.products || []).forEach((p, i) => {
    push(`products[${i}].image`, p?.image);
  });
  return refs;
}

async function loadBytes(value) {
  if (isStoredImageUrl(value)) return { skip: true, reason: 'כבר במונגו' };

  if (value.startsWith('http://') || value.startsWith('https://')) {
    const res = await fetch(value, {
      signal: AbortSignal.timeout(20000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FiestaMigrate/1.0)',
        Accept: 'image/*,video/*,application/pdf;q=0.9,*/*;q=0.5',
      },
      redirect: 'follow',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    if (!buffer.length) throw new Error('ריק');
    if (buffer.length > MAX_IMAGE_BYTES) throw new Error('גדול מדי');
    const declared = res.headers.get('content-type')?.split(';')[0]?.trim() || '';
    const fromName = contentTypeFromName(new URL(value).pathname);
    const contentType = declared || fromName || 'application/octet-stream';
    if (/^video\//i.test(contentType) && buffer.length > MAX_VIDEO_BYTES) {
      throw new Error('וידאו גדול מדי');
    }
    return {
      buffer,
      contentType,
      fileName: path.basename(new URL(value).pathname) || 'image',
    };
  }

  if (value.startsWith('/')) {
    const abs = path.join(APP_ROOT, 'public', value.replace(/^\//, '').split('?')[0]);
    if (!existsSync(abs)) throw new Error(`חסר בדיסק: ${abs}`);
    const buffer = readFileSync(abs);
    if (buffer.length > MAX_IMAGE_BYTES) throw new Error('גדול מדי');
    const contentType = contentTypeFromName(abs) || 'application/octet-stream';
    if (/^video\//i.test(contentType) && buffer.length > MAX_VIDEO_BYTES) {
      throw new Error('וידאו גדול מדי');
    }
    return { buffer, contentType, fileName: path.basename(abs) };
  }

  throw new Error('סוג מקור לא נתמך');
}

function setByPath(vendor, field, nextValue) {
  const portfolioMatch = /^portfolio\[(\d+)\]\.image$/.exec(field);
  if (portfolioMatch) {
    const i = Number(portfolioMatch[1]);
    if (!vendor.portfolio?.[i]) return;
    if (typeof vendor.portfolio[i] === 'string') vendor.portfolio[i] = nextValue;
    else vendor.portfolio[i].image = nextValue;
    return;
  }
  const productMatch = /^products\[(\d+)\]\.image$/.exec(field);
  if (productMatch) {
    const i = Number(productMatch[1]);
    if (!vendor.products?.[i]) return;
    vendor.products[i].image = nextValue;
    return;
  }
  vendor[field] = nextValue;
}

await mongoose.connect(await readMongoUri());
const db = mongoose.connection.db;
const vendors = db.collection('vendors');

const beforeBytes = await imagesCollectionBytes(db);
console.log(`\n${DRY ? '[DRY-RUN] ' : ''}מיגרציית תמונות → fiesta.images`);
console.log(`  גודל images לפני: ${(beforeBytes / 1048576).toFixed(2)} MB\n`);

const all = await vendors.find({}).toArray();
let migrated = 0;
let skipped = 0;
let failed = 0;
let cleared = 0;

for (const vendor of all) {
  const refs = collectRefs(vendor);
  let dirty = false;

  for (const ref of refs) {
    if (ref.skip) {
      setByPath(vendor, ref.field, '');
      dirty = true;
      cleared += 1;
      console.log(`  ✗ ${vendor.name} · ${ref.field} — נוקה (${ref.reason}: ${ref.value})`);
      continue;
    }

    if (isStoredImageUrl(ref.value)) {
      skipped += 1;
      continue;
    }

    try {
      const loaded = await loadBytes(ref.value);
      if (loaded.skip) {
        skipped += 1;
        continue;
      }

      if (DRY) {
        console.log(
          `  · ${vendor.name} · ${ref.field} → ${(loaded.buffer.length / 1024).toFixed(0)}KB (${loaded.contentType})`
        );
        migrated += 1;
        continue;
      }

      const stored = await putImage(db, loaded.buffer, {
        contentType: loaded.contentType,
        fileName: loaded.fileName,
      });
      setByPath(vendor, ref.field, stored.url);
      dirty = true;
      migrated += 1;
      console.log(
        `  ✓ ${vendor.name} · ${ref.field} → ${stored.url.slice(0, 28)}…${stored.deduped ? ' (dedup)' : ''}`
      );
    } catch (error) {
      failed += 1;
      console.log(`  ✗ ${vendor.name} · ${ref.field} — ${error.message}`);
    }
  }

  if (dirty && !DRY) {
    await vendors.updateOne(
      { _id: vendor._id },
      {
        $set: {
          image: vendor.image,
          agreementImage: vendor.agreementImage,
          portfolio: vendor.portfolio,
          products: vendor.products,
          updatedAt: new Date(),
        },
      }
    );
  }
}

const afterBytes = await imagesCollectionBytes(db);
const leftover = await vendors
  .find({
    $or: [
      { image: /cloudinary/i },
      { agreementImage: /cloudinary/i },
      { 'portfolio.image': /cloudinary/i },
      { 'products.image': /cloudinary/i },
    ],
  })
  .project({ name: 1 })
  .toArray();

console.log(`\nסיכום:`);
console.log(`  הועברו/זוהו: ${migrated}`);
console.log(`  כבר במונגו: ${skipped}`);
console.log(`  נוקו (שבורים): ${cleared}`);
console.log(`  נכשלו: ${failed}`);
console.log(`  גודל images אחרי: ${(afterBytes / 1048576).toFixed(2)} MB`);
console.log(`  ספקים שעדיין מצביעים ל-cloudinary: ${leftover.length}`);
if (leftover.length) leftover.forEach((v) => console.log(`    - ${v.name}`));

await mongoose.disconnect();
process.exit(leftover.length ? 1 : 0);
