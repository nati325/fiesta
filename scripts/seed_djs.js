import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const MONGODB_URI = 'mongodb+srv://netaneldama_db_user:Dama3253!%3F@cluster0.zptzjg6.mongodb.net/fiesta?retryWrites=true&w=majority&appName=Cluster0';

const copyFiles = () => {
  const srcDir = 'C:\\Users\\123\\.gemini\\antigravity\\brain\\842f267d-bab2-4fa2-bb42-c2400bf19e01';
  const destDir = path.join(process.cwd(), 'public', 'images');
  
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const files = {
    'dj_tomer_1779017009511.png': 'dj_tomer.png',
    'dj_roy_1779017022727.png': 'dj_roy.png',
    'dj_idan_1779017038227.png': 'dj_idan.png',
    'dj_asaf_1779018921882.png': 'dj_asaf.png',
    'dj_guy_1779018938144.png': 'dj_guy.png',
    'dj_noa_1779018951852.png': 'dj_noa.png',
    'dj_ben_1779018965426.png': 'dj_ben.png'
  };

  for (const [srcName, destName] of Object.entries(files)) {
    const srcPath = path.join(srcDir, srcName);
    const destPath = path.join(destDir, destName);
    try {
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied ${srcName} to ${destName}`);
      } else {
        console.warn(`Source file not found: ${srcPath}`);
      }
    } catch (err) {
      console.error(`Failed to copy ${srcName}:`, err);
    }
  }
};

const VendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String },
  contact: { type: String },
  image: { type: String },
  region: { type: String },
  price: { type: String },
  originalPrice: { type: String },
  discount: { type: String },
  discountType: { type: String, default: 'percent' },
  commissionAmount: { type: Number, default: 0 },
  agreementSigned: { type: Boolean, default: false },
  agreementImage: { type: String },
  adminNotes: { type: String },
  googleReviewsLink: { type: String },
  googleRating: { type: Number, default: 5 },
  googleReviewsCount: { type: Number, default: 0 },
  mainProductId: { type: String },
  products: [{
    id: String,
    name: String,
    price: String,
    originalPrice: String,
    image: String
  }],
  videos: [String],
  portfolio: [{
    title: String,
    image: String,
    price: String
  }],
  createdAt: { type: Date, default: Date.now }
});

const Vendor = mongoose.models.Vendor || mongoose.model('Vendor', VendorSchema);

const djs = [
  {
    name: "די ג'יי תומר אהרון",
    type: "dj",
    description: "תומר אהרון הוא מבכירי הדי ג'יים בישראל, מתמחה בחתונות מרימות ואנרגיות מטורפות. עם מעל עשור של ניסיון במועדונים הנחשבים ביותר, תומר מביא את הווייב של קלאב אמיתי לרחבת הריקודים שלכם. הוא יודע בדיוק איך לקרוא את הקהל, לשלב סגנונות בצורה חלקה, ולהשאיר את האורחים שלכם על הרגליים עד אור הבוקר.",
    contact: "054-1234567",
    image: "/images/dj_tomer.png",
    region: "מרכז",
    price: "7500",
    originalPrice: "8500",
    discount: "1000",
    discountType: "amount",
    commissionAmount: 500,
    agreementSigned: true,
    googleRating: 4.9,
    googleReviewsCount: 124,
    products: [],
    videos: [],
    portfolio: []
  },
  {
    name: "די ג'יי רועי בן צבי",
    type: "dj",
    description: "מחפשים קלאס באפס מאמץ? רועי בן צבי הוא הבחירה המושלמת לחתונות אלגנטיות, חתונות צהריים, ואירועי בוטיק. עם ידע מוזיקלי עשיר ויכולת התאמה אישית של כל פלייליסט, רועי הופך כל קבלת פנים לחוויה קסומה ואת המסיבה עצמה למסע מוזיקלי מרגש שחוצה דורות ומחבר בין כולם.",
    contact: "052-7654321",
    image: "/images/dj_roy.png",
    region: "שרון",
    price: "6800",
    originalPrice: "7500",
    discount: "700",
    discountType: "amount",
    commissionAmount: 400,
    agreementSigned: true,
    googleRating: 4.8,
    googleReviewsCount: 98,
    products: [],
    videos: [],
    portfolio: []
  },
  {
    name: "די ג'יי עידן כהן",
    type: "dj",
    description: "לזוגות שמחפשים משהו קצת אחר, עידן כהן מביא סאונד מודרני, אלקטרוני ובועט. מתמחה בחתונות שטח, אירועי שישי, ושילוב של לייב ביטים על העמדה. עידן הוא אמן יוצר בפני עצמו שיודע לקחת שירים מוכרים ולתת להם טוויסט מפתיע שמשאיר את האורחים פעורי פה ורוקדים בלי הפסקה.",
    contact: "050-9876543",
    image: "/images/dj_idan.png",
    region: "כל הארץ",
    price: "8000",
    originalPrice: "9000",
    discount: "1000",
    discountType: "amount",
    commissionAmount: 600,
    agreementSigned: true,
    googleRating: 5.0,
    googleReviewsCount: 156,
    products: [],
    videos: [],
    portfolio: []
  },
  {
    name: "די ג'יי אסף לוי",
    type: "dj",
    description: "אסף מביא את המיינסטרים והפופ בגרסאות הכי עדכניות שיש. מומחה בקריאת קהל צעיר שרוצה פשוט לרקוד את כל הלהיטים, עם מעברים חלקים שמקפיצים את הרחבה. אם אתם רוצים מסיבה שמרגישה כמו פסטיבל פופ – אסף הוא האיש שלכם.",
    contact: "053-4567890",
    image: "/images/dj_asaf.png",
    region: "דרום",
    price: "6500",
    originalPrice: "7200",
    discount: "700",
    discountType: "amount",
    commissionAmount: 400,
    agreementSigned: true,
    googleRating: 4.7,
    googleReviewsCount: 82,
    products: [],
    videos: [],
    portfolio: []
  },
  {
    name: "די ג'יי גיא מור",
    type: "dj",
    description: "גיא מור הוא אגדה בתחום חתונות הרטרו. אם אתם אוהבים אייטיז, ניינטיז, פאנק ודיסקו - גיא יעשה לכם מסיבה של פעם בחיים. הוא מביא איתו ניסיון עצום, ספריות מוזיקה נדירות, ויכולת חיבור מדהימה לכל גיל. מומחה לשבירת שגרה מוזיקלית.",
    contact: "050-1122334",
    image: "/images/dj_guy.png",
    region: "מרכז",
    price: "8500",
    originalPrice: "9500",
    discount: "1000",
    discountType: "amount",
    commissionAmount: 700,
    agreementSigned: true,
    googleRating: 4.9,
    googleReviewsCount: 210,
    products: [],
    videos: [],
    portfolio: []
  },
  {
    name: "די ג'יי נועה שקד",
    type: "dj",
    description: "נועה שקד פרצה בסערה לעולם חתונות האינדי והאלטרנטיב. היא משלבת רוק, פופ קצבי, ואינדי בדרך שגורמת לכולם לקפוץ. היא מביאה איתה אנרגיות שיא, חיוך שלא יורד, ויכולת לשלב בין הבקשות הכי מיוחדות שלכם ללהיטים שכולם מכירים ואוהבים.",
    contact: "052-9988776",
    image: "/images/dj_noa.png",
    region: "ירושלים והסביבה",
    price: "7000",
    originalPrice: "8000",
    discount: "1000",
    discountType: "amount",
    commissionAmount: 500,
    agreementSigned: true,
    googleRating: 4.8,
    googleReviewsCount: 104,
    products: [],
    videos: [],
    portfolio: []
  },
  {
    name: "די ג'יי בן דויד",
    type: "dj",
    description: "אין חפלה טובה בלי בן דויד. אלוף במוזיקה מזרחית, ים-תיכונית ולהיטי חתונות שמרקידים את כולם, מסבתא ועד אחרון החברים מהצבא. בן יודע להרים את הקהל, לעשות שמח אמיתי מכל הלב, ולשמור על הקצב בשיא עד השעות הקטנות של הלילה.",
    contact: "054-5566778",
    image: "/images/dj_ben.png",
    region: "צפון",
    price: "7200",
    originalPrice: "7800",
    discount: "600",
    discountType: "amount",
    commissionAmount: 450,
    agreementSigned: true,
    googleRating: 4.9,
    googleReviewsCount: 178,
    products: [],
    videos: [],
    portfolio: []
  }
];

async function seed() {
  try {
    console.log('Copying images...');
    copyFiles();

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully.');

    console.log('Inserting DJs...');
    for (const dj of djs) {
      await Vendor.findOneAndUpdate(
        { name: dj.name },
        dj,
        { upsert: true, new: true }
      );
      console.log(`Upserted DJ: ${dj.name}`);
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

seed();
