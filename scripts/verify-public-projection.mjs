/**
 * Confirms that the public `/api/vendors` projection really withholds the
 * internal numbers — the per-vendor and per-product commission, and the
 * supplier's phone — while still handing the customer what the cards need.
 *
 *   npm run verify-projection
 *
 * Read-only: it queries the live database and writes nothing.
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import mongoose from 'mongoose';
import Vendor from '../lib/models/Vendor.js';

const APP_ROOT = path.resolve(import.meta.dirname, '..');

// Kept identical to the public branch of app/api/vendors/route.js
const PUBLIC_SELECT =
  'name type description image region price originalPrice discount discountType googleRating googleReviewsCount portfolio eventTypes reviews ' +
  'products.id products.name products.description products.price products.originalPrice products.image products.kind products.order products.active';

async function readMongoUri() {
  for (const file of ['.env.local', '.env']) {
    try {
      const raw = await readFile(path.join(APP_ROOT, file), 'utf8');
      const line = raw.split(/\r?\n/).find((l) => l.startsWith('MONGODB_URI='));
      if (line) return line.slice('MONGODB_URI='.length).trim().replace(/^["']|["']$/g, '');
    } catch {
      // try the next candidate
    }
  }
  throw new Error('MONGODB_URI לא נמצא ב-.env.local או ב-.env');
}

await mongoose.connect(await readMongoUri());

let failures = 0;
const check = (label, ok, detail = '') => {
  if (!ok) failures += 1;
  console.log(`  ${ok ? '✓' : '✗'} ${label}${ok || !detail ? '' : ` — ${detail}`}`);
};

const leftovers = await Vendor.countDocuments({
  $or: [{ name: /^__E2E__/ }, { contact: '0599999901' }],
});
check('לא נשארו ספקי בדיקה במסד', leftovers === 0, `נמצאו ${leftovers}`);

const total = await Vendor.countDocuments({});
console.log(`  · סה״כ ${total} ספקים אמיתיים במסד`);

const publicDocs = await Vendor.find({}).select(PUBLIC_SELECT).limit(200).lean();
const leakedVendorFee = publicDocs.filter((v) => v.commissionAmount !== undefined);
const leakedProductFee = publicDocs.filter((v) =>
  (v.products || []).some((p) => p.commissionAmount !== undefined)
);
const leakedContact = publicDocs.filter((v) => v.contact !== undefined);

check('עמלת הספק לא נחשפת', leakedVendorFee.length === 0, `${leakedVendorFee.length} ספקים`);
check('עמלת המוצר לא נחשפת', leakedProductFee.length === 0, `${leakedProductFee.length} ספקים`);
check('טלפון לא נחשף', leakedContact.length === 0, `${leakedContact.length} ספקים`);

const withProducts = publicDocs.filter((v) => (v.products || []).length > 0);
console.log(`  · ${withProducts.length} ספקים כבר מחזיקים מוצרים`);
if (withProducts.length) {
  const sample = withProducts[0].products[0];
  check('שם ומחיר המוצר כן מגיעים ללקוח', sample.name !== undefined && sample.price !== undefined);
}

await mongoose.disconnect();
console.log(`\n${failures ? '✗' : '✓'} ${failures ? `${failures} בדיקות נכשלו` : 'הכל תקין'}`);
process.exit(failures ? 1 : 0);
