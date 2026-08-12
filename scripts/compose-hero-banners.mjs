import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const assets =
  "C:/Users/Admin/.cursor/projects/d-1-Code-App-web-th-i-trang/assets";

/** bemine.vn 3600×1200 — crop vùng model bên phải, scale FULL chiều cao */
const W = 3600;
const H = 1200;

async function makeBanner({ src, out, label, cropRightRatio = 0.62 }) {
  const meta = await sharp(src).metadata();
  const sw = meta.width ?? 1536;
  const sh = meta.height ?? 1024;

  // Lấy phần phải (có người) — bỏ khoảng trống thừa bên trái của scene AI
  const cropW = Math.round(sw * cropRightRatio);
  const cropLeft = sw - cropW;

  // Model chiếm ~52% chiều ngang banner (giống Bemine), full chiều cao
  const targetW = Math.round(W * 0.52);
  // cover + top: giữ mặt (cắt chân như Bemine), không cắt đầu
  const model = await sharp(src)
    .extract({ left: cropLeft, top: 0, width: cropW, height: sh })
    .resize({ width: targetW, height: H, fit: "cover", position: "top" })
    .jpeg({ quality: 95 })
    .toBuffer({ resolveWithObject: true });

  const mw = model.info.width;
  const mh = model.info.height;
  const left = Math.max(0, W - mw);

  // màu nền lấy từ mép trái vùng crop
  const sample = await sharp(src)
    .extract({
      left: Math.max(0, cropLeft - 4),
      top: Math.round(sh * 0.4),
      width: 4,
      height: 4,
    })
    .resize(1, 1)
    .raw()
    .toBuffer();
  const [r, g, b] = sample;

  // soft blend + mild left vignette for text readability
  const overlaySvg = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="left" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="rgb(${r},${g},${b})" stop-opacity="1"/>
      <stop offset="48%" stop-color="rgb(${r},${g},${b})" stop-opacity="0.92"/>
      <stop offset="70%" stop-color="rgb(${r},${g},${b})" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="rgb(${r},${g},${b})" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${Math.min(W, left + Math.round(mw * 0.35))}" height="${H}" fill="url(#left)"/>
</svg>`);

  await sharp({
    create: {
      width: W,
      height: H,
      channels: 3,
      background: { r, g, b },
    },
  })
    .composite([
      { input: model.data, left, top: 0 },
      { input: overlaySvg, left: 0, top: 0 },
    ])
    .jpeg({ quality: 93, mozjpeg: true })
    .toFile(out);

  console.log(
    `${label}: ${W}x${H} | model ${mw}x${mh} @${left} | crop ${cropRightRatio}`,
  );
}

await makeBanner({
  src: path.join(assets, "bemine-scene-1.jpg"),
  out: path.join(root, "public/banners/hero-dam-gia-tot.jpg"),
  label: "banner1",
  cropRightRatio: 0.68,
});

await makeBanner({
  src: path.join(assets, "bemine-scene-2.jpg"),
  out: path.join(root, "public/banners/hero-du-tiec.jpg"),
  label: "banner2",
  cropRightRatio: 0.6,
});
