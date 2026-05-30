const {MongoClient}=require('mongodb');
async function run() {
  const client = new MongoClient('mongodb+srv://netaneldama_db_user:Dama3253%21%3F@cluster0.zptzjg6.mongodb.net/fiesta');
  await client.connect();
  const vendors = await client.db('fiesta').collection('vendors').find({}).sort({createdAt: -1}).limit(10).toArray();
  console.log(JSON.stringify(vendors.map(v => ({name: v.name, portfolio: v.portfolio})), null, 2));
  client.close();
}
run();
