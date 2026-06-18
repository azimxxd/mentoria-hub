"use client";

import { useRef, useState } from "react";
import { Send, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Button } from "./ui";
import { Mascot, MascotStatic } from "./mascot";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

// Ready-made starter questions (auto-sent on click). Shown only before the chat begins.
const SUGGESTIONS = [
  "assistant.suggest1",
  "assistant.suggest2",
  "assistant.suggest3",
  "assistant.suggest4",
] as const;

export function AssistantWidget() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const user = useStore((s) => s.users.find((u) => u.id === s.currentUserId) ?? null);
  const opportunities = useStore((s) => s.opportunities);
  const courses = useStore((s) => s.courses);

  async function send(raw?: string) {
    const fromInput = raw === undefined;
    const text = (raw ?? input).trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    if (fromInput) setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next,
          profile: user
            ? { grade: user.grade, interests: user.interests, subjects: user.subjects, goals: user.goals }
            : null,
          catalog: {
            opportunities: opportunities.map((o) => ({
              title: o.title,
              direction: o.direction,
              category: o.category,
              deadline: o.deadline,
              gradeMin: o.gradeMin,
              gradeMax: o.gradeMax,
              tags: o.tags,
            })),
            courses: courses.map((c) => ({ title: c.title, subject: c.subject, direction: c.direction, level: c.level })),
          },
        }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply ?? "…" }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, I couldn't respond just now." }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollTo({ top: 9e9, behavior: "smooth" }), 50);
    }
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="group fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/80 py-2 pl-2 pr-4 text-sm font-semibold text-foreground shadow-lg shadow-primary/20 backdrop-blur transition hover:scale-105 hover:border-brand-chrome/50"
          aria-label={t("assistant.open")}
        >
          <Mascot size={48} float className="transition-transform group-hover:scale-110" />
          <span className="hidden sm:inline">{t("assistant.open")}</span>
        </button>
      )}

      {open && (
        <div className="fixed bottom-20 right-5 z-50 flex h-[28rem] w-[min(92vw,24rem)] flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card shadow-2xl">
          <div className="flex items-center gap-2 border-b border-border bg-secondary/40 px-4 py-3">
            <Mascot size={44} state={loading ? "talking" : "idle"} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-tight">{t("assistant.title")}</p>
              <p className="truncate text-xs text-muted-foreground">{t("assistant.subtitle")}</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label={t("common.close")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            <div className="flex gap-2">
              <MascotStatic size={28} className="shrink-0" />
              <div className="rounded-[var(--radius-md)] bg-muted px-3 py-2 text-sm">{t("assistant.greeting")}</div>
            </div>
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2 pl-9">
                {SUGGESTIONS.map((key) => (
                  <button
                    key={key}
                    onClick={() => send(t(key))}
                    disabled={loading}
                    className="rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-brand-chrome/50 hover:bg-secondary disabled:opacity-50"
                  >
                    {t(key)}
                  </button>
                ))}
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "assistant" && <MascotStatic size={28} className="shrink-0" />}
                <div
                  className={`max-w-[80%] whitespace-pre-wrap rounded-[var(--radius-md)] px-3 py-2 text-sm ${
                    m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && <p className="pl-9 text-xs text-muted-foreground">{t("assistant.thinking")}</p>}
          </div>

          <div className="flex items-center gap-2 border-t border-border p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={t("assistant.placeholder")}
              className="h-10 flex-1 rounded-[var(--radius-md)] border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button size="icon" onClick={() => send()} disabled={loading} aria-label={t("assistant.send")}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
