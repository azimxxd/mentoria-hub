import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Course,
  Direction,
  LeaderboardEntry,
  Lesson,
  Opportunity,
  RoadmapTask,
  User,
} from "./types";

/* ----------------------------- row mappers ----------------------------- */

type Row = Record<string, unknown>;

export function mapOpportunity(r: Row): Opportunity {
  return {
    id: String(r.id),
    title: String(r.title ?? ""),
    organizer: String(r.organizer ?? ""),
    category: r.category as Opportunity["category"],
    direction: r.direction as Direction,
    format: r.format as Opportunity["format"],
    deadline: String(r.deadline ?? "").slice(0, 10),
    description: String(r.description ?? ""),
    requirements: String(r.requirements ?? ""),
    applyUrl: String(r.apply_url ?? ""),
    gradeMin: Number(r.grade_min ?? 8),
    gradeMax: Number(r.grade_max ?? 12),
    tags: (r.tags as string[]) ?? [],
    image: (r.image as string) || undefined,
  };
}

function mapLesson(r: Row): Lesson {
  return {
    id: String(r.id),
    title: String(r.title ?? ""),
    content: String(r.content ?? ""),
    videoUrl: (r.video_url as string) ?? "",
    durationMin: Number(r.duration_min ?? 10),
    quiz: (r.quiz as Lesson["quiz"]) ?? [],
  };
}

export function mapCourse(r: Row, lessons: Row[]): Course {
  return {
    id: String(r.id),
    title: String(r.title ?? ""),
    description: String(r.description ?? ""),
    level: r.level as Course["level"],
    subject: String(r.subject ?? "General"),
    direction: r.direction as Direction,
    emoji: String(r.emoji ?? "📚"),
    tags: (r.tags as string[]) ?? [],
    image: (r.image as string) || undefined,
    authorId: (r.author_id as string) || undefined,
    lessons: lessons
      .filter((l) => String(l.course_id) === String(r.id))
      .sort((a, b) => Number(a.position ?? 0) - Number(b.position ?? 0))
      .map(mapLesson),
  };
}

export function mapProfile(r: Row, email: string): User {
  return {
    id: String(r.id),
    email: email || String(r.email ?? ""),
    password: "", // never stored client-side with Supabase Auth
    name: String(r.full_name ?? ""),
    role: (r.role as User["role"]) ?? "student",
    onboarded: Boolean(r.onboarded),
    grade: r.grade == null ? undefined : Number(r.grade),
    interests: (r.interests as Direction[]) ?? [],
    subjects: (r.subjects as string[]) ?? [],
    goals: (r.goals as string[]) ?? [],
    language: (r.language as User["language"]) ?? "en",
  };
}

/* ----------------------------- catalog ----------------------------- */

export async function loadCatalog(sb: SupabaseClient): Promise<{
  opportunities: Opportunity[];
  courses: Course[];
}> {
  const [oppRes, courseRes, lessonRes] = await Promise.all([
    sb.from("opportunities").select("*").order("deadline", { ascending: true }),
    sb.from("courses").select("*").order("created_at", { ascending: true }),
    sb.from("lessons").select("*"),
  ]);
  const opportunities = (oppRes.data ?? []).map(mapOpportunity);
  const lessons = (lessonRes.data ?? []) as Row[];
  const courses = (courseRes.data ?? []).map((c) => mapCourse(c as Row, lessons));
  return { opportunities, courses };
}

/* ----------------------------- per-user data ----------------------------- */

export interface UserData {
  user: User;
  savedIds: string[];
  enrollments: { courseId: string; enrolledAt: string }[];
  progress: Record<string, { completed: boolean; quizScore?: number; completedAt?: string }>;
  certificateRows: { id: string; courseId: string; code: string; issuedAt: string }[];
  roadmap: RoadmapTask[];
}

