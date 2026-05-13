import dbConnect from '@/lib/mongodb';
import Vendor from '@/lib/models/Vendor';

export const dynamic = 'force-dynamic';

function generateDescription(type, name) {
    const templates = [
        `אנחנו ב-${name} מתמחים ביצירת רגעים בלתי נשכחים. עם גישה ייחודית ושנים של ניסיון, נהפוך את האירוע שלכם למשהו שידברו עליו עוד המון זמן. אנחנו מאמינים ביחס אישי, הקפדה על הפרטים הקטנים וסטנדרט שירות ללא פשרות.`,
        `ברוכים הבאים ל-${name}. כאן תמצאו את השילוב המדויק בין מקצועיות, יצירתיות ושירות מכל הלב. אנחנו מבינים שהאירוע שלכם הוא חד פעמי, ולכן אנחנו נותנים 100% מעצמנו כדי להבטיח תוצאה מושלמת שתעלה על הציפיות שלכם.`,
        `ב-${name} אנחנו לא רק מספקים שירות, אנחנו יוצרים חוויה. הצוות המקצועי שלנו מלווה אתכם צעד אחר צעד, משלב התכנון ועד לביצוע המושלם ביום האירוע. אנחנו מתגאים במאות זוגות מרוצים ואירועים שהשאירו חותם אמיתי.`,
        `מחפשים שלמות? הגעתם למקום הנכון. ${name} מביא איתו משב רוח רענן של חדשנות, עיצוב עדכני והבנה עמוקה של צרכי הלקוח. אנחנו כאן כדי להגשים את החזון שלכם במלואו, עם המון אהבה למקצוע ותשוקה אמיתית לעשייה.`
    ];
    return templates[Math.floor(Math.random() * templates.length)];
}

const hebrewTitles = ['חבילת סטנדרט', 'חבילת קלאסיק', 'שדרוג פרימיום', 'הכל כלול VIP', 'תוספת אקסטרה'];
const hebrewPrices = ['2500 ₪', '4500 ₪', '150 ₪ למנה', '8000 ₪', '3200 ₪', '500 ₪'];

const unsplashPool = {
  'dj': [
    '1516280440614-37939bbacd41', '1571266028243-3716f02d2d2e', '1470229722913-7c090be05e7f', 
    '1598387181032-a3103a2db5b3', '1514525253161-7a46d19cd819', '1429962201586-7e44655f4104',
    '1557004467-33924fdb23e0', '1511285560929-80b456fea0bc'
  ],
  'photographer': [
    '1511285560929-80b456fea0bc', '1520854221256-17451cc331bf', '1537151608828-ea2b11777ee8', 
    '1519741497674-611481863552', '1581456495146-65a71b2c8e52', '1527068593452-959c5d082215',
    '1542042161784-26ab9e041e89', '1515934751635-c81c6bc9a2d8'
  ],
  'venue': [
    '1519167758481-83f550bb49b3', '1464366400600-7168b8af9bc3', '1469334031218-e382a71b716b', 
    '1511795409834-ef04bbd61622', '1519225421980-715cb0215aed', '1522413452208-9969062f7a94',
    '1505373877841-8d25f7d46678', '1475713222730-4be68b55581b'
  ],
  'catering': [
    '1555244162-803834f70033', '1414235077428-338989a2e8c0', '1533777857889-4be7c70b33f7', 
    '1467453678174-768ec283a940', '1481931098730-146b005e8e81', '1473093295043-cdd812d0e601',
    '1546069901-d5bfd2cbfb3f', '1504670073073-6123e39e0754'
  ],
  'alcohol': [
    '1514362545857-3bc16c4c7d1b', '1551538827-9c037cb4f32a', '1536935338788-846bb9981813', 
    '1470337458703-415120a41f67', '1513558161293-cdaf765ed2fd', '1574629830351-4091f09b555a',
    '1499561385668-5eb506764491', '1436811460492-f05256e2eb9a'
  ],
  'design': [
    '1478146896981-b80fe463b330', '1519225421980-715cb0215aed', '1522413452208-9969062f7a94', 
    '1520854221256-17451cc331bf', '1502444330042-4116633b1f0e', '1469334031218-e382a71b716b'
  ],
  'dresses': [
    '1594553939328-14936d6f5f3e', '1546803073-67894a4aefa6', '1549416878-b99b533e46bc', 
    '1606214589252-9f636cb077d8', '1515934751635-c81c6bc9a2d8', '1511285560929-80b456fea0bc'
  ],
  'attractions': [
    '1533174072545-7a4b6ad7a6c3', '1492684223066-81342ee5ff30', '1470225620780-dba8ba36b745', 
    '1520069806497-6a4d7c04e221', '1478146896981-b80fe463b330', '1516280440614-37939bbacd41'
  ]
};

const defaultPool = ['1511285560929-80b456fea0bc', '1519741497674-611481863552', '1537151608828-ea2b11777ee8', '1522413452208-9969062f7a94', '1519167758481-83f550bb49b3', '1464366400600-7168b8af9bc3'];

// Helper to shuffle array
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function GET(request) {
    try {
        await dbConnect();
        
        const vendors = await Vendor.find({});
        let updatedCount = 0;

        for (const vendor of vendors) {
            let needsSave = false;

            // Enhance description if it's too generic or missing
            if (!vendor.description || vendor.description.length < 60) {
                vendor.description = generateDescription(vendor.type, vendor.name);
                needsSave = true;
            }

            if (!vendor.portfolio) {
                vendor.portfolio = [];
            }
            
            const categoryIDs = unsplashPool[vendor.type] || defaultPool;
            const shuffledIDs = shuffle(categoryIDs);
            
            const newPortfolio = [];
            
            // First keep any items that have real prices
            vendor.portfolio.forEach((item, idx) => {
                if (item.price) {
                    newPortfolio.push({
                        title: item.title,
                        price: item.price,
                        image: `https://images.unsplash.com/photo-${shuffledIDs[idx % shuffledIDs.length]}?auto=format&fit=crop&w=800&q=80`
                    });
                }
            });

            // If we don't have enough, add more
            while (newPortfolio.length < 4) {
                newPortfolio.push({
                    title: hebrewTitles[newPortfolio.length % hebrewTitles.length],
                    price: hebrewPrices[Math.floor(Math.random() * hebrewPrices.length)],
                    image: `https://images.unsplash.com/photo-${shuffledIDs[newPortfolio.length % shuffledIDs.length]}?auto=format&fit=crop&w=800&q=80`
                });
            }

            vendor.portfolio = newPortfolio;
            
            // Set main image to a distinct one
            vendor.image = `https://images.unsplash.com/photo-${shuffledIDs[shuffledIDs.length - 1]}?auto=format&fit=crop&w=800&q=80`;
            needsSave = true;

            if (needsSave) {
                await vendor.save();
                updatedCount++;
            }
        }

        return Response.json({ message: 'Vendors enhanced successfully with UNIQUE Unsplash images', updatedVendors: updatedCount });
    } catch (error) {
        return Response.json({ message: 'Error enhancing vendors', error: error.message }, { status: 500 });
    }
}
