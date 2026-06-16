export type Lang = "en" | "ru" | "kk";

export type Direction =
  | "Business"
  | "STEM"
  | "Social Impact"
  | "Finance"
  | "Coding"
  | "Science";

export const DIRECTIONS: Direction[] = [
  "Business",
  "STEM",
  "Social Impact",
  "Finance",
  "Coding",
  "Science",
];

export type OppFormat = "Online" | "In-person" | "Hybrid";

export type OppCategory =
  | "Olympiad"
  | "Competition"
  | "Scholarship"
  | "Internship"
  | "Summer School"
  | "Research"
  | "Volunteering"
  | "Hackathon"
  | "Program";

export const CATEGORIES: OppCategory[] = [
  "Olympiad",
  "Competition",
  "Scholarship",
  "Internship",
  "Summer School",
  "Research",
  "Volunteering",
  "Hackathon",
  "Program",
];

export interface Opportunity {
  id: string;
  title: string;
  organizer: string;
  category: OppCategory;
  direction: Direction;
  format: OppFormat;
  deadline: string; // ISO date
  description: string;
  requirements: string;
  applyUrl: string;
  gradeMin: number;
  gradeMax: number;
  tags: string[];
  /** Optional cover photo (data URL or external URL). Overrides /covers/<id>.png. */
  image?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answer: number;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  durationMin: number;
  quiz: QuizQuestion[];
}

export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";

export interface Course {
  id: string;
  title: string;
  description: string;
  level: CourseLevel;
  subject: string;
  direction: Direction;
  tags: string[];
  emoji: string;
  lessons: Lesson[];
  /** Optional cover photo (data URL or external URL). Overrides /covers/<id>.png. */
  image?: string;
  /** Mentor (or admin) who owns/created this course. Used for the mentor portal + RLS. */
  authorId?: string;
  /** Display name of the author, when known (leaderboard/listing convenience). */
  authorName?: string;
}

/** One row of the student leaderboard. */
export interface LeaderboardEntry {
  userId: string;
  name: string;
  points: number;
  completedLessons: number;
  certificates: number;
  grade?: number;
}

export interface LiveSession {
  courseId: string;
  courseTitle: string;
  emoji: string;
  /** 0 = Sunday … 6 = Saturday */
  weekday: number;
  /** "HH:MM" 24h local time */
  time: string;
  durationMin: number;
  title: string;
  meetingUrl: string;
}

export type Role = "student" | "mentor" | "admin";

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: Role;
  onboarded: boolean;
  grade?: number;
  interests: Direction[];
  subjects: string[];
  goals: string[];
  language: Lang;
}

export interface Enrollment {
  courseId: string;
  enrolledAt: string;
}

export interface LessonProgress {
  completed: boolean;
  quizScore?: number;
  completedAt?: string;
}

export interface Certificate {
  id: string;
  courseId: string;
  courseTitle: string;
  userName: string;
  code: string;
  issuedAt: string;
}

export type RoadmapTask = {
  id: string;
  grade: 9 | 10 | 11 | 12;
  text: string;
  done: boolean;
};
