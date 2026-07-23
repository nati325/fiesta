const { MongoClient } = require('mongodb');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

(async () => {
  const c = new MongoClient(
    'mongodb+srv://netaneldama_db_user:Dama3253%21%3F@cluster0.zptzjg6.mongodb.net/fiesta?retryWrites=true&w=majority&appName=Cluster0',
    { serverSelectionTimeoutMS: 20000 }
  );
  await c.connect();
  const col = c.db('fiesta').collection('vendors');

  const fakeNames = ['איפור בסטייל', 'סטודיו ביוטי', 'לירון מאפרת כלה'];
  const before = await col.find({ type: 'makeup' }).project({ name: 1, contact: 1 }).toArray();

  const result = await col.deleteMany({
    type: 'makeup',
    name: { $in: fakeNames },
  });

  // safety: remove other makeup placeholders with dog/wedding stock and no real agent note
  const extra = await col.deleteMany({
    type: 'makeup',
    name: { $not: /חושן|HOSHEN/i },
    $or: [
      { contact: { $in: ['', null] } },
      { contact: '054-2221110' },
      { image: /photo-1537151608828|photo-1519741497674/ },
    ],
  });

  const after = await col
    .find({ type: 'makeup' })
    .project({ name: 1, contact: 1, image: 1, type: 1 })
    .toArray();

  console.log(
    JSON.stringify(
      {
        before,
        deletedNamed: result.deletedCount,
        deletedExtra: extra.deletedCount,
        after,
      },
      null,
      2
    )
  );
  await c.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
