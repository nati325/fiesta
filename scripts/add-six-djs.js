/**
 * Add 6 DJs with weekday/weekend pricing + 7% customer / 8% Fiesta.
 * Pull images from official sites + attach real reviews where available.
 */
const fs = require('fs');
const path = require('path');
const dns = require('dns');
const { MongoClient } = require('mongodb');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const MONGODB_URI =
  'mongodb+srv://netaneldama_db_user:Dama3253%21%3F@cluster0.zptzjg6.mongodb.net/fiesta?retryWrites=true&w=majority&appName=Cluster0';

const CONTACT = '053-3452322'; // Fiesta manager line (coordination)
const WEEKDAY = 8500;
const WEEKEND = 10000;
const CUSTOMER_PCT = 7;
const FIESTA_PCT = 8;
const weekdayFiesta = Math.round(WEEKDAY * (1 - CUSTOMER_PCT / 100)); // 7905
const weekendFiesta = Math.round(WEEKEND * (1 - CUSTOMER_PCT / 100)); // 9300
const commissionWeekend = Math.round(WEEKEND * (FIESTA_PCT / 100)); // 800

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const DJS = [
  {
    name: 'NADAV SHUKRUN | נדב שוקרון',
    region: 'דרום / כל הארץ',
    phonePublic: '050-5888228',
    website: 'https://www.shukrunmusic.com',
    instagram: 'https://www.instagram.com/shukrunmusic/',
    imageUrls: [],
    // Will try duckduckgo for better images with site filter
    ddgQuery: 'נדב שוקרון דיג׳יי שירותי מוסיקה',
    description:
      'נדב שוקרון — דיג׳יי בעל ניסיון של למעלה מ־20 שנה ומאות חתונות. משלב תופים אקוסטיים ואלקטרוניים בלייב, קורא קהל מצוין ומשאיר רחבה מלאה עד הסוף. ליווי אישי, התאמה מוזיקלית ותחושת מסיבה אמיתית.',
    reviews: [
      {
        reviewer: 'לקוח',
        rating: 5,
        text: 'אחלה נדב! אלוף, מקצוען, מגיע עם אנרגיות טובות, זרימה וקלילות. מתאים את עצמו לצרכים, קשוב, אכפתי וזמין. מומלץ מאוד!',
        source: 'https://www.mit4mit.co.il/biz/29789',
      },
      {
        reviewer: 'זוג',
        rating: 5,
        text: 'הגענו אליו דרך המלצה מהאולם ומהפגישה הראשונה התאהבנו! עשה לנו את האירוע הכי מושלם. מביא תופים ואנרגיות מטורפות ועד עכשיו מקבלים עליו ביקורות טובות.',
        source: 'https://www.mit4mit.co.il/biz/29789',
      },
      {
        reviewer: 'חתן',
        rating: 5,
        text: 'דיג׳יי אגדי! בפגישת ההכנה וידא שהוא מבין מה אנחנו אוהבים, ובזמן אמת ידע לקרוא את הרחבה ולנהל מסיבה בלתי נשכחת. ממליץ 10/10.',
        source: 'https://www.mit4mit.co.il/biz/29789',
      },
    ],
  },
  {
    name: 'MOR GOLDSTEIN | מור גולדשטיין',
    region: 'מרכז / כל הארץ',
    phonePublic: '',
    website: 'https://www.djmor.co.il/',
    instagram: 'https://www.instagram.com/djmorgoldstein/',
    imageUrls: [
      'https://static.wixstatic.com/media/f90c9f_bfa2d1e713ca4ee0803f5a92a57bb2f1~mv2.jpg/v1/fill/w_960,h_640,al_c,q_85/f90c9f_bfa2d1e713ca4ee0803f5a92a57bb2f1~mv2.jpg',
      'https://static.wixstatic.com/media/f90c9f_04c870b3a60e4e9b99215437276087b5f000.jpg/v1/fill/w_960,h_540,al_c,q_80/f90c9f_04c870b3a60e4e9b99215437276087b5f000.jpg',
    ],
    ddgQuery: 'מור גולדשטיין דיג׳יי djmor',
    description:
      'מור גולדשטיין — חברת מוזיקה לאירועים מאז תחילת שנות ה־2000. יחס אישי, התאמת פלייליסט מדויקת לזוג ולקהל, וקו מוזיקלי צעיר שמשלב סגנונות לדורות שונים. המטרה: להפוך את החתונה לאירוע שמדברים עליו.',
    reviews: [
      {
        reviewer: 'לקוחה',
        rating: 5,
        text: 'פשוט וואו!! מקצועי, נעים, עשה עבודה מדהימה. מהרגע הראשון הקשיב, שאל שאלות ונתן המלצות מדויקות. הפלייליסט היה מושלם — הקפיץ כשצריך והרגיע במקומות הנכונים. קיבלנו מחמאות מהאורחים על המוזיקה.',
        source: 'https://www.mit4mit.co.il/biz/18180',
      },
      {
        reviewer: 'זוג',
        rating: 5,
        text: 'ידענו מהרגע הראשון שזו הבחירה הנכונה. רחבה מלאה עד השעות הקטנות, טיפים מדויקים ויחס מדהים.',
        source: 'https://engaged.co.il/המלצות/מור-גולדשטיין.html',
      },
    ],
  },
  {
    name: 'DJ TALPI | תומר טפירו',
    region: 'שרון / חדרה',
    phonePublic: '054-6648771',
    website: 'https://tapiro-music.com/',
    instagram: 'https://www.instagram.com/tapiro.music/',
    imageUrls: [],
    ddgQuery: 'תומר טפירו DJ TAPIRO חתונה',
    description:
      'DJ TALPI (תומר טפירו) — DJ ומפיק מוזיקלי עם למעלה מ־12 שנות ניסיון. מאות חתונות ובמות גדולות בארץ. רמיקסים וגרסאות קלאב מותאמות אישית, מיקס בין סגנונות, וערב מלא קצב ושמחה עד הסוף.',
    reviews: [],
  },
  {
    name: 'NIMROD AVISHAI | נמרוד אבישי',
    region: 'מרכז / גבעתיים',
    phonePublic: '077-4301270',
    website: 'https://www.djgutman.co.il/djs/dj-nimrod-avishai/',
    instagram: '',
    imageUrls: [],
    ddgQuery: 'נמרוד אבישי דיג׳יי גוטמן',
    description:
      'נמרוד אבישי — דיג׳יי דינמי עם ידע רחב בהפקות מוזיקליות ובמגוון סגנונות. התחיל במועדונים וצבר ניסיון בעשרות אירועים. מתמחה בקריאת קהל, חשיבה משותפת עם הזוג, והפקת ערב שלא שוכחים.',
    reviews: [],
  },
  {
    name: 'DOR MELODY | דור מלודי',
    region: 'צפון / חיפה',
    phonePublic: '054-5817006',
    website: 'https://www.djdormelody.co.il/',
    instagram: '',
    imageUrls: [
      'https://static.wixstatic.com/media/4c5523_6cf0ecb477a948529647982e64cb0347~mv2.jpg/v1/fill/w_1200,h_800,al_c,q_85/4c5523_6cf0ecb477a948529647982e64cb0347~mv2.jpg',
      'https://static.wixstatic.com/media/4c5523_c0c59a3211bc4af88864be8bd145f14b~mv2.jpg/v1/fill/w_800,h_600,al_c,q_80/4c5523_c0c59a3211bc4af88864be8bd145f14b~mv2.jpg',
    ],
    ddgQuery: 'דור מלודי דיג׳יי חיפה',
    description:
      'דור מלודי — תקליטן עם למעלה מ־22 שנות ניסיון. התחיל בגיל 17 במועדוני חיפה והפך לתקליטן בית במקומות מובילים בצפון. שולט בכל סגנונות החתונה, מפיק גרסאות ייחודיות לשירים, ובונה את הערב יחד איתכם לפי הקהל והבקשות.',
    reviews: [],
  },
  {
    name: 'ASAF HAR TAL | אסף הר טל',
    region: 'מרכז / תל אביב',
    phonePublic: '052-4666037',
    website: 'https://www.asafhartal.com/he/',
    instagram: '',
    imageUrls: [
      'https://www.asafhartal.com/wp-content/uploads/2025/07/87326809_10157254388172987_1239923252667613184_n.jpg',
      'https://www.asafhartal.com/wp-content/uploads/2025/03/293869216_545423183944454_5601792268952168468_n.jpg',
      'https://www.asafhartal.com/wp-content/uploads/2025/03/66849970_522241421909642_5111281958867784113_n.jpg',
    ],
    ddgQuery: 'אסף הרטל DJ Asaf Hartal',
    description:
      'אסף הר טל (Hartal) — DJ ומפיק מוזיקלי בינלאומי עם למעלה מ־20 שנות ניסיון. מתמחה בקריאת קהל ובשילוב ז׳אנרים לחתונות, אירועים פרטיים ומועדונים בארץ ובעולם. פסקול מותאם אישית — מקבלת פנים אלגנטית ועד רחבה בוערת.',
    reviews: [],
  },
];

