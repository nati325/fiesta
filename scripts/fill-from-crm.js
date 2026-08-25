const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const { MongoClient } = require('mongodb');

const URI =
  'mongodb+srv://netaneldama_db_user:Dama3253%21%3F@cluster0.zptzjg6.mongodb.net/fiesta?retryWrites=true&w=majority&appName=Cluster0';

function r(reviewer, rating, text, source) {
  return { reviewer, rating, text, source: source || '' };
}

const ALIAH_DESC =
  'בית האופנה של אליה הוקם בשנת 2009 ומאז מייצר שמלות כלה ושמחות. לאורך השנים צברנו מוניטין בזכות עיצובים ייחודיים ויחס אישי לכל כלה, והפכנו חלום למציאות לאלפי כלות בישראל. מתמחים בתפירה אישית של שמלות כלה מגוונות, עם דגש לשמלות צנועות ומענה מלא גם למגזר הדתי ולכלות בכל המידות. הבדים, התפירה המקצועית והגזרות המותאמות לכל גוף מאפשרים חוויה ייחודית ושמלה חלומית.';

const EHUD_DESC = `מעצב שיער ומאפרת מגיעים עד אלייך ביום האירוע.
אהוד אלבז בעל ניסיון של 20 שנה בעיצוב שיער וסירוק כלות, עם השתלמויות בארץ ובחו״ל. ביום החתונה תקבלי תסרוקת מקצועית, שזירת שיער טבעית ועמידות לאורך כל האירוע, עם התאמה למבנה הפנים, לאיפור ולשמלה.
ליטל, אשתו, מאפרת מקצועית בוגרת איל מקיאג׳ עם ניסיון של 10 שנים באיפור כלות ואירועים. השילוב של אהוד וליטל מדגיש את היופי הייחודי שלך.
שירותים: עיצוב שיער, תסרוקות כלה/ערב כולל הגעה ביום האירוע, איפור מקצועי, עיצוב גבות, תוספות שיער. הסטודיו בחיפה, חנה סנש 45.`;

const INBAL_DESC =
  'אני לא רק מניחה צבע, אלא לומדת את התווים שלך ואת מה שגורם לך להרגיש בנוח. בעזרת טכניקות מקצועיות ודגש על אסתטיקה נקייה אני יוצרת חוויה רגועה, עוטפת וללא לחץ של זמן. איפור הוא לא מסכה — הוא כלי שנועד לגרום לך להרגיש הגרסה הכי זוהרת, בטוחה ואותנטית של עצמך. מציעה חבילות מגוונות לאירוע הגדול שלך.';

function cheapestMain(products) {
  const mains = (products || []).filter(
    (p) => p.active !== false && (p.kind || 'main') === 'main'
  );
  if (!mains.length) return null;
  return mains.slice().sort((a, b) => Number(a.price) - Number(b.price))[0];
}

