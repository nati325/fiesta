/** Scan CRM suppliers_complete.json with same rules as clean-vendor-content.js */
const fs = require('fs');
const path = require('path');

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

const SCRAPING_JUNK_PATTERNS = [
  /#\d{5,6}/,
  /&#\d+;/,
  /&nbsp;/i,
  /<[^>]+>/,
  /\\u[0-9a-f]{4}/i,
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

function isGenericDescription(text) {
  return GENERIC_DESC_PATTERNS.some((p) => p.test(text || ''));
}

function hasScrapingJunk(text) {
  return SCRAPING_JUNK_PATTERNS.some((p) => p.test(text || ''));
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

function needsDescriptionWork(v) {
  const desc = (v.description || '').trim();
  if (!desc) return false;
  return !isDescriptionGoodEnough(desc);
}

function needsReviewWork(v) {
  const reviews = v.reviews || [];
  if (!reviews.length) return false;
  return reviews.some((r) => reviewNeedsWork(r));
}

const jsonPath = path.join(__dirname, '..', '..', '..', '‏‏scarping_for_fiesta - עותק', 'data', 'suppliers_complete.json');
const arr = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

let descIssues = 0;
let reviewIssues = 0;
let anyIssues = 0;
let alreadyClean = 0;
let good = 0;

for (const s of arr) {
  if (s.contentCleanedAt || s.cleaned_by_gemini) alreadyClean++;
  const d = needsDescriptionWork(s);
  const r = needsReviewWork(s);
  if (d) descIssues++;
  if (r) reviewIssues++;
  if (d || r) anyIssues++;
  else good++;
}

console.log('=== CRM suppliers_complete.json ===');
console.log('סה"כ:', arr.length);
console.log('כבר נוקו (cleaned_by_gemini/contentCleanedAt):', alreadyClean);
console.log('תיאור שזקוק לטיפול:', descIssues);
console.log('ביקורות שזקוקות לטיפול:', reviewIssues);
console.log('ספקים עם בעיה כלשהי:', anyIssues);
console.log('ספקים תקינים (ללא שינוי):', good);
