"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Certificate,
  Course,
  Enrollment,
  LeaderboardEntry,
  LessonProgress,
  Opportunity,
  RoadmapTask,
  Role,
  User,
} from "./types";
import { SEED_COURSES, SEED_OPPORTUNITIES, SEED_USERS } from "./seed-data";
import { uid } from "./utils";
import { getSupabase, isSupabaseConfigured } from "./supabase";
import * as db from "./supabase-data";

type Result = { ok: true } | { ok: false; error: string };
type SyncMode = "local" | "supabase";

interface StoreState {
  _hasHydrated: boolean;
  _initStarted: boolean;
  syncMode: SyncMode;
  users: User[];
  currentUserId: string | null;
  opportunities: Opportunity[];
  courses: Course[];
  saved: Record<string, string[]>;
  enrollments: Record<string, Enrollment[]>;
  progress: Record<string, Record<string, LessonProgress>>;
  certificates: Record<string, Certificate[]>;
  roadmaps: Record<string, RoadmapTask[]>;
  leaderboard: LeaderboardEntry[];

  // lifecycle
  init: () => Promise<void>;
  _loadUser: (userId: string, email: string) => Promise<void>;

  // auth
  signup: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    nickname: string,
    role?: Role,
  ) => Promise<Result>;
  login: (email: string, password: string) => Promise<Result>;
  logout: () => Promise<void>;
  currentUser: () => User | null;
  updateProfile: (patch: Partial<User>) => Promise<void>;

  // opportunities
  toggleSave: (opportunityId: string) => void;
  isSaved: (opportunityId: string) => boolean;
  savedOpportunities: () => Opportunity[];

  // courses
  enroll: (courseId: string) => void;
  isEnrolled: (courseId: string) => boolean;
  completeLesson: (courseId: string, lessonId: string, quizScore: number) => void;
  lessonProgress: (lessonId: string) => LessonProgress | undefined;
  courseProgressPct: (courseId: string) => number;
  enrolledCourses: () => Course[];
  myCertificates: () => Certificate[];

  // leaderboard
  loadLeaderboard: () => Promise<void>;

  // mentor
  myCourses: () => Course[];
  uploadLessonVideo: (file: File) => Promise<string | null>;

  // roadmap
  roadmap: () => RoadmapTask[];
  ensureRoadmap: () => void;
  addRoadmapTask: (grade: RoadmapTask["grade"], text: string) => void;
  toggleRoadmapTask: (id: string) => void;
  deleteRoadmapTask: (id: string) => void;

  // admin
  saveOpportunity: (o: Opportunity) => void;
  deleteOpportunity: (id: string) => void;
  saveCourse: (c: Course) => void;
  deleteCourse: (id: string) => void;
}

const DEFAULT_ROADMAP: Omit<RoadmapTask, "id" | "done">[] = [
  { grade: 9, text: "Explore interests: join 1 club or online course" },
  { grade: 9, text: "Start learning English consistently" },
  { grade: 10, text: "Compete in a subject olympiad" },
  { grade: 10, text: "Begin a small project or volunteering" },
  { grade: 11, text: "Take an SAT/IELTS diagnostic test" },
  { grade: 11, text: "Apply to a summer school or internship" },
  { grade: 12, text: "Shortlist universities & scholarships" },
  { grade: 12, text: "Prepare application essays" },
];

