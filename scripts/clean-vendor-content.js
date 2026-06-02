/**
 * Clean vendor descriptions & reviews in Fiesta MongoDB using Gemini.
 *
 * Usage:
 *   node scripts/clean-vendor-content.js --dry-run --limit 3
 *   node scripts/clean-vendor-content.js --limit 20
 *   node scripts/clean-vendor-content.js --scan --force
 *   node scripts/clean-vendor-content.js --force --limit 100
 *   node scripts/clean-vendor-content.js --id 6a0b4b1915588fb82bc018f1 --dry-run
 *
 * Env: MONGODB_URI / MONGODB_URI_DIRECT in .env
 *      GEMINI_API_KEY in .env or scraping dashboard .env.local (comma-separated keys)
 */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

const CATEGORY_LABELS = {
  venue: 'אולמות וגנים',
  dj: 'DJ ומוזיקה',
  photographer: 'צילום אירועים',
  design: 'עיצוב אירועים',
  catering: 'קייטרינג',
  makeup: 'איפור',
  dresses: 'שמלות כלה',
  suits: 'חליפות חתן',
  hair: 'עיצוב שיער',
  bar: 'שירותי בר',
  alcohol: 'אלכוהול ובר',
  rings: 'טבעות נישואין',
  transportation: 'הסעות',
  cars: 'רכבי יוקרה',
  singers: 'זמרים ולהקות',
  attractions: 'אטרקציות',
  'event-production': 'הפקת אירועים',
  invitations: 'הזמנות',
  rabbi: 'רב לחופה',
  cantors: 'חזנים ופייטנים',
  'religious-bands': 'להקות דתיות',
  challa: 'הפרשת חלה',
  hotels: 'מלונות',
  'getting-ready': 'התארגנות כלה',
  bachelor: 'מסיבות רווקים',
  souvenirs: 'מזכרות',
  'bride-shoes': 'נעלי כלה',
  'groom-shoes': 'נעלי חתן',
  'equipment-rental': 'השכרת ציוד',
  rsvp: 'אישורי הגעה',
  dietitians: 'תזונה ודיאטה',
  'personal-training': 'כושר ואימון',
};

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

function findEnvLocalFiles() {
  const roots = [
    path.join(__dirname, '..', '..', '..'),
    path.join(__dirname, '..', '..'),
  ];
  const found = [];

  function walk(dir, depth) {
    if (depth > 2) return;
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
    walk(root, 0);
  }
  return found;
}

function loadEnv() {
  const env = loadEnvFile(path.join(__dirname, '..', '.env'));

  for (const file of findEnvLocalFiles()) {
    const local = loadEnvFile(file);
    if (local.GEMINI_API_KEY && !env.GEMINI_API_KEY) {
      env.GEMINI_API_KEY = local.GEMINI_API_KEY;
    }
  }

  return env;
}

const SCRAPING_JUNK_PATTERNS = [
  /&#\w+;/,
  /&amp;|&lt;|&gt;/,
  /mit4mit/i,
  /engaged\.co/i,
  /חוות דעת על/i,
  /\.{4,}/,
  /_{3,}/,
  /(.{15,})\1/,
];

function parseArgs(argv) {
  const args = {
    dryRun: argv.includes('--dry-run'),
    force: argv.includes('--force'),
    scan: argv.includes('--scan'),
    limit: 100,
    only: 'all',
    id: null,
    delayMs: 3000,
  };
  const limitIdx = argv.indexOf('--limit');
  if (limitIdx !== -1) args.limit = parseInt(argv[limitIdx + 1], 10) || 10;
  const onlyIdx = argv.indexOf('--only');
  if (onlyIdx !== -1) args.only = argv[onlyIdx + 1] || 'all';
  const idIdx = argv.indexOf('--id');
  if (idIdx !== -1) args.id = argv[idIdx + 1] || null;
  const delayIdx = argv.indexOf('--delay');
  if (delayIdx !== -1) args.delayMs = parseInt(argv[delayIdx + 1], 10) || 2500;
  return args;
}

function getGeminiKeys(env) {
  const raw = env.GEMINI_API_KEY || '';
  const keys = raw.split(',').map((k) => k.trim()).filter(Boolean);
  if (!keys.length) {
    throw new Error('GEMINI_API_KEY לא נמצא. הוסף ל-.env או ל-scarping .env.local');
  }
  return keys;
}

