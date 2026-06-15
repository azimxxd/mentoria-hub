import type { Course, Direction, Opportunity, User } from "./types";
import { daysUntil } from "./utils";

/**
 * Content-based recommendation engine.
 *
 * We represent both the student's profile and every item (opportunity / course)
 * as a weighted bag-of-tags vector, then score items by cosine similarity plus
 * a few domain signals (grade fit and deadline urgency). This is a real,
 * inspectable algorithm — not a random shuffle — so recommendations change
 * meaningfully as the student's interests, subjects and goals change.
 */

export interface ProfileVector {
  [tag: string]: number;
}

const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "to",
  "of",
  "and",
  "for",
  "in",
  "on",
  "my",
  "win",
  "get",
  "apply",
  "explore",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s/]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

const DIRECTION_TAGS: Record<Direction, string[]> = {
  Business: ["business", "startup", "pitch", "entrepreneur", "management"],
  STEM: ["stem", "math", "physics", "robotics", "engineering"],
  "Social Impact": ["social impact", "community", "volunteering", "leadership", "debate"],
  Finance: ["finance", "economics", "investing", "money", "markets"],
  Coding: ["coding", "programming", "web", "apps", "hackathon", "software"],
  Science: ["science", "biology", "chemistry", "research", "lab"],
};

/** Build a weighted tag vector from the student's onboarding answers. */
export function buildProfileVector(user: Pick<User, "interests" | "subjects" | "goals">): ProfileVector {
  const v: ProfileVector = {};
  const add = (tag: string, w: number) => {
    const k = tag.toLowerCase();
    v[k] = (v[k] ?? 0) + w;
  };

  // Interests (directions) are the strongest signal.
  for (const dir of user.interests ?? []) {
    add(dir, 3);
    for (const t of DIRECTION_TAGS[dir] ?? []) add(t, 2);
  }
  // Subjects are a strong, specific signal.
  for (const subj of user.subjects ?? []) for (const tok of tokenize(subj)) add(tok, 2);
  // Goals are a softer signal.
  for (const goal of user.goals ?? []) for (const tok of tokenize(goal)) add(tok, 1);

  return v;
}

function itemVector(tags: string[], extra: string[]): ProfileVector {
  const v: ProfileVector = {};
  for (const t of tags) v[t.toLowerCase()] = (v[t.toLowerCase()] ?? 0) + 2;
  for (const e of extra) for (const tok of tokenize(e)) v[tok] = (v[tok] ?? 0) + 1;
  return v;
}

function cosine(a: ProfileVector, b: ProfileVector): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (const k in a) {
    magA += a[k] * a[k];
    if (b[k]) dot += a[k] * b[k];
  }
  for (const k in b) magB += b[k] * b[k];
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export interface Scored<T> {
  item: T;
  score: number;
  reasons: string[];
}

export function scoreOpportunities(
  user: Pick<User, "interests" | "subjects" | "goals" | "grade">,
  opportunities: Opportunity[],
): Scored<Opportunity>[] {
  const profile = buildProfileVector(user);
  const grade = user.grade;

  return opportunities
    .map((o) => {
      const sim = cosine(profile, itemVector(o.tags, [o.title, o.description, o.direction, o.category]));
      const reasons: string[] = [];
      let score = sim;

      if (user.interests?.includes(o.direction)) {
        score += 0.25;
        reasons.push(`Matches your interest in ${o.direction}`);
      }
      if (grade != null) {
        if (grade >= o.gradeMin && grade <= o.gradeMax) {
          score += 0.1;
        } else {
          score -= 0.3; // wrong grade band — push down
        }
      }
      const d = daysUntil(o.deadline);
      if (d >= 0 && d <= 14) {
        score += 0.08;
        reasons.push("Deadline is approaching");
      }
      if (d < 0) score -= 0.5; // already closed

      if (sim > 0.15 && reasons.length === 0) reasons.push("Aligned with your profile");

      return { item: o, score, reasons };
    })
    .sort((a, b) => b.score - a.score);
}

export function scoreCourses(
  user: Pick<User, "interests" | "subjects" | "goals">,
  courses: Course[],
): Scored<Course>[] {
  const profile = buildProfileVector(user);

  return courses
    .map((c) => {
      const sim = cosine(profile, itemVector(c.tags, [c.title, c.description, c.subject, c.direction]));
      const reasons: string[] = [];
      let score = sim;

      if (user.interests?.includes(c.direction)) {
        score += 0.2;
        reasons.push(`Great for ${c.direction}`);
      }
      if (user.subjects?.some((s) => c.subject.toLowerCase().includes(s.toLowerCase()))) {
        score += 0.25;
        reasons.push(`Covers ${c.subject}`);
      }
      if (sim > 0.15 && reasons.length === 0) reasons.push("Recommended for you");

      return { item: c, score, reasons };
    })
    .sort((a, b) => b.score - a.score);
}

/** Convenience: top-N recommended opportunities (closed ones filtered out). */
export function recommendOpportunities(
  user: Pick<User, "interests" | "subjects" | "goals" | "grade">,
  opportunities: Opportunity[],
  n = 4,
): Scored<Opportunity>[] {
  return scoreOpportunities(user, opportunities)
    .filter((s) => daysUntil(s.item.deadline) >= 0)
    .slice(0, n);
}

export function recommendCourses(
  user: Pick<User, "interests" | "subjects" | "goals">,
  courses: Course[],
  n = 3,
): Scored<Course>[] {
  return scoreCourses(user, courses).slice(0, n);
}
