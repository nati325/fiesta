/**
 * Attach existing local DJ agreement files to MongoDB vendors
 * and normalize agreementSigned when a file is missing.
 */
const { MongoClient } = require('mongodb');
const dns = require('dns');
const fs = require('fs');
const path = require('path');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const AGREEMENTS = [
  { phone: '0523300403', file: 'agreement_0523300403.pdf', label: 'ליאור פרץ' },
  { phone: '0544850419', file: 'agreement_0544850419.jpeg', label: 'שרון כהן' },
  { phone: '0584474558', file: 'agreement_0584474558.pdf', label: 'אליהו ידגרוב' },
  { phone: '0507984019', file: 'agreement_0507984019.pdf', label: 'דיג׳י איזי' },
  { phone: '0523586868', file: 'agreement_0523586868.mp4', label: 'יובל ענבר' },
];

const MOSHE_PHONE = '0524235911';

function phoneRegex(digits) {
  return new RegExp(digits.split('').join('\\D*'));
}

(async () => {
  const root = path.join(__dirname, '..');
  const agreementsDir = path.join(root, 'public', 'documents', 'agreements');
  const c = new MongoClient(
    'mongodb+srv://netaneldama_db_user:Dama3253%21%3F@cluster0.zptzjg6.mongodb.net/fiesta?retryWrites=true&w=majority&appName=Cluster0',
    { serverSelectionTimeoutMS: 20000 }
  );
  await c.connect();
  const col = c.db('fiesta').collection('vendors');
  const results = [];

  for (const item of AGREEMENTS) {
    const localPath = path.join(agreementsDir, item.file);
    const exists = fs.existsSync(localPath);
    const agreementImage = `/documents/agreements/${item.file}`;

    const vendor = await col.findOne({
      type: 'dj',
      contact: { $regex: phoneRegex(item.phone) },
    });

    if (!vendor) {
      results.push({ ...item, status: 'vendor_not_found', exists });
      continue;
    }

    if (!exists) {
      results.push({ ...item, status: 'missing_file', vendorName: vendor.name });
      continue;
    }

    // Keep Sharon's existing Cloudinary/local image if already set to a non-empty path
    // but prefer the dedicated agreements folder when current image is empty
    const update = {
      agreementImage,
      agreementSigned: true,
    };

    // Don't overwrite Sharon's existing uploaded agreement if it's already a real path
    // under /images/vendors — keep both? User wants contract in DB shown in admin.
    // Prefer agreements folder for consistency, except if existing is already set and different.
    // Actually Sharon has /images/vendors/... which works. Keep it if present and non-empty.
    if (vendor.agreementImage && String(vendor.agreementImage).trim()) {
      results.push({
        label: item.label,
        status: 'already_has_image',
        agreementImage: vendor.agreementImage,
        vendorName: vendor.name,
      });
      // still ensure signed
      await col.updateOne({ _id: vendor._id }, { $set: { agreementSigned: true } });
      continue;
    }

    await col.updateOne({ _id: vendor._id }, { $set: update });
    results.push({
      label: item.label,
      status: 'attached',
      agreementImage,
      vendorName: vendor.name,
    });
  }

  // Moshe: no contract file — mark unsigned so admin doesn't show false "חתום"
  const moshe = await col.findOne({
    type: 'dj',
    contact: { $regex: phoneRegex(MOSHE_PHONE) },
  });
  if (moshe) {
    await col.updateOne(
      { _id: moshe._id },
      {
        $set: {
          agreementSigned: false,
          agreementImage: '',
        },
      }
    );
    results.push({
      label: 'דיגיי משה בי',
      status: 'no_contract_file_marked_unsigned',
      vendorName: moshe.name,
    });
  }

  const after = await col
    .find({ type: 'dj' })
    .project({
      name: 1,
      price: 1,
      originalPrice: 1,
      discount: 1,
      agreementSigned: 1,
      agreementImage: 1,
      contact: 1,
    })
    .toArray();

  console.log(
    JSON.stringify(
      {
        results,
        after: after.map((d) => ({
          name: (d.name || '').split('|')[0].trim(),
          price: d.price,
          originalPrice: d.originalPrice,
          discount: d.discount,
          agreementSigned: d.agreementSigned,
          agreementImage: d.agreementImage || null,
          contact: d.contact,
        })),
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
