const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8']);

function loadEnvFile(p) {
  if (!fs.existsSync(p)) return {};
  const o = {};
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t[0] === '#') continue;
    const eq = t.indexOf('=');
    if (eq < 0) continue;
    o[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
  }
  return o;
}

(async () => {
  const env = loadEnvFile(path.join(__dirname, '..', '.env'));
  await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 25000 });
  const c = mongoose.connection.db.collection('vendors');
  const total = await c.countDocuments({});
  const checked = await c.countDocuments({ contentCleanedAt: { $exists: true } });
  const skipped = await c.countDocuments({ contentCleanSkipped: true });
  const generic = await c.countDocuments({
    description: /אנחנו ב-|ברוכים הבאים|מחפשים שלמות|לא רק מספקים שירות/,
  });
  console.log({ total, checked, skipped, stillGeneric: generic });
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
