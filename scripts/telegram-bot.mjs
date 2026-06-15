#!/usr/bin/env node
/**
 * Mentoria Hub — Telegram reminder bot.
 *
 * Sends "your live lesson starts in ~30 minutes" reminders and answers a few
 * commands. Standalone Node script (no Next.js runtime).
 *
 * Data sources:
 *   - Courses: read from Supabase when configured (so admin-added courses get
 *     reminders too); falls back to lib/live-sessions.json otherwise.
 *   - Subscribers: stored in a Supabase table when a service-role key is present
 *     (survives restarts on ephemeral hosts like Railway); falls back to a local
 *     JSON file otherwise.
 *
 * Env: TELEGRAM_BOT_TOKEN (required), NEXT_PUBLIC_SUPABASE_URL,
 *      NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY (all optional).
 *
 * Commands: /start, /subscribe, /unsubscribe, /next, /courses, /test, /help
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SUBS_FILE = join(__dirname, "telegram-subs.json");
const SCHEDULE_FILE = join(ROOT, "lib", "live-sessions.json");

const REMINDER_MINUTES = 30;
const POLL_MS = 5000;
const TICK_MS = 60000;
const COURSE_REFRESH_MS = 10 * 60000;

// ---- tiny .env loader (only used locally; on a host, real env vars win) ----
function loadEnv() {
  for (const f of [".env.local", ".env"]) {
    const p = join(ROOT, f);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  }
}
loadEnv();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) {
  console.error("✖ TELEGRAM_BOT_TOKEN is not set. Add it to .env.local or the host env, then re-run.");
  process.exit(1);
}
const API = `https://api.telegram.org/bot${TOKEN}`;

// ---- Supabase (optional) ----
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SB_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const sbKey = SB_SERVICE || SB_ANON;
const supabase = SB_URL && sbKey ? createClient(SB_URL, sbKey, { auth: { persistSession: false } }) : null;
const hasServiceRole = Boolean(SB_URL && SB_SERVICE);

// ---- schedule (mirror of lib/live-sessions.ts) ----
const BASE = JSON.parse(readFileSync(SCHEDULE_FILE, "utf8")).sessions;
const BASE_BY_TITLE = new Map(BASE.map((s) => [s.courseTitle, s]));
const FALLBACK_WEEKDAYS = [1, 2, 3, 4, 5];
const FALLBACK_TIMES = ["17:00", "17:30", "18:00", "18:30", "19:00"];

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function sessionForCourse(course) {
  const explicit = BASE_BY_TITLE.get(course.title);
  if (explicit) return { ...explicit, courseId: course.id };
  const h = hash(String(course.id));
  return {
    courseId: course.id,
    courseTitle: course.title,
    emoji: course.emoji || "📚",
    weekday: FALLBACK_WEEKDAYS[h % FALLBACK_WEEKDAYS.length],
    time: FALLBACK_TIMES[Math.floor(h / 7) % FALLBACK_TIMES.length],
    durationMin: 60,
    title: `Live session: ${course.title}`,
    meetingUrl: `https://meet.mentoria.hub/${course.id}`,
  };
}

let sessions = [...BASE];

async function refreshSessions() {
  if (!supabase) return;
  try {
    const { data, error } = await supabase.from("courses").select("id, title, emoji");
    if (error) throw error;
    if (data && data.length) sessions = data.map(sessionForCourse);
  } catch (err) {
    console.error("course refresh failed:", err.message);
  }
}

function nextOccurrence(session, from = new Date()) {
  const [h, m] = session.time.split(":").map(Number);
  const d = new Date(from);
  for (let i = 0; i < 8; i++) {
    if (d.getDay() === session.weekday) {
      const c = new Date(d);
      c.setHours(h, m, 0, 0);
      if (c.getTime() >= from.getTime()) return c;
    }
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
  }
  const c = new Date(from.getTime() + 7 * 864e5);
  c.setHours(h, m, 0, 0);
  return c;
}

function fmt(date) {
  return date.toLocaleString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ---- subscribers ----
const subs = new Set();

async function loadSubs() {
  if (hasServiceRole) {
    try {
      const { data, error } = await supabase.from("telegram_subscribers").select("chat_id");
      if (error) throw error;
      for (const r of data) subs.add(Number(r.chat_id));
      return;
    } catch (err) {
      console.error("load subscribers from DB failed:", err.message);
    }
  }
  try {
    for (const id of JSON.parse(readFileSync(SUBS_FILE, "utf8"))) subs.add(Number(id));
  } catch {
    /* no file yet */
  }
}

function saveSubsFile() {
  try {
    writeFileSync(SUBS_FILE, JSON.stringify([...subs], null, 2));
  } catch (err) {
    console.error("save subscribers failed:", err.message);
  }
}

async function addSub(chatId) {
  subs.add(chatId);
  if (hasServiceRole) await supabase.from("telegram_subscribers").upsert({ chat_id: chatId });
  else saveSubsFile();
}

async function removeSub(chatId) {
  subs.delete(chatId);
  if (hasServiceRole) await supabase.from("telegram_subscribers").delete().eq("chat_id", chatId);
  else saveSubsFile();
}

