/**
 * Fix known missing-letter artifacts from mojibake decode (נ lost).
 * Usage: node scripts/fix-spelling-artifacts.js [--dry-run]
 */
const fs = require('fs');
const { MongoClient } = require('mongodb');
const { findSuppliersJson, findScrapingEnv } = require('./crm-data-paths');

function loadEnvFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return {};
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

const REPLACEMENTS = [
  [/רקע ופים/g, 'רקע נופים'],
  [/אחו רוק/g, 'אנחנו רוק'],
  [/מרהיב וחדשי ב/g, 'מרהיב וחדשני ב'],
  [/תאורה חדשית/g, 'תאורה חדשנית'],
  [/סטילס ומגטים/g, 'סטילס ומגנטים'],
  [/([\s,—–-])יסיון מוכח/g, '$1ניסיון מוכח'],
  [/בר מצווה, חתוה, חיה/g, 'בר מצווה, חתונה, חינה'],
];

function fixDescription(text) {
  let out = text || '';
  for (const [pattern, replacement] of REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }
  return out.trim();
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const jsonPath = findSuppliersJson();
  const all = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const fixedIds = [];

  for (const s of all) {
    const before = s.description || '';
    const after = fixDescription(before);
    if (after === before) continue;

    console.log(`[${s.id}] ${(s.clean_name || s.name || '').split('|')[0].trim()}`);
    console.log(`  BEFORE: ${before.slice(0, 90)}`);
    console.log(`  AFTER : ${after.slice(0, 90)}`);

    if (!dryRun) {
      s.description = after;
      s.contentCleanVersion = 5;
      fixedIds.push(s.id);
    }
  }

  if (!dryRun && fixedIds.length) {
    fs.writeFileSync(jsonPath, JSON.stringify(all, null, 2), 'utf8');
    console.log(`\nעודכן ${fixedIds.length} תיאורים ב-${jsonPath}`);

    const env = loadEnvFile(findScrapingEnv());
    if (env.MONGODB_URI) {
      const client = new MongoClient(env.MONGODB_URI);
      await client.connect();
      const col = client.db('fiesta_crm').collection('suppliers');
      let mongo = 0;
      for (const id of fixedIds) {
        const s = all.find((x) => x.id === id);
        const phone = s?.real_phone || s?.phone;
        if (!phone) continue;
        const res = await col.updateOne(
          { $or: [{ phone }, { real_phone: phone }] },
          { $set: { description: s.description, contentCleanVersion: 5 } }
        );
        if (res.matchedCount) mongo += 1;
      }
      await client.close();
      console.log(`MongoDB: ${mongo} עודכנו`);
    }
  } else {
    console.log(`\n${dryRun ? 'dry-run: ' : ''}${fixedIds.length || 0} תיאורים לתיקון`);
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
