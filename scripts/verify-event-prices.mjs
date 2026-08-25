/**
 * Confirms Fiesta can receive CRM per-event pricing: customer prices by event
 * type, package filtering, and that company commission stays off the public
 * eventPrices projection.
 *
 *   node scripts/verify-event-prices.mjs
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pickEventPrice, cheapestEventPrice, vendorFitsEvent } from '../lib/eventTypes.js';
import { getVendorDisplayPrice, getPackages, parsePrice } from '../lib/vendorPrice.js';

let failures = 0;
const check = (label, ok, detail = '') => {
  if (!ok) failures += 1;
  console.log(`  ${ok ? '✓' : '✗'} ${label}${ok || !detail ? '' : ` — ${detail}`}`);
};

const vendor = {
  name: 'ספק בדיקה',
  price: '8000',
  originalPrice: '10000',
  discount: '20',
  eventTypes: ['חתונה', 'בר מצווה'],
  eventTypesExplicit: true,
  eventPrices: [
    {
      eventType: 'חתונה',
      originalPrice: '12000',
      price: '9600',
      discount: '20',
      discountType: 'percent',
      commissionPercent: 15,
      commissionAmount: 1800,
    },
    {
      eventType: 'בר מצווה',
      originalPrice: '8000',
      price: '7200',
      discount: '10',
      discountType: 'percent',
      commissionPercent: 8,
      commissionAmount: 640,
    },
  ],
  products: [
    {
      id: 'evt1',
      name: 'חתונה',
      price: '9600',
      originalPrice: '12000',
      kind: 'main',
      eventType: 'חתונה',
      active: true,
    },
    {
      id: 'p-real',
      name: 'חבילת פרימיום',
      price: '15000',
      originalPrice: '18000',
      kind: 'main',
      eventType: '',
      active: true,
    },
  ],
};

console.log('קבלה של מחיר לפי סוג אירוע');

check(
  'מחיר חתונה נמשך משורת האירוע',
  parsePrice(getVendorDisplayPrice(vendor, 'חתונה').raw) === 9600,
  String(getVendorDisplayPrice(vendor, 'חתונה').raw)
);
check(
  'מחיר בר מצווה נמשך משורת האירוע',
  parsePrice(getVendorDisplayPrice(vendor, 'בר מצווה').raw) === 7200
);
check(
  'בלי העדפת אירוע מוצג הזול ביותר',
  parsePrice(getVendorDisplayPrice(vendor).raw) === 7200
);
check('הנחה של חתונה 20%', getVendorDisplayPrice(vendor, 'חתונה').savings === 2400);
check('הנחה של בר מצווה 10%', getVendorDisplayPrice(vendor, 'בר מצווה').savings === 800);
check('pickEventPrice מוצא בר מצווה', pickEventPrice(vendor, 'בר מצווה')?.price === '7200');
check('cheapestEventPrice הוא בר מצווה', cheapestEventPrice(vendor)?.eventType === 'בר מצווה');
check('הספק לא מוצג ליום הולדת', vendorFitsEvent(vendor, 'יום הולדת') === false);
check('הספק כן מוצג לחתונה', vendorFitsEvent(vendor, 'חתונה') === true);
check(
  'ספק לכל האירועים מוצג גם ליום הולדת',
  vendorFitsEvent({ eventTypes: ['מתאים לכל האירועים'] }, 'יום הולדת') === true
);
check(
  'ספק חתונה בלבד לא מוצג לבר מצווה',
  vendorFitsEvent({ eventTypes: ['חתונה'], eventTypesExplicit: false }, 'בר מצווה') === false
);
check(
  'בלי סוג אירוע נבחר — כולם מוצגים',
  vendorFitsEvent({ eventTypes: ['חתונה'] }, '') === true
);

const packages = getPackages(vendor, 'חתונה');
check(
  'חבילות לא כוללות שיבוט של eventPrices',
  packages.length === 1 && packages[0].name === 'חבילת פרימיום',
  packages.map((p) => p.name).join(', ')
);

const samePriceVendor = {
  ...vendor,
  eventPrices: [],
  products: [],
  price: '9000',
  originalPrice: '10000',
};
check(
  'אותו מחיר לכל האירועים → מחיר הספק',
  parsePrice(getVendorDisplayPrice(samePriceVendor, 'חתונה').raw) === 9000
);

const route = await readFile(path.resolve(import.meta.dirname, '../app/api/vendors/route.js'), 'utf8');
check(
  'API ציבורי מחזיר מחיר לפי אירוע בלי עמלת חברה',
  route.includes('eventPrices.price')
    && route.includes('eventPrices.eventType')
    && !route.includes('eventPrices.commissionPercent')
    && !route.includes('eventPrices.commissionAmount')
);

const schema = await readFile(path.resolve(import.meta.dirname, '../lib/models/Vendor.js'), 'utf8');
check(
  'מודל Vendor שומר commissionPercent לכל סוג אירוע',
  schema.includes('commissionPercent') && schema.includes('eventPrices')
);

console.log(`\n${failures ? '✗' : '✓'} ${failures ? `${failures} בדיקות נכשלו` : 'האתר יודע לקבל מחיר לפי סוג אירוע'}`);
process.exit(failures ? 1 : 0);
