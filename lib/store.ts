"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Certificate,
  Course,
  Enrollment,
  LessonProgress,
  Opportunity,
  RoadmapTask,
  User,
} from "./types";
import { SEED_COURSES, SEED_OPPORTUNITIES, SEED_USERS } from "./seed-data";
import { uid } from "./utils";

type Result = { ok: true } | { ok: false; error: string };

interface StoreState {
  _hasHydrated: boolean;
  users: User[];
  currentUserId: string | null;
  opportunities: Opportunity[];
  courses: Course[];
  saved: Record<string, string[]>;
  enrollments: Record<string, Enrollment[]>;
  progress: Record<string, Record<string, LessonProgress>>;
  certificates: Record<string, Certificate[]>;
  roadmaps: Record<string, RoadmapTask[]>;

  // auth
  signup: (email: string, password: string, name: string) => Result;
  login: (email: string, password: string) => Result;
  logout: () => void;
  currentUser: () => User | null;
  updateProfile: (patch: Partial<User>) => void;

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

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      _hasHydrated: false,
      users: SEED_USERS,
      currentUserId: null,
      opportunities: SEED_OPPORTUNITIES,
      courses: SEED_COURSES,
      saved: {},
      enrollments: {},
      progress: {},
      certificates: {},
      roadmaps: {},

      signup: (email, password, name) => {
        email = email.trim().toLowerCase();
        if (!email || !password || !name) return { ok: false, error: "All fields are required." };
        if (get().users.some((u) => u.email === email))
          return { ok: false, error: "An account with this email already exists." };
        const user: User = {
          id: uid("user"),
          email,
          password,
          name: name.trim(),
          role: "student",
          onboarded: false,
          interests: [],
          subjects: [],
          goals: [],
          language: "en",
        };
        set((s) => ({ users: [...s.users, user], currentUserId: user.id }));
        return { ok: true };
      },

      login: (email, password) => {
        email = email.trim().toLowerCase();
        const user = get().users.find((u) => u.email === email);
        if (!user || user.password !== password)
          return { ok: false, error: "Incorrect email or password." };
        set({ currentUserId: user.id });
        return { ok: true };
      },

      logout: () => set({ currentUserId: null }),

      currentUser: () => {
        const { users, currentUserId } = get();
        return users.find((u) => u.id === currentUserId) ?? null;
      },

      updateProfile: (patch) => {
        const id = get().currentUserId;
        if (!id) return;
        set((s) => ({
          users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)),
        }));
      },

      toggleSave: (opportunityId) => {
        const id = get().currentUserId;
        if (!id) return;
        set((s) => {
          const list = s.saved[id] ?? [];
          const next = list.includes(opportunityId)
            ? list.filter((x) => x !== opportunityId)
            : [...list, opportunityId];
          return { saved: { ...s.saved, [id]: next } };
        });
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

      enroll: (courseId) => {
        const id = get().currentUserId;
        if (!id) return;
        set((s) => {
          const list = s.enrollments[id] ?? [];
          if (list.some((e) => e.courseId === courseId)) return s;
          return {
            enrollments: {
              ...s.enrollments,
              [id]: [...list, { courseId, enrolledAt: new Date().toISOString() }],
            },
          };
        });
      },

      isEnrolled: (courseId) => {
        const id = get().currentUserId;
        if (!id) return false;
        return (get().enrollments[id] ?? []).some((e) => e.courseId === courseId);
      },

      completeLesson: (courseId, lessonId, quizScore) => {
        const id = get().currentUserId;
        if (!id) return;
        // ensure enrollment
        get().enroll(courseId);
        set((s) => {
          const userProgress = { ...(s.progress[id] ?? {}) };
          userProgress[lessonId] = {
            completed: true,
            quizScore,
            completedAt: new Date().toISOString(),
          };
          return { progress: { ...s.progress, [id]: userProgress } };
        });

        // issue certificate if course fully complete
        const course = get().courses.find((c) => c.id === courseId);
        if (!course) return;
        const up = get().progress[id] ?? {};
        const allDone = course.lessons.every((l) => up[l.id]?.completed);
        if (allDone) {
          const existing = get().certificates[id] ?? [];
          if (!existing.some((c) => c.courseId === courseId)) {
            const user = get().currentUser();
            const cert: Certificate = {
              id: uid("cert"),
              courseId,
              courseTitle: course.title,
              userName: user?.name ?? "Student",
              code: `MH-${course.id.slice(-4).toUpperCase()}-${uid("").slice(-5).toUpperCase()}`,
              issuedAt: new Date().toISOString(),
            };
            set((s) => ({
              certificates: { ...s.certificates, [id]: [...existing, cert] },
            }));
          }
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

      // Pure read — does not mutate. Call ensureRoadmap() (e.g. in an effect)
      // to seed the default plan for a new user.
      roadmap: () => {
        const id = get().currentUserId;
        if (!id) return [];
        return get().roadmaps[id] ?? [];
      },

      ensureRoadmap: () => {
        const id = get().currentUserId;
        if (!id || get().roadmaps[id]) return;
        const seeded: RoadmapTask[] = DEFAULT_ROADMAP.map((t) => ({
          ...t,
          id: uid("rt"),
          done: false,
        }));
        set((s) => ({ roadmaps: { ...s.roadmaps, [id]: seeded } }));
      },

      addRoadmapTask: (grade, text) => {
        const id = get().currentUserId;
        if (!id || !text.trim()) return;
        const list = get().roadmaps[id] ?? [];
        set((s) => ({
          roadmaps: {
            ...s.roadmaps,
            [id]: [...list, { id: uid("rt"), grade, text: text.trim(), done: false }],
          },
        }));
      },

      toggleRoadmapTask: (taskId) => {
        const id = get().currentUserId;
        if (!id) return;
        const list = get().roadmaps[id] ?? [];
        set((s) => ({
          roadmaps: {
            ...s.roadmaps,
            [id]: list.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)),
          },
        }));
      },

      deleteRoadmapTask: (taskId) => {
        const id = get().currentUserId;
        if (!id) return;
        const list = get().roadmaps[id] ?? [];
        set((s) => ({ roadmaps: { ...s.roadmaps, [id]: list.filter((t) => t.id !== taskId) } }));
      },

      saveOpportunity: (o) =>
        set((s) => {
          const exists = s.opportunities.some((x) => x.id === o.id);
          return {
            opportunities: exists
              ? s.opportunities.map((x) => (x.id === o.id ? o : x))
              : [{ ...o, id: o.id || uid("opp") }, ...s.opportunities],
          };
        }),

      deleteOpportunity: (id) =>
        set((s) => ({ opportunities: s.opportunities.filter((x) => x.id !== id) })),

      saveCourse: (c) =>
        set((s) => {
          const exists = s.courses.some((x) => x.id === c.id);
          return {
            courses: exists
              ? s.courses.map((x) => (x.id === c.id ? c : x))
              : [{ ...c, id: c.id || uid("course") }, ...s.courses],
          };
        }),

      deleteCourse: (id) => set((s) => ({ courses: s.courses.filter((x) => x.id !== id) })),
    }),
    {
      name: "mentoria-hub-v1",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state._hasHydrated = true;
      },
      partialize: (s) => ({
        users: s.users,
        currentUserId: s.currentUserId,
        opportunities: s.opportunities,
        courses: s.courses,
        saved: s.saved,
        enrollments: s.enrollments,
        progress: s.progress,
        certificates: s.certificates,
        roadmaps: s.roadmaps,
      }),
    },
  ),
);

export function useHydrated() {
  return useStore((s) => s._hasHydrated);
}
