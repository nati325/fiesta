/**
 * Clean CRM supplier descriptions & reviews (911 pool) using Gemini.
 * Updates suppliers_complete.json (+ MongoDB fiesta_crm.suppliers when reachable).
 *
 * Usage:
 *   node scripts/clean-crm-supplier-content.js --scan
 *   node scripts/clean-crm-supplier-content.js --limit 9999
 *
 * Incremental save: each supplier is written to JSON + checkpoint immediately.
 * Resume: re-run the same command — skips suppliers with contentCleanVersion >= 4.
 *
 * Core rule: write ONLY from existing source text. Never invent facts, numbers, or claims.
 */
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

const GENERIC_DESC_PATTERNS = [
  /אנחנו ב-/,
  /ברוכים הבאים ל-/,
  /מחפשים שלמות\?/,
  /לא רק מספקים שירות/,
  /יוצרים חוויה\. הצוות המקצועי/,
  /מתגאים במאות זוגות מרוצים/,
  /100% מעצמנו/,
  /סטנדרט שירות ללא פשרות/,
  /משב רוח רענן של חדשנות/,
];

const SPAM_REVIEW_PATTERNS = [
  /mit4mit/i,
  /חוות דעת על/i,
  /השאירו פרטים/i,
  /לחצו כאן/i,
  /www\./i,
  /https?:\/\//i,
  /bing\.com/i,
  /google\.com\/maps/i,
  /^\s*[0-9.]+\s*$/,
  /^\s*0\.0\s*$/,
];

const REVIEW_METADATA_PATTERNS = [
  /^\d+\s*ביקורות/i,
  /אין עדיין חוות דעת/i,
  /אין חוות דעת/i,
  /לאירועים ב[\s·]/i,
  /קרא עוד/i,
  /easywed\.co/i,
  /10comm\.com/i,
  /מתחתנים/i,
  /היכנסו על מנת/i,
  /אתר .* מציג מידע/i,
];

const CTA_PATTERNS = [
  /השאירו פרטים/gi,
  /לחצו כאן/gi,
  /התקשרו עכשיו/gi,
  /לפרטים נוספים/gi,
  /צרו קשר/gi,
];

const VENDOR_SOURCE_PATTERNS = [
  /instagram\.com/i,
  /facebook\.com/i,
  /valley-events\.co/i,
  /sia\.events/i,
  /siaevents/i,
];

const SCRAPING_JUNK_PATTERNS = [
  /&#\w+;/,
  /&amp;|&lt;|&gt;/,
  /&nbsp;/i,
  /#\d{5,6}/,
  /mit4mit/i,
  /engaged\.co/i,
  /חוות דעת על/i,
  /\.{4,}/,
  /_{3,}/,
];

const AI_PHRASES = [
  /^הנה /,
  /^לסיכום/,
  /^חשוב לציין/,
  /^בקיצור/,
  /^בטוח ש/,
  /^ללא ספק/,
  /^בהחלט,/,
  /^שימו לב,/,
  /בכל פנים,/,
  /אני שמח לעזור/,
  /כעוזר AI/,
  /כמודל שפה/,
];

const GEMINI_MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash'];
let geminiKeyIndex = 0;

/** Injected into every Gemini prompt — authenticity is mandatory. */
const AUTHENTICITY_RULES = `
עקרון עליון — אמינות:
- כתוב אך ורק על בסיס הטקסט המקורי שסופק. זה המקור היחיד.
- אסור להמציא, לשקר, להוסיף עובדות, מספרים, שנות ניסיון, מחירים, הישגים או שירותים שלא הופיעו במקור.
- אם משהו לא היה במקור — אל תכלול אותו. עדיף טקסט קצר ומדויק מאשר תוכן מומצא.
- עריכה = תיקון כתיב/ניסוח/הסרת לכלוך. לא כתיבה מחדש עם תוכן חדש.`;

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

function findScrapingEnv() {
  const roots = [path.join(__dirname, '..', '..', '..'), path.join(__dirname, '..', '..')];
  for (const root of roots) {
    try {
      for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
        if (entry.isDirectory() && entry.name.includes('scarping')) {
          const envPath = path.join(root, entry.name, '.env.local');
          if (fs.existsSync(envPath)) return envPath;
        }
      }
    } catch {
      // skip
    }
  }
  return null;
}