export async function loadUserData(sb: SupabaseClient, userId: string, email: string): Promise<UserData | null> {
  const [profileRes, savedRes, enrollRes, progressRes, certRes, roadmapRes] = await Promise.all([
    sb.from("profiles").select("*").eq("id", userId).single(),
    sb.from("saved_opportunities").select("opportunity_id").eq("user_id", userId),
    sb.from("enrollments").select("course_id, enrolled_at").eq("user_id", userId),
    sb.from("lesson_progress").select("lesson_id, completed, quiz_score, completed_at").eq("user_id", userId),
    sb.from("certificates").select("id, course_id, code, issued_at").eq("user_id", userId),
    sb.from("roadmap_tasks").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
  ]);

  if (!profileRes.data) return null;

  const progress: UserData["progress"] = {};
  for (const p of (progressRes.data ?? []) as Row[]) {
    progress[String(p.lesson_id)] = {
      completed: Boolean(p.completed),
      quizScore: p.quiz_score == null ? undefined : Number(p.quiz_score),
      completedAt: (p.completed_at as string) ?? undefined,
    };
  }

  return {
    user: mapProfile(profileRes.data as Row, email),
    savedIds: ((savedRes.data ?? []) as Row[]).map((r) => String(r.opportunity_id)),
    enrollments: ((enrollRes.data ?? []) as Row[]).map((r) => ({
      courseId: String(r.course_id),
      enrolledAt: String(r.enrolled_at ?? ""),
    })),
    progress,
    certificateRows: ((certRes.data ?? []) as Row[]).map((r) => ({
      id: String(r.id),
      courseId: String(r.course_id),
      code: String(r.code ?? ""),
      issuedAt: String(r.issued_at ?? ""),
    })),
    roadmap: ((roadmapRes.data ?? []) as Row[]).map((r) => ({
      id: String(r.id),
      grade: Number(r.grade) as RoadmapTask["grade"],
      text: String(r.text ?? ""),
      done: Boolean(r.done),
    })),
  };
}

/** All profiles — only succeeds for admins (RLS), used to populate the admin users table. */
export async function loadAllProfiles(sb: SupabaseClient): Promise<User[]> {
  const { data } = await sb.from("profiles").select("*");
  return ((data ?? []) as Row[]).map((r) => mapProfile(r, String(r.email ?? "")));
}

/* ----------------------------- student mutations ----------------------------- */

export const dbSave = (sb: SupabaseClient, userId: string, opportunityId: string) =>
  sb.from("saved_opportunities").upsert({ user_id: userId, opportunity_id: opportunityId });

export const dbUnsave = (sb: SupabaseClient, userId: string, opportunityId: string) =>
  sb.from("saved_opportunities").delete().eq("user_id", userId).eq("opportunity_id", opportunityId);

export const dbEnroll = (sb: SupabaseClient, userId: string, courseId: string) =>
  sb.from("enrollments").upsert({ user_id: userId, course_id: courseId });

export const dbCompleteLesson = (
  sb: SupabaseClient,
  userId: string,
  lessonId: string,
  quizScore: number,
) =>
  sb.from("lesson_progress").upsert({
    user_id: userId,
    lesson_id: lessonId,
    completed: true,
    quiz_score: quizScore,
    completed_at: new Date().toISOString(),
  });

/** Inserts a certificate and returns the DB-generated id + issued_at. */
export async function dbInsertCertificate(
  sb: SupabaseClient,
  userId: string,
  courseId: string,
  code: string,
): Promise<{ id: string; issuedAt: string } | null> {
  const { data } = await sb
    .from("certificates")
    .insert({ user_id: userId, course_id: courseId, code })
    .select("id, issued_at")
    .single();
  if (!data) return null;
  return { id: String(data.id), issuedAt: String(data.issued_at) };
}

export async function dbAddRoadmap(
  sb: SupabaseClient,
  userId: string,
  grade: number,
  text: string,
): Promise<string | null> {
  const { data } = await sb
    .from("roadmap_tasks")
    .insert({ user_id: userId, grade, text })
    .select("id")
    .single();
  return data ? String(data.id) : null;
}

export const dbToggleRoadmap = (sb: SupabaseClient, id: string, done: boolean) =>
  sb.from("roadmap_tasks").update({ done }).eq("id", id);

export const dbDeleteRoadmap = (sb: SupabaseClient, id: string) =>
  sb.from("roadmap_tasks").delete().eq("id", id);

