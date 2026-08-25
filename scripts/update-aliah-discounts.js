const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const { MongoClient } = require('mongodb');

const URI =
  'mongodb+srv://netaneldama_db_user:Dama3253%21%3F@cluster0.zptzjg6.mongodb.net/fiesta?retryWrites=true&w=majority&appName=Cluster0';

function clientPrice(list, pct) {
  return Math.round(list * (1 - pct / 100));
}

(async () => {
  const client = new MongoClient(URI, { serverSelectionTimeoutMS: 25000 });
  await client.connect();
  const col = client.db('fiesta').collection('vendors');
  const v = await col.findOne({ name: /אליה שמלות|Aliah/i });
  if (!v) {
    console.error('not found');
    process.exit(1);
  }

  const dressList = 7500;
  const customList = 9000;
  const dressPct = 7;
  const customPct = 4;
  const dressClient = clientPrice(dressList, dressPct);
  const customClient = clientPrice(customList, customPct);

  const products = (v.products || []).map((p) => {
    const name = String(p.name || '');
    if (/אישי/.test(name)) {
      return {
        ...p,
        originalPrice: String(customList),
        price: String(customClient),
        kind: p.kind || 'main',
        active: p.active !== false,
      };
    }
    if (/שמלה|כלה/.test(name)) {
      return {
        ...p,
        originalPrice: String(dressList),
        price: String(dressClient),
        kind: p.kind || 'main',
        active: p.active !== false,
      };
    }
    return p;
  });

  const notesLine =
    `הנחות: שמלה מהקולקציה ${dressPct}% (₪${dressList.toLocaleString('he-IL')} → ₪${dressClient.toLocaleString('he-IL')}) · עיצוב אישי ${customPct}% (₪${customList.toLocaleString('he-IL')} → ₪${customClient.toLocaleString('he-IL')}). תגית כרטיס לפי החבילה הזולה (${dressPct}%).`;
  const adminNotes = (v.adminNotes || '').includes('הנחות: שמלה מהקולקציה')
    ? v.adminNotes
    : `${v.adminNotes || ''}\n---\n${notesLine}`.trim();

  await col.updateOne(
    { _id: v._id },
    {
      $set: {
        products,
        originalPrice: String(dressList),
        price: String(dressClient),
        discount: String(dressPct),
        discountType: 'percent',
        adminNotes,
        updatedAt: new Date(),
      },
    }
  );

  const after = await col.findOne(
    { _id: v._id },
    { projection: { name: 1, price: 1, originalPrice: 1, discount: 1, products: 1 } }
  );
  console.log(JSON.stringify(after, null, 2));
  await client.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
