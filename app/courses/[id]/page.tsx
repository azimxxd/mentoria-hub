"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Circle, Clock, PlayCircle } from "lucide-react";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Badge, Button, Card, Progress } from "@/components/ui";
import { CoverImage } from "@/components/cover-image";
import type { LessonProgress } from "@/lib/types";

const EMPTY_PROGRESS: Record<string, LessonProgress> = {};

export default function CourseDetailPage() {
  const t = useT();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const course = useStore((s) => s.courses.find((c) => c.id === id));
  const hydrated = useStore((s) => s._hasHydrated);
  const user = useStore((s) => s.currentUserId);
  const pct = useStore((s) => (s._hasHydrated ? s.courseProgressPct(id) : 0));
  const progress = useStore((s) => (s.currentUserId ? s.progress[s.currentUserId] ?? EMPTY_PROGRESS : EMPTY_PROGRESS));
  const enroll = useStore((s) => s.enroll);

  if (!course) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-muted-foreground">{t("common.noResults")}</p>
        <Link href="/courses" className="mt-4 inline-block">
          <Button variant="outline">{t("common.back")}</Button>
        </Link>
      </div>
    );
  }

  const firstUnfinished = course.lessons.find((l) => !progress[l.id]?.completed) ?? course.lessons[0];

  function startLearning() {
    if (!user) return router.push("/login");
    if (!useStore.getState().isEnrolled(course!.id)) {
      enroll(course!.id);
      toast.success(t("toast.enrolled"));
    }
    router.push(`/courses/${course!.id}/lessons/${firstUnfinished.id}`);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/courses" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {t("courses.title")}
      </Link>

      <div className="relative mt-4 overflow-hidden rounded-[var(--radius-xl)] border border-border">
        <CoverImage
          id={course.id}
          alt={course.title}
          emoji={course.emoji}
          src={course.image}
          className="aspect-[21/9] w-full"
          sizes="(max-width: 896px) 100vw, 896px"
          priority
        />
      </div>

      <Card className="mt-4 p-7">
        <div className="flex items-start gap-4">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-[var(--radius-lg)] bg-secondary text-3xl">
            {course.emoji}
          </span>
          <div className="flex-1">
            <div className="flex flex-wrap gap-2">
              <Badge tone="primary">{course.direction}</Badge>
              <Badge tone="muted">{course.level}</Badge>
              <Badge tone="muted">{course.subject}</Badge>
            </div>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{course.title}</h1>
            <p className="mt-2 text-muted-foreground">{course.description}</p>
          </div>
        </div>

        {hydrated && user && (
          <div className="mt-6">
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-muted-foreground">{t("courses.yourProgress")}</span>
              <span className="font-medium">{pct}%</span>
            </div>
            <Progress value={pct} />
          </div>
        )}

        <div className="mt-6">
          <Button size="lg" onClick={startLearning}>
            <PlayCircle className="h-5 w-5" />
            {pct > 0 ? t("common.continue") : t("common.start")}
          </Button>
        </div>
      </Card>

      <h2 className="mt-8 text-lg font-semibold">
        {course.lessons.length} {t("common.lessons")}
      </h2>
      <div className="mt-3 space-y-2">
        {course.lessons.map((l, i) => {
          const done = progress[l.id]?.completed;
          return (
            <Link key={l.id} href={user ? `/courses/${course.id}/lessons/${l.id}` : "/login"}>
              <Card className="card-hover flex items-center gap-3 p-4">
                {done ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {t("courses.lesson")} {i + 1}: {l.title}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> {l.durationMin}m
                </span>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