function findSuppliersJson() {
  if (process.env.CRM_SUPPLIERS_JSON && fs.existsSync(process.env.CRM_SUPPLIERS_JSON)) {
    return process.env.CRM_SUPPLIERS_JSON;
  }

  const found = [];
  const roots = [path.join(__dirname, '..', '..', '..'), path.join(__dirname, '..', '..')];
  for (const root of roots) {
    try {
      for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
        if (entry.isDirectory() && entry.name.includes('scarping')) {
          const jsonPath = path.join(root, entry.name, 'data', 'suppliers_complete.json');
          if (fs.existsSync(jsonPath)) found.push(jsonPath);
        }
      }
    } catch {
      // skip
    }
  }

  if (!found.length) return null;

  found.sort((a, b) => {
    const aRtl = /[\u200f\u202a-\u202e]/.test(a) ? 1 : 0;
    const bRtl = /[\u200f\u202a-\u202e]/.test(b) ? 1 : 0;
    if (aRtl !== bRtl) return aRtl - bRtl;
    try {
      const ac = JSON.parse(fs.readFileSync(a, 'utf8')).filter((s) => s.contentCleanedAt).length;
      const bc = JSON.parse(fs.readFileSync(b, 'utf8')).filter((s) => s.contentCleanedAt).length;
      return bc - ac;
    } catch {
      return 0;
    }
  });

  return found[0];
}

