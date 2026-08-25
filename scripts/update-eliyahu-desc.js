const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const { MongoClient } = require('mongodb');

const URI =
  'mongodb+srv://netaneldama_db_user:Dama3253%21%3F@cluster0.zptzjg6.mongodb.net/fiesta?retryWrites=true&w=majority&appName=Cluster0';

const DESCRIPTION = `אליהו ידגרוב (Dj Eliyahu Yadgarov) הוא דיג'יי לחתונות ואירועי שמחה מתל אביב. עובד במרכז, בשרון ובהשפלה, ומתאים את הפסקול לזוג ולקהל — מקבלת הפנים ועד סוף הערב.

חבילת DJ מלאה, תיאום מוזיקה מראש וליווי אישי עד האירוע. מזמינים לתאם פגישה ולבדוק אם זה החיבור הנכון לחתונה שלכם.`;

(async () => {
  const client = new MongoClient(URI, { serverSelectionTimeoutMS: 25000 });
  await client.connect();
  const col = client.db('fiesta').collection('vendors');
  const v = await col.findOne({ name: /אליהו ידגרוב/ });
  if (!v) {
    console.error('not found');
    process.exit(1);
  }
  await col.updateOne(
    { _id: v._id },
    { $set: { description: DESCRIPTION, updatedAt: new Date() } }
  );
  const after = await col.findOne({ _id: v._id }, { projection: { name: 1, description: 1 } });
  console.log('updated', after.name);
  console.log(after.description);
  await client.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
