const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i < 0) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

const { findSuppliersJson, findScrapingEnv } = require('./crm-data-paths');

loadEnv(path.join(__dirname, '..', '.env'));
const scrapingEnv = findScrapingEnv();
if (scrapingEnv) loadEnv(scrapingEnv);

async function main() {
  const scrapingJson = findSuppliersJson();
  if (fs.existsSync(scrapingJson)) {
    const arr = JSON.parse(fs.readFileSync(scrapingJson, 'utf8'));
    console.log('suppliers_complete.json:', arr.length, '→', scrapingJson);
  }

  const fiestaUri = process.env.MONGODB_URI || process.env.FIESTA_MONGODB_URI;
  let crmUri = process.env.CRM_MONGODB_URI;
  if (!crmUri && fs.existsSync(scrapingEnv)) {
    for (const line of fs.readFileSync(scrapingEnv, 'utf8').split(/\r?\n/)) {
      const t = line.trim();
      if (t.startsWith('MONGODB_URI=')) {
        crmUri = t.slice('MONGODB_URI='.length).trim().replace(/^["']|["']$/g, '');
        break;
      }
    }
  }

  for (const [label, uri, dbName, coll] of [
    ['Fiesta vendors', fiestaUri, 'fiesta', 'vendors'],
    ['CRM suppliers', crmUri, 'fiesta_crm', 'suppliers'],
  ]) {
    if (!uri) {
      console.log(label + ': no URI');
      continue;
    }
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 25000 });
    await client.connect();
    const n = await client.db(dbName).collection(coll).countDocuments();
    const cleaned = await client
      .db(dbName)
      .collection(coll)
      .countDocuments({ cleaned_by_gemini: true });
    const contentCleaned = await client
      .db(dbName)
      .collection(coll)
      .countDocuments({ contentCleanedAt: { $exists: true } });
    console.log(`${label} (${dbName}.${coll}): total=${n}, cleaned_by_gemini=${cleaned}, contentCleanedAt=${contentCleaned}`);
    await client.close();
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
