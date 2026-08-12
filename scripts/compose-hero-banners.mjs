import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const assets =
  "C:/Users/Admin/.cursor/projects/d-1-Code-App-web-th-i-trang/assets";

/** Giống bemine.vn: 3600×1200 (3:1) */
const W = 3600;
const H = 1200;

async function fitModel(src, targetH) {
  return sharp(src)
    .resize({ height: targetH, fit: "inside" })
    .png()
    .toBuffer({ resolveWithObject: true });
}

async function makeBanner({ models, out, label }) {
  const bg = await sharp({
    create: {
      width: W,
      height: H,
      channels: 3,
      background: { r: 246, g: 239, b: 228 },
    },
  })
    .jpeg()
    .toBuffer();

  const modelH = Math.round(H * 0.92);
  const prepared = [];
  for (const src of models) {
    prepared.push(await fitModel(src, modelH));
  }

  const gap = 24;
  const totalW =
    prepared.reduce((s, p) => s + p.info.width, 0) +
    gap * Math.max(0, prepared.length - 1);
  let cursor = W - totalW - Math.round(W * 0.04);
  const layers = [];

  for (const p of prepared) {
    const top = Math.round((H - p.info.height) / 2);
    layers.push({
      input: p.data,
      left: Math.max(0, cursor),
      top: Math.max(0, top),
    });
    cursor += p.info.width + gap;
  }

  const overlaySvg = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#f6efe4" stop-opacity="1"/>
      <stop offset="38%" stop-color="#f6efe4" stop-opacity="0.96"/>
      <stop offset="58%" stop-color="#f6efe4" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#f6efe4" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="ray" x1="0" y1="0" x2="1" y2="0.2">
      <stop offset="0%" stop-color="#e31c23" stop-opacity="0.13"/>
      <stop offset="100%" stop-color="#e31c23" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <!-- soft arch lines like Bemine -->
  <g stroke="#d9c4a8" stroke-width="2" fill="none" opacity="0.45">
    <path d="M40 1100 Q 420 200 900 1100"/>
    <path d="M180 1100 Q 520 280 980 1100"/>
  </g>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <polygon points="0,0 980,0 1480,${H} 0,${H}" fill="url(#ray)"/>
  <circle cx="210" cy="230" r="28" fill="#f5c542" opacity="0.9"/>
  <circle cx="300" cy="310" r="16" fill="#f5c542" opacity="0.75"/>
  <circle cx="480" cy="980" r="22" fill="#e31c23" opacity="0.32"/>
  <g transform="translate(150 900) rotate(-8)">
    <rect width="96" height="74" rx="10" fill="#e31c23" opacity="0.95"/>
    <rect x="26" y="12" width="44" height="12" rx="3" fill="#f5c542"/>
  </g>
</svg>`);

  layers.push({ input: overlaySvg, left: 0, top: 0 });

  await sharp(bg)
    .composite(layers)
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(out);

  const m = await sharp(out).metadata();
  console.log(`${label}: ${m.width}x${m.height} (3:1 Bemine)`);
}

await makeBanner({
  models: [
    path.join(assets, "model-banner-b.jpg"),
    path.join(assets, "model-banner-a.jpg"),
  ],
  out: path.join(root, "public/banners/hero-dam-gia-tot.jpg"),
  label: "banner1",
});

await makeBanner({
  models: [path.join(assets, "model-banner-a.jpg")],
  out: path.join(root, "public/banners/hero-du-tiec.jpg"),
  label: "banner2",
});
