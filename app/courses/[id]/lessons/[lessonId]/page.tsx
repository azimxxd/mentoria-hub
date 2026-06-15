"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle2, PlayCircle } from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Badge, Button, Card, Progress } from "@/components/ui";
import { QuizWidget } from "@/components/quiz-widget";
import { CertificateModal } from "@/components/certificate-modal";
import type { Certificate } from "@/lib/types";

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
  const [cert, setCert] = useState<Certificate | null>(null);
  const [showCert, setShowCert] = useState(false);

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
  const canComplete = done || noQuiz || quizScore != null;

  function markComplete() {
    completeLesson(courseId, lessonId, quizScore ?? 100);
    const certs = useStore.getState().myCertificates();
    const c = certs.find((x) => x.courseId === courseId);
    const fullyDone = useStore.getState().courseProgressPct(courseId) === 100;
    if (fullyDone && c) {
      toast.success(t("toast.courseDone"));
      setCert(c);
      setShowCert(true);
    } else {
      toast.success(t("toast.lessonDone"));
      if (next) router.push(`/courses/${courseId}/lessons/${next.id}`);
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

      {/* Video placeholder */}
      <div className="mt-5 flex aspect-video w-full flex-col items-center justify-center rounded-[var(--radius-lg)] border border-border bg-gradient-to-br from-secondary/40 to-muted text-muted-foreground">
        <PlayCircle className="h-14 w-14 text-primary" />
        <p className="mt-2 text-sm">{t("courses.videoPlaceholder")} · {lesson.durationMin}:00</p>
      </div>

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
        <Button onClick={markComplete} disabled={!canComplete}>
          <CheckCircle2 className="h-4 w-4" />
          {done ? t("common.completed") : t("courses.markComplete")}
        </Button>
        {next && (
          <Link href={`/courses/${courseId}/lessons/${next.id}`}>
            <Button variant="outline">
              {t("courses.nextLesson")} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
        {!next && done && (
          <span className="font-medium text-success">{t("courses.courseComplete")}</span>
        )}
      </div>

      <CertificateModal cert={cert} open={showCert} onClose={() => { setShowCert(false); router.push("/dashboard"); }} />
    </div>
  );
}
