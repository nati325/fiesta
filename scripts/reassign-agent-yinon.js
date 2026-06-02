/**
 * Reassign Yinon's supplier pool from מוזיקה → צלמים in fiesta_crm.supplier_states
 * Usage:
 *   node scripts/reassign-agent-yinon.js --inspect
 *   node scripts/reassign-agent-yinon.js --apply
 */
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const AGENT = 'ינון';
const FROM_CATEGORY = 'מוזיקה';
const TO_CATEGORY = 'צלמים';

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const out = {};
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i < 0) continue;
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    out[t.slice(0, i).trim()] = v;
  }
  return out;
}

function findCrmUri() {
  const candidates = [
    process.env.CRM_MONGODB_URI,
    process.env.MONGODB_URI,
    loadEnvFile(path.join(__dirname, '..', '..', '..', 'scarping_for_fiesta', '.env.local')).MONGODB_URI,
    loadEnvFile('C:/Users/123/Desktop/scarping_for_fiesta/.env.local').MONGODB_URI,
  ].filter(Boolean);
  return candidates[0];
}

function normPhone(p) {
  return String(p || '').replace(/\D/g, '');
}

function supplierPhone(s) {
  return s['Real Phone'] || s.real_phone || s.Phone || s.phone || s._id;
}

async function main() {
  const apply = process.argv.includes('--apply');
  const uri = findCrmUri();
  if (!uri) throw new Error('CRM MONGODB_URI not found');

  const jsonPath = path.join(__dirname, '..', '..', '..', 'scarping_for_fiesta - עותק', 'data', 'suppliers_complete.json');
  const catalog = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  const byPhone = new Map();
  for (const s of catalog) {
    const phone = normPhone(supplierPhone(s));
    if (phone) byPhone.set(phone, s);
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('fiesta_crm');
  const statesCol = db.collection('supplier_states');

  const yinonStates = await statesCol.find({ agent: AGENT }).toArray();
  const enriched = yinonStates.map((st) => {
    const phone = normPhone(st._id || st.phone || st['Real Phone']);
    const sup = byPhone.get(phone);
    return {
      phone,
      status: st.status,
      category: sup?.category || st.category || '?',
      name: sup?.clean_name || sup?.name || st.name || phone,
    };
  });

  const music = enriched.filter((x) => x.category === FROM_CATEGORY);
  const photographers = catalog.filter((s) => s.category === TO_CATEGORY);
  const photographerPhones = new Set(
    photographers.map((s) => normPhone(supplierPhone(s))).filter(Boolean)
  );

  const alreadyPhoto = enriched.filter((x) => x.category === TO_CATEGORY);
  const yinonPhotoPhones = new Set(alreadyPhoto.map((x) => x.phone));

  const candidatePhotos = photographers
    .map((s) => ({
      phone: normPhone(supplierPhone(s)),
      name: s.clean_name || s.name,
      id: s.id,
    }))
    .filter((s) => s.phone && !yinonPhotoPhones.has(s.phone));

  const existingStates = await statesCol.find({ _id: { $in: candidatePhotos.map((c) => c.phone) } }).toArray();
  const stateByPhone = new Map(existingStates.map((st) => [normPhone(st._id), st]));

  const toAssign = candidatePhotos.slice(0, music.length);

  console.log(`\n=== ${AGENT} — inspect ===`);
  console.log(`Total assigned to ${AGENT}: ${yinonStates.length}`);
  console.log(`Music (${FROM_CATEGORY}): ${music.length}`);
  console.log(`Already photographers: ${alreadyPhoto.length}`);
  console.log(`Photographers in catalog: ${photographers.length}`);
  console.log(`Will assign ${toAssign.length} new photographers (match music count)\n`);

  if (music.length) {
    console.log('Current music suppliers:');
    for (const m of music.slice(0, 20)) console.log(`  • ${m.name} (${m.phone}) [${m.status}]`);
    if (music.length > 20) console.log(`  ... +${music.length - 20} more`);
  }

  if (toAssign.length) {
    console.log('\nNew photographer assignments:');
    for (const p of toAssign.slice(0, 20)) console.log(`  • [${p.id}] ${p.name} (${p.phone})`);
    if (toAssign.length > 20) console.log(`  ... +${toAssign.length - 20} more`);
  }

  if (!apply) {
    console.log('\nDry-run only. Run with --apply to execute.');
    await client.close();
    return;
  }

  let removed = 0;
  for (const m of music) {
    const res = await statesCol.updateOne(
      { _id: m.phone },
      { $unset: { agent: '' }, $set: { reassignedFrom: AGENT, reassignedAt: new Date().toISOString() } }
    );
    if (res.matchedCount) removed += 1;
  }

  let assigned = 0;
  for (const p of toAssign) {
    const existing = stateByPhone.get(p.phone);
    const doc = {
      agent: AGENT,
      status: existing?.status || 'pending',
      assignedAt: new Date().toISOString(),
      assignedCategory: TO_CATEGORY,
    };
    const res = await statesCol.updateOne({ _id: p.phone }, { $set: doc }, { upsert: true });
    if (res.upsertedCount || res.modifiedCount) assigned += 1;
  }

  const after = await statesCol.find({ agent: AGENT }).toArray();
  const afterEnriched = after.map((st) => {
    const phone = normPhone(st._id);
    const sup = byPhone.get(phone);
    return sup?.category || '?';
  });
  const catCounts = afterEnriched.reduce((a, c) => {
    a[c] = (a[c] || 0) + 1;
    return a;
  }, {});

  console.log(`\nDone. Removed agent from ${removed} music suppliers. Assigned ${assigned} photographers.`);
  console.log(`${AGENT} categories now:`, catCounts);

  await client.close();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
