import type { Course, LiveSession } from "./types";
import scheduleJson from "./live-sessions.json";

const BASE: LiveSession[] = scheduleJson.sessions as LiveSession[];
// Matched by course title so the curated schedule survives whatever id scheme
// the data layer uses (string seed ids locally, uuids in Supabase).
const BASE_BY_TITLE = new Map(BASE.map((s) => [s.courseTitle, s]));

// Weekday/time options used to invent a live lesson for any course that does not
// have an explicit entry in live-sessions.json (e.g. admin-created courses).
const FALLBACK_WEEKDAYS = [1, 2, 3, 4, 5]; // Mon–Fri
const FALLBACK_TIMES = ["17:00", "17:30", "18:00", "18:30", "19:00"];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Returns the recurring live lesson for a course (explicit or deterministically invented). */
export function sessionForCourse(course: Pick<Course, "id" | "title" | "emoji">): LiveSession {
  const explicit = BASE_BY_TITLE.get(course.title);
  if (explicit) return { ...explicit, courseId: course.id };
  const h = hash(course.id);
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

export function getSchedule(courses: Pick<Course, "id" | "title" | "emoji">[]): LiveSession[] {
  return courses.map(sessionForCourse);
}

export interface Occurrence {
  date: Date; // exact start datetime
  session: LiveSession;
}

function withTime(day: Date, time: string): Date {
  const [h, m] = time.split(":").map(Number);
  const d = new Date(day);
  d.setHours(h, m ?? 0, 0, 0);
  return d;
}

/** All occurrences of the given sessions within a calendar month (year, 0-indexed month). */
export function monthOccurrences(sessions: LiveSession[], year: number, month: number): Occurrence[] {
  const out: Occurrence[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const wd = date.getDay();
    for (const s of sessions) {
      if (s.weekday === wd) out.push({ date: withTime(date, s.time), session: s });
    }
  }
  return out.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/** The next occurrence of a recurring session at or after `from`. */
export function nextOccurrence(session: LiveSession, from: Date = new Date()): Date {
  const d = new Date(from);
  for (let i = 0; i < 8; i++) {
    if (d.getDay() === session.weekday) {
      const candidate = withTime(d, session.time);
      if (candidate.getTime() >= from.getTime()) return candidate;
    }
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
  }
  // Fallback (should never hit): one week out.
  return withTime(new Date(from.getTime() + 7 * 864e5), session.time);
}
