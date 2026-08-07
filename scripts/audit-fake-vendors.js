/**
 * Audit fake/demo vendors in MongoDB.
 * Dry-run by default. Pass --delete to remove matches.
 *
 * KEEP real Fiesta vendors (Cloudinary, local images, real DJs, CRM scraped, etc.)
 */
const fs = require('fs');
const path = require('path');
const dns = require('dns');
const { MongoClient } = require('mongodb');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://netaneldama_db_user:Dama3253%21%3F@cluster0.zptzjg6.mongodb.net/fiesta?retryWrites=true&w=majority&appName=Cluster0';

/** Exact names from data/vendors.json seed catalog (demo) */
const SEED_NAMES = [
  "גן אירועים 'טרה'",
  'DJ ELAD',
  'סטודיו פוקוס',
  "קייטרינג 'טעם וצבע'",
  'סטודיו הילה לכלות',
  "בר 'בוטיק'",
  'אפקטים לאירועים',
  'לירון מאפרת כלה',
  'מספרת הקיץ',
  "להקת 'פיאסטה'",
  "רכבי יוקרה 'סמארט'",
  'הזמנות בסטייל',
  "צ'ק-אין אירועים",
  "טקס 'הקודש'",
  'שמחת הלב',
  'מתנה מכל הלב',
  'ארט עיצובים',
  'קלאסיק קאר',
  'הרב אברהם',
  'יהלומי פיאסטה',
  'מלון בוטיק רויאל',
  "הפקות רווקים 'אקשן'",
  'פייטן הלב',
  'הספק הכי טוב',
  'רועי',
  "קייטרינג 'טעם החיים'",
  "קייטרינג 'ארגמן'",
  'DJ AMIR',
  'DJ MAYA',
  "אולם אירועים 'קאלה'",
  'אחוזה בכפר',
  "צילום 'זיכרון מתוק'",
  'סטודיו לוק',
  'אלכוהול פרימיום',
  'בר המלכים',
  'אטרקציות אקסטרים',
  'פיאסטה אטרקציות',
  'איפור בסטייל',
  'סטודיו ביוטי',
  'מספרת הצמרת',
  'שיער ויופי',
  'הזמנות יוקרה',
  'הזמנה דיגיטלית',
  'שמלות הלבן',
  'בוטיק שמלות',
  'חליפות החתן',
  "חליפת הג'נטלמן",
  'הפקות פאר',
  'מפיקי חלומות',
  'מלון הבוטיק',
  'מלון המלכים',
  'טבעות הזהב',
  'תכשיטי היוקרה',
  'רב מרגש',
  'נעלי הכלה שלי',
  'נעלי הנסיכה',
  'נעלי החתן',
  'צעד החתן',
  'דיאטת Fiesta',
  'תזונה נכונה',
  'מאמן אישי VIP',
  'סטודיו פיט',
  'רכבי יוקרה',
  'לימוזין פלוס',
];

const FAKE_PKG_TITLES = [
  'חבילת סטנדרט',
  'חבילת קלאסיק',
  'שדרוג פרימיום',
  'הכל כלול VIP',
  'תוספת אקסטרה',
];

const GENERIC_DESC = [
  /אנחנו ב-/,
  /ברוכים הבאים ל-/,
  /מחפשים שלמות\?/,
  /לא רק מספקים שירות/,
  /יוצרים חוויה\. הצוות המקצועי/,
  /מתגאים במאות זוגות מרוצים/,
  /משב רוח רענן של חדשנות/,
];

const PLACEHOLDER_PHONES = new Set(['050-1234567', '054-2221110', '050-0000000']);

/** Real vendors we must never delete (name substrings / exact) */
const KEEP_NAME_RE =
  /מזל קשאני|חושן|HOSHEN|אנימה|ANIMA|אקפלה|Acapella|שרון|ליאור|איזי|אליהו|נדב|מור גולדשטיין|טפירו|טיפירו|TALPI|נמרוד|דור |אסף|Asaf|Nimrod|Easy|Eliyahu|Lior|Sharon|Acapella|קשאני/i;

function hasUnsplash(v) {
  const blobs = [v.image, ...(v.portfolio || []).map((p) => p && p.image), ...(v.products || []).map((p) => p && p.image)];
  return blobs.some((u) => typeof u === 'string' && /unsplash\.com/i.test(u));
}

