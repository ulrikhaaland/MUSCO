import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');
const SOURCE_SVG = path.join(PUBLIC_DIR, 'img', 'app-logo.svg');

const BG = '#111827'; // slate-900-ish

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function renderSquarePng({
  size,
  outPath,
  innerScale = 0.78,
  background = BG,
}) {
  const svg = await fs.readFile(SOURCE_SVG);
  const inner = Math.max(1, Math.round(size * innerScale));

  // Higher density helps SVG lines look crisp when rasterized.
  const rendered = await sharp(svg, { density: 600 })
    .resize(inner, inner, { fit: 'contain' })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background,
    },
  })
    .composite([{ input: rendered, gravity: 'center' }])
    .png()
    .toFile(outPath);
}

async function main() {
  await ensureDir(PUBLIC_DIR);

  // Standard app icons
  const icons = [
    { file: 'icon-192.png', size: 192, innerScale: 0.8 },
    { file: 'icon-512.png', size: 512, innerScale: 0.8 },
    { file: 'ms-icon-310x310.png', size: 310, innerScale: 0.8 },
    { file: 'apple-icon-180x180.png', size: 180, innerScale: 0.82 },
    { file: 'apple-icon-144x144.png', size: 144, innerScale: 0.82 },
  ];

  // Maskable icons need more padding (safe zone).
  const maskables = [
    { file: 'icon-maskable-192.png', size: 192, innerScale: 0.62 },
    { file: 'icon-maskable-512.png', size: 512, innerScale: 0.62 },
  ];

  console.log(`Generating icons from ${path.relative(ROOT, SOURCE_SVG)}...`);

  for (const i of icons) {
    const out = path.join(PUBLIC_DIR, i.file);
    await renderSquarePng({
      size: i.size,
      outPath: out,
      innerScale: i.innerScale,
    });
    console.log(`- ${path.relative(ROOT, out)}`);
  }

  for (const i of maskables) {
    const out = path.join(PUBLIC_DIR, i.file);
    await renderSquarePng({
      size: i.size,
      outPath: out,
      innerScale: i.innerScale,
    });
    console.log(`- ${path.relative(ROOT, out)}`);
  }

  // Favicon ICO (16/32/48)
  const faviconSizes = [16, 32, 48];
  const faviconPngs = [];
  for (const size of faviconSizes) {
    const out = path.join(PUBLIC_DIR, `favicon-${size}.png`);
    await renderSquarePng({ size, outPath: out, innerScale: 0.88 });
    faviconPngs.push(out);
  }

  const icoBuf = await pngToIco(faviconPngs);
  const faviconIco = path.join(PUBLIC_DIR, 'favicon.ico');
  await fs.writeFile(faviconIco, icoBuf);
  console.log(`- ${path.relative(ROOT, faviconIco)}`);

  // Clean up intermediate favicon PNGs (we only need favicon.ico).
  await Promise.allSettled(faviconPngs.map((p) => fs.unlink(p)));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

