const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const { MongoClient } = require('mongodb');

const URI =
  'mongodb+srv://netaneldama_db_user:Dama3253%21%3F@cluster0.zptzjg6.mongodb.net/fiesta?retryWrites=true&w=majority&appName=Cluster0';

const DESCRIPTION = `אליה Bridal הוא בית אופנה לשמלות כלה שהוקם לפני יותר מ־20 שנה על ידי לאה כורלמן — תדמיתנית ומעצבת קוטור עם ניסיון מול מעצבי על. מאז 2019 מעצבת לצידה גם בתה אלין, והשתיים בונות יחד שמלות שמשלבות אלגנטיות קלאסית עם קו מודרני.

אפשר לבחור שמלה מקולקציות נבחרות, או עיצוב אישי חד־פעמי. התפירה והתדמיתנות נעשות בארץ, במתפרה מקומית, עם הקפדה על בדים איכותיים וגימור מדויק. הסטודיו ביהוד, אלטלף אברהם 9 — מזמינים לתאם מדידה ולהתאים את שמלת החלומות.`;

(async () => {
  const client = new MongoClient(URI, { serverSelectionTimeoutMS: 25000 });
  await client.connect();
  const col = client.db('fiesta').collection('vendors');
  const v = await col.findOne({ name: /אליה שמלות|Aliah/i });
  if (!v) {
    console.error('not found');
    process.exit(1);
  }
  const notes = v.adminNotes || '';
  const extra = 'טלפון נוסף מהאתר: 053-420-3405 · דגל: Florentin 45 תל אביב (עמוד משווקים) · מקור תיאור: aliahbridal.com/אודות';
  const adminNotes = notes.includes('053-420-3405') ? notes : `${notes}\n---\n${extra}`.trim();
  await col.updateOne(
    { _id: v._id },
    { $set: { description: DESCRIPTION, adminNotes, updatedAt: new Date() } }
  );
  const after = await col.findOne({ _id: v._id }, { projection: { description: 1 } });
  console.log('updated', v.name);
  console.log(after.description);
  await client.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
