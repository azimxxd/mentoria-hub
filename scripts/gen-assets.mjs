// One-off asset generator for Mentoria Hub — Y2K / Liquid Chrome decorations.
// Uses the OpenAI Images API (gpt-image-1) with transparent backgrounds.
// Run: node scripts/gen-assets.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// --- read OPENAI_API_KEY from .env.local ---
function readEnvKey() {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;
  const env = readFileSync(resolve(root, ".env.local"), "utf8");
  const m = env.match(/^OPENAI_API_KEY=(.+)$/m);
  if (!m) throw new Error("OPENAI_API_KEY not found");
  return m[1].trim().replace(/^["']|["']$/g, "");
}
const KEY = readEnvKey();

const outDir = resolve(root, "public/generated");
mkdirSync(outDir, { recursive: true });

const PALETTE =
  "color palette: soft rose-white #FDF4F6, light lavender #F1E3F5, lavender #D7BDE2, rich purple #884EA0, chrome pink-purple #D279E5. Y2K aesthetic, liquid chrome / liquid metal, holographic iridescent, soft pastel gradients, glossy reflective surface, high detail, clean.";

const assets = [
  {
    name: "logo-emblem",
    size: "1024x1024",
    quality: "high",
    prompt: `A modern app logo emblem: a liquid chrome graduation cap fused with a four-point sparkle star, sculpted from glossy reflective liquid metal with pink-purple chrome highlights. Centered, isolated on a fully transparent background, soft studio reflections, no text, no letters. ${PALETTE}`,
  },
  {
    name: "sparkle-1",
    size: "1024x1024",
    quality: "medium",
    prompt: `A single Y2K four-point sparkle star made of glossy liquid chrome with a bright specular highlight and soft pink-purple glow, isolated on a fully transparent background, no text. ${PALETTE}`,
  },
  {
    name: "sparkle-2",
    size: "1024x1024",
    quality: "medium",
    prompt: `A cluster of three Y2K sparkle stars of different sizes made of holographic chrome, glossy and reflective with lavender glow, isolated on a fully transparent background, no text. ${PALETTE}`,
  },
  {
    name: "chrome-blob",
    size: "1024x1024",
    quality: "medium",
    prompt: `A 3D liquid metal blob droplet, smooth glossy chrome surface with pink-purple and lavender iridescent reflections, soft and rounded, floating, isolated on a fully transparent background, no text. ${PALETTE}`,
  },
  {
    name: "butterfly",
    size: "1024x1024",
    quality: "medium",
    prompt: `A delicate holographic chrome butterfly with iridescent lavender and pink-purple metallic wings, glossy reflective, Y2K aesthetic, isolated on a fully transparent background, no text. ${PALETTE}`,
  },
  {
    name: "hero-liquid",
    size: "1536x1024",
    quality: "high",
    prompt: `An abstract wide background of flowing liquid chrome and liquid metal waves, smooth glossy ripples blending rose-white, lavender, purple and pink-purple chrome, holographic iridescent, soft dreamy Y2K aesthetic, no text, no objects, seamless soft gradient composition. ${PALETTE}`,
  },
];

async function gen(a) {
  process.stdout.write(`→ ${a.name} (${a.size}, ${a.quality}) ... `);
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt: a.prompt,
      size: a.size,
      quality: a.quality,
      background: "transparent",
      n: 1,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`${a.name}: ${res.status} ${t}`);
  }
  const json = await res.json();
  const b64 = json.data[0].b64_json;
  const file = resolve(outDir, `${a.name}.png`);
  writeFileSync(file, Buffer.from(b64, "base64"));
  console.log("saved");
}

const only = process.argv.slice(2);
const list = only.length ? assets.filter((a) => only.includes(a.name)) : assets;

for (const a of list) {
  try {
    await gen(a);
  } catch (e) {
    console.log("FAILED");
    console.error(String(e).slice(0, 500));
  }
}
console.log("Done.");