// ---- Telegram API ----
async function tg(method, body) {
  try {
    const res = await fetch(`${API}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch (err) {
    console.error(`telegram ${method} failed:`, err.message);
    return null;
  }
}

const send = (chatId, text) =>
  tg("sendMessage", { chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true });

// ---- command handling ----
const HELP =
  "🎓 <b>Mentoria Hub bot</b>\n\n" +
  "/subscribe — get reminders 30 min before each live lesson\n" +
  "/unsubscribe — stop reminders\n" +
  "/next — show the next live lesson\n" +
  "/courses — list all live lessons\n" +
  "/test — send yourself a sample reminder now\n" +
  "/help — this message";

function coursesList() {
  return sessions
    .map((s) => `${s.emoji} <b>${s.title}</b>\n   ${s.courseTitle} · next: ${fmt(nextOccurrence(s))}`)
    .join("\n\n");
}

function soonest() {
  return sessions.map((s) => ({ s, when: nextOccurrence(s) })).sort((a, b) => a.when - b.when)[0];
}

async function handleUpdate(u) {
  const msg = u.message;
  if (!msg || !msg.text) return;
  const chatId = msg.chat.id;
  const cmd = msg.text.trim().split(/\s+/)[0].replace(/@.*$/, "").toLowerCase();

  switch (cmd) {
    case "/start":
      await addSub(chatId);
      await send(chatId, `Welcome! 🎉 You're subscribed to live-lesson reminders.\n\n${HELP}`);
      break;
    case "/subscribe":
      await addSub(chatId);
      await send(chatId, "✅ Subscribed. I'll remind you ~30 minutes before each live lesson.");
      break;
    case "/unsubscribe":
      await removeSub(chatId);
      await send(chatId, "🔕 Unsubscribed. Send /subscribe anytime to turn reminders back on.");
      break;
    case "/next": {
      const n = soonest();
      await send(
        chatId,
        `⏭ Next live lesson:\n${n.s.emoji} <b>${n.s.title}</b>\n${n.s.courseTitle}\n🕒 ${fmt(n.when)}\n🔗 ${n.s.meetingUrl}`,
      );
      break;
    }
    case "/courses":
      await send(chatId, `📚 <b>Live lessons</b>\n\n${coursesList()}`);
      break;
    case "/test": {
      const n = soonest();
      const minutes = Math.max(1, Math.round((n.when - new Date()) / 60000));
      await send(
        chatId,
        `⏰ <b>(TEST) Live lesson in ${minutes} minutes — don't forget!</b>\n\n${n.s.emoji} <b>${n.s.title}</b>\n${n.s.courseTitle}\n🕒 ${fmt(n.when)}\n🔗 ${n.s.meetingUrl}`,
      );
      break;
    }
    default:
      await send(chatId, HELP);
  }
}

// ---- reminder loop ----
const reminded = new Set();

async function checkReminders() {
  if (subs.size === 0) return;
  const now = new Date();
  for (const s of sessions) {
    const when = nextOccurrence(s, now);
    const minutes = (when.getTime() - now.getTime()) / 60000;
    const key = `${s.courseId}:${when.getTime()}`;
    if (minutes <= REMINDER_MINUTES && minutes > 0 && !reminded.has(key)) {
      reminded.add(key);
      const text =
        `⏰ <b>Live lesson in ${Math.round(minutes)} minutes — don't forget!</b>\n\n` +
        `${s.emoji} <b>${s.title}</b>\n${s.courseTitle}\n🕒 ${fmt(when)}\n🔗 ${s.meetingUrl}`;
      for (const chatId of subs) await send(chatId, text);
      console.log(`Sent reminder for ${s.title} to ${subs.size} subscriber(s).`);
    }
  }
  for (const key of reminded) {
    if (Number(key.split(":").pop()) < now.getTime()) reminded.delete(key);
  }
}

// ---- long-poll updates ----
let offset = 0;
async function poll() {
  const res = await tg("getUpdates", { offset, timeout: 30 });
  if (res && res.ok) {
    for (const u of res.result) {
      offset = u.update_id + 1;
      try {
        await handleUpdate(u);
      } catch (err) {
        console.error("handleUpdate error:", err.message);
      }
    }
  }
}

async function main() {
  const me = await tg("getMe", {});
  if (!me || !me.ok) {
    console.error("✖ Invalid TELEGRAM_BOT_TOKEN — getMe failed.");
    process.exit(1);
  }

  await refreshSessions();
  await loadSubs();

  const source = supabase ? "Supabase" : "live-sessions.json";
  const subStore = hasServiceRole ? "Supabase" : "local file";
  console.log(`🤖 @${me.result.username} running. Courses: ${source}. Subscribers: ${subs.size} (${subStore}).`);

  setInterval(refreshSessions, COURSE_REFRESH_MS);
  setInterval(checkReminders, TICK_MS);
  checkReminders();

  while (true) {
    await poll();
    await new Promise((r) => setTimeout(r, POLL_MS));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
