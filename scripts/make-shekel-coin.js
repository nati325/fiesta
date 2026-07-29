const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function main() {
  const src = process.argv[2];
  if (!src || !fs.existsSync(src)) {
    throw new Error('Usage: node make-shekel-coin.js <source.png>');
  }

  const size = 512;
  const { data, info } = await sharp(src)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const out = Buffer.from(data);

  for (let i = 0; i < out.length; i += channels) {
    const r = out[i];
    const g = out[i + 1];
    const b = out[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const avg = (r + g + b) / 3;
    const sat = max - min;
    if ((avg > 200 && sat < 40) || (avg > 175 && sat < 18)) {
      out[i + 3] = 0;
    }
  }

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (out[(y * width + x) * channels + 3] < 28) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX <= minX || maxY <= minY) {
    throw new Error('Could not find coin content after bg removal');
  }

  const pad = 2;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);

  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;
  const dim = Math.max(cropW, cropH);

  const resized = await sharp(out, { raw: { width, height, channels } })
    .extract({ left: minX, top: minY, width: cropW, height: cropH })
    .resize(dim, dim, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .resize(size, size)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 10;
  const px = Buffer.from(resized.data);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
      if (d > R) {
        px[i + 3] = 0;
        continue;
      }
      const edge = R - d;
      // Soft alpha falloff — no hard white fringe
      if (edge < 3.5) {
        const t = edge / 3.5;
        px[i + 3] = Math.round(px[i + 3] * Math.max(0, t));
      }
      // Darken outer rim so AA highlight doesn't read as a white ring
      if (edge < 12) {
        const shade = 0.62 + 0.38 * (edge / 12);
        px[i] = Math.round(px[i] * shade);
        px[i + 1] = Math.round(px[i + 1] * shade);
        px[i + 2] = Math.round(px[i + 2] * shade);
      }
    }
  }

  const maskSvg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${cx}" cy="${cy}" r="${R}" fill="#fff"/></svg>`
  );

  const png = await sharp(px, {
    raw: { width: size, height: size, channels: 4 },
  })
    .png()
    .composite([
      { input: await sharp(maskSvg).png().toBuffer(), blend: 'dest-in' },
    ])
    .png()
    .toBuffer();

  const outDir = path.join(__dirname, '..', 'public', 'images');
  const outWebp = path.join(outDir, 'shekel-coin.webp');
  await sharp(png).webp({ quality: 92, alphaQuality: 100 }).toFile(outWebp);
  console.log('Wrote', outWebp, await sharp(outWebp).metadata());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