let geminiKeyIndex = 0;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectMongo(env) {
  const uris = [env.MONGODB_URI, env.MONGODB_URI_DIRECT].filter(Boolean);
  if (!uris.length) throw new Error('MONGODB_URI חסר ב-.env');

  let lastError;
  for (const uri of uris) {
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
        await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 20000,
          bufferCommands: false,
        });
        return;
      } catch (error) {
        lastError = error;
        await sleep(1000 * attempt);
      }
    }
  }
  throw lastError;
}

const GEMINI_MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash'];

async function callGemini(keys, prompt, { json = false, temperature = 0.35 } = {}) {
  await sleep(800);

  for (const model of GEMINI_MODELS) {
    for (let round = 0; round < keys.length * 2; round += 1) {
      const key = keys[geminiKeyIndex % keys.length];
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

      try {
        const body = {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature,
            ...(json ? { responseMimeType: 'application/json' } : {}),
          },
        };

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (res.status === 429 || res.status === 503) {
          geminiKeyIndex += 1;
          await sleep(res.status === 503 ? 4000 : 2000);
          continue;
        }

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
        }

        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error('תשובה ריקה מ-Gemini');
        return text.trim();
      } catch (error) {
        console.warn(`  Gemini (${model}) key ${geminiKeyIndex % keys.length}: ${error.message}`);
        geminiKeyIndex += 1;
        await sleep(1500);
      }
    }
  }

  throw new Error('כל מפתחות Gemini נכשלו');
}

function preCleanText(text) {
  if (!text) return '';
  return text
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\(\s*\)/g, ' ')
    .replace(/\.{3,}/g, '.')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
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

  for (const pattern of AI_PHRASES) {
    out = out.replace(pattern, '');
  }

  return out.trim();
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

function extractNumbers(text) {
  return (text || '').match(/\d{2,}/g) || [];
}

function hasInventedNumbers(original, cleaned) {
  const orig = new Set(extractNumbers(original));
  return extractNumbers(cleaned).some((n) => !orig.has(n));
}

function isDescriptionOutputValid(original, cleaned, mode) {
  if (!cleaned || cleaned.length < 12) return false;
  if (hasInventedNumbers(original, cleaned)) return false;
  const ratio = wordOverlapRatio(original, cleaned);
  if (mode === 'light' || mode === 'preserve' || mode === 'restore') {
    if (ratio < 0.28) return false;
  } else if (ratio < 0.15) return false;
  const origWords = tokenizeHebrew(original).filter((w) => w.length >= 4);
  if (origWords.length >= 3) {
    const kept = origWords.filter((w) => cleaned.includes(w)).length;
    if (kept / origWords.length < 0.3) return false;
  }
  return true;
}

function isReviewOutputValid(original, cleaned) {
  if (!cleaned || cleaned.length < 12) return false;
  if (hasInventedNumbers(original, cleaned)) return false;
  if (wordOverlapRatio(original, cleaned) < 0.28) return false;
  return true;
}

function isGenericDescription(text) {
  if (!text) return false;
  return GENERIC_DESC_PATTERNS.some((p) => p.test(text));
}

function hasScrapingJunk(text) {
  if (!text) return false;
  return SCRAPING_JUNK_PATTERNS.some((p) => p.test(text));
}

function isDescriptionGoodEnough(desc) {
  const text = (desc || '').trim();
  if (text.length < 12) return false;
  if (isGenericDescription(text)) return false;
  if (hasScrapingJunk(text)) return false;
  if (/[\[\]{}<>]/.test(text)) return false;
  if (/\.\.\.|…/.test(text)) return false;
  if ((text.match(/[א-ת]/g) || []).length < 8) return false;
  if (/[A-Za-z]{4,}/.test(text) && (text.match(/[א-ת]/g) || []).length < 12) return false;
  if (text.length > 450) return false;
  return true;
}

function describeDescriptionIssue(desc) {
  const text = (desc || '').trim();
  if (!text) return 'אין תיאור';
  if (isGenericDescription(text)) return 'תיאור גנרי/AI';
  if (hasScrapingJunk(text)) return 'לכלוך שליפה';
  if (/[\[\]{}<>]/.test(text)) return 'תווים שבורים';
  if (/\.\.\.|…/.test(text)) return 'שלוש נקודות/טקסט חתוך';
  if (/[A-Za-z]{4,}/.test(text) && (text.match(/[א-ת]/g) || []).length < 8) return 'שפה לא עברית';
  if (text.length > 450) return 'טקסט ארוך מדי';
  return 'לא תקין';
}