function slugify(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

async function downloadUrl(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': UA,
        Accept: 'image/avif,image/webp,image/*,*/*;q=0.8',
        Referer: new URL(url).origin + '/',
      },
      redirect: 'follow',
    });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 2500) return null;
    // skip tiny placeholders
    if (buf.length < 8000 && /placeholder/i.test(url)) return null;
    return buf;
  } catch {
    return null;
  }
}

async function duckImages(query) {
  try {
    const pageUrl =
      'https://duckduckgo.com/?q=' + encodeURIComponent(query) + '&iax=images&ia=images';
    const page = await fetch(pageUrl, { headers: { 'User-Agent': UA, Accept: 'text/html' } });
    const html = await page.text();
    const vqd =
      html.match(/vqd=["']([^"']+)["']/)?.[1] || html.match(/vqd=([\d-]+)/)?.[1];
    if (!vqd) return [];
    const api =
      'https://duckduckgo.com/i.js?l=us-en&o=json&q=' +
      encodeURIComponent(query) +
      '&vqd=' +
      encodeURIComponent(vqd) +
      '&f=,,,,,&p=1';
    const res = await fetch(api, {
      headers: {
        'User-Agent': UA,
        Referer: 'https://duckduckgo.com/',
        Accept: 'application/json',
      },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || [])
      .map((r) => r.image)
      .filter((u) => u?.startsWith('http') && !/freepik|shutterstock|stock|placeholder/i.test(u));
  } catch {
    return [];
  }
}

function extFromBuffer(buf) {
  if (buf[0] === 0xff && buf[1] === 0xd8) return '.jpg';
  if (buf[0] === 0x89 && buf[1] === 0x50) return '.png';
  if (buf[0] === 0x52 && buf[1] === 0x49) return '.webp';
  return '.jpg';
}

async function resolveImages(dj, outDir, uploadBufferToCloudinary) {
  const candidates = [...(dj.imageUrls || [])];
  const ddg = await duckImages(dj.ddgQuery || dj.name);
  candidates.push(...ddg.slice(0, 6));

  const saved = [];
  for (const url of candidates) {
    if (saved.length >= 3) break;
    process.stdout.write(`    img ${String(url).slice(0, 70)}... `);
    const buf = await downloadUrl(url);
    if (!buf) {
      console.log('fail');
      continue;
    }
    const fileName = `${slugify(dj.name)}_${saved.length + 1}_${Date.now()}${extFromBuffer(buf)}`;
    fs.writeFileSync(path.join(outDir, fileName), buf);
    let web = `/images/vendors/${fileName}`;
    if (uploadBufferToCloudinary) {
      try {
        const up = await uploadBufferToCloudinary(buf, {
          originalName: fileName,
          uploadType: 'image',
          folder: `fiesta-vendors/djs/${slugify(dj.name)}`,
        });
        if (up?.url) web = up.url;
      } catch (e) {
        console.log('cld-fail', e.message);
      }
    }
    saved.push(web);
    console.log('ok', Math.round(buf.length / 1024) + 'KB');
  }
  return saved;
}

(async () => {
  const projectRoot = path.join(__dirname, '..');
  const outDir = path.join(projectRoot, 'public', 'images', 'vendors');
  fs.mkdirSync(outDir, { recursive: true });

  let uploadBufferToCloudinary = null;
  try {
    for (const line of fs.readFileSync(path.join(projectRoot, '.env'), 'utf8').split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#') || !t.includes('=')) continue;
      const eq = t.indexOf('=');
      if (!process.env[t.slice(0, eq).trim()]) process.env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
    }
    uploadBufferToCloudinary = (await import('../lib/cloudinaryUpload.js')).uploadBufferToCloudinary;
  } catch {
    /* local only */
  }

  const client = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 25000 });
  await client.connect();
  const col = client.db('fiesta').collection('vendors');
  const report = [];

  for (const dj of DJS) {
    console.log('\n===', dj.name, '===');
    const exists = await col.findOne({
      type: 'dj',
      name: { $regex: new RegExp(dj.name.split('|')[0].trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
    });
    if (exists) {
      console.log('  exists — updating pricing/content');
    }

    const images = await resolveImages(dj, outDir, uploadBufferToCloudinary);
    const image = images[0] || '';
    const portfolio = images.map((img, i) => ({ title: `תמונה ${i + 1}`, image: img }));

    const doc = {
      name: dj.name,
      type: 'dj',
      description: dj.description,
      contact: CONTACT,
      image,
      region: dj.region,
      price: String(weekendFiesta),
      originalPrice: String(WEEKEND),
      discount: String(CUSTOMER_PCT),
      discountType: 'percent',
      commissionAmount: commissionWeekend,
      agreementSigned: false,
      agreementImage: '',
      adminNotes: [
        `עסקה Fiesta: אמצע שבוע ₪${WEEKDAY.toLocaleString('he-IL')} | סופ״ש ₪${WEEKEND.toLocaleString('he-IL')}`,
        `הנחת לקוח: ${CUSTOMER_PCT}% → שבוע ₪${weekdayFiesta.toLocaleString('he-IL')} / סופ״ש ₪${weekendFiesta.toLocaleString('he-IL')}`,
        `עמלת Fiesta: ${FIESTA_PCT}% (₪${commissionWeekend} על בסיס סופ״ש)`,
        `טלפון מנהל/תיאום: ${CONTACT}`,
        dj.phonePublic ? `טלפון ציבורי ידוע: ${dj.phonePublic}` : null,
        dj.website ? `אתר: ${dj.website}` : null,
      ]
        .filter(Boolean)
        .join('\n'),
      instagramLink: dj.instagram || '',
      googleRating: 5,
      googleReviewsCount: dj.reviews.length,
      mainProductId: 'weekend',
      products: [
        {
          id: 'weekday',
          name: 'חבילת DJ — אמצע שבוע',
          price: String(weekdayFiesta),
          originalPrice: String(WEEKDAY),
          image,
        },
        {
          id: 'weekend',
          name: 'חבילת DJ — סוף שבוע',
          price: String(weekendFiesta),
          originalPrice: String(WEEKEND),
          image,
        },
      ],
      videos: [],
      portfolio,
      reviews: dj.reviews,
      eventTypes: ['חתונה'],
      priceIncludesVat: true,
      createdAt: new Date(),
    };

    if (exists) {
      const { createdAt, ...update } = doc;
      await col.updateOne({ _id: exists._id }, { $set: update });
      report.push({ name: dj.name, status: 'updated', id: String(exists._id), images: images.length });
    } else {
      const ins = await col.insertOne(doc);
      report.push({ name: dj.name, status: 'inserted', id: String(ins.insertedId), images: images.length });
    }
    console.log('  done images=', images.length);
  }

  console.log('\nREPORT\n', JSON.stringify(report, null, 2));
  await client.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
