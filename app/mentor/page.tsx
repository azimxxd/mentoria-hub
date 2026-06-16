"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { BookOpen, GraduationCap, Pencil, Plus, Trash2, Users } from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { CourseForm } from "@/app/admin/page";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Badge, Button, Card, Dialog } from "@/components/ui";
import type { Course, User } from "@/lib/types";

export default function MentorPage() {
  return <AuthGuard roles={["mentor"]}>{(user) => <Mentor user={user} />}</AuthGuard>;
}

function Mentor({ user }: { user: User }) {
  const t = useT();
  const courses = useStore((s) => s.courses);
  const save = useStore((s) => s.saveCourse);
  const del = useStore((s) => s.deleteCourse);
  const enrollMap = useStore((s) => s.enrollments);

  // A mentor sees the courses they authored. (Admins viewing this page see theirs too.)
  const myCourses = useMemo(
    () => courses.filter((c) => c.authorId === user.id),
    [courses, user.id],
  );

  const [editing, setEditing] = useState<Course | null>(null);
  const [open, setOpen] = useState(false);

  const totalLessons = myCourses.reduce((a, c) => a + c.lessons.length, 0);
  const totalStudents = useMemo(() => {
    const ids = new Set(myCourses.map((c) => c.id));
    let n = 0;
    for (const list of Object.values(enrollMap)) {
      if (list.some((e) => ids.has(e.courseId))) n++;
    }
    return n;
  }, [enrollMap, myCourses]);

  function blank(): Course {
    return {
      id: "",
      title: "",
      description: "",
      level: "Beginner",
      subject: "General",
      direction: "STEM",
      emoji: "📚",
      tags: [],
      lessons: [],
      authorId: user.id,
    };
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{t("mentor.title")}</h1>
          <p className="mt-1 text-muted-foreground">{t("mentor.subtitle")}</p>
        </div>
        <Button onClick={() => { setEditing(blank()); setOpen(true); }}>
          <Plus className="h-4 w-4" /> {t("admin.newCourse")}
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat icon={GraduationCap} label={t("admin.totalCourses")} value={myCourses.length} />
        <Stat icon={BookOpen} label={t("admin.totalLessons")} value={totalLessons} />
        <Stat icon={Users} label={t("mentor.students")} value={totalStudents} />
      </div>

      <h2 className="mt-8 text-lg font-semibold">{t("mentor.myCourses")}</h2>
      {myCourses.length === 0 ? (
        <Card className="mt-3 flex flex-col items-center gap-3 border-dashed p-8 text-center">
          <GraduationCap className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{t("mentor.empty")}</p>
          <Button onClick={() => { setEditing(blank()); setOpen(true); }}>
            <Plus className="h-4 w-4" /> {t("admin.newCourse")}
          </Button>
        </Card>
      ) : (
        <div className="mt-3 grid gap-3">
          {myCourses.map((c) => (
            <Card key={c.id} className="flex items-center gap-3 p-4">
              <span className="text-2xl">{c.emoji}</span>
              <div className="flex-1">
                <Link href={`/courses/${c.id}`} className="font-medium hover:underline">{c.title}</Link>
                <p className="text-xs text-muted-foreground">
                  {c.lessons.length} {t("common.lessons")} · {c.subject}
                </p>
              </div>
              <Badge tone="muted">{c.level}</Badge>
              <Button variant="ghost" size="icon" onClick={() => { setEditing(c); setOpen(true); }} aria-label="Edit">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => { del(c.id); toast.success(t("toast.adminDeleted")); }} aria-label="Delete">
                <Trash2 className="h-4 w-4 text-danger" />
              </Button>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)}>
        {editing && (
          <CourseForm
            initial={editing}
            onCancel={() => setOpen(false)}
            onSave={(c) => { save({ ...c, authorId: c.authorId || user.id }); setOpen(false); toast.success(t("toast.adminSaved")); }}
          />
        )}
      </Dialog>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return (
    <Card className="p-5">
      <Icon className="h-6 w-6 text-primary" />
      <p className="mt-3 text-3xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </Card>
  );
}