const sb = () => getSupabase()!; // only called when syncMode === "supabase"

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      _hasHydrated: false,
      _initStarted: false,
      syncMode: "local",
      users: SEED_USERS,
      currentUserId: null,
      opportunities: SEED_OPPORTUNITIES,
      courses: SEED_COURSES,
      saved: {},
      enrollments: {},
      progress: {},
      certificates: {},
      roadmaps: {},
      leaderboard: [],

      /* --------------------------- lifecycle --------------------------- */
      init: async () => {
        if (get()._initStarted) return;
        set({ _initStarted: true });

        if (!isSupabaseConfigured) {
          set({ syncMode: "local", _hasHydrated: true });
          return;
        }

        // Supabase mode: catalog + auth come from the database.
        set({
          syncMode: "supabase",
          users: [],
          currentUserId: null,
          saved: {},
          enrollments: {},
          progress: {},
          certificates: {},
          roadmaps: {},
        });

        try {
          const { opportunities, courses } = await db.loadCatalog(sb());
          set({ opportunities, courses });

          const {
            data: { session },
          } = await sb().auth.getSession();
          if (session) await get()._loadUser(session.user.id, session.user.email ?? "");

          sb().auth.onAuthStateChange((_event, sess) => {
            if (sess) {
              void get()._loadUser(sess.user.id, sess.user.email ?? "");
            } else {
              set({ currentUserId: null, users: [] });
            }
          });
        } catch (err) {
          console.error("Supabase init failed:", err);
        } finally {
          set({ _hasHydrated: true });
        }
      },

      _loadUser: async (userId, email) => {
        const data = await db.loadUserData(sb(), userId, email);
        if (!data) return;

        // Build certificates from rows using the catalog + profile name.
        const certificates: Certificate[] = data.certificateRows.map((c) => ({
          id: c.id,
          courseId: c.courseId,
          courseTitle: get().courses.find((x) => x.id === c.courseId)?.title ?? "Course",
          userName: data.user.name,
          code: c.code,
          issuedAt: c.issuedAt,
        }));

        let users: User[] = [data.user];
        if (data.user.role === "admin") {
          try {
            users = await db.loadAllProfiles(sb());
            if (!users.some((u) => u.id === userId)) users = [data.user, ...users];
          } catch {
            /* fall back to just the current user */
          }
        }

        set({
          currentUserId: userId,
          users,
          saved: { [userId]: data.savedIds },
          enrollments: { [userId]: data.enrollments },
          progress: { [userId]: data.progress },
          certificates: { [userId]: certificates },
          roadmaps: { [userId]: data.roadmap },
        });
      },

      /* --------------------------- auth --------------------------- */
      signup: async (email, password, firstName, lastName, nickname, role = "student") => {
        email = email.trim().toLowerCase();
        firstName = firstName.trim();
        lastName = lastName.trim();
        nickname = nickname.trim();
        if (!email || !password || !firstName || !lastName)
          return { ok: false, error: "Email, password, first name and last name are required." };
        // Only student/mentor can self-register; admin is assigned manually.
        const safeRole: Role = role === "mentor" ? "mentor" : "student";
        // Display name = nickname when provided, otherwise the real full name.
        const displayName = nickname || `${firstName} ${lastName}`.trim();

        if (get().syncMode === "supabase") {
          const { data, error } = await sb().auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: displayName,
                first_name: firstName,
                last_name: lastName,
                nickname,
                role: safeRole,
              },
            },
          });
          if (error) return { ok: false, error: error.message };
          if (data.session) await get()._loadUser(data.session.user.id, email);
          return { ok: true };
        }

        // local mode
        if (get().users.some((u) => u.email === email))
          return { ok: false, error: "An account with this email already exists." };
        const user: User = {
          id: uid("user"),
          email,
          password,
          name: displayName,
          firstName,
          lastName,
          nickname: nickname || undefined,
          role: safeRole,
          onboarded: false,
          interests: [],
          subjects: [],
          goals: [],
          language: "en",
        };
        set((s) => ({ users: [...s.users, user], currentUserId: user.id }));
        return { ok: true };
      },

      login: async (email, password) => {
        email = email.trim().toLowerCase();

        if (get().syncMode === "supabase") {
          const { data, error } = await sb().auth.signInWithPassword({ email, password });
          if (error) return { ok: false, error: error.message };
          await get()._loadUser(data.user.id, data.user.email ?? email);
          return { ok: true };
        }

        const user = get().users.find((u) => u.email === email);
        if (!user || user.password !== password)
          return { ok: false, error: "Incorrect email or password." };
        set({ currentUserId: user.id });
        return { ok: true };
      },

      logout: async () => {
        if (get().syncMode === "supabase") {
          try {
            await sb().auth.signOut();
          } catch (err) {
            console.error("signOut failed:", err);
          }
        }
        set({ currentUserId: null });
      },

      currentUser: () => {
        const { users, currentUserId } = get();
        return users.find((u) => u.id === currentUserId) ?? null;
      },

      updateProfile: async (patch) => {
        const id = get().currentUserId;
        if (!id) return;
        set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) }));
        if (get().syncMode === "supabase") {
          const { error } = await db.dbUpdateProfile(sb(), id, patch);
          if (error) console.error("updateProfile failed:", error.message);
        }
      },

      /* --------------------------- opportunities --------------------------- */
      toggleSave: (opportunityId) => {
        const id = get().currentUserId;
        if (!id) return;
        const list = get().saved[id] ?? [];
        const has = list.includes(opportunityId);
        set((s) => ({
          saved: {
            ...s.saved,
            [id]: has ? list.filter((x) => x !== opportunityId) : [...list, opportunityId],
          },
        }));
        if (get().syncMode === "supabase") {
          void (has ? db.dbUnsave(sb(), id, opportunityId) : db.dbSave(sb(), id, opportunityId));
        }
      },

      isSaved: (opportunityId) => {
        const id = get().currentUserId;
        if (!id) return false;
        return (get().saved[id] ?? []).includes(opportunityId);
      },

      savedOpportunities: () => {
        const id = get().currentUserId;
        if (!id) return [];
        const ids = get().saved[id] ?? [];
        return get().opportunities.filter((o) => ids.includes(o.id));
      },

      /* --------------------------- courses --------------------------- */
      enroll: (courseId) => {
        const id = get().currentUserId;
        if (!id) return;
        const list = get().enrollments[id] ?? [];
        if (list.some((e) => e.courseId === courseId)) return;
        set((s) => ({
          enrollments: {
            ...s.enrollments,
            [id]: [...list, { courseId, enrolledAt: new Date().toISOString() }],
          },
        }));
        if (get().syncMode === "supabase") void db.dbEnroll(sb(), id, courseId);
      },

      isEnrolled: (courseId) => {
        const id = get().currentUserId;
        if (!id) return false;
        return (get().enrollments[id] ?? []).some((e) => e.courseId === courseId);
      },

      completeLesson: (courseId, lessonId, quizScore) => {
        const id = get().currentUserId;
        if (!id) return;
        get().enroll(courseId);

        set((s) => {
          const userProgress = { ...(s.progress[id] ?? {}) };
          userProgress[lessonId] = { completed: true, quizScore, completedAt: new Date().toISOString() };
          return { progress: { ...s.progress, [id]: userProgress } };
        });
        if (get().syncMode === "supabase") void db.dbCompleteLesson(sb(), id, lessonId, quizScore);

        // Issue a certificate once every lesson in the course is complete.
        const course = get().courses.find((c) => c.id === courseId);
        if (!course) return;
        const up = get().progress[id] ?? {};
        const allDone = course.lessons.length > 0 && course.lessons.every((l) => up[l.id]?.completed);
        if (!allDone) return;

        const existing = get().certificates[id] ?? [];
        if (existing.some((c) => c.courseId === courseId)) return;

        const user = get().currentUser();
        const code = `MH-${course.id.slice(-4).toUpperCase()}-${uid("").slice(-5).toUpperCase()}`;

        if (get().syncMode === "supabase") {
          void db.dbInsertCertificate(sb(), id, courseId, code).then((res) => {
            if (!res) return;
            const cert: Certificate = {
              id: res.id,
              courseId,
              courseTitle: course.title,
              userName: user?.name ?? "Student",
              code,
              issuedAt: res.issuedAt,
            };
            set((s) => ({ certificates: { ...s.certificates, [id]: [...(s.certificates[id] ?? []), cert] } }));
          });
        } else {
          const cert: Certificate = {
            id: uid("cert"),
            courseId,
            courseTitle: course.title,
            userName: user?.name ?? "Student",
            code,
            issuedAt: new Date().toISOString(),
          };
          set((s) => ({ certificates: { ...s.certificates, [id]: [...existing, cert] } }));
        }
      },

      lessonProgress: (lessonId) => {
        const id = get().currentUserId;
        if (!id) return undefined;
        return (get().progress[id] ?? {})[lessonId];
      },

      courseProgressPct: (courseId) => {
        const id = get().currentUserId;
        const course = get().courses.find((c) => c.id === courseId);
        if (!id || !course || course.lessons.length === 0) return 0;
        const up = get().progress[id] ?? {};
        const done = course.lessons.filter((l) => up[l.id]?.completed).length;
        return Math.round((done / course.lessons.length) * 100);
      },

      enrolledCourses: () => {
        const id = get().currentUserId;
        if (!id) return [];
        const ids = (get().enrollments[id] ?? []).map((e) => e.courseId);
        return get().courses.filter((c) => ids.includes(c.id));
      },

      myCertificates: () => {
        const id = get().currentUserId;
        if (!id) return [];
        return get().certificates[id] ?? [];
      },

      /* --------------------------- leaderboard --------------------------- */
      loadLeaderboard: async () => {
        if (get().syncMode === "supabase") {
          try {
            const rows = await db.loadLeaderboard(sb());
            set({ leaderboard: rows });
          } catch (err) {
            console.error("loadLeaderboard failed:", err);
          }
          return;
        }
        // local mode: compute from in-memory progress + certificates.
        const { users, progress, certificates } = get();
        const rows: LeaderboardEntry[] = users
          .filter((u) => u.role === "student")
          .map((u) => {
            const completedLessons = Object.values(progress[u.id] ?? {}).filter((p) => p.completed).length;
            const certs = (certificates[u.id] ?? []).length;
            return {
              userId: u.id,
              name: u.name || "Student",
              grade: u.grade,
              completedLessons,
              certificates: certs,
              points: completedLessons * 10 + certs * 100,
            };
          })
          .sort((a, b) => b.points - a.points || b.completedLessons - a.completedLessons);
        set({ leaderboard: rows });
      },

      /* --------------------------- mentor --------------------------- */
      myCourses: () => {
        const id = get().currentUserId;
        if (!id) return [];
        return get().courses.filter((c) => c.authorId === id);
      },

      uploadLessonVideo: async (file) => {
        if (get().syncMode !== "supabase") {
          // No backend storage in local mode — fall back to an in-browser object URL
          // (works for the current session only).
          return URL.createObjectURL(file);
        }
        return db.dbUploadLessonVideo(sb(), file);
      },

      /* --------------------------- roadmap --------------------------- */
      roadmap: () => {
        const id = get().currentUserId;
        if (!id) return [];
        return get().roadmaps[id] ?? [];
      },

      // Seeds the default plan for a new user. In Supabase mode the seeded tasks
      // are also persisted so they survive across devices.
      ensureRoadmap: () => {
        const id = get().currentUserId;
        if (!id || get().roadmaps[id]) return;
        const seeded: RoadmapTask[] = DEFAULT_ROADMAP.map((t) => ({ ...t, id: uid("rt"), done: false }));
        set((s) => ({ roadmaps: { ...s.roadmaps, [id]: seeded } }));
        if (get().syncMode === "supabase") {
          void (async () => {
            const withIds = await Promise.all(
              DEFAULT_ROADMAP.map(async (t, i) => {
                const realId = await db.dbAddRoadmap(sb(), id, t.grade, t.text);
                return { ...seeded[i], id: realId ?? seeded[i].id };
              }),
            );
            set((s) => ({ roadmaps: { ...s.roadmaps, [id]: withIds } }));
          })();
        }
      },

      addRoadmapTask: (grade, text) => {
        const id = get().currentUserId;
        if (!id || !text.trim()) return;
        const tempId = uid("rt");
        set((s) => ({
          roadmaps: {
            ...s.roadmaps,
            [id]: [...(s.roadmaps[id] ?? []), { id: tempId, grade, text: text.trim(), done: false }],
          },
        }));
        if (get().syncMode === "supabase") {
          void db.dbAddRoadmap(sb(), id, grade, text.trim()).then((realId) => {
            if (!realId) return;
            set((s) => ({
              roadmaps: {
                ...s.roadmaps,
                [id]: (s.roadmaps[id] ?? []).map((t) => (t.id === tempId ? { ...t, id: realId } : t)),
              },
            }));
          });
        }
      },

      toggleRoadmapTask: (taskId) => {
        const id = get().currentUserId;
        if (!id) return;
        const list = get().roadmaps[id] ?? [];
        const task = list.find((t) => t.id === taskId);
        const nextDone = !task?.done;
        set((s) => ({
          roadmaps: {
            ...s.roadmaps,
            [id]: list.map((t) => (t.id === taskId ? { ...t, done: nextDone } : t)),
          },
        }));
        if (get().syncMode === "supabase" && db.isUuid(taskId)) void db.dbToggleRoadmap(sb(), taskId, nextDone);
      },

      deleteRoadmapTask: (taskId) => {
        const id = get().currentUserId;
        if (!id) return;
        const list = get().roadmaps[id] ?? [];
        set((s) => ({ roadmaps: { ...s.roadmaps, [id]: list.filter((t) => t.id !== taskId) } }));
        if (get().syncMode === "supabase" && db.isUuid(taskId)) void db.dbDeleteRoadmap(sb(), taskId);
      },

      /* --------------------------- admin --------------------------- */
      saveOpportunity: (o) => {
        if (get().syncMode === "supabase") {
          void db.dbUpsertOpportunity(sb(), o).then((saved) => {
            if (!saved) return;
            set((s) => {
              const exists = s.opportunities.some((x) => x.id === saved.id);
              return {
                opportunities: exists
                  ? s.opportunities.map((x) => (x.id === saved.id ? saved : x))
                  : [saved, ...s.opportunities.filter((x) => x.id !== o.id)],
              };
            });
          });
          return;
        }
        set((s) => {
          const exists = s.opportunities.some((x) => x.id === o.id);
          return {
            opportunities: exists
              ? s.opportunities.map((x) => (x.id === o.id ? o : x))
              : [{ ...o, id: o.id || uid("opp") }, ...s.opportunities],
          };
        });
      },

      deleteOpportunity: (id) => {
        set((s) => ({ opportunities: s.opportunities.filter((x) => x.id !== id) }));
        if (get().syncMode === "supabase") void db.dbDeleteOpportunity(sb(), id);
      },

      saveCourse: (c) => {
        // Stamp ownership so the mentor portal + RLS recognize the creator.
        const ownerId = get().currentUserId;
        if (ownerId && !c.authorId) c = { ...c, authorId: ownerId };
        if (get().syncMode === "supabase") {
          void db.dbUpsertCourse(sb(), c).then((saved) => {
            if (!saved) return;
            set((s) => {
              const exists = s.courses.some((x) => x.id === saved.id);
              return {
                courses: exists
                  ? s.courses.map((x) => (x.id === saved.id ? saved : x))
                  : [saved, ...s.courses.filter((x) => x.id !== c.id)],
              };
            });
          });
          return;
        }
        set((s) => {
          const exists = s.courses.some((x) => x.id === c.id);
          return {
            courses: exists
              ? s.courses.map((x) => (x.id === c.id ? c : x))
              : [{ ...c, id: c.id || uid("course") }, ...s.courses],
          };
        });
      },

      deleteCourse: (id) => {
        set((s) => ({ courses: s.courses.filter((x) => x.id !== id) }));
        if (get().syncMode === "supabase") void db.dbDeleteCourse(sb(), id);
      },
    }),
    {
      name: "mentoria-hub-v1",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state._hasHydrated = true;
      },
      // Only persist to localStorage in local mode; Supabase is the source of truth otherwise.
      partialize: (s) =>
        s.syncMode === "supabase"
          ? { syncMode: s.syncMode }
          : {
              syncMode: s.syncMode,
              users: s.users,
              currentUserId: s.currentUserId,
              opportunities: s.opportunities,
              courses: s.courses,
              saved: s.saved,
              enrollments: s.enrollments,
              progress: s.progress,
              certificates: s.certificates,
              roadmaps: s.roadmaps,
            },
    },
  ),
);

export function useHydrated() {
  return useStore((s) => s._hasHydrated);
}