function saveJsonAtomic(jsonPath, data) {
  const tmp = `${jsonPath}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmp, jsonPath);
}

function writeCheckpoint(outDir, info) {
  const checkpointPath = path.join(outDir, 'crm-clean-checkpoint.json');
  fs.writeFileSync(checkpointPath, JSON.stringify(info, null, 2), 'utf-8');
  return checkpointPath;
}

async function persistSupplierMongo(client, supplier) {
  if (!client || !supplier) return false;
  const phone = supplierPhone(supplier);
  const col = client.db('fiesta_crm').collection('suppliers');
  const res = await col.updateOne(
    { $or: [{ phone }, { real_phone: phone }, { phone: supplier.phone }] },
    {
      $set: {
        description: supplier.description,
        reviews: supplier.reviews,
        contentCleanedAt: supplier.contentCleanedAt,
        contentCleanVersion: supplier.contentCleanVersion || 4,
      },
    }
  );
  return res.matchedCount > 0;
}

async function persistProgress({ all, jsonPath, supplier, mongoClient, outDir, progress }) {
  saveJsonAtomic(jsonPath, all);
  let mongoOk = false;
  if (mongoClient) {
    try {
      mongoOk = await persistSupplierMongo(mongoClient, supplier);
    } catch (error) {
      console.warn(`  ⚠ MongoDB: ${error.message}`);
    }
  }
  writeCheckpoint(outDir, {
    lastId: supplier.id,
    lastName: supplierName(supplier),
    processedInRun: progress.processedInRun,
    totalInRun: progress.totalInRun,
    checkedTotal: progress.checkedTotal,
    jsonPath,
    updatedAt: new Date().toISOString(),
    mongoOk,
  });
}

function loadEnv() {
  const env = loadEnvFile(path.join(__dirname, '..', '.env'));
  const scrapingEnv = findScrapingEnv();
  if (scrapingEnv) {
    const local = loadEnvFile(scrapingEnv);
    if (local.GEMINI_API_KEY) env.GEMINI_API_KEY = local.GEMINI_API_KEY;
    if (local.MONGODB_URI) env.CRM_MONGODB_URI = local.MONGODB_URI;
  }
  return env;
}

function parseArgs(argv) {
  const fromIdIdx = argv.indexOf('--from-id');
  const idsIdx = argv.indexOf('--ids');
  return {
    dryRun: argv.includes('--dry-run'),
    force: argv.includes('--force'),
    scan: argv.includes('--scan'),
    limit: parseInt(argv[argv.indexOf('--limit') + 1], 10) || 10,
    delayMs: parseInt(argv[argv.indexOf('--delay') + 1], 10) || 2500,
    fromId: fromIdIdx !== -1 ? parseInt(argv[fromIdIdx + 1], 10) : null,
    ids: idsIdx !== -1 ? argv[idsIdx + 1].split(',').map((x) => parseInt(x.trim(), 10)).filter(Boolean) : null,
  };
}

function getGeminiKeys(env) {
  const keys = (env.GEMINI_API_KEY || '').split(',').map((k) => k.trim()).filter(Boolean);
  if (!keys.length) throw new Error('GEMINI_API_KEY לא נמצא');
  return keys;
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function preCleanText(text) {
  if (!text) return '';
  let t = decodeHtmlEntities(fixMojibake(text));
  t = t.replace(/\bnbsp;/gi, ' ');
  return t
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\(\s*\)/g, ' ')
    .replace(/\.{3,}/g, '.')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function fixMojibake(text) {
  if (!text || !/×/.test(text)) return text;
  try {
    const t = text.replace(/×\s+/g, '×').replace(/\s+(?=×)/g, '');
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
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#(\d+);/g, (_, n) => {
      const code = parseInt(n, 10);
      return Number.isFinite(code) ? String.fromCharCode(code) : '';
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => {
      const code = parseInt(h, 16);
      return Number.isFinite(code) ? String.fromCharCode(code) : '';
    });
}

function hasBrokenEncoding(text) {
  const t = text || '';
  if (/\uFFFD/.test(t)) return true;
  if (/\bnbsp;/i.test(t)) return true;
  if (/×[\u0080-\u00FF]/.test(t)) return true;
  return false;
}

function normalizeSourceText(text) {
  return stripDescriptionCTA(preCleanText(text || ''));
}

function loadPreCleanBackupMap() {
  const outDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outDir)) return new Map();
  const files = fs
    .readdirSync(outDir)
    .filter((f) => f.startsWith('crm-pre-clean-backup-') && f.endsWith('.json'))
    .map((f) => ({ f, m: fs.statSync(path.join(outDir, f)).mtimeMs }))
    .sort((a, b) => b.m - a.m);
  const map = new Map();
  for (const { f } of files) {
    try {
      const batch = JSON.parse(fs.readFileSync(path.join(outDir, f), 'utf8'));
      for (const s of batch) {
        if (s.id != null && s.description && !map.has(s.id)) map.set(s.id, s.description);
      }
    } catch {
      // skip bad backup
    }
  }
  return map;
}

function resolveDescriptionSource(s, backupMap) {
  const current = s.description || '';
  if (!/\uFFFD/.test(current)) return current;
  const fromBackup = backupMap.get(s.id);
  if (fromBackup && /×/.test(fromBackup)) return fromBackup;
  return current;
}

function isWrongScrapeDescription(s, desc) {
  const t = desc || '';
  const profile = `${s.category || ''} ${s.name || ''} ${s.clean_name || ''}`;
  if (!/צלמ|צילום|photo|סושיאל/i.test(profile)) return false;
  return /greennadlan|נדל"ן|נכסים|שכירות|משקיעים|שוכרים/i.test(t);
}

function pickDescriptionFallback(sourceNorm, localOnly, geminiCleaned) {
  const candidates = [
    { label: 'gemini', text: geminiCleaned },
    { label: 'local', text: localOnly },
    { label: 'source', text: sourceNorm },
  ].filter((c) => c.text && c.text.length >= 15 && !hasBrokenEncoding(c.text));

  if (!candidates.length) return null;

  let best = candidates[0];
  let bestScore = -1;
  for (const c of candidates) {
    const score = wordOverlapRatio(sourceNorm, c.text);
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return best.text;
}

function sanitizeOutput(text) {
  if (!text) return '';
  let out = text
    .replace(/^```(?:json|text)?/i, '')
    .replace(/```$/i, '')
    .replace(/\*\*/g, '')
    .replace(/__/g, '')
    .replace(/^["'״]+|["'״]+$/g, '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
  for (const pattern of AI_PHRASES) out = out.replace(pattern, '');
  return out.trim();
}

function isGenericDescription(text) {
  return GENERIC_DESC_PATTERNS.some((p) => p.test(text || ''));
}

function hasScrapingJunk(text) {
  return SCRAPING_JUNK_PATTERNS.some((p) => p.test(text || ''));
}

function hasCTA(text) {
  return CTA_PATTERNS.some((p) => {
    p.lastIndex = 0;
    return p.test(text || '');
  });
}

function hasPhoneNumber(text) {
  return /0\d{1,2}[-\s]?\d{3}[-\s]?\d{4}/.test(text || '');
}

function stripDescriptionCTA(text) {
  let t = text || '';
  for (const p of CTA_PATTERNS) t = t.replace(p, ' ');
  t = t.replace(/^\s*0\d{1,2}[-\s]?\d{3}[-\s]?\d{4}\s*/g, ' ');
  t = t.replace(/\*\s*הטבה[^.]*\./gi, ' ');
  return preCleanText(t);
}

function tokenizeHebrew(text) {
  return (text || '')
    .replace(/[^\u0590-\u05FF\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3);
}

function wordOverlapRatio(original, cleaned) {
  const a = tokenizeHebrew(original);
  const b = new Set(tokenizeHebrew(cleaned));
  if (!a.length || !b.size) return 0;
  let overlap = 0;
  for (const w of a) if (b.has(w)) overlap += 1;
  return overlap / a.length;
}

function isDescriptionGoodEnough(desc) {
  const text = (desc || '').trim();
  if (text.length < 12) return false;
  if (hasBrokenEncoding(text)) return false;
  if (isGenericDescription(text)) return false;
  if (hasScrapingJunk(text)) return false;
  if (hasCTA(text)) return false;
  if (/^\s*0\d{1,2}[-\s]?\d/.test(text)) return false;
  if (/[\[\]{}<>]/.test(text)) return false;
  if (/\.\.\.|…/.test(text)) return false;
  if ((text.match(/[א-ת]/g) || []).length < 8) return false;
  if (/[A-Za-z]{4,}/.test(text) && (text.match(/[א-ת]/g) || []).length < 12) return false;
  if (text.length > 450) return false;
  return true;
}

function isReviewMetadata(text) {
  const t = (text || '').trim();
  if (!t) return true;
  return REVIEW_METADATA_PATTERNS.some((p) => p.test(t));
}

function hasCustomerVoice(text) {
  return /(?:חגגנו|היינו|נהנינו|הוזמנתי|ממליץ|ממליצה|תודה|האורחים|החתונה|חתונה|האירוע שלנו|בחרנו|חגגתי|קיבלנו|נהנו|מרגיש)/i.test(
    text || ''
  );
}

function isVendorMarketingReview(review, supplier) {
  const text = review.text || '';
  if (hasCustomerVoice(text)) return false;

  const name = supplierName(supplier).toLowerCase();
  const reviewer = (review.reviewer || '').toLowerCase();
  const source = review.source || '';

  if (reviewer && name && name.length >= 3 && reviewer.includes(name) && !hasCustomerVoice(text)) return true;
  if (supplier.category && reviewer === supplier.category) return true;
  if (/^אצלנו ב/.test(text)) return true;
  if (hasPhoneNumber(text)) return true;
  if (VENDOR_SOURCE_PATTERNS.some((p) => p.test(source)) && !hasCustomerVoice(text)) return true;
  return false;
}

function isObviousSpamReview(text) {
  const t = (text || '').trim();
  if (!t || t.length < 8) return true;

  if (hasCustomerVoice(t)) {
    if (/^\d+\s*ביקורות/i.test(t)) return true;
    if (/אין עדיין חוות דעת/i.test(t)) return true;
    return false;
  }

  if (isReviewMetadata(t)) return true;
  if (SPAM_REVIEW_PATTERNS.some((p) => p.test(t))) return true;
  if (/^[\d\s.,]+$/.test(t)) return true;
  return false;
}

function extractNumbers(text) {
  return (text || '').match(/\d{2,}/g) || [];
}

function hasInventedNumbers(original, cleaned) {
  const orig = new Set(extractNumbers(original));
  return extractNumbers(cleaned).some((n) => !orig.has(n));
}

function isDescriptionOutputValid(original, cleaned, mode) {
  if (!cleaned || cleaned.length < 12) return false;
  if (hasBrokenEncoding(cleaned)) return false;
  if (hasCTA(cleaned)) return false;
  if (hasInventedNumbers(original, cleaned)) return false;

  const ratio = wordOverlapRatio(original, cleaned);
  if (mode === 'light' || mode === 'preserve') {
    if (ratio < 0.28) return false;
  } else if (ratio < 0.15) {
    return false;
  }

  const origWords = tokenizeHebrew(original).filter((w) => w.length >= 4);
  if (origWords.length >= 3) {
    const kept = origWords.filter((w) => cleaned.includes(w)).length;
    if (kept / origWords.length < 0.3) return false;
  }

  return true;
}

function isReviewOutputValid(original, cleaned) {
  if (!cleaned || cleaned.length < 12) return false;
  if (hasBrokenEncoding(cleaned)) return false;
  if (isObviousSpamReview(cleaned)) return false;
  if (isVendorMarketingReview({ text: cleaned, reviewer: '', source: '' }, { clean_name: '' })) return false;
  if (hasPhoneNumber(cleaned) && !hasPhoneNumber(original)) return false;
  if (hasInventedNumbers(original, cleaned)) return false;

  const sourceNorm = preCleanText(original);
  const ratio = wordOverlapRatio(sourceNorm, cleaned);
  if (ratio < 0.28) return false;

  const origWords = tokenizeHebrew(sourceNorm);
  const keyFacts = origWords.filter((w) => w.length >= 4).slice(0, 6);
  if (keyFacts.length >= 2) {
    const kept = keyFacts.filter((w) => cleaned.includes(w)).length;
    if (kept / keyFacts.length < 0.25) return false;
  }

  return true;
}

function lightCleanReviewText(text) {
  let t = preCleanText(text);
  t = t.replace(/^\d+\s*ביקורות\.?\s*/i, '');
  t = t.replace(/^חוות דעת על[^.…]*[.…]{1,3}\s*/i, '');
  t = t.replace(/\s*קרא עוד\.{0,3}$/i, '');
  t = t.replace(/\s*[✨🎉]+/g, ' ');
  return preCleanText(t);
}

function reviewNeedsWork(review) {
  const t = (review.text || '').trim();
  if (!t) return true;
  if (isObviousSpamReview(t)) return true;
  if (t.length > 300) return true;
  if (/[\[\]{}<>]/.test(t)) return true;
  if (/\.\.\.|…/.test(t)) return true;
  if (hasScrapingJunk(t)) return true;
  if (/[A-Za-z]{5,}/.test(t) && (t.match(/[א-ת]/g) || []).length < 10) return true;
  return false;
}

function needsDescriptionWork(s) {
  const desc = (s.description || '').trim();
  if (!desc) return false;
  return !isDescriptionGoodEnough(desc);
}

function needsReviewWork(s) {
  const reviews = s.reviews || [];
  if (!reviews.length) return false;
  return reviews.some((r) => reviewNeedsWork(r));
}

function describeDescriptionIssue(desc) {
  const text = (desc || '').trim();
  if (!text) return 'אין תיאור';
  if (hasBrokenEncoding(text)) return 'encoding שבור (×/nbsp/�)';
  if (isGenericDescription(text)) return 'תיאור גנרי/AI';
  if (hasScrapingJunk(text)) return 'לכלוך שליפה';
  if (hasCTA(text)) return 'קריאה לפעולה (CTA)';
  if (/^\s*0\d/.test(text)) return 'מספר טלפון בתיאור';
  if (/[\[\]{}<>]/.test(text)) return 'תווים שבורים';
  if (/\.\.\.|…/.test(text)) return 'טקסט חתוך';
  if (text.length > 450) return 'ארוך מדי';
  return 'לא תקין';
}

function supplierName(s) {
  return (s.clean_name || s.name || '').split('|')[0].trim();
}

function supplierPhone(s) {
  return s.real_phone || s.phone || '';
}

async function callGemini(keys, prompt, { temperature = 0.25 } = {}) {
  await sleep(700);
  for (const model of GEMINI_MODELS) {
    for (let round = 0; round < keys.length * 2; round += 1) {
      const key = keys[geminiKeyIndex % keys.length];
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature },
          }),
        });
        if (res.status === 429 || res.status === 503) {
          geminiKeyIndex += 1;
          await sleep(res.status === 503 ? 4000 : 2000);
          continue;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error('תשובה ריקה');
        return text.trim();
      } catch (error) {
        console.warn(`  Gemini (${model}): ${error.message}`);
        geminiKeyIndex += 1;
        await sleep(1500);
      }
    }
  }
  throw new Error('כל מפתחות Gemini נכשלו');
}

function getDescMode(desc) {
  const text = preCleanText(desc);
  if (isGenericDescription(text)) return 'strip-generic';
  if (hasScrapingJunk(text) || /[\[\]{}<>]/.test(text) || /\.\.\.|…/.test(text)) return 'light';
  return 'preserve';
}

function buildDescriptionPrompt(s) {
  const name = supplierName(s);
  const cat = s.category || 'ספקי אירועים';
  const desc = preCleanText(s.description || '');
  const mode = getDescMode(desc);

  if (mode === 'light') {
    return `${AUTHENTICITY_RULES}

עריכת לשון בלבד — לא לכתוב מחדש.

שם: ${name}
קטגוריה: ${cat}
טקסט מקורי (המקור היחיד — אל תסטה ממנו):
${desc}

כללים:
- שמור את המשמעות, העובדות והסגנון המקוריים
- תקן שגיאות כתיב, פיסוק, הסר תווים שבורים/emoji codes/HTML
- אל תוסיף משפטים, מספרים, שירותים או סיסמאות שלא היו במקור
- אל תכלול "השאירו פרטים", מספרי טלפון או קריאות לפעולה
- החזר רק את הטקסט המתוקן בעברית`;
  }

  if (mode === 'strip-generic') {
    return `${AUTHENTICITY_RULES}

הסר ניסוח AI/שיווק ריק — רק ממה שכבר כתוב.

שם: ${name}
קטגוריה: ${cat}
טקסט נוכחי (המקור היחיד):
${desc}

כללים:
- שמור רק עובדות שמופיעות במקור — אל תוסיף שום דבר חדש
- הסר משפטי שיווק ריקים וקריאות לפעולה
- אם נשאר מעט — החזר רק את העובדות שנשארו, בלי להמציא
- החזר רק את התיאור`;
  }

  return `${AUTHENTICITY_RULES}

ניקוי תיאור קיים — שמור על התוכן המקורי.

שם: ${name}
קטגוריה: ${cat}
טקסט מקורי (המקור היחיד — אל תסטה ממנו):
${desc}

כללים:
- שמור עובדות ושירותים מהמקור בלבד
- אסור להוסיף מידע, לשפר "ב creatively" או לשכתב עם תוכן חדש
- 2-4 משפטים, עברית טבעית, בלי markdown
- החזר רק את התיאור`;
}

async function rebuildDescriptionFromReviews(s, keys) {
  const snippets = (s.reviews || [])
    .filter((r) => !isVendorMarketingReview(r, s) && !isReviewMetadata(r.text))
    .map((r) => preCleanText(r.text))
    .filter((t) => t.length >= 25 && !isObviousSpamReview(t) && !hasBrokenEncoding(t));
  if (!snippets.length) return null;

  const source = snippets.slice(0, 3).join('\n---\n');
  const prompt = `${AUTHENTICITY_RULES}

כתוב תיאור קצר (2-3 משפטים) לספק "${supplierName(s)}" — רק מעובדות שמופיעות בביקורות:
${source}

כללים:
- אסור להמציא עובדות, מספרים או שירותים
- 2-3 משפטים, עברית טבעית
- החזר רק את התיאור`;

  try {
    const raw = await callGemini(keys, prompt, { temperature: 0.1 });
    const text = stripDescriptionCTA(sanitizeOutput(raw));
    if (text.length >= 15 && !hasBrokenEncoding(text) && !hasCTA(text)) return text;
  } catch {
    // fall through
  }
  return snippets[0].slice(0, 280).trim();
}

async function cleanDescription(s, keys, backupMap) {
  const rawOriginal = resolveDescriptionSource(s, backupMap);
  const sourceNorm = normalizeSourceText(rawOriginal);
  const mode = getDescMode(sourceNorm);
  let localOnly = sourceNorm;

  if (isWrongScrapeDescription(s, sourceNorm)) {
    console.warn('  ⚠ תיאור: scrape שגוי (תוכן לא שייך לספק) — בונה מביקורות');
    const rebuilt = await rebuildDescriptionFromReviews(s, keys);
    if (rebuilt && rebuilt.length >= 15 && !hasBrokenEncoding(rebuilt)) return rebuilt;
  }

  if (isDescriptionGoodEnough(localOnly) && (mode === 'light' || mode === 'preserve')) {
    return localOnly;
  }

  if (hasBrokenEncoding(rawOriginal)) {
    localOnly = normalizeSourceText(rawOriginal);
    if (localOnly.length >= 15 && !hasBrokenEncoding(localOnly)) {
      console.warn('  ⚠ תיאור: תוקן encoding מקומי');
      return localOnly;
    }
  }

  const promptSupplier = { ...s, description: rawOriginal };
  const raw = await callGemini(keys, buildDescriptionPrompt(promptSupplier), {
    temperature: mode === 'light' ? 0.1 : 0.15,
  });
  let cleaned = stripDescriptionCTA(sanitizeOutput(raw));

  if (cleaned.length < 15) throw new Error('תיאור קצר מדי');
  if (hasCTA(cleaned)) cleaned = stripDescriptionCTA(cleaned);

  if (!isDescriptionOutputValid(sourceNorm, cleaned, mode)) {
    const fallback = pickDescriptionFallback(sourceNorm, localOnly, cleaned);
    if (fallback) {
      console.warn('  ⚠ תיאור: Gemini לא מבוסס מספיק על המקור — נשמר ניקוי מקומי');
      return fallback;
    }
    throw new Error('תיאור לא עבר ולידציית אמינות ו-encoding לא תוקן');
  }

  if (!isDescriptionGoodEnough(cleaned) && localOnly.length >= 15 && !hasBrokenEncoding(localOnly)) {
    return localOnly;
  }

  return cleaned;
}

async function cleanReviews(s, keys) {
  const source = s.reviews || [];
  const cleaned = [];

  for (const r of source) {
    const originalText = (r.text || '').trim();

    if (isVendorMarketingReview(r, s) || isReviewMetadata(originalText)) {
      continue;
    }

    if (!reviewNeedsWork(r)) {
      cleaned.push(r);
      continue;
    }

    if (isObviousSpamReview(originalText)) continue;

    const localText = lightCleanReviewText(originalText);
    const sourceNorm = preCleanText(originalText);
    const localOk = localText.length >= 15 && isReviewOutputValid(sourceNorm, localText);

    if (localOk && !reviewNeedsWork({ ...r, text: localText })) {
      cleaned.push({ ...r, text: localText });
      continue;
    }

    const prompt = `${AUTHENTICITY_RULES}

ערוך חוות דעת לקוח — רק על בסיס מה שנאמר במקור.

ספק: ${supplierName(s)}
חוות דעת מקורית (המקור היחיד):
${preCleanText(originalText)}

כללים:
- תקן כתיב וניסוח בלבד — אותו מסר, אותן עובדות, אותו סיפור
- אסור להוסיף מחמאות, פרטים, שמות או אירועים שלא היו במקור
- אסור לשכתב כך שהמשמעות תשתנה
- 1-3 משפטים בעברית יומיומית
- אם spam/פרסומת/קישור/metadata/אין תוכן אמיתי — החזר: SKIP
- החזר רק את הטקסט המתוקן או SKIP`;

    try {
      const raw = await callGemini(keys, prompt, { temperature: 0.1 });
      const text = sanitizeOutput(raw);

      if (!text || text.toUpperCase() === 'SKIP') continue;

      if (isReviewOutputValid(sourceNorm, text)) {
        cleaned.push({
          reviewer: (r.reviewer || 'לקוח').trim() || 'לקוח',
          rating: Number(r.rating) || 5,
          text,
          source: r.source || 'google',
        });
      } else if (localOk) {
        console.warn('  ⚠ ביקורת: Gemini נדחה — נשמר ניקוי מקומי');
        cleaned.push({ ...r, text: localText });
      } else if (localText.length >= 20 && wordOverlapRatio(originalText, localText) >= 0.35) {
        cleaned.push({ ...r, text: localText });
      }
    } catch {
      if (localOk) cleaned.push({ ...r, text: localText });
      else if (!isObviousSpamReview(originalText) && localText.length >= 20) {
        cleaned.push({ ...r, text: localText });
      }
    }
  }

  return cleaned;
}

async function processSupplier(s, keys, options, backupMap) {
  const changes = {};
  const log = { id: s.id, name: supplierName(s), updates: [] };

  if (needsDescriptionWork(s)) {
    const before = (s.description || '').slice(0, 100);
    const after = await cleanDescription(s, keys, backupMap);
    changes.description = after;
    log.updates.push({ field: 'description', mode: getDescMode(s.description), before, after: after.slice(0, 100) });
  }

  if (needsReviewWork(s)) {
    const beforeCount = (s.reviews || []).length;
    const after = await cleanReviews(s, keys);
    if (JSON.stringify(after) !== JSON.stringify(s.reviews || [])) {
      changes.reviews = after;
      log.updates.push({ field: 'reviews', beforeCount, afterCount: after.length });
    }
  }

  if (Object.keys(changes).length) {
    changes.contentCleanedAt = new Date().toISOString();
    changes.contentCleanVersion = 5;
  }

  return { changes, log };
}

async function tryConnectCrm(uri) {
  if (!uri) return null;
  try {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 });
    await client.connect();
    return client;
  } catch {
    return null;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const env = loadEnv();
  const keys = getGeminiKeys(env);
  const jsonPath = findSuppliersJson();

  if (!jsonPath) throw new Error('suppliers_complete.json לא נמצא');

  console.log('\n=== ניקוי תוכן ספקים (CRM — 911) ===');
  console.log(`קובץ: ${jsonPath}`);
  console.log(`מצב: ${args.scan ? 'סкан' : args.dryRun ? 'dry-run' : 'שמירה'} | limit: ${args.limit}\n`);

  const all = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const backupMap = loadPreCleanBackupMap();
  let candidates = all.filter((s) => {
    const needsWork = needsDescriptionWork(s) || needsReviewWork(s);
    const encodingBroken =
      hasBrokenEncoding(s.description) || (s.reviews || []).some((r) => hasBrokenEncoding(r.text));
    if (args.ids) return args.ids.includes(s.id) && (args.force || needsWork || encodingBroken || (s.contentCleanVersion || 0) < 5);
    if (args.fromId != null && s.id < args.fromId) return false;
    if (args.force) return needsWork || encodingBroken || (s.contentCleanVersion || 0) < 5;
    if (encodingBroken) return true;
    if (s.contentCleanedAt && (s.contentCleanVersion || 0) >= 5) return false;
    if (s.contentCleanedAt && (s.contentCleanVersion || 0) >= 4 && !encodingBroken) return false;
    if (s.contentCleanedAt && !args.force) return false;
    return needsWork;
  });

  if (args.ids) {
    candidates.sort((a, b) => args.ids.indexOf(a.id) - args.ids.indexOf(b.id));
  } else {
    candidates.sort((a, b) => a.id - b.id);
  }

  if (args.scan) {
    console.log(`סה"כ: ${all.length} | זקוקים לטיפול: ${candidates.length}`);
    for (const s of candidates.slice(0, 30)) {
      const parts = [];
      if (needsDescriptionWork(s)) parts.push(`תיאור: ${describeDescriptionIssue(s.description)}`);
      if (needsReviewWork(s)) {
        const bad = (s.reviews || []).filter((r) => reviewNeedsWork(r)).length;
        parts.push(`ביקורות: ${bad} בעייתיות`);
      }
      console.log(`• [${s.id}] ${supplierName(s)} — ${parts.join(' | ')}`);
    }
    if (candidates.length > 30) console.log(`... ועוד ${candidates.length - 30}`);
    return;
  }

  const batch = candidates.slice(0, args.limit);
  const alreadyChecked = all.filter((s) => s.contentCleanedAt && (s.contentCleanVersion || 0) >= 4).length;
  console.log(`מעבד ${batch.length} ספקים מתוך ${candidates.length} שזקוקים לטיפול.`);
  console.log(`כבר נבדקו (v4): ${alreadyChecked}/${all.length} — resume אוטומטי\n`);

  const outDir = path.join(__dirname, 'output');
  fs.mkdirSync(outDir, { recursive: true });

  let mongoClient = null;
  if (!args.dryRun) {
    mongoClient = await tryConnectCrm(env.CRM_MONGODB_URI);
    if (mongoClient) console.log('MongoDB CRM: מחובר — שמירה incremental\n');
    else console.log('MongoDB CRM: לא זמין — שמירה ל-JSON בלבד\n');
  }

  if (!args.dryRun && batch.length) {
    const backupPath = path.join(outDir, `crm-pre-clean-backup-${Date.now()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(batch, null, 2), 'utf-8');
    console.log(`גיבוי: ${backupPath}\n`);
  }

  const report = [];
  let updated = 0;

  for (let i = 0; i < batch.length; i += 1) {
    const s = batch[i];
    console.log(`[${i + 1}/${batch.length}] [${s.id}] ${supplierName(s)}`);

    try {
      const { changes, log } = await processSupplier(s, keys, args, backupMap);
      const idx = all.findIndex((x) => x.id === s.id);
      const markFields = {
        contentCleanedAt: new Date().toISOString(),
        contentCleanVersion: 5,
      };

      if (!Object.keys(changes).length) {
        console.log('  ↷ דולג — כבר תקין');
        if (!args.dryRun && idx >= 0) {
          all[idx] = { ...all[idx], ...markFields, contentCleanSkipped: true };
          await persistProgress({
            all,
            jsonPath,
            supplier: all[idx],
            mongoClient,
            outDir,
            progress: {
              processedInRun: i + 1,
              totalInRun: batch.length,
              checkedTotal: all.filter((x) => x.contentCleanedAt).length,
            },
          });
          console.log('  💾 נשמר (JSON + checkpoint)');
        }
        report.push({ ...log, skipped: true });
      } else {
        for (const u of log.updates) {
          if (u.field === 'description') console.log(`  ✎ תיאור (${u.mode}): "${u.after}..."`);
          if (u.field === 'reviews') console.log(`  ✎ ביקורות: ${u.beforeCount} → ${u.afterCount}`);
        }

        if (!args.dryRun && idx >= 0) {
          all[idx] = { ...all[idx], ...changes, ...markFields };
          updated += 1;
          await persistProgress({
            all,
            jsonPath,
            supplier: all[idx],
            mongoClient,
            outDir,
            progress: {
              processedInRun: i + 1,
              totalInRun: batch.length,
              checkedTotal: all.filter((x) => x.contentCleanedAt).length,
            },
          });
          console.log('  💾 נשמר (JSON + checkpoint)');
        } else {
          console.log('  🔍 dry-run');
        }
        report.push(log);
      }
    } catch (error) {
      console.error(`  ❌ ${error.message}`);
      report.push({ id: s.id, name: supplierName(s), error: error.message });
      if (!args.dryRun) {
        writeCheckpoint(outDir, {
          lastId: s.id,
          lastName: supplierName(s),
          error: error.message,
          processedInRun: i + 1,
          totalInRun: batch.length,
          jsonPath,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    if (i < batch.length - 1) await sleep(args.delayMs);
  }

  const reportPath = path.join(outDir, `crm-clean-report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`דוח: ${reportPath}`);

  if (mongoClient) {
    await mongoClient.close();
    console.log(`MongoDB CRM: עודכנו ${updated} רשומות (incremental)`);
  }

  const checked = all.filter((s) => s.contentCleanedAt).length;
  console.log(`\nסיום. batch: ${updated}/${batch.length} | נבדקו בסך הכל: ${checked}/${all.length}\n`);
}

main().catch((err) => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
