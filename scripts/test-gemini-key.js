/**
 * בדיקת מפתח Gemini — לא מדפיס את המפתח המלא
 *
 * Usage:
 *   node scripts/test-gemini-key.js
 *   node scripts/test-gemini-key.js YOUR_KEY_HERE
 *   node scripts/test-gemini-key.js --list-models
 */
const fs = require('fs');
const path = require('path');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const out = {};
  for (const line of fs.readFileSync(filePath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function findEnvLocalFiles() {
  const roots = [
    path.join(__dirname, '..', '..', '..'),
    path.join(__dirname, '..', '..'),
  ];
  const found = [];
  function walk(dir, depth) {
    if (depth > 3) return;
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isFile() && entry.name === '.env.local') found.push(full);
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        walk(full, depth + 1);
      }
    }
  }
  for (const root of roots) {
    if (fs.existsSync(root)) walk(root, 0);
  }
  return found;
}

function loadKeys() {
  const cliKey = process.argv.find((a) => a.startsWith('AIza'));
  if (cliKey) return [cliKey];

  const env = loadEnvFile(path.join(__dirname, '..', '.env'));
  for (const file of findEnvLocalFiles()) {
    const local = loadEnvFile(file);
    if (local.GEMINI_API_KEY) env.GEMINI_API_KEY = local.GEMINI_API_KEY;
  }

  const raw = env.GEMINI_API_KEY || '';
  return raw.split(',').map((k) => k.trim()).filter(Boolean);
}

function maskKey(key) {
  if (!key || key.length < 12) return '(קצר מדי)';
  return `${key.slice(0, 8)}...${key.slice(-4)}`;
}

async function listModels(key) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`);
  return (data.models || [])
    .filter((m) => (m.supportedGenerationMethods || []).includes('generateContent'))
    .map((m) => m.name.replace('models/', ''))
    .sort();
}

async function testKey(key, model) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: 'ענה במילה אחת: שלום' }] }],
      generationConfig: { temperature: 0, maxOutputTokens: 10 },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    return { ok: false, status: res.status, error: data.error?.message || res.statusText };
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return { ok: true, status: res.status, text: text.trim() };
}

const MODELS_TO_TRY = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.0-flash-001',
];

async function main() {
  const keys = loadKeys();
  const listOnly = process.argv.includes('--list-models');

  console.log('\n=== בדיקת מפתח Gemini ===\n');

  if (!keys.length) {
    console.log('❌ לא נמצא GEMINI_API_KEY');
    console.log('\nאפשרויות:');
    console.log('  1. הוסף ל-Fiesta/fiesta-nextjs/.env:');
    console.log('     GEMINI_API_KEY=AIzaSy...');
    console.log('  2. או הרץ עם מפתח ישיר:');
    console.log('     node scripts/test-gemini-key.js AIzaSy...');
    process.exit(1);
  }

  console.log(`נמצאו ${keys.length} מפתח/ות\n`);

  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    console.log(`--- מפתח ${i + 1}: ${maskKey(key)} ---`);

    if (listOnly) {
      try {
        const models = await listModels(key);
        console.log(`✅ המפתח תקין — ${models.length} מודלים זמינים`);
        console.log('מודלים (generateContent):');
        for (const m of models.slice(0, 15)) console.log(`  • ${m}`);
        if (models.length > 15) console.log(`  ... ועוד ${models.length - 15}`);
      } catch (e) {
        console.log(`❌ המפתח לא תקין: ${e.message}`);
      }
      console.log('');
      continue;
    }

    let anyOk = false;
    for (const model of MODELS_TO_TRY) {
      const result = await testKey(key, model);
      if (result.ok) {
        console.log(`✅ ${model} — OK (תשובה: "${result.text}")`);
        anyOk = true;
        break;
      }
      console.log(`❌ ${model} — ${result.status}: ${(result.error || '').slice(0, 120)}`);
    }

    if (!anyOk) {
      console.log('⚠️  המפתח לא עבר אף מודל — ייתכן שהוא חסום, פג תוקף, או שאין מכסה');
    }
    console.log('');
  }

  console.log('טיפ: אם 503 — עומס זמני, נסה שוב בעוד דקה');
  console.log('טיפ: אם 400 API key invalid — צור מפתח חדש ב-https://aistudio.google.com/apikey\n');
}

main().catch((e) => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
