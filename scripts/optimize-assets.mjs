// Optimize generated PNG assets → WebP (transparent) at display-appropriate sizes.
// Run: node scripts/optimize-assets.mjs
import sharp from "sharp";
import { readdirSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dir = resolve(__dirname, "..", "public", "generated");

// Decorative icons rendered small (≤96px) → 256px is plenty even at 2x DPR.
// hero-liquid is full-bleed but heavily blurred → 768px is more than enough.
const targets = {
  "logo-emblem": { width: 256, quality: 90 },
  "sparkle-1": { width: 256, quality: 85 },
  "sparkle-2": { width: 256, quality: 85 },
  "butterfly": { width: 256, quality: 85 },
  "chrome-blob": { width: 256, quality: 85 },
  "hero-liquid": { width: 768, quality: 72 },
};

const kb = (n) => `${(n / 1024).toFixed(0)}KB`;
let before = 0;
let after = 0;

for (const [name, opt] of Object.entries(targets)) {
  const src = resolve(dir, `${name}.png`);
  const out = resolve(dir, `${name}.webp`);
  const srcSize = statSync(src).size;
  await sharp(src)
    .resize({ width: opt.width, withoutEnlargement: true })
    .webp({ quality: opt.quality, effort: 6 })
    .toFile(out);
  const outSize = statSync(out).size;
  before += srcSize;
  after += outSize;
  console.log(`${name}: ${kb(srcSize)} → ${kb(outSize)}  (${Math.round((1 - outSize / srcSize) * 100)}% smaller)`);
}

console.log(`\nTotal: ${kb(before)} → ${kb(after)}  (${Math.round((1 - after / before) * 100)}% smaller)`);
console.log("Done. Remove the .png originals once references are updated.");
