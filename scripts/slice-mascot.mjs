#!/usr/bin/env node
/**
 * Slices the two AI-generated Menti sprite sheets (idle + talking) into
 * individual, normalized animation frames so playback never jumps.
 *
 * Each frame is: extracted from the strip → trimmed of transparent padding →
 * scaled so the character is the SAME visual size in every frame (both sheets)
 * → centered on a 256×256 transparent canvas → saved as WebP with alpha.
 *
 * Inputs (background already removed) and outputs are configured below.
 * Run:  node scripts/slice-mascot.mjs
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "public/generated/mascot");

const CANVAS = 256; // final square frame size
const CONTENT = 224; // character bounding box inside the canvas (leaves padding)
const QUALITY = 92;

const SHEETS = [
  {
    name: "idle",
    src: "C:/Users/azama/Downloads/OpenAI_Playground_2026-06-18_at_13.25.31-removebg-preview.png",
    frames: 4,
  },
  {
    name: "talk",
    src: "C:/Users/azama/Downloads/OpenAI_Playground_2026-06-18_at_13.25.44-removebg-preview.png",
    frames: 4,
  },
];

// Crop a frame down to its non-transparent pixels (robust manual alpha bbox).
async function trimAlpha(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * channels + 3];
      if (alpha > 12) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return buf; // fully transparent — leave as-is
  return sharp(buf)
    .extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
    .toBuffer();
}

async function sliceSheet({ name, src, frames }) {
  // Normalize the source (apply any EXIF rotation, guarantee alpha) so extract
  // boundaries match the real pixel grid.
  const base = await sharp(src).rotate().ensureAlpha().png().toBuffer();
  const { width, height } = await sharp(base).metadata();
  for (let i = 0; i < frames; i++) {
    const left = Math.round((i * width) / frames);
    const right = Math.round(((i + 1) * width) / frames);
    const w = Math.min(right - left, width - left);

    // Extract the frame, trim its transparent border down to the character.
    const frameBuf = await sharp(base).extract({ left, top: 0, width: w, height }).toBuffer();
    const trimmed = await trimAlpha(frameBuf);

    // Scale the character to a consistent size, then center on a square canvas.
    const fitted = await sharp(trimmed)
      .resize(CONTENT, CONTENT, { fit: "inside", withoutEnlargement: false })
      .toBuffer();

    const out = join(OUT_DIR, `${name}-${i}.webp`);
    await sharp({
      create: { width: CANVAS, height: CANVAS, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    })
      .composite([{ input: fitted, gravity: "center" }])
      .webp({ quality: QUALITY, alphaQuality: 100 })
      .toFile(out);

    console.log(`  ✓ ${name}-${i}.webp`);
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  for (const sheet of SHEETS) {
    console.log(`Slicing ${sheet.name} sheet (${sheet.frames} frames)…`);
    await sliceSheet(sheet);
  }
  console.log("\n✅ Mascot frames ready in public/generated/mascot/");
}

main().catch((err) => {
  console.error("✖ Slicing failed:", err.message ?? err);
  process.exit(1);
});
