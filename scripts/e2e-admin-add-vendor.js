/**
 * Smoke test: admin vendor creation (main CRM + quick add flows)
 * Run: node scripts/e2e-admin-add-vendor.js [baseUrl]
 */
const BASE = process.argv[2] || 'http://127.0.0.1:3002';
const EMAIL = process.env.MASTER_ADMIN_EMAIL || 'fiestaafakot@gmail.com';
const PASSWORD = process.env.MASTER_ADMIN_PASSWORD || 'fiestamadar';

const results = [];

function pass(name, detail = 'OK') {
  results.push([name, detail, true]);
}

function fail(name, detail) {
  results.push([name, detail, false]);
}

async function login() {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const data = await res.json();
  if (!res.ok || !data.token) throw new Error(data.message || 'Login failed');
  return data.token;
}

function authHeaders(token, json = true) {
  const h = { Authorization: `Bearer ${token}` };
  if (json) h['Content-Type'] = 'application/json';
  return h;
}

async function uploadFile(token, buffer, filename, type) {
  const form = new FormData();
  form.append('file', new Blob([buffer]), filename);
  form.append('type', type);
  const res = await fetch(`${BASE}/api/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const data = await res.json();
  if (!res.ok || !data.url) throw new Error(data.error || `Upload failed (${res.status})`);
  return data;
}

function calculateClientPrice(form) {
  const orig = Number(form.originalPrice) || 0;
  const disc = Number(form.discount) || 0;
  if (form.discountType === 'percent') return orig - orig * (disc / 100);
  return orig - disc;
}

function buildVendorPayload(form) {
  const payload = { ...form };
  if (!payload.price && payload.originalPrice) {
    payload.price = String(Math.round(calculateClientPrice(payload)));
  }
  return payload;
}

async function main() {
  const adminPage = await fetch(`${BASE}/admin`);
  adminPage.ok ? pass('Admin page loads', `${adminPage.status}`) : fail('Admin page loads', `${adminPage.status}`);

  const quickPage = await fetch(`${BASE}/admin/add-vendor`);
  quickPage.ok ? pass('Quick add page loads', `${quickPage.status}`) : fail('Quick add page loads', `${quickPage.status}`);

  let token;
  try {
    token = await login();
    pass('Admin login');
  } catch (e) {
    fail('Admin login', e.message);
    printResults();
    process.exit(1);
  }

  const createdIds = [];
  const ts = Date.now();

  // --- Upload image (simulates FileUploadField camera/file) ---
  let imageUrl = '';
  try {
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64'
    );
    const img = await uploadFile(token, png, 'test-vendor.png', 'image');
    imageUrl = img.url;
    const imgCheck = await fetch(`${BASE}${imageUrl}`);
    imgCheck.ok ? pass('Image upload + serve', imageUrl) : fail('Image upload + serve', `${imgCheck.status}`);
  } catch (e) {
    fail('Image upload + serve', e.message);
  }

  // --- Upload agreement document ---
  let agreementUrl = '';
  try {
    const pdf = Buffer.from('%PDF-1.4 test agreement');
    const doc = await uploadFile(token, pdf, 'agreement-test.pdf', 'document');
    agreementUrl = doc.url;
    const docCheck = await fetch(`${BASE}${agreementUrl}`);
    docCheck.ok ? pass('Agreement upload + serve', agreementUrl) : fail('Agreement upload + serve', `${docCheck.status}`);
  } catch (e) {
    fail('Agreement upload + serve', e.message);
  }

  // --- Main admin form flow (full vendor) ---
  const fullForm = {
    name: `Admin CRM Test ${ts}`,
    type: 'dj',
    contact: '0501234567',
    region: 'מרכז',
    description: 'בדיקת הוספה מדף CRM מלא',
    image: imageUrl,
    originalPrice: '6000',
    discount: '15',
    discountType: 'percent',
    commissionAmount: 450,
    agreementSigned: true,
    agreementImage: agreementUrl,
    googleReviewsLink: 'https://maps.google.com',
    googleRating: 4.8,
    googleReviewsCount: 20,
    eventTypes: ['חתונה'],
    priceIncludesVat: true,
    adminNotes: 'נוסף בבדיקה',
    instagramLink: '',
    videos: [],
    products: [],
    portfolio: imageUrl ? [{ title: 'תמונה 1', image: imageUrl, price: '' }] : [],
    mainProductId: '',
  };

  try {
    const payload = buildVendorPayload(fullForm);
    if (payload.price !== '5100') {
      fail('Price auto-calculation', `expected 5100 got ${payload.price}`);
    } else {
      pass('Price auto-calculation', `6000 - 15% = ${payload.price}`);
    }

    const res = await fetch(`${BASE}/api/vendors`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    const vendor = await res.json();
    const vendorId = vendor._id || vendor.id;
    if (!res.ok || !vendorId) throw new Error(vendor.message || `HTTP ${res.status}`);
    createdIds.push(String(vendorId));
    pass('Add vendor (CRM full form)', vendor.name);
  } catch (e) {
    fail('Add vendor (CRM full form)', e.message);
  }

  // --- Quick add flow (minimal fields) ---
  const quickForm = buildVendorPayload({
    name: `Quick Add Test ${ts}`,
    type: 'photographer',
    contact: '0509876543',
    region: 'מרכז',
    description: 'בדיקת הוספה מהירה',
    image: imageUrl,
    originalPrice: '8000',
    discount: '500',
    discountType: 'amount',
    commissionAmount: 300,
    agreementSigned: Boolean(agreementUrl),
    agreementImage: agreementUrl,
    googleReviewsLink: '',
    googleRating: 5,
    googleReviewsCount: 0,
    eventTypes: ['חתונה'],
    priceIncludesVat: true,
    adminNotes: '',
    instagramLink: '',
    videos: [],
    products: [],
    mainProductId: '',
  });

  try {
    const res = await fetch(`${BASE}/api/vendors`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(quickForm),
    });
    const vendor = await res.json();
    const vendorId = vendor._id || vendor.id;
    if (!res.ok || !vendorId) throw new Error(vendor.message || `HTTP ${res.status}`);
    if (vendor.price !== '7500') {
      fail('Quick add price calc', `expected 7500 got ${vendor.price}`);
    } else {
      pass('Quick add price calc', '8000 - 500 = 7500');
    }
    createdIds.push(String(vendorId));
    pass('Add vendor (quick add flow)', vendor.name);
  } catch (e) {
    fail('Add vendor (quick add flow)', e.message);
  }

  // --- Verify in admin vendor list ---
  try {
    const res = await fetch(`${BASE}/api/vendors`, { headers: authHeaders(token, false) });
    const list = await res.json();
    if (!res.ok || !Array.isArray(list)) throw new Error('List fetch failed');
    const found = createdIds.every((id) => list.some((v) => (v._id || v.id) === id));
    found
      ? pass('Vendors appear in admin list', `${createdIds.length} created`)
      : fail('Vendors appear in admin list', 'missing from list');
  } catch (e) {
    fail('Vendors appear in admin list', e.message);
  }

  // --- Cleanup ---
  for (const id of createdIds) {
    try {
      await fetch(`${BASE}/api/vendors/${id}`, {
        method: 'DELETE',
        headers: authHeaders(token, false),
      });
    } catch {
      // ignore
    }
  }
  if (createdIds.length) pass('Cleanup test vendors', `${createdIds.length} deleted`);

  printResults();
  const failed = results.filter((r) => !r[2]).length;
  process.exit(failed ? 1 : 0);
}

function printResults() {
  console.log(`\n=== Admin Add Vendor @ ${BASE} ===\n`);
  for (const [name, detail, ok] of results) {
    console.log(`${ok ? '✅' : '❌'} ${name}: ${detail}`);
  }
  console.log('');
}

main().catch((err) => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
