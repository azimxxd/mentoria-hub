"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Video } from "lucide-react";
import { useStore } from "@/lib/store";
import { useI18n, useT } from "@/lib/i18n";
import { Badge, Button, Card } from "@/components/ui";
import { getSchedule, monthOccurrences, type Occurrence } from "@/lib/live-sessions";

const LOCALE_MAP: Record<string, string> = { en: "en-US", ru: "ru-RU", kk: "kk-KZ" };

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function CalendarPage() {
  const t = useT();
  const { lang } = useI18n();
  const locale = LOCALE_MAP[lang] ?? "en-US";
  const courses = useStore((s) => s.courses);

  const today = new Date();
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const sessions = useMemo(() => getSchedule(courses), [courses]);
  const occurrences = useMemo(
    () => monthOccurrences(sessions, cursor.getFullYear(), cursor.getMonth()),
    [sessions, cursor],
  );

  // Group occurrences by day-of-month for fast cell lookup.
  const byDay = useMemo(() => {
    const m = new Map<number, Occurrence[]>();
    for (const o of occurrences) {
      const d = o.date.getDate();
      m.set(d, [...(m.get(d) ?? []), o]);
    }
    return m;
  }, [occurrences]);

  // Build the calendar grid (Monday-first), padding leading/trailing blanks.
  const cells = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDow = (new Date(year, month, 1).getDay() + 6) % 7; // Mon=0
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const arr: (number | null)[] = [];
    for (let i = 0; i < firstDow; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [cursor]);

  const weekdayLabels = useMemo(() => {
    // Reference week starting Monday 2024-01-01.
    return Array.from({ length: 7 }, (_, i) =>
      new Date(2024, 0, 1 + i).toLocaleDateString(locale, { weekday: "short" }),
    );
  }, [locale]);

  const monthLabel = cursor.toLocaleDateString(locale, { month: "long", year: "numeric" });

  const upcoming = useMemo(() => {
    const now = new Date();
    return occurrences.filter((o) => o.date.getTime() >= now.getTime()).slice(0, 6);
  }, [occurrences]);

  function shift(delta: number) {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <CalendarDays className="h-7 w-7 text-primary" /> {t("calendar.title")}
          </h1>
          <p className="mt-1 text-muted-foreground">{t("calendar.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => shift(-1)} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-44 text-center text-sm font-semibold capitalize">{monthLabel}</span>
          <Button variant="outline" size="icon" onClick={() => shift(1)} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}>
            {t("calendar.today")}
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Calendar grid */}
        <Card className="overflow-hidden p-4 lg:col-span-2">
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase text-muted-foreground">
            {weekdayLabels.map((w) => (
              <div key={w} className="py-1">{w}</div>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (day === null) return <div key={i} className="min-h-20 rounded-[var(--radius-md)]" />;
              const date = new Date(cursor.getFullYear(), cursor.getMonth(), day);
              const isToday = sameDay(date, today);
              const list = byDay.get(day) ?? [];
              return (
                <div
                  key={i}
                  className={`min-h-20 rounded-[var(--radius-md)] border p-1.5 text-left ${
                    isToday ? "border-primary bg-secondary/40" : "border-border"
                  }`}
                >
                  <span className={`text-xs font-semibold ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                    {day}
                  </span>
                  <div className="mt-1 space-y-1">
                    {list.map((o, j) => (
                      <Link
                        key={j}
                        href={`/courses/${o.session.courseId}`}
                        title={`${o.session.title} · ${o.session.time}`}
                        className="block truncate rounded bg-primary/10 px-1 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/20"
                      >
                        {o.session.emoji} {o.session.time} {o.session.title}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Upcoming sessions */}
        <div>
          <h2 className="text-lg font-semibold">{t("calendar.upcoming")}</h2>
          <div className="mt-3 space-y-3">
            {upcoming.length === 0 ? (
              <p className="rounded-[var(--radius-lg)] border border-dashed border-border p-4 text-sm text-muted-foreground">
                {t("calendar.noSessions")}
              </p>
            ) : (
              upcoming.map((o, i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-md)] bg-secondary text-xl">
                      {o.session.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{o.session.title}</p>
                      <Link href={`/courses/${o.session.courseId}`} className="truncate text-xs text-primary hover:underline">
                        {o.session.courseTitle}
                      </Link>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {o.date.toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short" })} · {o.session.time}
                        <Badge tone="muted" className="ml-1">{o.session.durationMin}m</Badge>
                      </p>
                    </div>
                  </div>
                  <a href={o.session.meetingUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="mt-3 w-full">
                      <Video className="h-4 w-4" /> {t("calendar.join")}
                    </Button>
                  </a>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
