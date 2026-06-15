"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import type { Course } from "@/lib/types";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Badge, Card, Progress } from "./ui";

export function CourseCard({ course }: { course: Course }) {
  const t = useT();
  const pct = useStore((s) => (s._hasHydrated ? s.courseProgressPct(course.id) : 0));
  const enrolled = useStore((s) => (s._hasHydrated ? s.isEnrolled(course.id) : false));

  return (
    <Link href={`/courses/${course.id}`}>
      <Card className="card-hover flex h-full flex-col p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="grid h-12 w-12 place-items-center rounded-[var(--radius-md)] bg-secondary text-2xl">
            {course.emoji}
          </span>
          <Badge tone="muted">{course.level}</Badge>
        </div>
        <h3 className="text-base font-semibold leading-snug">{course.title}</h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">{course.description}</p>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5" />
          {course.lessons.length} {t("common.lessons")}
          <span>·</span>
          <span>{course.subject}</span>
        </div>
        {enrolled && (
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-muted-foreground">{t("courses.yourProgress")}</span>
              <span className="font-medium">{pct}%</span>
            </div>
            <Progress value={pct} />
          </div>
        )}
      </Card>
    </Link>
  );
}
