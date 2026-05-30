import dbConnect from '@/lib/mongodb';
import Vendor from '@/lib/models/Vendor';
import { guardDevRoute } from '@/lib/devRoutes';

// Realistic data per vendor name
const vendorPatches = {
  "גן אירועים 'טרה'": { region: 'מרכז', googleRating: 4.8, googleReviewsCount: 127, googleReviewsLink: 'https://www.google.com/maps/search/%D7%92%D7%9F+%D7%90%D7%99%D7%A8%D7%95%D7%A2%D7%99%D7%9D' },
  "DJ ELAD": { region: 'מרכז', googleRating: 4.9, googleReviewsCount: 89, googleReviewsLink: 'https://www.google.com/maps/search/DJ+ELAD' },
  "סטודיו פוקוס": { region: 'מרכז', googleRating: 5.0, googleReviewsCount: 214, googleReviewsLink: 'https://www.google.com/maps/search/%D7%A1%D7%98%D7%95%D7%93%D7%99%D7%95+%D7%A4%D7%95%D7%A7%D7%95%D7%A1' },
  "קייטרינג 'טעם וצבע'": { region: 'מרכז', googleRating: 4.7, googleReviewsCount: 163, googleReviewsLink: 'https://www.google.com/maps/search/%D7%A7%D7%99%D7%99%D7%98%D7%A8%D7%99%D7%A0%D7%92' },
  "סטודיו הילה לכלות": { region: 'מרכז', googleRating: 4.9, googleReviewsCount: 98, googleReviewsLink: 'https://www.google.com/maps/search/%D7%A1%D7%98%D7%95%D7%93%D7%99%D7%95+%D7%94%D7%99%D7%9C%D7%94' },
  "בר 'בוטיק'": { region: 'מרכז', googleRating: 4.8, googleReviewsCount: 77, googleReviewsLink: 'https://www.google.com/maps/search/%D7%91%D7%A8+%D7%91%D7%95%D7%98%D7%99%D7%A7' },
  "אפקטים לאירועים": { region: 'כל הארץ', googleRating: 4.9, googleReviewsCount: 54, googleReviewsLink: 'https://www.google.com/maps/search/%D7%90%D7%A4%D7%A7%D7%98%D7%99%D7%9D+%D7%90%D7%99%D7%A8%D7%95%D7%A2%D7%99%D7%9D' },
  "לירון מאפרת כלה": { region: 'מרכז', googleRating: 5.0, googleReviewsCount: 186, googleReviewsLink: 'https://www.google.com/maps/search/%D7%9C%D7%99%D7%A8%D7%95%D7%9F+%D7%9E%D7%90%D7%A4%D7%A8%D7%AA' },
  "מספרת הקיץ": { region: 'מרכז', googleRating: 4.7, googleReviewsCount: 112, googleReviewsLink: 'https://www.google.com/maps/search/%D7%9E%D7%A1%D7%A4%D7%A8%D7%AA+%D7%94%D7%A7%D7%99%D7%A5' },
  "להקת 'פיאסטה'": { region: 'כל הארץ', googleRating: 4.9, googleReviewsCount: 67, googleReviewsLink: 'https://www.google.com/maps/search/%D7%9C%D7%94%D7%A7%D7%AA+%D7%A4%D7%99%D7%90%D7%A1%D7%98%D7%94' },
  "רכבי יוקרה 'סמארט'": { region: 'מרכז', googleRating: 4.8, googleReviewsCount: 43, googleReviewsLink: 'https://www.google.com/maps/search/%D7%A8%D7%9B%D7%91%D7%99+%D7%99%D7%95%D7%A7%D7%A8%D7%94' },
  "הזמנות בסטייל": { region: 'כל הארץ', googleRating: 4.9, googleReviewsCount: 201, googleReviewsLink: 'https://www.google.com/maps/search/%D7%94%D7%96%D7%9E%D7%A0%D7%95%D7%AA+%D7%91%D7%A1%D7%98%D7%99%D7%99%D7%9C' },
  "צ'ק-אין אירועים": { region: 'כל הארץ', googleRating: 4.6, googleReviewsCount: 38, googleReviewsLink: 'https://www.google.com/maps/search/%D7%A6%D7%A7+%D7%90%D7%99%D7%9F' },
  "טקס 'הקודש'": { region: 'מרכז', googleRating: 4.9, googleReviewsCount: 55, googleReviewsLink: 'https://www.google.com/maps/search/%D7%98%D7%A7%D7%A1+%D7%94%D7%A7%D7%95%D7%93%D7%A9' },
  "שמחת הלב": { region: 'כל הארץ', googleRating: 4.8, googleReviewsCount: 92, googleReviewsLink: 'https://www.google.com/maps/search/%D7%A9%D7%9E%D7%97%D7%AA+%D7%94%D7%9C%D7%91' },
  "מתנה מכל הלב": { region: 'כל הארץ', googleRating: 4.7, googleReviewsCount: 61, googleReviewsLink: 'https://www.google.com/maps/search/%D7%9E%D7%AA%D7%A0%D7%94+%D7%9E%D7%9B%D7%9C+%D7%94%D7%9C%D7%91' },
  "ארט עיצובים": { region: 'מרכז', googleRating: 4.8, googleReviewsCount: 74, googleReviewsLink: 'https://www.google.com/maps/search/%D7%A2%D7%99%D7%A6%D7%95%D7%91+%D7%90%D7%99%D7%A8%D7%95%D7%A2%D7%99%D7%9D' },
  "קלאסיק קאר": { region: 'מרכז', googleRating: 4.9, googleReviewsCount: 33, googleReviewsLink: 'https://www.google.com/maps/search/%D7%A7%D7%9C%D7%90%D7%A1%D7%99%D7%A7+%D7%A7%D7%90%D7%A8' },
  "הרב אברהם": { region: 'כל הארץ', googleRating: 5.0, googleReviewsCount: 148, googleReviewsLink: 'https://www.google.com/maps/search/%D7%94%D7%A8%D7%91+%D7%90%D7%91%D7%A8%D7%94%D7%9D' },
  "יהלומי פיאסטה": { region: 'מרכז', googleRating: 4.8, googleReviewsCount: 85, googleReviewsLink: 'https://www.google.com/maps/search/%D7%99%D7%94%D7%9C%D7%95%D7%9E%D7%99+%D7%A4%D7%99%D7%90%D7%A1%D7%98%D7%94' },
  "מלון בוטיק רויאל": { region: 'מרכז', googleRating: 4.7, googleReviewsCount: 312, googleReviewsLink: 'https://www.google.com/maps/search/%D7%9E%D7%9C%D7%95%D7%9F+%D7%91%D7%95%D7%98%D7%99%D7%A7' },
  "הפקות רווקים 'אקשן'": { region: 'כל הארץ', googleRating: 4.9, googleReviewsCount: 47, googleReviewsLink: 'https://www.google.com/maps/search/%D7%94%D7%A4%D7%A7%D7%95%D7%AA+%D7%A8%D7%95%D7%95%D7%A7%D7%99%D7%9D' },
  "פייטן הלב": { region: 'כל הארץ', googleRating: 5.0, googleReviewsCount: 93, googleReviewsLink: 'https://www.google.com/maps/search/%D7%A4%D7%99%D7%99%D7%98%D7%9F+%D7%94%D7%9C%D7%91' },
  "קייטרינג 'טעם החיים'": { region: 'צפון', googleRating: 4.8, googleReviewsCount: 134, googleReviewsLink: 'https://www.google.com/maps/search/%D7%A7%D7%99%D7%99%D7%98%D7%A8%D7%99%D7%A0%D7%92' },
  "קייטרינג 'ארגמן'": { region: 'דרום', googleRating: 4.7, googleReviewsCount: 88, googleReviewsLink: 'https://www.google.com/maps/search/%D7%A7%D7%99%D7%99%D7%98%D7%A8%D7%99%D7%A0%D7%92+%D7%90%D7%A8%D7%92%D7%9E%D7%9F' },
  "DJ AMIR": { region: 'צפון', googleRating: 4.8, googleReviewsCount: 76, googleReviewsLink: 'https://www.google.com/maps/search/DJ+AMIR' },
  "DJ MAYA": { region: 'מרכז', googleRating: 4.9, googleReviewsCount: 103, googleReviewsLink: 'https://www.google.com/maps/search/DJ+MAYA' },
  "אולם אירועים 'קאלה'": { region: 'צפון', googleRating: 4.8, googleReviewsCount: 178, googleReviewsLink: 'https://www.google.com/maps/search/%D7%90%D7%95%D7%9C%D7%9D+%D7%A7%D7%90%D7%9C%D7%94' },
  "אחוזה בכפר": { region: 'מרכז', googleRating: 4.9, googleReviewsCount: 245, googleReviewsLink: 'https://www.google.com/maps/search/%D7%90%D7%97%D7%95%D7%96%D7%94+%D7%91%D7%9B%D7%A4%D7%A8' },
  "צילום 'זיכרון מתוק'": { region: 'דרום', googleRating: 4.8, googleReviewsCount: 119, googleReviewsLink: 'https://www.google.com/maps/search/%D7%A6%D7%99%D7%9C%D7%95%D7%9D+%D7%96%D7%99%D7%9B%D7%A8%D7%95%D7%9F' },
  "סטודיו לוק": { region: 'מרכז', googleRating: 4.9, googleReviewsCount: 156, googleReviewsLink: 'https://www.google.com/maps/search/%D7%A1%D7%98%D7%95%D7%93%D7%99%D7%95+%D7%9C%D7%95%D7%A7' },
  "הספק הכי טוב": { region: 'מרכז', googleRating: 4.8, googleReviewsCount: 22, googleReviewsLink: 'https://www.google.com/maps/search/%D7%A2%D7%99%D7%A6%D7%95%D7%91' },
  "רועי": { region: 'מרכז', googleRating: 4.9, googleReviewsCount: 31, googleReviewsLink: 'https://www.google.com/maps/search/DJ' },
};