(async () => {
  const client = new MongoClient(URI, { serverSelectionTimeoutMS: 25000 });
  await client.connect();
  const col = client.db('fiesta').collection('vendors');
  const report = [];

  async function patch(filter, update, label) {
    const res = await col.updateOne(filter, { $set: { ...update, updatedAt: new Date() } });
    report.push({ label, matched: res.matchedCount, modified: res.modifiedCount });
  }

  // --- Easy DJ: empty region → מרכז, fix rating stuffed in link ---
  await patch(
    { name: /דיג׳י איזי|DJ EASY/i },
    {
      region: 'מרכז',
      regions: ['מרכז'],
      googleRating: 4.85,
      googleReviewsLink: '',
    },
    'easy-region-rating'
  );

  // --- Eliyahu: broken reviews → array ---
  const eliyahu = await col.findOne({ name: /אליהו ידגרוב/ });
  if (eliyahu && !Array.isArray(eliyahu.reviews)) {
    await patch({ _id: eliyahu._id }, { reviews: [] }, 'eliyahu-reviews-array');
  }

  // --- Meital: starting price from CRM review + 7% already stored ---
  const meital = await col.findOne({ name: /מיטל גמליאל/ });
  if (meital) {
    const list = 4500;
    const clientPrice = Math.round(list * 0.93);
    const commission = Math.round(list * 0.08);
    const existing = Array.isArray(meital.reviews) ? meital.reviews : [];
    const extra = [
      r(
        'לקוחה',
        5,
        'מיטל בחורה מדהימה, סבלנית ומתאימה את השמלה לכלה בדיוק לפי הסגנון. היחס מדהים. הסלון של מיטל היה הראשון שנכנסתי אליו ולא היה צורך ללכת לעוד. העיצוב מהמם.',
        'https://engaged.co.il/המלצות/מיטל-גמליאל.html'
      ),
    ];
    await patch(
      { _id: meital._id },
      {
        originalPrice: String(list),
        price: String(clientPrice),
        discount: '7',
        commissionAmount: commission,
        commissionPercent: 8,
        mainProductId: 'dress-from',
        products: [
          {
            id: 'dress-from',
            name: 'שמלה החל מ',
            kind: 'main',
            price: String(clientPrice),
            originalPrice: String(list),
            active: true,
            order: 0,
            commissionAmount: commission,
          },
        ],
        reviews: existing.length ? existing : extra,
        adminNotes: (meital.adminNotes || '').includes('מחיר פתיחה ₪4,500')
          ? meital.adminNotes
          : `${meital.adminNotes || ''}\n---\nמחיר פתיחה ₪4,500 מתוך ביקורת/פרסום CRM (לא מחירון חוזה). הנחה 7% → ₪${clientPrice.toLocaleString('he-IL')} ללקוח.`.trim(),
      },
      'meital-price-reviews'
    );
  }

  // --- Aliah: description + reviews + address in notes ---
  const aliah = await col.findOne({ name: /אליה שמלות|Aliah/i });
  if (aliah) {
    const existing = Array.isArray(aliah.reviews) ? aliah.reviews : [];
    const extra = [
      r(
        'לקוחה',
        5,
        'לאחר שיטוט לא קצר הגעתי אל אליה בדיזינגוף וקיבלתי יחס אמיתי, מחיר סביר ושירות מקצועי.',
        'https://engaged.co.il/המלצות/אליה-ברידל.html'
      ),
      r(
        'לקוחה',
        5,
        'הצוות פשוט מהמם. נחמדים, סבלניים, ונותנים הרגשה שהם באמת פה בשבילך ושחשוב להם שנהיה מרוצות ורגועות לאורך כל הדרך.',
        'https://engaged.co.il/המלצות/אליה-ברידל.html'
      ),
    ];
    await patch(
      { _id: aliah._id },
      {
        description: ALIAH_DESC,
        reviews: existing.length ? existing : extra,
        adminNotes: (aliah.adminNotes || '').includes('אלטלף אברהם 9')
          ? aliah.adminNotes
          : `${aliah.adminNotes || ''}\n---\nכתובת מ-CRM: אלטלף אברהם 9, יהוד.`.trim(),
      },
      'aliah-desc-reviews'
    );
  }

  // --- Ehud: long description + real reviews ---
  const ehud = await col.findOne({ name: /אהוד אלבז/ });
  if (ehud) {
    const extra = [
      r('עינת', 5, 'חוויה מאוד נעימה, יחס אישי ומקצועי, עבודה מדויקת, יפה ומהירה. יצאתי מרוצה מהתוצאה.', 'https://www.mit4mit.co.il/biz/739'),
      r('זהבה', 5, 'כמה ימים לפני האירוע גוונים מושלמים בשיער שעליהם קיבלתי מלא מחמאות. ביום האירוע סירק אותי ואת הילדה במקצועיות, והתוצאה החזיקה כל הערב.', 'https://www.mit4mit.co.il/biz/739'),
      r('Tali', 5, 'ליטל ואהוד פשוט מקסימים ומקצועיים. השיער והאיפור שרדו את כל החתונה ויצאתי מרוצה מאוד. לא הפסקתי לקבל מחמאות.', 'https://www.mit4mit.co.il/biz/739'),
      r('Natali', 5, 'אווירה מושלמת ויחס אישי וכיפי. תסרוקת מדהימה שלא זזה כל היום. ממליצה בחום, אין על אהוד.', 'https://www.mit4mit.co.il/biz/739'),
      r('ענבל', 5, 'הזמנו את אהוד וליטל לאיפור ושיער לי, לאמא שלי ולבת שלי לחתונה של אחי. כולנו יצאנו מהממות וקיבלנו מחמאות כל הערב.', 'https://www.mit4mit.co.il/biz/739'),
      r('מזל אולן', 5, 'איפור ברמה גבוהה מאוד, מתאים לבגדים ולתווי הפנים, סוג העור והצבע. מומלץ מאוד.', 'https://www.mit4mit.co.il/biz/739'),
    ];
    const existing = Array.isArray(ehud.reviews) ? ehud.reviews : [];
    await patch(
      { _id: ehud._id },
      {
        description: EHUD_DESC,
        reviews: existing.length >= 4 ? existing : extra,
        googleRating: 4,
        googleReviewsCount: 127,
      },
      'ehud-desc-reviews'
    );
  }

  // --- Inbal: better desc, one real review, escort/evening → addon, headline = bridal ---
  const inbal = await col.findOne({ name: /ענבל אלבר/ });
  if (inbal) {
    const products = (inbal.products || []).map((p) => {
      const name = String(p.name || '');
      if (/ליווי|ערב/.test(name)) return { ...p, kind: 'addon' };
      return p;
    });
    const base = cheapestMain(products);
    const extra = [
      r(
        'ענבל צור',
        5,
        'ענבל הייתה מדהימה. גם חמודה ונעימה וגם אהבתי מאוד את האיפור — עדין מאוד אבל עמיד ויפה. איפרה גם את האחיות שלי, בשיא הרוגע ותמיד עם חיוך.',
        'https://engaged.co.il/המלצות/ענבל-אלבר-מאפרת-כלות.html'
      ),
    ];
    const existing = Array.isArray(inbal.reviews) ? inbal.reviews : [];
    await patch(
      { _id: inbal._id },
      {
        description: INBAL_DESC,
        products,
        price: base ? String(base.price) : inbal.price,
        originalPrice: base ? String(base.originalPrice) : inbal.originalPrice,
        commissionAmount: base ? base.commissionAmount || 200 : inbal.commissionAmount,
        reviews: existing.length ? existing : extra,
      },
      'inbal-kind-desc'
    );
  }

  // --- Diti: evening → addon, fix rating 201, headline = bridal ---
  const diti = await col.findOne({ name: /דיתי מסר/ });
  if (diti) {
    const products = (diti.products || []).map((p) => {
      const name = String(p.name || '');
      if (/ערב/.test(name)) return { ...p, kind: 'addon' };
      return p;
    });
    const base = cheapestMain(products);
    await patch(
      { _id: diti._id },
      {
        products,
        price: base ? String(base.price) : '1395',
        originalPrice: base ? String(base.originalPrice) : '1500',
        commissionAmount: base ? base.commissionAmount || 120 : 120,
        googleRating: 5,
        googleReviewsCount: 201,
      },
      'diti-kind-rating'
    );
  }

  // --- Lena: real reviews ---
  const lena = await col.findOne({ name: /לנה זינמן/ });
  if (lena) {
    const existing = Array.isArray(lena.reviews) ? lena.reviews : [];
    const extra = [
      r(
        'לקוחה',
        5,
        'הכרנו ב-2021 כשאיפרה אותי ביום החתונה. האיפור היה מושלם, והיה לי ברור שעוד ניפגש. ב-2026 איפרה אותי ואת הבת שלי לאירוע בת מצווה.',
        'https://engaged.co.il/המלצות/לנה-זינמן-איפור.html'
      ),
      r(
        'לקוחה',
        5,
        'לנה איפרה אותי פעמיים לפני תקופת החתונה, פעם כמלווה ופעם לאירוע משפחתי. בדרך כלל אני לא אוהבת להתאפר, ומאוד אהבתי איך שהיא איפרה אותי.',
        'https://engaged.co.il/המלצות/לנה-זינמן-איפור.html'
      ),
    ];
    if (!existing.length) {
      await patch({ _id: lena._id }, { reviews: extra }, 'lena-reviews');
    } else {
      report.push({ label: 'lena-reviews', matched: 1, modified: 0, skip: 'already has reviews' });
    }
  }

  // --- Mor: public phone into notes if missing ---
  const mor = await col.findOne({ name: /MOR GOLDSTEIN|מור גולדשטיין/i });
  if (mor && !(mor.adminNotes || '').includes('052-4888311')) {
    await patch(
      { _id: mor._id },
      { adminNotes: `${mor.adminNotes || ''}\nטלפון ציבורי ידוע: 052-4888311 (פרדסיה)`.trim() },
      'mor-public-phone'
    );
  }

  // --- Sharon: spread vendor-level price into a package ---
  const sharon = await col.findOne({ name: /^שרון כהן$/ });
  if (sharon && (!sharon.products || !sharon.products.length) && sharon.price) {
    await patch(
      { _id: sharon._id },
      {
        products: [
          {
            id: 'main',
            name: 'חבילת DJ',
            kind: 'main',
            price: String(sharon.price),
            originalPrice: String(sharon.originalPrice || sharon.price),
            active: true,
            order: 0,
            commissionAmount: sharon.commissionAmount || 0,
          },
        ],
        mainProductId: 'main',
      },
      'sharon-package'
    );
  }

  // --- Acapella: mit4mit rating counts ---
  const acapella = await col.findOne({ name: /^אקפלה$/ });
  if (acapella) {
    await patch(
      { _id: acapella._id },
      {
        googleRating: 4,
        googleReviewsCount: 590,
        googleReviewsLink: 'https://www.mit4mit.co.il/biz/2953',
      },
      'acapella-rating'
    );
  }

  // Any remaining empty region → מרכז
  const emptyRegion = await col
    .find({
      $or: [{ region: { $in: [null, ''] } }, { region: { $exists: false } }],
    })
    .project({ name: 1, region: 1 })
    .toArray();
  for (const v of emptyRegion) {
    await patch({ _id: v._id }, { region: 'מרכז', regions: ['מרכז'] }, `region-center:${v.name}`);
  }

  console.log('PATCHES', JSON.stringify(report, null, 2));

  const all = await col.find({}).toArray();
  const leftover = all.map((v) => {
    const gaps = [];
    if (!v.image) gaps.push('תמונה');
    const disc = String(v.discount || '').trim();
    if (!disc || disc === '0') gaps.push('הנחה');
    if (!v.products || !v.products.length) gaps.push('חבילות');
    const range = /^\d[\d,]*\s*[-–—]\s*\d/.test(String(v.price || ''));
    if (range) gaps.push('טווח בלי פירוט');
    if (!v.agreementSigned) gaps.push('הסכם לא חתום');
    if (!v.region) gaps.push('אזור');
    const desc = String(v.description || '');
    if (desc.length < 40) gaps.push('תיאור קצר');
    const reviewsOk = Array.isArray(v.reviews) ? v.reviews.length : 0;
    if (!reviewsOk) gaps.push('ביקורות');
    const mains = (v.products || []).filter((p) => (p.kind || 'main') === 'main' && p.active !== false);
    const evenings = mains.filter((p) => /ערב/.test(p.name || ''));
    if (evenings.length) gaps.push('ערב עדיין main');
    if (String(v.price) === '0') gaps.push('מחיר 0');
    return {
      name: v.name,
      type: v.type,
      region: v.region,
      price: v.price,
      originalPrice: v.originalPrice,
      discount: v.discount || '',
      products: (v.products || []).map((p) => `${p.name}[${p.kind || 'main'}]=${p.price}`).join(' | '),
      reviews: Array.isArray(v.reviews) ? v.reviews.length : 'NOT_ARRAY',
      image: !!v.image,
      signed: !!v.agreementSigned,
      gaps: gaps.join(' · '),
    };
  });
  console.log('\nREMAINING');
  leftover
    .filter((v) => v.gaps)
    .forEach((v) => console.log('-', v.type, '|', v.name.split('|')[0].trim(), '|', v.price, '|', v.gaps));
  console.log(
    '\nCLEAN',
    leftover.filter((v) => !v.gaps).map((v) => v.name.split('|')[0].trim())
  );

  await client.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
