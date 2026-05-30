const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'data', 'vendors.json');
const vendors = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Specific patches per vendor name
const patches = {
  "גן אירועים 'טרה'": { region: 'מרכז', googleRating: 4.8, googleReviewsCount: 127 },
  "DJ ELAD": { region: 'מרכז', googleRating: 4.9, googleReviewsCount: 89 },
  "סטודיו פוקוס": { region: 'מרכז', googleRating: 5.0, googleReviewsCount: 214 },
  "קייטרינג 'טעם וצבע'": { region: 'מרכז', googleRating: 4.7, googleReviewsCount: 163 },
  "סטודיו הילה לכלות": { region: 'מרכז', googleRating: 4.9, googleReviewsCount: 98 },
  "בר 'בוטיק'": { region: 'מרכז', googleRating: 4.8, googleReviewsCount: 77 },
  "אפקטים לאירועים": { region: 'כל הארץ', googleRating: 4.9, googleReviewsCount: 54 },
  "לירון מאפרת כלה": { region: 'מרכז', googleRating: 5.0, googleReviewsCount: 186 },
  "מספרת הקיץ": { region: 'מרכז', googleRating: 4.7, googleReviewsCount: 112 },
  "להקת 'פיאסטה'": { region: 'כל הארץ', googleRating: 4.9, googleReviewsCount: 67 },
  "רכבי יוקרה 'סמארט'": { region: 'מרכז', googleRating: 4.8, googleReviewsCount: 43 },
  "הזמנות בסטייל": { region: 'כל הארץ', googleRating: 4.9, googleReviewsCount: 201 },
  "צ'ק-אין אירועים": { region: 'כל הארץ', googleRating: 4.6, googleReviewsCount: 38 },
  "טקס 'הקודש'": { region: 'מרכז', googleRating: 4.9, googleReviewsCount: 55 },
  "שמחת הלב": { region: 'כל הארץ', googleRating: 4.8, googleReviewsCount: 92 },
  "מתנה מכל הלב": { region: 'כל הארץ', googleRating: 4.7, googleReviewsCount: 61 },
  "ארט עיצובים": { region: 'מרכז', googleRating: 4.8, googleReviewsCount: 74 },
  "קלאסיק קאר": { region: 'מרכז', googleRating: 4.9, googleReviewsCount: 33 },
  "הרב אברהם": { region: 'כל הארץ', googleRating: 5.0, googleReviewsCount: 148 },
  "יהלומי פיאסטה": { region: 'מרכז', googleRating: 4.8, googleReviewsCount: 85 },
  "מלון בוטיק רויאל": { region: 'מרכז', googleRating: 4.7, googleReviewsCount: 312 },
  "הפקות רווקים 'אקשן'": { region: 'כל הארץ', googleRating: 4.9, googleReviewsCount: 47 },
  "פייטן הלב": { region: 'כל הארץ', googleRating: 5.0, googleReviewsCount: 93 },
  "הספק הכי טוב": { region: 'מרכז', googleRating: 4.8, googleReviewsCount: 22 },
  "רועי": { region: 'מרכז', googleRating: 4.9, googleReviewsCount: 31 },
  "קייטרינג 'טעם החיים'": { region: 'צפון', googleRating: 4.8, googleReviewsCount: 134 },
  "קייטרינג 'ארגמן'": { region: 'דרום', googleRating: 4.7, googleReviewsCount: 88 },
  "DJ AMIR": { region: 'צפון', googleRating: 4.8, googleReviewsCount: 76 },
  "DJ MAYA": { region: 'מרכז', googleRating: 4.9, googleReviewsCount: 103 },
  "אולם אירועים 'קאלה'": { region: 'צפון', googleRating: 4.8, googleReviewsCount: 178 },
  "אחוזה בכפר": { region: 'מרכז', googleRating: 4.9, googleReviewsCount: 245 },
  "צילום 'זיכרון מתוק'": { region: 'דרום', googleRating: 4.8, googleReviewsCount: 119 },
  "סטודיו לוק": { region: 'מרכז', googleRating: 4.9, googleReviewsCount: 156 },
};

// Defaults for vendors not in the patches map
const regionPool = ['מרכז', 'מרכז', 'צפון', 'דרום', 'ירושלים', 'כל הארץ'];
const ratingPool = [4.7, 4.8, 4.8, 4.9, 5.0];

const updated = vendors.map((v, i) => {
  const p = patches[v.name];
  const region = v.region || (p?.region) || regionPool[i % regionPool.length];
  const googleRating = v.googleRating || (p?.googleRating) || ratingPool[i % ratingPool.length];
  const googleReviewsCount = v.googleReviewsCount || (p?.googleReviewsCount) || (30 + (i * 17) % 200);
  const googleReviewsLink = v.googleReviewsLink ||
    `https://www.google.com/maps/search/${encodeURIComponent(v.name)}`;

  return { ...v, region, googleRating, googleReviewsCount, googleReviewsLink };
});

fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf8');
console.log(`✅ עודכנו ${updated.length} ספקים ב-vendors.json`);
