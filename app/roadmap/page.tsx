"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Button, Card, Input, Progress, Select } from "@/components/ui";
import type { RoadmapTask } from "@/lib/types";

const GRADES: RoadmapTask["grade"][] = [9, 10, 11, 12];
const EMPTY_TASKS: RoadmapTask[] = [];

export default function RoadmapPage() {
  return <AuthGuard>{() => <Roadmap />}</AuthGuard>;
}

function Roadmap() {
  const t = useT();
  const ensureRoadmap = useStore((s) => s.ensureRoadmap);
  const tasks = useStore((s) => s.roadmaps[s.currentUserId ?? ""] ?? EMPTY_TASKS);
  const toggle = useStore((s) => s.toggleRoadmapTask);
  const remove = useStore((s) => s.deleteRoadmapTask);
  const add = useStore((s) => s.addRoadmapTask);

  const [grade, setGrade] = useState<RoadmapTask["grade"]>(9);
  const [text, setText] = useState("");

  useEffect(() => {
    ensureRoadmap();
  }, [ensureRoadmap]);

  const doneCount = tasks.filter((t) => t.done).length;
  const pct = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    add(grade, text);
    setText("");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">{t("roadmap.title")}</h1>
      <p className="mt-1 text-muted-foreground">{t("roadmap.subtitle")}</p>

      <Card className="mt-6 p-5">
        <div className="mb-1 flex justify-between text-sm">
          <span className="text-muted-foreground">{t("roadmap.progress")}</span>
          <span className="font-medium">{pct}%</span>
        </div>
        <Progress value={pct} />
      </Card>

      <form onSubmit={submit} className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Select value={grade} onChange={(e) => setGrade(Number(e.target.value) as RoadmapTask["grade"])} className="sm:w-40">
          {GRADES.map((g) => (
            <option key={g} value={g}>{t("common.grade")} {g}</option>
          ))}
        </Select>
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={t("roadmap.placeholder")} className="flex-1" />
        <Button type="submit">
          <Plus className="h-4 w-4" /> {t("roadmap.addTask")}
        </Button>
      </form>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {GRADES.map((g) => {
          const items = tasks.filter((t) => t.grade === g);
          return (
            <Card key={g} className="p-5">
              <h2 className="font-semibold">
                {t("common.grade")} {g}
              </h2>
              <div className="mt-3 space-y-2">
                {items.length === 0 && <p className="text-sm text-muted-foreground">—</p>}
                {items.map((task) => (
                  <div key={task.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggle(task.id)}
                      className="h-4 w-4 accent-[var(--primary)]"
                    />
                    <span className={`flex-1 text-sm ${task.done ? "text-muted-foreground line-through" : ""}`}>
                      {task.text}
                    </span>
                    <button onClick={() => remove(task.id)} className="text-muted-foreground hover:text-danger" aria-label="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
