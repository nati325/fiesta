/**
 * Add managed DJ roster with Instagram/Google images.
 */
const fs = require('fs');
const path = require('path');
const dns = require('dns');
const { MongoClient } = require('mongodb');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const SERPER_API_KEY =
  process.env.SERPER_API_KEY || 'ae9018b64b8a4a24a1639012bc57ec00d5330e78';
const MONGODB_URI =
  'mongodb+srv://netaneldama_db_user:Dama3253%21%3F@cluster0.zptzjg6.mongodb.net/fiesta?retryWrites=true&w=majority&appName=Cluster0';

const MANAGER_PHONE = '053-3452322';
const MANAGER_PHONE_DIGITS = '0533452322';

const DJS = [
  {
    name: 'ANIMA',
    displayName: 'ANIMA',
    instagram: 'https://www.instagram.com/animamusic/',
    search: 'ANIMA DJ animamusic',
  },
  {
    name: 'SLUKI',
    displayName: 'SLUKI',
    instagram: 'https://www.instagram.com/sluki_ofc/',
    search: 'SLUKI DJ sluki_ofc',
  },
  {
    name: 'HEFETZ',
    displayName: 'HEFETZ | Michael Hefetz',
    instagram: 'https://www.instagram.com/michael_hefetz/',
    search: 'Michael Hefetz DJ',
  },
  {
    name: 'SHAKEL',
    displayName: 'SHAKEL | Shaked Levi',
    instagram: 'https://www.instagram.com/shaked_levi2/',
    search: 'Shaked Levi DJ shaked_levi2',
  },
  {
    name: 'BAR SHAKED',
    displayName: 'BAR SHAKED',
    instagram: 'https://www.instagram.com/barshaked_musik/',
    search: 'Bar Shaked DJ musik',
  },
  {
    name: 'IDAN PARTY BOY',
    displayName: 'IDAN PARTY BOY | Fribert',
    instagram: 'https://www.instagram.com/party_boy_fribert_music/',
    search: 'Idan Party Boy Fribert DJ',
  },
  {
    name: 'HANAN RIVO',
    displayName: 'HANAN RIVO | SOLIX',
    instagram: 'https://www.instagram.com/hanan_ribo/',
    search: 'Hanan Ribo SOLIX DJ',
  },
];

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
};

function slugify(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

async function fetchOg(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': HEADERS['User-Agent'],
        Accept: 'text/html',
        Referer: 'https://www.instagram.com/',
      },
      signal: controller.signal,
      redirect: 'follow',
    });
    if (!res.ok) return null;
    const html = await res.text();
    const match =
      html.match(/property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["']/i) ||
      html.match(/"profile_pic_url_hd":"([^"]+)"/i) ||
      html.match(/"profile_pic_url":"([^"]+)"/i);
    if (!match?.[1]) return null;
    return match[1].replace(/\\u0026/g, '&').replace(/\\\//g, '/');
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function serperUrls(query) {
  try {
    const res = await fetch('https://google.serper.dev/images', {
      method: 'POST',
      headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query, gl: 'il', num: 8 }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.images || [])
      .map((item) => item.imageUrl)
      .filter((url) => url?.startsWith('http'));
  } catch {
    return [];
  }
}

async function downloadUrl(url, timeoutMs = 45000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: {
        ...HEADERS,
        Referer: /instagram|cdninstagram|fbcdn/i.test(url)
          ? 'https://www.instagram.com/'
          : new URL(url).origin + '/',
      },
      signal: controller.signal,
      redirect: 'follow',
    });
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 1500) return null;
    return buffer;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function extFromBuffer(buf) {
  if (buf[0] === 0xff && buf[1] === 0xd8) return '.jpg';
  if (buf[0] === 0x89 && buf[1] === 0x50) return '.png';
  if (buf[0] === 0x52 && buf[1] === 0x49) return '.webp';
  return '.jpg';
}

async function collectImageUrls(dj) {
  const urls = [];
  const seen = new Set();
  const add = (u) => {
    if (!u || !u.startsWith('http') || seen.has(u)) return;
    seen.add(u);
    urls.push(u);
  };

  console.log(`  IG OG: ${dj.instagram}`);
  const og = await fetchOg(dj.instagram);
  if (og) {
    console.log(`    og ok`);
    add(og);
  } else {
    console.log(`    og fail`);
  }

  for (const q of [`${dj.search}`, `${dj.name} DJ ישראל`, `${dj.name} דיג'יי`]) {
    const found = await serperUrls(q);
    console.log(`  serper "${q}": ${found.length}`);
    found.forEach(add);
    if (urls.length >= 6) break;
  }

  return urls;
}

