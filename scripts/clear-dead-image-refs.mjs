/**
 * Clear vendor image fields that still point at dead remote URLs (HTTP 404)
 * after the main migration. Leaves /api/image/... untouched.
 *
 *   node scripts/clear-dead-image-refs.mjs
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import mongoose from 'mongoose';
import { isStoredImageUrl } from '../lib/imageStore.js';

const APP_ROOT = path.resolve(import.meta.dirname, '..');

async function readMongoUri() {
  for (const file of ['.env.local', '.env']) {
    try {
      const raw = await readFile(path.join(APP_ROOT, file), 'utf8');
      const line = raw.split(/\r?\n/).find((l) => l.startsWith('MONGODB_URI='));
      if (line) return line.slice('MONGODB_URI='.length).trim().replace(/^["']|["']$/g, '');
    } catch {
      // next
    }
  }
  throw new Error('MONGODB_URI חסר');
}

async function isDead(url) {
  const s = String(url || '').trim();
  if (!s || isStoredImageUrl(s) || s.startsWith('/')) return false;
  if (!/^https?:\/\//i.test(s)) return false;
  try {
    const res = await fetch(s, {
      method: 'HEAD',
      signal: AbortSignal.timeout(10000),
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FiestaCleanup/1.0)' },
    });
    if (res.status === 404 || res.status === 410) return true;
    // Some hosts reject HEAD — try GET range
    if (res.status === 405 || res.status === 403) {
      const get = await fetch(s, {
        method: 'GET',
        signal: AbortSignal.timeout(10000),
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; FiestaCleanup/1.0)',
          Range: 'bytes=0-0',
        },
      });
      return get.status === 404 || get.status === 410;
    }
    return false;
  } catch {
    return false;
  }
}

await mongoose.connect(await readMongoUri());
const vendors = mongoose.connection.db.collection('vendors');
const all = await vendors.find({}).toArray();
let cleared = 0;

for (const v of all) {
  let dirty = false;

  if (await isDead(v.image)) {
    console.log(`clear image: ${v.name}`);
    v.image = '';
    dirty = true;
    cleared += 1;
  }
  if (await isDead(v.agreementImage)) {
    console.log(`clear agreementImage: ${v.name}`);
    v.agreementImage = '';
    dirty = true;
    cleared += 1;
  }
  for (let i = 0; i < (v.portfolio || []).length; i++) {
    const raw = typeof v.portfolio[i] === 'string' ? v.portfolio[i] : v.portfolio[i]?.image;
    if (await isDead(raw)) {
      console.log(`clear portfolio[${i}]: ${v.name}`);
      if (typeof v.portfolio[i] === 'string') v.portfolio[i] = '';
      else v.portfolio[i].image = '';
      dirty = true;
      cleared += 1;
    }
  }
  for (let i = 0; i < (v.products || []).length; i++) {
    if (await isDead(v.products[i]?.image)) {
      console.log(`clear products[${i}].image: ${v.name}`);
      v.products[i].image = '';
      dirty = true;
      cleared += 1;
    }
  }

  if (dirty) {
    // Drop empty portfolio slots
    v.portfolio = (v.portfolio || []).filter((item) => {
      const img = typeof item === 'string' ? item : item?.image;
      return Boolean(String(img || '').trim());
    });
    await vendors.updateOne(
      { _id: v._id },
      {
        $set: {
          image: v.image || '',
          agreementImage: v.agreementImage || '',
          portfolio: v.portfolio || [],
          products: v.products || [],
          updatedAt: new Date(),
        },
      }
    );
  }
}

console.log(`\nנוקו ${cleared} הפניות מתות`);
await mongoose.disconnect();