function isObviousSpamReview(text) {
  const t = (text || '').trim();
  if (!t || t.length < 8) return true;
  if (SPAM_REVIEW_PATTERNS.some((p) => p.test(t))) return true;
  if (/^[\d\s.,]+$/.test(t)) return true;
  return false;
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

function describeReviewIssue(review) {
  const t = (review.text || '').trim();
  if (!t) return 'ביקורת ריקה';
  if (isObviousSpamReview(t)) return 'spam/לא רלוונטי';
  if (t.length > 300) return 'ארוכה מדי';
  if (hasScrapingJunk(t)) return 'לכלוך שליפה';
  return 'ניסוח/כתיב';
}

function needsDescriptionWork(vendor) {
  const desc = (vendor.description || '').trim();
  if (!desc) return false;
  return !isDescriptionGoodEnough(desc);
}

function needsReviewWork(vendor) {
  const reviews = vendor.reviews || [];
  if (!reviews.length) return false;
  return reviews.some((r) => reviewNeedsWork(r));
}

function vendorNeedsWork(vendor) {
  const descIssue = needsDescriptionWork(vendor);
  const reviewIssue = needsReviewWork(vendor);
  return { descIssue, reviewIssue, any: descIssue || reviewIssue };
}

function findDataFiles(filename) {
  const roots = [
    path.join(__dirname, '..', '..', '..'),
    path.join(__dirname, '..', '..'),
  ];
  const found = [];

  function walk(dir, depth) {
    if (depth > 4) return;
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isFile() && entry.name === filename) found.push(full);
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

let scrapingIndex = null;

function normalizeName(name) {
  return (name || '')
    .split('|')[0]
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function normalizePhone(phone) {
  return (phone || '').replace(/\D/g, '');
}

function loadScrapingIndex() {
  if (scrapingIndex) return scrapingIndex;
  scrapingIndex = { byName: new Map(), byPhone: new Map() };

  for (const file of findDataFiles('suppliers_complete.json')) {
    try {
      const arr = JSON.parse(fs.readFileSync(file, 'utf-8'));
      if (!Array.isArray(arr)) continue;
      for (const s of arr) {
        const desc = preCleanText(s.description || '');
        if (!desc || desc.length < 15) continue;
        const name = normalizeName(s.clean_name || s.name);
        const phone = normalizePhone(s.real_phone || s.phone);
        if (name) scrapingIndex.byName.set(name, desc);
        if (phone.length >= 9) scrapingIndex.byPhone.set(phone, desc);
      }
    } catch {
      // skip broken file
    }
  }

  return scrapingIndex;
}

function getScrapingDescription(vendor) {
  const idx = loadScrapingIndex();
  const byName = idx.byName.get(normalizeName(vendor.name));
  if (byName) return byName;
  const phone = normalizePhone(vendor.contact);
  if (phone) return idx.byPhone.get(phone) || '';
  return '';
}

function needsLightClean(text) {
  const desc = (text || '').trim();
  if (!desc || isGenericDescription(desc)) return false;
  return /[\[\]{}<>]/.test(desc) || /\.\.\.|…/.test(desc) || /  /.test(desc);
}

function getDescriptionSource(vendor) {
  const fiestaDesc = preCleanText(vendor.description || '');
  const scrapingDesc = preCleanText(getScrapingDescription(vendor));
  const generic = isGenericDescription(fiestaDesc);

  let mode = 'preserve';
  if (generic && scrapingDesc) mode = 'restore';
  else if (needsLightClean(fiestaDesc)) mode = 'light';
  else if (generic) mode = 'strip-generic';

  const primary = generic && scrapingDesc ? scrapingDesc : fiestaDesc;

  return { fiestaDesc, scrapingDesc, primary, generic, mode };
}

function categoryLabel(type) {
  return CATEGORY_LABELS[type] || type || 'ספקי אירועים';
}

function buildDescriptionPrompt(vendor, sourceInfo) {
  const name = vendor.name || 'הספק';
  const cat = categoryLabel(vendor.type);
  const region = (vendor.region || '').trim();
  const { fiestaDesc, scrapingDesc, primary, mode } = sourceInfo;

  if (mode === 'light') {
    return `${AUTHENTICITY_RULES}

עריכת לשון בלבד — לא לכתוב מחדש.

שם: ${name}
קטגוריה: ${cat}
טקסט מקורי:
${fiestaDesc}

כללים:
- שמור את המשמעות, העובדות והסגנון המקוריים
- תקן שגיאות כתיב, פיסוק, רווחים כפולים
- הסר סוגריים מיותרים, שלוש נקודות, תווים שבורים
- אל תוסיף משפטים חדשים, סיסמאות שיווקיות או מידע שלא היה במקור
- החזר רק את הטקסט המתוקן בעברית`;
  }

  if (mode === 'restore') {
    return `${AUTHENTICITY_RULES}

ניקוי תיאור מקורי שנשלף מהרשת — חובה לשמור על האותנטיות.

שם: ${name}
קטגוריה: ${cat}
${region ? `אזור: ${region}` : ''}

תיאור מקורי אמיתי (השתמש בזה כבסיס):
${scrapingDesc}

${fiestaDesc && fiestaDesc !== scrapingDesc ? `תיאור נוכחי באתר (גנרי/לא אמין — אל תעתיק ממנו):\n${fiestaDesc}` : ''}

כללים:
- שמור כל עובדה, שירות, מספר, שנות ניסיון, סגנון ומאפיין שהופיעו בתיאור המקורי
- נסח מחדש רק כדי שהטקסט יהיה קריא ותקין בעברית
- 2-5 משפטים, טון טבעי — לא שיווק AI
- אל תמציא פרטים שלא היו במקור
- בלי markdown, בלי "ברוכים הבאים", בלי "חוויה בלתי נשכחת"
- החזר רק את התיאור`;
  }

  if (mode === 'strip-generic') {
    return `${AUTHENTICITY_RULES}

הסר ניסוח AI גנרי — רק ממה שכבר כתוב, אל תמציא מידע חדש.

שם: ${name}
קטגוריה: ${cat}
טקסט נוכחי (גנרי):
${fiestaDesc}

כללים:
- אם יש בתוך הטקסט עובדות אמיתיות על השירות — שמור רק אותן
- הסר משפטי שיווק ריקים ("אנחנו לא רק...", "ברוכים הבאים", "מאות זוגות מרוצים")
- אם אין מידע אמיתי במקור — החזר רק מה שנשאר, בלי להמציא תיאור חדש
- 1-3 משפטים, עברית פשוטה
- החזר רק את התיאור`;
  }

  if (mode === 'minimal') {
    return `${AUTHENTICITY_RULES}

אין תיאור מקורי אמין — אל תמציא עובדות.

שם: ${name}
קטגוריה: ${cat}
${region ? `אזור: ${region}` : ''}

כללים:
- משפט אחד כללי בלבד על סוג השירות לפי הקטגוריה — בלי עובדות, מספרים או הישגים
- החזר רק את התיאור`;
  }

  return `${AUTHENTICITY_RULES}

ניקוי ועריכה של תיאור קיים — שמור על התוכן המקורי.

שם: ${name}
קטגוריה: ${cat}
${region ? `אזור: ${region}` : ''}
טקסט מקורי:
${primary || fiestaDesc}

כללים:
- שמור את כל העובדות, השירותים והפרטים מהמקור
- אל תוסיף מידע חדש ואל תמציא
- נסח מחדש רק אם צריך — בעברית פשוטה וטבעית
- 2-4 משפטים, בלי סיסמאות AI ובלי markdown
- החזר רק את התיאור`;
}

async function cleanDescription(vendor, keys) {
  const sourceInfo = getDescriptionSource(vendor);
  const original = sourceInfo.scrapingDesc || sourceInfo.fiestaDesc || sourceInfo.primary || '';
  const temp = sourceInfo.mode === 'light' ? 0.1 : 0.15;
  const raw = await callGemini(keys, buildDescriptionPrompt(vendor, sourceInfo), { temperature: temp });
  const cleaned = sanitizeOutput(raw);
  if (cleaned.length < 15) throw new Error('תיאור קצר מדי אחרי ניקוי');
  if (sourceInfo.mode !== 'minimal' && original && !isDescriptionOutputValid(original, cleaned, sourceInfo.mode)) {
    throw new Error('תיאור לא מבוסס על המקור — נדחה');
  }
  return cleaned;
}

function buildSingleReviewPrompt(vendor, review) {
  return `${AUTHENTICITY_RULES}

ערוך חוות דעת לקוח — רק על בסיס מה שנאמר במקור.

ספק: ${vendor.name}
חוות דעת מקורית (המקור היחיד):
${preCleanText(review.text || '')}

כללים:
- תקן כתיב, סדר וניסוח בלבד — אותו מסר, אותן עובדות
- אסור להוסיף מחמאות, פרטים או שמות שלא היו במקור
- אסור לשכתב כך שהמשמעות תשתנה
- 1-2 משפטים בעברית יומיומית
- אם זו פרסומת/spam/לא רלוונטי — החזר בדיוק: SKIP
- החזר רק את הטקסט המתוקן או SKIP`;
}

async function cleanReviews(vendor, keys) {
  const source = vendor.reviews || [];
  const cleaned = [];

  for (const r of source) {
    if (!reviewNeedsWork(r)) {
      cleaned.push(r);
      continue;
    }

    if (isObviousSpamReview(r.text)) {
      continue;
    }

    try {
      const raw = await callGemini(keys, buildSingleReviewPrompt(vendor, r), { temperature: 0.1 });
      const text = sanitizeOutput(raw);
      if (!text || text.toUpperCase() === 'SKIP' || isObviousSpamReview(text)) {
        continue;
      }
      if (!isReviewOutputValid(r.text || '', text)) {
        if (!isObviousSpamReview(r.text)) cleaned.push(r);
        continue;
      }
      cleaned.push({
        reviewer: (r.reviewer || 'לקוח').trim() || 'לקוח',
        rating: Number(r.rating) || 5,
        text,
        source: r.source || 'google',
      });
    } catch {
      if (!isObviousSpamReview(r.text)) cleaned.push(r);
    }
  }

  return cleaned;
}

async function processVendor(vendor, keys, options) {
  const changes = {};
  const log = { id: String(vendor._id), name: vendor.name, updates: [] };

  const doDesc = options.only === 'all' || options.only === 'descriptions';
  const doReviews = options.only === 'all' || options.only === 'reviews';

  if (doDesc && needsDescriptionWork(vendor)) {
    const sourceInfo = getDescriptionSource(vendor);
    const before = (vendor.description || '').slice(0, 120);
    const after = await cleanDescription(vendor, keys);
    changes.description = after;
    log.updates.push({
      field: 'description',
      mode: sourceInfo.mode,
      hadScrapingSource: Boolean(sourceInfo.scrapingDesc),
      before,
      after: after.slice(0, 120),
    });
  }

  if (doReviews && needsReviewWork(vendor)) {
    const beforeCount = (vendor.reviews || []).length;
    const after = await cleanReviews(vendor, keys);
    if (JSON.stringify(after) !== JSON.stringify(vendor.reviews || [])) {
      changes.reviews = after;
      log.updates.push({ field: 'reviews', beforeCount, afterCount: after.length });
    }
  }

  if (Object.keys(changes).length) {
    changes.contentCleanedAt = new Date();
    changes.contentCleanVersion = 3;
  }

  return { changes, log };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const env = loadEnv();
  const keys = getGeminiKeys(env);

  console.log(`\n=== ניקוי תוכן ספקים (Fiesta) ===`);
  console.log(`מצב: ${args.scan ? 'סкан בלבד' : args.dryRun ? 'dry-run' : 'שמירה ל-MongoDB'}`);
  console.log(`limit: ${args.limit} | only: ${args.only} | force: ${args.force}`);
  console.log(`כלל: מעבד רק תיאורים/ביקורות בעייתיים — לא נוגע במה שכבר תקין\n`);

  await connectMongo(env);
  const collection = mongoose.connection.db.collection('vendors');

  let query = {};
  if (args.id) {
    query = { _id: new mongoose.Types.ObjectId(args.id) };
  } else if (!args.force) {
    query = { contentCleanedAt: { $exists: false } };
  }

  let candidates = await collection.find(query).toArray();

  if (!args.id && args.only !== 'descriptions' && args.only !== 'reviews') {
    candidates = candidates.filter((v) => needsDescriptionWork(v) || needsReviewWork(v));
  } else if (args.only === 'descriptions') {
    candidates = candidates.filter((v) => needsDescriptionWork(v));
  } else if (args.only === 'reviews') {
    candidates = candidates.filter((v) => needsReviewWork(v));
  }

  const vendors = candidates.slice(0, args.limit);

  if (args.scan) {
    console.log(`נמצאו ${candidates.length} ספקים שזקוקים לטיפול (מתוך ${await collection.countDocuments(query)})\n`);
    for (const v of vendors) {
      const parts = [];
      if (needsDescriptionWork(v)) parts.push(`תיאור: ${describeDescriptionIssue(v.description)}`);
      if (needsReviewWork(v)) {
        const bad = (v.reviews || []).filter((r) => reviewNeedsWork(r)).length;
        parts.push(`ביקורות: ${bad} בעייתיות`);
      }
      console.log(`• ${v.name} — ${parts.join(' | ')}`);
    }
    console.log('');
    await mongoose.disconnect();
    return;
  }

  console.log(`נמצאו ${vendors.length} ספקים לעיבוד.\n`);

  const outDir = path.join(__dirname, 'output');
  fs.mkdirSync(outDir, { recursive: true });

  if (!vendors.length && !args.dryRun) {
    const unchecked = await collection.find({ contentCleanedAt: { $exists: false } }).toArray();
    let marked = 0;
    for (const v of unchecked) {
      if (!needsDescriptionWork(v) && !needsReviewWork(v)) {
        await collection.updateOne(
          { _id: v._id },
          { $set: { contentCleanedAt: new Date(), contentCleanVersion: 3, contentCleanSkipped: true } }
        );
        marked += 1;
      }
    }
    console.log(`✅ כל הספקים תקינים — סומנו ${marked} ספקים שנבדקו (ללא שינוי).\n`);
    await mongoose.disconnect();
    return;
  }

  if (!vendors.length) {
    console.log('✅ אין ספקים שזקוקים לעריכה.\n');
    await mongoose.disconnect();
    return;
  }

  if (!args.dryRun) {
    const backupPath = path.join(outDir, `pre-clean-backup-${Date.now()}.json`);
    fs.writeFileSync(
      backupPath,
      JSON.stringify(
        vendors.map((v) => ({
          _id: v._id,
          name: v.name,
          description: v.description,
          reviews: v.reviews,
        })),
        null,
        2
      ),
      'utf-8'
    );
    console.log(`גיבוי לפני עריכה: ${backupPath}\n`);
  }

  const report = [];
  let updated = 0;

  for (let i = 0; i < vendors.length; i += 1) {
    const vendor = vendors[i];
    console.log(`[${i + 1}/${vendors.length}] ${vendor.name}`);

    try {
      const { changes, log } = await processVendor(vendor, keys, args);

      if (!Object.keys(changes).length) {
        console.log('  ↷ דולג — תיאור וביקורות כבר תקינים');
        if (!args.dryRun && !args.force) {
          await collection.updateOne(
            { _id: vendor._id },
            { $set: { contentCleanedAt: new Date(), contentCleanVersion: 3 } }
          );
        }
        report.push({ ...log, skipped: true });
      } else {
        for (const u of log.updates) {
          if (u.field === 'description') {
            console.log(`  ✎ תיאור: "${u.after}..."`);
          }
          if (u.field === 'reviews') {
            console.log(`  ✎ ביקורות: ${u.beforeCount} → ${u.afterCount}`);
          }
        }

        if (!args.dryRun) {
          await collection.updateOne({ _id: vendor._id }, { $set: changes });
          updated += 1;
          console.log('  💾 נשמר');
        } else {
          console.log('  🔍 dry-run');
        }
        report.push(log);
      }
    } catch (error) {
      console.error(`  ❌ ${error.message}`);
      report.push({ id: String(vendor._id), name: vendor.name, error: error.message });
    }

    if (i < vendors.length - 1) await sleep(args.delayMs);
  }

  const reportPath = path.join(outDir, `clean-vendor-report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');

  console.log(`\nסיום. עודכנו ${updated} ספקים.`);
  console.log(`דוח: ${reportPath}`);

  if (!args.dryRun) {
    const unchecked = await collection.find({ contentCleanedAt: { $exists: false } }).toArray();
    let marked = 0;
    for (const v of unchecked) {
      if (!needsDescriptionWork(v) && !needsReviewWork(v)) {
        await collection.updateOne(
          { _id: v._id },
          { $set: { contentCleanedAt: new Date(), contentCleanVersion: 3, contentCleanSkipped: true } }
        );
        marked += 1;
      }
    }
    if (marked) console.log(`סומנו ${marked} ספקים תקינים נוספים (ללא שינוי).`);
  }

  const total = await collection.countDocuments({});
  const checked = await collection.countDocuments({ contentCleanedAt: { $exists: true } });
  console.log(`סטטוס: ${checked}/${total} ספקים נבדקו.\n`);

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('Fatal:', err.message);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});
