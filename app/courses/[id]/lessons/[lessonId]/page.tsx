"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Award, CheckCircle2 } from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Badge, Button, Card, Progress } from "@/components/ui";
import { QuizWidget } from "@/components/quiz-widget";
import { VideoPlayer } from "@/components/video-player";
import { CertificateModal } from "@/components/certificate-modal";
import type { Certificate } from "@/lib/types";

const WATCH_GATE = 90; // % of the video required before advancing

export default function LessonPage() {
  return <AuthGuard>{() => <Lesson />}</AuthGuard>;
}

function Lesson() {
  const t = useT();
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  const lessonId = params.lessonId as string;

  const course = useStore((s) => s.courses.find((c) => c.id === courseId));
  const completeLesson = useStore((s) => s.completeLesson);
  const lessonProgress = useStore((s) => s.lessonProgress);
  const pct = useStore((s) => s.courseProgressPct(courseId));

  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [watched, setWatched] = useState(0);
  const [cert, setCert] = useState<Certificate | null>(null);
  const [showCert, setShowCert] = useState(false);

  // Reset the watch gate whenever we move to a different lesson.
  useEffect(() => {
    setWatched(0);
    setQuizScore(null);
  }, [lessonId]);

  if (!course) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center text-muted-foreground">{t("common.noResults")}</div>
    );
  }
  const idx = course.lessons.findIndex((l) => l.id === lessonId);
  const lesson = course.lessons[idx];
  if (!lesson) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center text-muted-foreground">{t("common.noResults")}</div>
    );
  }

  const done = lessonProgress(lessonId)?.completed;
  const prev = course.lessons[idx - 1];
  const next = course.lessons[idx + 1];
  const noQuiz = lesson.quiz.length === 0;
  const hasVideo = Boolean(lesson.videoUrl);
  // Flow: watch the lesson → answer the quiz → continue. The quiz (when present)
  // is the gate; the video is shown but not hard-locked (lessons can be long
  // YouTube videos, so a strict %-watched gate would block completion).
  const watchedEnough = watched >= WATCH_GATE;
  const canComplete = done || noQuiz || quizScore != null;
  const courseComplete = pct === 100;

  function markComplete() {
    completeLesson(courseId, lessonId, quizScore ?? 100);
    if (next) {
      toast.success(t("toast.lessonDone"));
      router.push(`/courses/${courseId}/lessons/${next.id}`);
    } else {
      // Last lesson — the "Get certificate" button appears once the course is 100%.
      toast.success(t("toast.courseDone"));
    }
  }

  function openCertificate() {
    const c = useStore.getState().myCertificates().find((x) => x.courseId === courseId);
    if (c) {
      setCert(c);
      setShowCert(true);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href={`/courses/${courseId}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {course.title}
      </Link>

      <div className="mt-4 flex items-center justify-between gap-3">
        <Badge tone="muted">
          {t("courses.lesson")} {idx + 1}/{course.lessons.length}
        </Badge>
        <div className="flex-1">
          <Progress value={pct} />
        </div>
        <span className="text-sm font-medium">{pct}%</span>
      </div>

      <h1 className="mt-4 text-2xl font-bold">{lesson.title}</h1>

      <VideoPlayer key={lesson.id} url={lesson.videoUrl ?? ""} durationMin={lesson.durationMin} onProgress={setWatched} />

      {/* Watch progress (informational) */}
      {hasVideo && !done && (
        <div className="mt-3 flex items-center gap-3">
          <Progress value={watched} className="flex-1" />
          <span className={`text-xs font-medium ${watchedEnough ? "text-success" : "text-muted-foreground"}`}>
            {watchedEnough ? t("courses.watchDone") : `${watched}%`}
          </span>
        </div>
      )}

      <Card className="mt-5 p-6">
        <p className="leading-relaxed">{lesson.content}</p>
      </Card>

      {lesson.quiz.length > 0 && (
        <div className="mt-6">
          <QuizWidget questions={lesson.quiz} onScored={setQuizScore} />
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {prev && (
          <Link href={`/courses/${courseId}/lessons/${prev.id}`}>
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" /> {t("courses.prevLesson")}
            </Button>
          </Link>
        )}

        {/* 1–2–3 flow: complete this lesson (answer the quiz) → continue. */}
        {!done && (
          <Button onClick={markComplete} disabled={!canComplete}>
            <CheckCircle2 className="h-4 w-4" />
            {next ? t("courses.completeContinue") : t("courses.markComplete")}
          </Button>
        )}

        {done && next && (
          <Link href={`/courses/${courseId}/lessons/${next.id}`}>
            <Button variant="outline">
              {t("courses.nextLesson")} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        )}

        {done && !next && !courseComplete && (
          <span className="font-medium text-success">{t("common.completed")}</span>
        )}

        {/* Whole course finished → explicit certificate button. */}
        {courseComplete && (
          <Button onClick={openCertificate}>
            <Award className="h-4 w-4" /> {t("courses.getCertificate")}
          </Button>
        )}
      </div>

      {courseComplete && (
        <p className="mt-3 text-sm font-medium text-success">{t("courses.courseComplete")}</p>
      )}

      <CertificateModal cert={cert} open={showCert} onClose={() => { setShowCert(false); router.push("/dashboard"); }} />
    </div>
  );
}
