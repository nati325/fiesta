/**
 * Upload DJ agreements to Cloudinary and save URLs in Fiesta MongoDB.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import mongoose from 'mongoose';
import { isCloudinaryConfigured, uploadBufferToCloudinary } from '../lib/cloudinaryUpload.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const scrapingRoot = path.join(projectRoot, '..', '..', '..', 'scarping_for_fiesta');
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
loadEnv(path.join(scrapingRoot, '.env.local'));

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {
  // ignore
}

const AGREEMENTS = [
  { phone: '0523300403', label: 'ליאור פרץ', file: 'agreement_0523300403.pdf' },
  { phone: '0544850419', label: 'שרון כהן', file: 'agreement_0544850419.jpeg' },
  { phone: '0584474558', label: 'אליהו ידגרוב', file: 'agreement_0584474558.pdf' },
  { phone: '0507984019', label: 'ישראל ישראלוב', file: 'agreement_0507984019.pdf' },
  { phone: '0523586868', label: 'יובל ענבר / אקפלה', file: 'agreement_0523586868.mp4' },
];

const VendorSchema = new mongoose.Schema({}, { strict: false, collection: 'vendors' });
const Vendor = mongoose.models.CloudAgreementVendor || mongoose.model('CloudAgreementVendor', VendorSchema);

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
  if (!isCloudinaryConfigured()) {
    console.error('❌ CLOUDINARY_* credentials missing');
    process.exit(1);
  }

  await connectMongo();
  const results = [];

  for (const item of AGREEMENTS) {
    const localPath = path.join(agreementsDir, item.file);
    if (!fs.existsSync(localPath)) {
      results.push({ ...item, status: 'missing_file' });
      continue;
    }

    const buffer = await fs.promises.readFile(localPath);
    const uploaded = await uploadBufferToCloudinary(buffer, {
      originalName: item.file,
      uploadType: 'document',
      folder: `fiesta-agreements/${item.phone}`,
    });

    const vendor = await Vendor.findOne({
      type: 'dj',
      contact: { $regex: phoneRegex(item.phone) },
    });

    if (!vendor) {
      results.push({ ...item, status: 'vendor_not_found', cloudUrl: uploaded.url });
      continue;
    }

    vendor.agreementImage = uploaded.url;
    vendor.agreementSigned = true;
    await vendor.save();

    results.push({
      label: item.label,
      phone: item.phone,
      status: 'ok',
      vendorName: vendor.name,
      agreementImage: uploaded.url,
    });
  }

  console.log(JSON.stringify(results, null, 2));
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
