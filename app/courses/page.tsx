"use client";

import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { CourseCard } from "@/components/course-card";

export default function CoursesPage() {
  const t = useT();
  const courses = useStore((s) => s.courses);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold">{t("courses.title")}</h1>
      <p className="mt-1 text-muted-foreground">{t("courses.subtitle")}</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((c) => (
          <CourseCard key={c.id} course={c} />
        ))}
      </div>
    </div>
  );
}
