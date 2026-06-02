/**
 * Fix nbsp / mojibake in already-cleaned supplier descriptions.
 * Usage: node scripts/fix-encoding-issues.js [--dry-run] [--ids 233,234]
 */
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

function findSuppliersJson() {
  const roots = [path.join(__dirname, '..', '..', '..'), path.join(__dirname, '..', '..')];
  for (const root of roots) {
    try {
      for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
        if (entry.isDirectory() && entry.name.includes('scarping')) {
          const jsonPath = path.join(root, entry.name, 'data', 'suppliers_complete.json');
          if (fs.existsSync(jsonPath) && !/[\u200f\u202a-\u202e]/.test(jsonPath)) return jsonPath;
        }
      }
    } catch {
      // skip
    }
  }
  return null;
}

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

function fixMojibake(text) {
  if (!text || !/×/.test(text)) return text;
  try {
    const t = text.replace(/×\s+([\u0080-\u00FF])/g, '×$1');
    const fixed = Buffer.from(t, 'latin1').toString('utf8').replace(/\uFFFD/g, '');
    const heBefore = (text.match(/[א-ת]/g) || []).length;
    const heAfter = (fixed.match(/[א-ת]/g) || []).length;
    if (heAfter > heBefore && heAfter >= 8) return fixed.replace(/\s{2,}/g, ' ').trim();
  } catch {
    // ignore
  }
  return text;
}

function decodeHtmlEntities(text) {
  if (!text) return '';
  return text
    .replace(/&nbsp;|&#160;|&#xA0;/gi, ' ')
    .replace(/\bnbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function cleanText(text) {
  return decodeHtmlEntities(fixMojibake(text || ''))
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function hasIssue(text) {
  return /\bnbsp;/i.test(text || '') || /×/.test(text || '') || /\uFFFD/.test(text || '');
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const idsArg = process.argv.indexOf('--ids');
  const filterIds =
    idsArg !== -1
      ? process.argv[idsArg + 1].split(',').map((x) => parseInt(x.trim(), 10)).filter(Boolean)
      : null;

  const jsonPath = findSuppliersJson();
  if (!jsonPath) throw new Error('suppliers_complete.json not found');

  const all = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  let fixed = 0;
  const fixedIds = [];

  for (const s of all) {
    if (filterIds && !filterIds.includes(s.id)) continue;
    if (!hasIssue(s.description)) continue;

    const before = s.description;
    const after = cleanText(before);
    if (after === before || after.length < 12) continue;

    console.log(`[${s.id}] ${(s.clean_name || s.name || '').split('|')[0].trim()}`);
    console.log(`  BEFORE: ${before.slice(0, 90)}`);
    console.log(`  AFTER : ${after.slice(0, 90)}`);

    if (!dryRun) {
      s.description = after;
      s.contentCleanVersion = 5;
      fixedIds.push(s.id);
    }
    fixed += 1;
  }

  if (!dryRun && fixed) {
    fs.writeFileSync(jsonPath, JSON.stringify(all, null, 2), 'utf8');
    console.log(`\nעודכן ${fixed} תיאורים ב-${jsonPath}`);

    const env = loadEnvFile(path.join(__dirname, '..', '..', '..', 'scarping_for_fiesta - עותק', '.env.local'));
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
    console.log(`\n${dryRun ? 'dry-run: ' : ''}נמצאו ${fixed} תיאורים לתיקון`);
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
