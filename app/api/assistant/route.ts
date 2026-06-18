import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Hugging Face Inference router — OpenAI-compatible chat completions endpoint.
// Free to use with a HF access token (https://huggingface.co/settings/tokens).
const HF_ENDPOINT = "https://router.huggingface.co/v1/chat/completions";
const DEFAULT_MODEL = "meta-llama/Llama-3.1-8B-Instruct:novita";

interface CatalogOpp {
  title: string;
  direction: string;
  category: string;
  deadline: string;
  gradeMin: number;
  gradeMax: number;
  tags: string[];
}
interface CatalogCourse {
  title: string;
  subject: string;
  direction: string;
  level: string;
}
interface Profile {
  grade?: number;
  interests?: string[];
  subjects?: string[];
  goals?: string[];
}
interface Body {
  messages: { role: "user" | "assistant"; content: string }[];
  profile: Profile | null;
  catalog: { opportunities: CatalogOpp[]; courses: CatalogCourse[] };
}

function fallbackReply(body: Body): string {
  const { profile, catalog, messages } = body;
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content.toLowerCase() ?? "";
  const interest = new Set<string>([
    ...(profile?.interests ?? []),
    ...(profile?.subjects ?? []),
    ...(profile?.goals ?? []),
  ].map((s) => s.toLowerCase()));

  const score = (text: string, tags: string[]) => {
    let s = 0;
    const hay = (text + " " + tags.join(" ")).toLowerCase();
    interest.forEach((k) => {
      if (hay.includes(k)) s += 2;
    });
    lastUser.split(/\s+/).forEach((w) => {
      if (w.length > 3 && hay.includes(w)) s += 1;
    });
    return s;
  };

  const opps = [...catalog.opportunities]
    .map((o) => ({ o, s: score(`${o.title} ${o.direction} ${o.category}`, o.tags) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 3)
    .filter((x) => x.s > 0);

  const courses = [...catalog.courses]
    .map((c) => ({ c, s: score(`${c.title} ${c.subject} ${c.direction}`, []) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 2)
    .filter((x) => x.s > 0);

  const parts: string[] = [];
  parts.push("Here's what I'd suggest based on your profile:");
  if (opps.length) {
    parts.push("\n🎯 Opportunities:");
    opps.forEach(({ o }) => parts.push(`• ${o.title} (${o.direction}, deadline ${o.deadline})`));
  }
  if (courses.length) {
    parts.push("\n📚 Courses:");
    courses.forEach(({ c }) => parts.push(`• ${c.title} — ${c.subject} (${c.level})`));
  }
  if (!opps.length && !courses.length) {
    parts.push(
      "\nTell me a direction you like — Business, STEM, Coding, Finance, Science or Social Impact — and your grade, and I'll match you to opportunities and courses.",
    );
  } else {
    parts.push("\nOpen the Opportunities or Courses page to apply or start learning. 🚀");
  }
  return parts.join("\n");
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ reply: "Invalid request." }, { status: 400 });
  }

  const apiKey = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ reply: fallbackReply(body), source: "fallback" });
  }

  try {
    const profile = body.profile
      ? `Student profile — grade: ${body.profile.grade ?? "unknown"}, interests: ${(body.profile.interests ?? []).join(", ") || "none"}, subjects: ${(body.profile.subjects ?? []).join(", ") || "none"}, goals: ${(body.profile.goals ?? []).join(", ") || "none"}.`
      : "The student has not completed onboarding yet.";

    const catalog =
      "OPPORTUNITIES:\n" +
      body.catalog.opportunities
        .map((o) => `- ${o.title} | ${o.direction} | ${o.category} | grades ${o.gradeMin}-${o.gradeMax} | deadline ${o.deadline} | tags: ${o.tags.join(", ")}`)
        .join("\n") +
      "\n\nCOURSES:\n" +
      body.catalog.courses.map((c) => `- ${c.title} | ${c.subject} | ${c.direction} | ${c.level}`).join("\n");

    // Ground the model in Kazakhstan local time (server runs UTC).
    const nowKz = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Almaty",
      dateStyle: "full",
      timeStyle: "short",
    }).format(new Date());
    const timeInfo = `Current date and time in Kazakhstan (Asia/Almaty, UTC+5): ${nowKz}. Use this when the student asks about the time, today's date, or how close a deadline is.`;

    const system = `You are the Mentoria Hub AI guide for school students (grades 8-11). Recommend educational opportunities (competitions, scholarships, internships, summer schools) and Mentoria courses ONLY from the catalog provided. Be warm, concise (under 120 words), and specific: name 2-4 items and say why each fits. If the profile is incomplete, ask one short clarifying question. Never invent items not in the catalog.\n\n${timeInfo}\n\n${profile}\n\nCATALOG:\n${catalog}`;

    const model = process.env.HF_MODEL || DEFAULT_MODEL;
    const res = await fetch(HF_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 500,
        temperature: 0.6,
        messages: [
          { role: "system", content: system },
          ...body.messages.map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("HF assistant error", res.status, detail.slice(0, 300));
      return NextResponse.json({ reply: fallbackReply(body), source: "fallback-error" });
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const reply = data.choices?.[0]?.message?.content?.trim() ?? "";

    return NextResponse.json({ reply: reply || fallbackReply(body), source: "huggingface" });
  } catch (err) {
    console.error("assistant error", err);
    return NextResponse.json({ reply: fallbackReply(body), source: "fallback-error" });
  }
}
