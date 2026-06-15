"use client";

import { useRef, useState } from "react";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Button } from "./ui";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

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

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
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
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:scale-105"
        aria-label={t("assistant.open")}
      >
        {open ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
        <span className="hidden sm:inline">{t("assistant.open")}</span>
      </button>

      {open && (
        <div className="fixed bottom-20 right-5 z-50 flex h-[28rem] w-[min(92vw,24rem)] flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card shadow-2xl">
          <div className="flex items-center gap-2 border-b border-border bg-secondary/40 px-4 py-3">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground">
              <Bot className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold leading-tight">{t("assistant.title")}</p>
              <p className="text-xs text-muted-foreground">{t("assistant.subtitle")}</p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            <div className="flex gap-2">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground">
                <Bot className="h-4 w-4" />
              </span>
              <div className="rounded-[var(--radius-md)] bg-muted px-3 py-2 text-sm">{t("assistant.greeting")}</div>
            </div>
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "assistant" && (
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground">
                    <Bot className="h-4 w-4" />
                  </span>
                )}
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
            <Button size="icon" onClick={send} disabled={loading} aria-label={t("assistant.send")}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
