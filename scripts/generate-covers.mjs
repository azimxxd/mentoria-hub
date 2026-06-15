// Generate cohesive cover images for every course and opportunity via the
// OpenAI Images API, saving them to public/covers/<id>.png.
//
// Usage:
//   1. Put your key in .env.local:  OPENAI_API_KEY=sk-...
//   2. node scripts/generate-covers.mjs
//
// Env overrides:
//   OPENAI_IMAGE_MODEL  (default: gpt-image-1; fallback auto: dall-e-3)
//   IMG_QUALITY         (gpt-image-1: low|medium|high, default medium)
//   FORCE=1             regenerate even if the file already exists

import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "public", "covers");

/* ---- read key from env or .env.local ---- */
function loadKey() {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY.trim();
  const envPath = join(root, ".env.local");
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*OPENAI_API_KEY\s*=\s*(.+?)\s*$/);
      if (m) return m[1].replace(/^["']|["']$/g, "").trim();
    }
  }
  return null;
}

const STYLE = `Modern EdTech cover illustration, flat-design meets soft 3D. Smooth gradient background blending deep indigo (#4F46E5), violet (#7C3AED) and sky blue (#0EA5E9), with subtle emerald (#059669) accents. One clean central icon-style motif: {{MOTIF}}. Rounded soft-3D shapes, gentle studio lighting, soft long shadows, light glassmorphism, faint glow, small floating geometric particles and soft bokeh. Lots of negative space, balanced centered composition, premium yet friendly, made for high-school students. Flat vector-illustration aesthetic, cohesive series. NO text, no letters, no words, no numbers, no logos, no watermark, no UI. Landscape 3:2, ultra clean, high detail, 4k.`;

const ITEMS = [
  // courses
  { id: "course_english", motif: "an open book turning into floating speech bubbles and a small globe, a fountain pen, a graduation cap accent" },
  { id: "course_math", motif: "geometric shapes, a compass and protractor, an abstract rising graph curve, floating cubes and spheres" },
  { id: "course_physics", motif: "a glowing atom with orbiting electrons, a small telescope, a planet and a rocket, motion-arc lines" },
  { id: "course_econ", motif: "a rising bar-and-line chart, stacked coins, an upward arrow, a pie chart and a glowing light bulb" },
  // opportunities
  { id: "opp_natmath", motif: "a gold medal with geometric math shapes, a compass and ruler, a laurel wreath, a podium" },
  { id: "opp_bizcase", motif: "a briefcase, a presentation board with a chart, a glowing light bulb, a handshake" },
  { id: "opp_stemsummer", motif: "a sunny campus building, a backpack, a microscope and gears, a paper airplane" },
  { id: "opp_scholarship", motif: "a graduation cap with a glowing award star and ribbon, a diploma scroll, a rising star path" },
  { id: "opp_hackathon", motif: "a laptop with glowing code-bracket symbols, a launching rocket, neon energy, a stopwatch" },
  { id: "opp_research", motif: "a microscope, a DNA helix, a lab flask, a magnifying glass over a notebook" },
  { id: "opp_finlit", motif: "a piggy bank, stacked coins, a calculator, a rising growth chart, a wallet" },
  { id: "opp_volunteer", motif: "a green sprout held in two hands, recycling arrows, trees and leaves, planet earth, emerald dominant" },
  { id: "opp_internship", motif: "a rocket launching out of a laptop, gears, an ID badge, a tidy office desk" },
  { id: "opp_debate", motif: "a podium microphone, two speech bubbles, balance scales, a globe" },
  { id: "opp_satprep", motif: "an answer-sheet with a pencil and checkmarks, a target with an arrow, a clock, a graduation cap" },
  { id: "opp_bioolymp", motif: "a leaf with a glowing cell, a DNA strand, a microscope, a gold medal" },
];

async function generate(model, prompt, key) {
  const isGpt = model.startsWith("gpt-image");
  const body = {
    model,
    prompt,
    n: 1,
    size: isGpt ? "1536x1024" : "1792x1024",
    ...(isGpt
      ? { quality: process.env.IMG_QUALITY || "medium" }
      : { response_format: "b64_json", quality: "hd", style: "vivid" }),
  };
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) {
    const msg = json?.error?.message || JSON.stringify(json);
    const err = new Error(msg);
    err.code = json?.error?.code || json?.error?.type;
    err.status = res.status;
    throw err;
  }
  return json.data[0].b64_json;
}

async function main() {
  const key = loadKey();
  if (!key) {
    console.error("\n✗ No OPENAI_API_KEY found. Add it to .env.local:\n    OPENAI_API_KEY=sk-...\n");
    process.exit(1);
  }
  mkdirSync(outDir, { recursive: true });

  const force = process.env.FORCE === "1";
  // Preferred model first, then automatic fallbacks (deduped).
  const preferred = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2";
  const chain = [...new Set([preferred, "gpt-image-1", "dall-e-3"])];
  let mi = 0; // active index into the fallback chain
  let ok = 0;
  let failed = 0;

  const isModelError = (e) =>
    /model|not\s*found|does not exist|unsupported|verif|access|permission|invalid_request/i.test(
      `${e.code || ""} ${e.message || ""}`,
    );

  console.log(`\nGenerating ${ITEMS.length} covers · model chain: ${chain.join(" → ")} → public/covers/\n`);

  for (const item of ITEMS) {
    const file = join(outDir, `${item.id}.png`);
    if (!force && existsSync(file)) {
      console.log(`• ${item.id}  ↷ exists, skipping`);
      ok++;
      continue;
    }
    const prompt = STYLE.replace("{{MOTIF}}", item.motif);
    let done = false;
    while (mi < chain.length && !done) {
      const model = chain[mi];
      try {
        const b64 = await generate(model, prompt, key);
        writeFileSync(file, Buffer.from(b64, "base64"));
        console.log(`✓ ${item.id}${mi ? ` (${model})` : ""}`);
        ok++;
        done = true;
      } catch (e) {
        if (isModelError(e) && mi < chain.length - 1) {
          console.log(`  "${model}" unavailable (${e.message}). Falling back to "${chain[mi + 1]}"…`);
          mi++; // stick with the next model for the rest of the run
        } else {
          console.error(`✗ ${item.id} [${model}]: ${e.message}`);
          failed++;
          done = true;
        }
      }
    }
  }

  console.log(`\nDone. ${ok} ok, ${failed} failed. Files in public/covers/\n`);
  if (failed) process.exit(1);
}

main();
