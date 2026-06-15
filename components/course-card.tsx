"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import type { Course } from "@/lib/types";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Badge, Card, Progress } from "./ui";
import { CoverImage } from "./cover-image";

export function CourseCard({ course }: { course: Course }) {
  const t = useT();
  const pct = useStore((s) => (s._hasHydrated ? s.courseProgressPct(course.id) : 0));
  const enrolled = useStore((s) => (s._hasHydrated ? s.isEnrolled(course.id) : false));

  return (
    <Link href={`/courses/${course.id}`}>
      <Card className="card-hover flex h-full flex-col overflow-hidden p-0">
        <div className="relative">
          <CoverImage id={course.id} alt={course.title} emoji={course.emoji} src={course.image} className="aspect-[16/9] w-full" />
          <span className="absolute right-3 top-3">
            <Badge tone="primary" className="backdrop-blur">{course.level}</Badge>
          </span>
        </div>
        <div className="flex flex-1 flex-col p-5">
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
        </div>
      </Card>
    </Link>
  );
}