const defaultRegions = ['מרכז', 'מרכז', 'מרכז', 'צפון', 'דרום', 'ירושלים', 'כל הארץ'];
const defaultRatings = [4.7, 4.8, 4.8, 4.9, 4.9, 5.0];

export async function GET(request) {
  const blocked = guardDevRoute(request);
  if (blocked) return blocked;

  try {
    await dbConnect();
    const vendors = await Vendor.find({});
    let updated = 0;

    for (const vendor of vendors) {
      const patch = vendorPatches[vendor.name];
      const needsUpdate =
        !vendor.region ||
        !vendor.googleReviewsLink ||
        vendor.googleReviewsCount === 0;

      if (needsUpdate) {
        const idx = vendors.indexOf(vendor);
        const region = patch?.region || defaultRegions[idx % defaultRegions.length];
        const googleRating = patch?.googleRating || defaultRatings[idx % defaultRatings.length];
        const googleReviewsCount = patch?.googleReviewsCount || Math.floor(Math.random() * 150) + 20;
        const googleReviewsLink = patch?.googleReviewsLink ||
          `https://www.google.com/maps/search/${encodeURIComponent(vendor.name)}`;

        await Vendor.findByIdAndUpdate(vendor._id, {
          region,
          googleRating,
          googleReviewsCount,
          googleReviewsLink,
        });
        updated++;
      }
    }

    return Response.json({ message: `עודכנו ${updated} ספקים בהצלחה!`, total: vendors.length });
  } catch (error) {
    return Response.json({ message: 'שגיאה', error: error.message }, { status: 500 });
  }
}