async function saveImages(dj, urls, outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  const saved = [];
  for (const url of urls) {
    if (saved.length >= 3) break;
    process.stdout.write(`    dl ${url.slice(0, 70)}... `);
    const buf = await downloadUrl(url);
    if (!buf) {
      console.log('fail');
      continue;
    }
    const ext = extFromBuffer(buf);
    const fileName = `${slugify(dj.name)}_${saved.length + 1}_${Date.now()}${ext}`;
    const abs = path.join(outDir, fileName);
    fs.writeFileSync(abs, buf);
    const web = `/images/vendors/${fileName}`;
    saved.push(web);
    console.log(`ok ${Math.round(buf.length / 1024)}KB`);
  }
  return saved;
}

(async () => {
  const projectRoot = path.join(__dirname, '..');
  const outDir = path.join(projectRoot, 'public', 'images', 'vendors');

  // optional cloudinary (ESM)
  let uploadBufferToCloudinary = null;
  try {
    const envPath = path.join(projectRoot, '.env');
    if (fs.existsSync(envPath)) {
      for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
        const t = line.trim();
        if (!t || t.startsWith('#') || !t.includes('=')) continue;
        const eq = t.indexOf('=');
        const k = t.slice(0, eq).trim();
        let v = t.slice(eq + 1).trim();
        if (!process.env[k]) process.env[k] = v;
      }
    }
    const mod = await import('../lib/cloudinaryUpload.js');
    uploadBufferToCloudinary = mod.uploadBufferToCloudinary;
  } catch (e) {
    console.log('Cloudinary unavailable:', e.message);
    uploadBufferToCloudinary = null;
  }

  const client = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 25000 });
  await client.connect();
  const col = client.db('fiesta').collection('vendors');
  const report = [];

  for (const dj of DJS) {
    console.log(`\n=== ${dj.displayName} ===`);
    const existing = await col.findOne({
      type: 'dj',
      $or: [
        { name: { $regex: new RegExp(`^${dj.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i') } },
        { instagramLink: dj.instagram },
      ],
    });
    if (existing) {
      console.log('  already exists — skip insert, maybe refresh image if empty');
      report.push({ name: dj.displayName, status: 'exists', id: String(existing._id) });
      continue;
    }

    const urls = await collectImageUrls(dj);
    let localPaths = await saveImages(dj, urls, outDir);
    let image = localPaths[0] || '';
    const portfolio = localPaths.map((p, i) => ({ title: `תמונה ${i + 1}`, image: p }));

    // Prefer Cloudinary if available
    if (uploadBufferToCloudinary && localPaths[0]) {
      try {
        const abs = path.join(projectRoot, 'public', localPaths[0].replace(/^\//, ''));
        const buf = fs.readFileSync(abs);
        const uploaded = await uploadBufferToCloudinary(buf, {
          originalName: path.basename(abs),
          uploadType: 'image',
          folder: `fiesta-vendors/djs/${slugify(dj.name)}`,
        });
        if (uploaded?.url) {
          image = uploaded.url;
          portfolio[0].image = uploaded.url;
          console.log('  cloudinary ok');
        }
      } catch (e) {
        console.log('  cloudinary skip:', e.message);
      }
    }

    const doc = {
      name: dj.displayName,
      type: 'dj',
      description: `${dj.displayName} — DJ לאירועים וחתונות. עובדים דרך מנהל Fiesta.`,
      contact: MANAGER_PHONE,
      image,
      region: 'כל הארץ',
      price: '4500-10000',
      originalPrice: '10000',
      discount: '',
      discountType: 'percent',
      commissionAmount: 0,
      agreementSigned: false,
      agreementImage: '',
      adminNotes: `עובד תחת מנהל משותף. טלפון מנהל: +972533452322 / ${MANAGER_PHONE}. טווח מחיר: ₪4,500–₪10,000. Instagram: ${dj.instagram}`,
      instagramLink: dj.instagram,
      googleRating: 5,
      googleReviewsCount: 0,
      products: [],
      videos: [],
      portfolio,
      reviews: [],
      eventTypes: ['חתונה'],
      priceIncludesVat: true,
      createdAt: new Date(),
    };

    const result = await col.insertOne(doc);
    console.log('  inserted', String(result.insertedId), '| image:', image || 'NONE');
    report.push({
      name: dj.displayName,
      status: 'inserted',
      id: String(result.insertedId),
      image: image || null,
      images: localPaths.length,
      contact: MANAGER_PHONE,
    });
  }

  const allManaged = await col
    .find({ type: 'dj', contact: { $regex: MANAGER_PHONE_DIGITS.split('').join('\\D*') } })
    .project({ name: 1, price: 1, contact: 1, image: 1, instagramLink: 1 })
    .toArray();

  console.log('\nREPORT', JSON.stringify({ report, managedDjs: allManaged.length, allManaged }, null, 2));
  await client.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
