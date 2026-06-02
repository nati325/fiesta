/**
 * End-to-end smoke test for Fiesta admin + vendor APIs
 * Run: node scripts/e2e-admin-test.js [baseUrl]
 */
const BASE = process.argv[2] || 'http://127.0.0.1:3002';

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    // not json
  }
  return { status: res.status, json, text: text.slice(0, 200), headers: res.headers };
}

async function main() {
  const results = [];

  const home = await req('/');
  results.push(['Home page', home.status === 200 ? 'OK' : `FAIL ${home.status}`]);

  const addPage = await req('/admin/add-vendor');
  results.push([
    'Quick add page',
    addPage.status === 200 ? 'OK' : `FAIL ${addPage.status}`,
  ]);

  const vendorsPublic = await req('/api/vendors');
  const vendorCount = Array.isArray(vendorsPublic.json) ? vendorsPublic.json.length : 0;
  results.push([
    'GET /api/vendors',
    vendorsPublic.status === 200 ? `OK (${vendorCount} vendors)` : `FAIL ${vendorsPublic.status}`,
  ]);

  const login = await req('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: process.env.MASTER_ADMIN_EMAIL || 'fiestaafakot@gmail.com',
      password: process.env.MASTER_ADMIN_PASSWORD || 'fiestamadar',
    }),
  });

  if (!login.json?.success || !login.json?.token) {
    results.push(['Admin login', `FAIL: ${login.json?.message || login.status}`]);
    printResults(results);
    process.exit(1);
  }

  const token = login.json.token;
  const authHeaders = { Authorization: `Bearer ${token}` };
  results.push(['Admin login', 'OK']);

  const legacyCheck = await req('/api/patch-vendor-types', { headers: authHeaders });
  results.push([
    'Legacy categories check',
    legacyCheck.status === 200
      ? `OK (${legacyCheck.json?.total || 0} to fix)`
      : `FAIL ${legacyCheck.status}`,
  ]);

  const testName = `E2E Test ${Date.now()}`;
  const create = await req('/api/vendors', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: testName,
      type: 'dj',
      contact: '0500000000',
      region: 'מרכז',
      price: '5000',
      originalPrice: '6000',
      discount: '17',
      discountType: 'percent',
      commissionAmount: 500,
      eventTypes: ['חתונה'],
      googleReviewsLink: '',
      agreementSigned: false,
    }),
  });

  const createdId = create.json?.id || create.json?._id;
  results.push([
    'POST /api/vendors (admin)',
    create.status === 201 ? `OK id=${createdId}` : `FAIL ${create.status}: ${create.json?.message || create.text}`,
  ]);

  if (createdId) {
    const del = await req(`/api/vendors/${createdId}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    results.push(['DELETE test vendor', del.status === 200 ? 'OK (cleaned up)' : `FAIL ${del.status}`]);
  }

  printResults(results);
}

function printResults(results) {
  console.log(`\n=== Fiesta E2E @ ${BASE} ===\n`);
  for (const [name, status] of results) {
    console.log(`${status.startsWith('OK') ? '✅' : '❌'} ${name}: ${status}`);
  }
  console.log('');
}

main().catch((err) => {
  console.error('E2E failed:', err.message);
  process.exit(1);
});
