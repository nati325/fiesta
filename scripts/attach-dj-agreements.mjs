/**
 * Copy DJ contract files into public/documents/agreements
 * and attach them to Fiesta vendor records (admin-only fields).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import mongoose from 'mongoose';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const contractsDir = path.join(projectRoot, '..', '..', 'חוזים פייסטה');
const agreementsDir = path.join(projectRoot, 'public', 'documents', 'agreements');

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv(path.join(projectRoot, '.env'));

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {
  // ignore
}

const CONTRACTS = [
  { file: 'ליאור פרץ חוזה .pdf', phone: '0523300403', label: 'ליאור פרץ' },
  { file: 'חוזה שרון כהן.jpeg', phone: '0544850419', label: 'שרון כהן' },
  { file: 'אליהו ידרגוב חוזה.pdf', phone: '0584474558', label: 'אליהו ידגרוב' },
  { file: 'חוזה ישראל ישראלוב.pdf', phone: '0507984019', label: 'ישראל ישראלוב / DJ Easy' },
  { file: 'חוזה אקפלה.mp4', phone: '0523586868', label: 'יובל ענבר / אקפלה' },
];

const VendorSchema = new mongoose.Schema({}, { strict: false, collection: 'vendors' });
const Vendor = mongoose.models.AttachVendor || mongoose.model('AttachVendor', VendorSchema);

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function phoneDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function phoneRegex(digits) {
  return new RegExp(digits.split('').join('\\D*'));
}

async function connectMongo() {
  const uris = [process.env.MONGODB_URI, process.env.MONGODB_URI_DIRECT].filter(Boolean);
  const opts = { serverSelectionTimeoutMS: 25000, bufferCommands: false };
  let lastError;
  for (const uri of uris) {
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
        await mongoose.connect(uri, opts);
        return;
      } catch (error) {
        lastError = error;
        await new Promise((r) => setTimeout(r, 1500 * attempt));
      }
    }
  }
  throw lastError;
}

async function main() {
  if (!fs.existsSync(contractsDir)) {
    console.error('❌ Contracts folder not found:', contractsDir);
    process.exit(1);
  }

  await fs.promises.mkdir(agreementsDir, { recursive: true });
  await connectMongo();

  const results = [];

  for (const item of CONTRACTS) {
    const sourcePath = path.join(contractsDir, item.file);
    if (!fs.existsSync(sourcePath)) {
      results.push({ ...item, status: 'missing_file' });
      continue;
    }

    const ext = path.extname(item.file);
    const destName = `agreement_${item.phone}${ext}`;
    const destPath = path.join(agreementsDir, destName);
    await fs.promises.copyFile(sourcePath, destPath);

    const agreementImage = `/documents/agreements/${destName}`;
    const vendor = await Vendor.findOne({
      type: 'dj',
      contact: { $regex: phoneRegex(item.phone) },
    });

    if (!vendor) {
      results.push({ ...item, status: 'vendor_not_found', agreementImage });
      continue;
    }

    vendor.agreementImage = agreementImage;
    vendor.agreementSigned = true;
    await vendor.save();

    results.push({
      label: item.label,
      phone: item.phone,
      status: 'ok',
      vendorName: vendor.name,
      agreementImage,
    });
  }

  console.log(JSON.stringify(results, null, 2));

  const missingMoshe = await Vendor.findOne({ type: 'dj', contact: { $regex: '0524235911' } });
  if (missingMoshe && !missingMoshe.agreementImage) {
    console.log('\n⚠️  No contract file for DJ Moshe B (052-4235911) — still waiting for upload.');
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
