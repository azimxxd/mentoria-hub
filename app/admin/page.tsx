"use client";

import { useState } from "react";
import { toast } from "sonner";
import { BookOpen, GraduationCap, LayoutGrid, Pencil, Plus, Trash2, Users } from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Badge, Button, Card, Dialog, Input, Label, Select, Textarea } from "@/components/ui";
import { ImagePicker } from "@/components/image-picker";
import { LessonEditor } from "@/components/lesson-editor";
import {
  CATEGORIES,
  DIRECTIONS,
  type Course,
  type Lesson,
  type Opportunity,
  type OppCategory,
  type OppFormat,
  type Direction,
  type CourseLevel,
} from "@/lib/types";
import { uid } from "@/lib/utils";

type Tab = "stats" | "opps" | "courses";
const FORMATS: OppFormat[] = ["Online", "In-person", "Hybrid"];
const LEVELS: CourseLevel[] = ["Beginner", "Intermediate", "Advanced"];

export default function AdminPage() {
  return <AuthGuard requireAdmin>{() => <Admin />}</AuthGuard>;
}

function Admin() {
  const t = useT();
  const [tab, setTab] = useState<Tab>("stats");

  const opportunities = useStore((s) => s.opportunities);
  const courses = useStore((s) => s.courses);
  const users = useStore((s) => s.users);

  const tabs: { id: Tab; label: string }[] = [
    { id: "stats", label: t("admin.tabStats") },
    { id: "opps", label: t("admin.tabOpps") },
    { id: "courses", label: t("admin.tabCourses") },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold">{t("admin.title")}</h1>
      <p className="mt-1 text-muted-foreground">{t("admin.subtitle")}</p>

      <div className="mt-6 flex gap-1 rounded-[var(--radius-md)] border border-border bg-card p-1">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={`flex-1 rounded-[calc(var(--radius-md)-2px)] px-3 py-2 text-sm font-medium transition ${
              tab === tb.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {tab === "stats" && (
        <div className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat icon={LayoutGrid} label={t("admin.totalOpps")} value={opportunities.length} />
            <Stat icon={GraduationCap} label={t("admin.totalCourses")} value={courses.length} />
            <Stat icon={BookOpen} label={t("admin.totalLessons")} value={courses.reduce((a, c) => a + c.lessons.length, 0)} />
            <Stat icon={Users} label={t("admin.totalUsers")} value={users.length} />
          </div>

          <h2 className="mt-8 text-lg font-semibold">{t("admin.users")}</h2>
          <Card className="mt-3 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="p-3">{t("auth.name")}</th>
                  <th className="p-3">{t("auth.email")}</th>
                  <th className="p-3">{t("common.grade")}</th>
                  <th className="p-3">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-border">
                    <td className="p-3 font-medium">{u.name}</td>
                    <td className="p-3 text-muted-foreground">{u.email}</td>
                    <td className="p-3">{u.grade ?? "—"}</td>
                    <td className="p-3">
                      <Badge tone={u.role === "admin" ? "primary" : "muted"}>{u.role}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {tab === "opps" && <OppsManager opportunities={opportunities} />}
      {tab === "courses" && <CoursesManager courses={courses} />}
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

/* ---------------- Opportunities manager ---------------- */
function OppsManager({ opportunities }: { opportunities: Opportunity[] }) {
  const t = useT();
  const save = useStore((s) => s.saveOpportunity);
  const del = useStore((s) => s.deleteOpportunity);
  const [editing, setEditing] = useState<Opportunity | null>(null);
  const [open, setOpen] = useState(false);

  function blank(): Opportunity {
    return {
      id: "",
      title: "",
      organizer: "Mentoria",
      category: "Competition",
      direction: "STEM",
      format: "Online",
      deadline: new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10),
      description: "",
      requirements: "",
      applyUrl: "https://example.org/apply",
      gradeMin: 9,
      gradeMax: 12,
      tags: [],
    };
  }

  return (
    <div className="mt-6">
      <div className="flex justify-end">
        <Button onClick={() => { setEditing(blank()); setOpen(true); }}>
          <Plus className="h-4 w-4" /> {t("admin.newOpp")}
        </Button>
      </div>
      <div className="mt-4 grid gap-3">
        {opportunities.map((o) => (
          <Card key={o.id} className="flex items-center gap-3 p-4">
            <div className="flex-1">
              <p className="font-medium">{o.title}</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                <Badge tone="primary">{o.direction}</Badge>
                <Badge tone="muted">{o.category}</Badge>
                <Badge tone="muted">{o.deadline}</Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => { setEditing(o); setOpen(true); }} aria-label="Edit">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => { del(o.id); toast.success(t("toast.adminDeleted")); }} aria-label="Delete">
              <Trash2 className="h-4 w-4 text-danger" />
            </Button>
          </Card>
        ))}
      </div>

      <Dialog open={open} onClose={() => setOpen(false)}>
        {editing && (
          <OppForm
            initial={editing}
            onCancel={() => setOpen(false)}
            onSave={(o) => { save(o); setOpen(false); toast.success(t("toast.adminSaved")); }}
          />
        )}
      </Dialog>
    </div>
  );
}

function OppForm({ initial, onSave, onCancel }: { initial: Opportunity; onSave: (o: Opportunity) => void; onCancel: () => void }) {
  const t = useT();
  const [f, setF] = useState<Opportunity>(initial);
  const [tags, setTags] = useState(initial.tags.join(", "));
  const set = (patch: Partial<Opportunity>) => setF((p) => ({ ...p, ...patch }));

  return (
    <div>
      <h3 className="text-lg font-semibold">{initial.id ? t("admin.editOpp") : t("admin.newOpp")}</h3>
      <div className="mt-4 space-y-3">
        <div>
          <Label>{t("admin.title_")}</Label>
          <Input value={f.title} onChange={(e) => set({ title: e.target.value })} />
        </div>
        <ImagePicker value={f.image} onChange={(image) => set({ image })} label={t("admin.coverPhoto")} />
        <div>
          <Label>{t("opps.organizer")}</Label>
          <Input value={f.organizer} onChange={(e) => set({ organizer: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>{t("common.direction")}</Label>
            <Select value={f.direction} onChange={(e) => set({ direction: e.target.value as Direction })}>
              {DIRECTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
            </Select>
          </div>
          <div>
            <Label>{t("common.category")}</Label>
            <Select value={f.category} onChange={(e) => set({ category: e.target.value as OppCategory })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
          <div>
            <Label>{t("common.format")}</Label>
            <Select value={f.format} onChange={(e) => set({ format: e.target.value as OppFormat })}>
              {FORMATS.map((x) => <option key={x} value={x}>{x}</option>)}
            </Select>
          </div>
          <div>
            <Label>{t("common.deadline")}</Label>
            <Input type="date" value={f.deadline} onChange={(e) => set({ deadline: e.target.value })} />
          </div>
          <div>
            <Label>{t("common.grade")} min</Label>
            <Input type="number" min={8} max={12} value={f.gradeMin} onChange={(e) => set({ gradeMin: Number(e.target.value) })} />
          </div>
          <div>
            <Label>{t("common.grade")} max</Label>
            <Input type="number" min={8} max={12} value={f.gradeMax} onChange={(e) => set({ gradeMax: Number(e.target.value) })} />
          </div>
        </div>
        <div>
          <Label>Description</Label>
          <Textarea value={f.description} onChange={(e) => set({ description: e.target.value })} />
        </div>
        <div>
          <Label>{t("opps.requirements")}</Label>
          <Input value={f.requirements} onChange={(e) => set({ requirements: e.target.value })} />
        </div>
        <div>
          <Label>Apply URL</Label>
          <Input value={f.applyUrl} onChange={(e) => set({ applyUrl: e.target.value })} />
        </div>
        <div>
          <Label>Tags (comma separated)</Label>
          <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="math, olympiad, stem" />
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>{t("common.cancel")}</Button>
        <Button
          onClick={() =>
            onSave({
              ...f,
              id: f.id || uid("opp"),
              tags: tags.split(",").map((s) => s.trim()).filter(Boolean),
            })
          }
          disabled={!f.title.trim()}
        >
          {t("admin.savedField")}
        </Button>
      </div>
    </div>
  );
}

/* ---------------- Courses manager ---------------- */
function CoursesManager({ courses }: { courses: Course[] }) {
  const t = useT();
  const save = useStore((s) => s.saveCourse);
  const del = useStore((s) => s.deleteCourse);
  const [editing, setEditing] = useState<Course | null>(null);
  const [open, setOpen] = useState(false);

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
    };
  }

  return (
    <div className="mt-6">
      <div className="flex justify-end">
        <Button onClick={() => { setEditing(blank()); setOpen(true); }}>
          <Plus className="h-4 w-4" /> {t("admin.newCourse")}
        </Button>
      </div>
      <div className="mt-4 grid gap-3">
        {courses.map((c) => (
          <Card key={c.id} className="flex items-center gap-3 p-4">
            <span className="text-2xl">{c.emoji}</span>
            <div className="flex-1">
              <p className="font-medium">{c.title}</p>
              <p className="text-xs text-muted-foreground">{c.lessons.length} {t("common.lessons")} · {c.subject}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => { setEditing(c); setOpen(true); }} aria-label="Edit">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => { del(c.id); toast.success(t("toast.adminDeleted")); }} aria-label="Delete">
              <Trash2 className="h-4 w-4 text-danger" />
            </Button>
          </Card>
        ))}
      </div>

      <Dialog open={open} onClose={() => setOpen(false)}>
        {editing && (
          <CourseForm initial={editing} onCancel={() => setOpen(false)} onSave={(c) => { save(c); setOpen(false); toast.success(t("toast.adminSaved")); }} />
        )}
      </Dialog>
    </div>
  );
}

export function CourseForm({ initial, onSave, onCancel }: { initial: Course; onSave: (c: Course) => void; onCancel: () => void }) {
  const t = useT();
  const [f, setF] = useState<Course>(initial);
  const [tags, setTags] = useState(initial.tags.join(", "));
  const [lessons, setLessons] = useState<Lesson[]>(initial.lessons);
  const set = (patch: Partial<Course>) => setF((p) => ({ ...p, ...patch }));

  function build(): Course {
    const cleaned = lessons
      .filter((l) => l.title.trim())
      .map((l, i) => ({
        ...l,
        title: l.title.trim() || `Lesson ${i + 1}`,
        content: l.content.trim() || "Lesson content coming soon.",
      }));
    return {
      ...f,
      id: f.id || uid("course"),
      tags: tags.split(",").map((s) => s.trim()).filter(Boolean),
      lessons: cleaned,
    };
  }

  return (
    <div>
      <h3 className="text-lg font-semibold">{initial.id ? t("admin.editCourse") : t("admin.newCourse")}</h3>
      <div className="mt-4 space-y-3">
        <div className="grid grid-cols-[4rem_1fr] gap-3">
          <div>
            <Label>Emoji</Label>
            <Input value={f.emoji} onChange={(e) => set({ emoji: e.target.value })} maxLength={2} />
          </div>
          <div>
            <Label>{t("admin.title_")}</Label>
            <Input value={f.title} onChange={(e) => set({ title: e.target.value })} />
          </div>
        </div>
        <ImagePicker value={f.image} onChange={(image) => set({ image })} label={t("admin.coverPhoto")} />
        <div>
          <Label>Description</Label>
          <Textarea value={f.description} onChange={(e) => set({ description: e.target.value })} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>{t("common.level")}</Label>
            <Select value={f.level} onChange={(e) => set({ level: e.target.value as CourseLevel })}>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </Select>
          </div>
          <div>
            <Label>Subject</Label>
            <Input value={f.subject} onChange={(e) => set({ subject: e.target.value })} />
          </div>
          <div>
            <Label>{t("common.direction")}</Label>
            <Select value={f.direction} onChange={(e) => set({ direction: e.target.value as Direction })}>
              {DIRECTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
            </Select>
          </div>
        </div>
        <div>
          <Label>Tags (comma separated)</Label>
          <Input value={tags} onChange={(e) => setTags(e.target.value)} />
        </div>
        <LessonEditor lessons={lessons} onChange={setLessons} />
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>{t("common.cancel")}</Button>
        <Button onClick={() => onSave(build())} disabled={!f.title.trim()}>{t("admin.savedField")}</Button>
      </div>
    </div>
  );
}
