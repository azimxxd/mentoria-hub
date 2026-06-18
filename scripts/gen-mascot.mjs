// Mascot generator for Mentoria Hub — "Menti", the animated chat-bot mascot.
// Generates a base character with the OpenAI Images API (gpt-image-2), then
// derives consistent frame-by-frame animation poses via the edits endpoint so
// every frame is unmistakably the same creature.
//
// Run all:           node scripts/gen-mascot.mjs
// Run a single pose:  node scripts/gen-mascot.mjs blink
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
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
// gpt-image-1 is used: it supports native transparent backgrounds (required for
// a floating mascot overlay). gpt-image-2 rejects `background: transparent`.
// Override with OPENAI_IMAGE_MODEL if a future model gains transparency support.
const MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";
const SIZE = "1024x1024";

const outDir = resolve(root, "public/generated/mascot");
mkdirSync(outDir, { recursive: true });

const PALETTE =
  "color palette: soft rose-white #FDF4F6, light lavender #F1E3F5, lavender #D7BDE2, rich purple #884EA0, chrome pink-purple #D279E5. Y2K aesthetic, liquid chrome / liquid metal, holographic iridescent, soft pastel gradients, glossy reflective surface.";

// A single, very specific character description reused everywhere so all poses
// read as the same mascot.
const CHARACTER =
  "Menti, a cute friendly kawaii mascot: a glossy rounded liquid-chrome blob/droplet creature sculpted from iridescent pink-purple and lavender liquid metal, with a smooth reflective 3D body, big sparkly friendly eyes, soft rosy cheeks, tiny rounded chrome arms, wearing a small glossy liquid-chrome graduation cap topped with a four-point Y2K sparkle star. Adorable, approachable, mascot-style, centered, full body, soft studio reflections.";

const BASE_PROMPT = `${CHARACTER} Neutral happy idle pose, looking straight at the viewer with a gentle closed-mouth smile, both little arms relaxed at its sides. Isolated on a fully transparent background, no text, no letters, no shadow on the ground. ${PALETTE}`;

// Frame edits derive from the base. Each keeps the SAME character but changes
// one expressive thing so the frames can be cycled into an animation.
const FRAMES = [
  {
    name: "blink",
    prompt: `Keep the exact same mascot character, same pose, same colors and graduation cap. Change ONLY the eyes: both eyes now happily closed in a cheerful upward "^_^" curve (blinking), still smiling. Transparent background, no text. ${PALETTE}`,
  },
  {
    name: "wave",
    prompt: `Keep the exact same mascot character, same colors and graduation cap, eyes open and happy. Change the pose: raise its right little chrome arm up in a friendly waving "hello" gesture, big welcoming smile. Transparent background, no text. ${PALETTE}`,
  },
  {
    name: "talk",
    prompt: `Keep the exact same mascot character, same colors and graduation cap, eyes open and bright. Change ONLY the mouth: open in a cheerful mid-speech "talking" expression as if happily explaining something, slight head tilt. Transparent background, no text. ${PALETTE}`,
  },
];

async function generateBase() {
  process.stdout.write(`→ base (${MODEL}, ${SIZE}) ... `);
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({
      model: MODEL,
      prompt: BASE_PROMPT,
      size: SIZE,
      quality: "high",
      background: "transparent",
      n: 1,
    }),
  });
  if (!res.ok) throw new Error(`base: ${res.status} ${await res.text()}`);
  const json = await res.json();
  const file = resolve(outDir, "idle.png");
  writeFileSync(file, Buffer.from(json.data[0].b64_json, "base64"));
  console.log("saved idle.png");
}

async function generateFrame(frame, baseBuffer) {
  process.stdout.write(`→ ${frame.name} (edit) ... `);
  const form = new FormData();
  form.append("model", MODEL);
  form.append("prompt", frame.prompt);
  form.append("size", SIZE);
  form.append("quality", "high");
  form.append("background", "transparent");
  form.append("n", "1");
  // input_fidelity=high keeps the reference character features tight.
  form.append("input_fidelity", "high");
  form.append("image", new Blob([baseBuffer], { type: "image/png" }), "idle.png");

  const res = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}` },
    body: form,
  });
  if (!res.ok) throw new Error(`${frame.name}: ${res.status} ${await res.text()}`);
  const json = await res.json();
  const file = resolve(outDir, `${frame.name}.png`);
  writeFileSync(file, Buffer.from(json.data[0].b64_json, "base64"));
  console.log(`saved ${frame.name}.png`);
}

const only = process.argv.slice(2);
const wantBase = !only.length || only.includes("base");
const idlePath = resolve(outDir, "idle.png");

try {
  if (wantBase) await generateBase();
  if (!existsSync(idlePath)) throw new Error("idle.png missing — generate the base first");
  const baseBuffer = readFileSync(idlePath);

  const frames = only.length ? FRAMES.filter((f) => only.includes(f.name)) : FRAMES;
  for (const f of frames) {
    try {
      await generateFrame(f, baseBuffer);
    } catch (e) {
      console.log("FAILED");
      console.error(String(e).slice(0, 600));
    }
  }
  console.log("Done.");
} catch (e) {
  console.error(String(e).slice(0, 600));
  process.exit(1);
}