function hasFakePackages(v) {
  return (v.portfolio || []).some((p) => p && FAKE_PKG_TITLES.includes(p.title));
}

function hasGenericDesc(v) {
  const d = v.description || '';
  return GENERIC_DESC.some((re) => re.test(d));
}

function isE2E(v) {
  return /Admin CRM Test|test-vendor|E2E/i.test(v.name || '');
}

function isSeedName(v) {
  return SEED_NAMES.includes(v.name);
}

function isPlaceholderContact(v) {
  const c = (v.contact || '').trim();
  return PLACEHOLDER_PHONES.has(c);
}

function looksLikeLocalDemoImage(v) {
  // /images/dj1.jpg style placeholders from old seed (not Cloudinary, not real vendor folders)
  const img = v.image || '';
  return /^\/images\/(dj|venue|photo|catering|makeup|bar|dress|suit)\d*\.(jpg|png|webp)$/i.test(img);
}

function classify(v) {
  if (KEEP_NAME_RE.test(v.name || '')) return null;

  const reasons = [];
  if (isE2E(v)) reasons.push('e2e');
  if (isSeedName(v)) reasons.push('seed-name');
  if (hasFakePackages(v)) reasons.push('fake-packages');
  if (hasGenericDesc(v) && hasUnsplash(v)) reasons.push('generic+unsplash');
  if (isPlaceholderContact(v) && (hasUnsplash(v) || hasGenericDesc(v) || isSeedName(v))) {
    reasons.push('placeholder-phone');
  }
  if (looksLikeLocalDemoImage(v) && (hasGenericDesc(v) || hasFakePackages(v))) {
    reasons.push('demo-local-image');
  }

  // Strong: unsplash main image + fake enhance packages = definitely fake enhance
  if (hasUnsplash(v) && hasFakePackages(v)) reasons.push('unsplash+fake-pkg');

  // Seed leftovers often: unsplash + placeholder/empty contact + no products with real cloudinary
  const emptyContact = !(v.contact || '').trim();
  if (hasUnsplash(v) && emptyContact && !(Array.isArray(v.products) && v.products.length)) {
    reasons.push('unsplash+empty-contact');
  }

  if (!reasons.length) return null;
  return reasons;
}

(async () => {
  const doDelete = process.argv.includes('--delete');
  const c = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 25000 });
  await c.connect();
  const col = c.db('fiesta').collection('vendors');

  const all = await col
    .find({})
    .project({
      name: 1,
      type: 1,
      contact: 1,
      price: 1,
      image: 1,
      description: 1,
      portfolio: 1,
      products: 1,
      id: 1,
    })
    .toArray();

  const byType = {};
  for (const v of all) byType[v.type || '?'] = (byType[v.type || '?'] || 0) + 1;

  const fake = [];
  const keep = [];
  for (const v of all) {
    const reasons = classify(v);
    if (reasons) fake.push({ _id: v._id, name: v.name, type: v.type, contact: v.contact, price: v.price, reasons, unsplash: hasUnsplash(v) });
    else keep.push({ name: v.name, type: v.type, contact: v.contact, price: v.price, unsplash: hasUnsplash(v) });
  }

  const outPath = path.join(__dirname, '..', '_vendor_audit_result.json');
  fs.writeFileSync(
    outPath,
    JSON.stringify({ total: all.length, byType, fakeCount: fake.length, keepCount: keep.length, fake, keep }, null, 2),
    'utf8'
  );

  console.log(
    JSON.stringify(
      {
        total: all.length,
        byType,
        fakeCount: fake.length,
        keepCount: keep.length,
        fakeNames: fake.map((f) => `${f.name} [${f.type}] (${f.reasons.join(',')})`),
        keepSample: keep.slice(0, 40).map((k) => `${k.name} [${k.type}]`),
        doDelete,
      },
      null,
      2
    )
  );

  if (doDelete && fake.length) {
    const ids = fake.map((f) => f._id);
    const result = await col.deleteMany({ _id: { $in: ids } });
    console.log('DELETED', result.deletedCount);
    const remaining = await col.countDocuments();
    const remByType = await col
      .aggregate([{ $group: { _id: '$type', n: { $sum: 1 } } }, { $sort: { n: -1 } }])
      .toArray();
    console.log('remaining', remaining, remByType);
  }

  await c.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