export function dbUpdateProfile(sb: SupabaseClient, userId: string, patch: Partial<User>) {
  const row: Row = {};
  if (patch.name !== undefined) row.full_name = patch.name;
  if (patch.grade !== undefined) row.grade = patch.grade;
  if (patch.interests !== undefined) row.interests = patch.interests;
  if (patch.subjects !== undefined) row.subjects = patch.subjects;
  if (patch.goals !== undefined) row.goals = patch.goals;
  if (patch.language !== undefined) row.language = patch.language;
  if (patch.onboarded !== undefined) row.onboarded = patch.onboarded;
  return sb.from("profiles").update(row).eq("id", userId);
}

/* ----------------------------- admin catalog CRUD ----------------------------- */

function oppToRow(o: Opportunity): Row {
  const row: Row = {
    title: o.title,
    organizer: o.organizer,
    category: o.category,
    direction: o.direction,
    format: o.format,
    deadline: o.deadline,
    description: o.description,
    requirements: o.requirements,
    apply_url: o.applyUrl,
    grade_min: o.gradeMin,
    grade_max: o.gradeMax,
    tags: o.tags,
    image: o.image ?? null,
  };
  if (isUuid(o.id)) row.id = o.id;
  return row;
}

/** Upserts an opportunity and returns the stored row mapped to an Opportunity (with its real id). */
export async function dbUpsertOpportunity(sb: SupabaseClient, o: Opportunity): Promise<Opportunity | null> {
  const { data } = await sb.from("opportunities").upsert(oppToRow(o)).select("*").single();
  return data ? mapOpportunity(data as Row) : null;
}

export const dbDeleteOpportunity = (sb: SupabaseClient, id: string) =>
  sb.from("opportunities").delete().eq("id", id);

/** Upserts a course and replaces its lessons, returning the stored course (with real ids). */
export async function dbUpsertCourse(sb: SupabaseClient, c: Course): Promise<Course | null> {
  const courseRow: Row = {
    title: c.title,
    description: c.description,
    level: c.level,
    subject: c.subject,
    direction: c.direction,
    emoji: c.emoji,
    tags: c.tags,
    image: c.image ?? null,
  };
  if (c.authorId) courseRow.author_id = c.authorId;
  if (isUuid(c.id)) courseRow.id = c.id;

  const { data: courseData } = await sb.from("courses").upsert(courseRow).select("*").single();
  if (!courseData) return null;
  const courseId = String((courseData as Row).id);

  // Replace lessons wholesale — simplest correct approach for the admin editor.
  await sb.from("lessons").delete().eq("course_id", courseId);
  if (c.lessons.length) {
    const lessonRows = c.lessons.map((l, i) => ({
      course_id: courseId,
      position: i,
      title: l.title,
      content: l.content,
      video_url: l.videoUrl ?? "",
      duration_min: l.durationMin,
      quiz: l.quiz,
    }));
    await sb.from("lessons").insert(lessonRows);
  }
  const { data: lessonData } = await sb.from("lessons").select("*").eq("course_id", courseId);
  return mapCourse(courseData as Row, (lessonData ?? []) as Row[]);
}

export const dbDeleteCourse = (sb: SupabaseClient, id: string) =>
  sb.from("courses").delete().eq("id", id);

/* ----------------------------- leaderboard ----------------------------- */

export async function loadLeaderboard(sb: SupabaseClient): Promise<LeaderboardEntry[]> {
  const { data, error } = await sb.rpc("get_leaderboard");
  if (error || !data) return [];
  return (data as Row[]).map((r) => ({
    userId: String(r.user_id),
    name: String(r.name ?? "Student"),
    grade: r.grade == null ? undefined : Number(r.grade),
    completedLessons: Number(r.completed_lessons ?? 0),
    certificates: Number(r.certificates ?? 0),
    points: Number(r.points ?? 0),
  }));
}

/* ----------------------------- video upload ----------------------------- */

/** Uploads a lesson video file to the public `lesson-videos` bucket and returns its public URL. */
export async function dbUploadLessonVideo(sb: SupabaseClient, file: File): Promise<string | null> {
  const ext = (file.name.split(".").pop() || "mp4").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await sb.storage.from("lesson-videos").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || "video/mp4",
  });
  if (error) {
    console.error("video upload failed:", error.message);
    return null;
  }
  const { data } = sb.storage.from("lesson-videos").getPublicUrl(path);
  return data.publicUrl;
}

/* ----------------------------- helpers ----------------------------- */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isUuid(v: string): boolean {
  return UUID_RE.test(v);
}
