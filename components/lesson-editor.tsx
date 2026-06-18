"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Circle, GripVertical, ListChecks, Loader2, Plus, Trash2, Upload, Video, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Button, Card, Input, Label, Textarea } from "./ui";
import type { Lesson, QuizQuestion } from "@/lib/types";
import { uid } from "@/lib/utils";

/** Per-lesson editor: title, content, duration, and a video link OR file upload. */
export function LessonEditor({
  lessons,
  onChange,
}: {
  lessons: Lesson[];
  onChange: (lessons: Lesson[]) => void;
}) {
  const t = useT();

  function update(i: number, patch: Partial<Lesson>) {
    onChange(lessons.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }
  function add() {
    onChange([
      ...lessons,
      { id: uid("l"), title: "", content: "", videoUrl: "", durationMin: 10, quiz: [] },
    ]);
  }
  function remove(i: number) {
    onChange(lessons.filter((_, idx) => idx !== i));
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= lessons.length) return;
    const next = [...lessons];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="mb-0">{t("admin.lessonsField")}</Label>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="h-4 w-4" /> {t("admin.addLesson")}
        </Button>
      </div>

      {lessons.length === 0 && (
        <p className="rounded-[var(--radius-md)] border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
          {t("admin.noLessons")}
        </p>
      )}

      {lessons.map((l, i) => (
        <LessonRow
          key={l.id}
          index={i}
          total={lessons.length}
          lesson={l}
          onUpdate={(patch) => update(i, patch)}
          onRemove={() => remove(i)}
          onMove={(dir) => move(i, dir)}
        />
      ))}
    </div>
  );
}

function LessonRow({
  lesson,
  index,
  total,
  onUpdate,
  onRemove,
  onMove,
}: {
  lesson: Lesson;
  index: number;
  total: number;
  onUpdate: (patch: Partial<Lesson>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const t = useT();
  const uploadVideo = useStore((s) => s.uploadLessonVideo);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast.error(t("admin.notVideo"));
      return;
    }
    setUploading(true);
    const url = await uploadVideo(file);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    if (url) {
      onUpdate({ videoUrl: url });
      toast.success(t("admin.videoUploaded"));
    } else {
      toast.error(t("admin.videoUploadFailed"));
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <div className="flex flex-col text-muted-foreground">
          <button type="button" onClick={() => onMove(-1)} disabled={index === 0} className="disabled:opacity-30" aria-label="Move up">
            <GripVertical className="h-4 w-4" />
          </button>
        </div>
        <span className="text-xs font-semibold text-muted-foreground">#{index + 1}</span>
        <Input
          value={lesson.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder={t("admin.lessonTitle")}
          className="flex-1"
        />
        <div className="w-20">
          <Input
            type="number"
            min={1}
            value={lesson.durationMin}
            onChange={(e) => onUpdate({ durationMin: Number(e.target.value) || 1 })}
            aria-label="Minutes"
          />
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={onRemove} aria-label="Remove lesson">
          <Trash2 className="h-4 w-4 text-danger" />
        </Button>
      </div>

      <Textarea
        value={lesson.content}
        onChange={(e) => onUpdate({ content: e.target.value })}
        placeholder={t("admin.lessonContent")}
        className="mt-3 min-h-20 text-sm"
      />

      <div className="mt-3">
        <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Video className="h-3.5 w-3.5" /> {t("admin.videoLabel")}
        </Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={lesson.videoUrl ?? ""}
            onChange={(e) => onUpdate({ videoUrl: e.target.value })}
            placeholder="https://youtube.com/watch?v=…  or  https://…/video.mp4"
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="shrink-0"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? t("admin.uploading") : t("admin.uploadVideo")}
          </Button>
          <input ref={fileRef} type="file" accept="video/*" hidden onChange={onFile} />
        </div>
        {lesson.videoUrl && (
          <p className="mt-1 truncate text-xs text-success">✓ {lesson.videoUrl}</p>
        )}
      </div>

      <QuizEditor quiz={lesson.quiz ?? []} onChange={(quiz) => onUpdate({ quiz })} />

      {/* keep move-down within reach on long lists */}
      {index < total - 1 && (
        <button type="button" onClick={() => onMove(1)} className="mt-2 text-xs text-muted-foreground hover:text-foreground">
          ↓ {t("admin.moveDown")}
        </button>
      )}
    </Card>
  );
}

/** Builds the multiple-choice quiz for a lesson (question → options → correct answer). */
function QuizEditor({ quiz, onChange }: { quiz: QuizQuestion[]; onChange: (quiz: QuizQuestion[]) => void }) {
  const t = useT();

  const setQuestion = (qi: number, patch: Partial<QuizQuestion>) =>
    onChange(quiz.map((q, i) => (i === qi ? { ...q, ...patch } : q)));

  const addQuestion = () =>
    onChange([...quiz, { id: uid("q"), question: "", options: ["", ""], answer: 0 }]);

  const removeQuestion = (qi: number) => onChange(quiz.filter((_, i) => i !== qi));

  const setOption = (qi: number, oi: number, value: string) =>
    setQuestion(qi, { options: quiz[qi].options.map((o, i) => (i === oi ? value : o)) });

  const addOption = (qi: number) => setQuestion(qi, { options: [...quiz[qi].options, ""] });

  const removeOption = (qi: number, oi: number) => {
    const q = quiz[qi];
    if (q.options.length <= 2) return; // keep at least two choices
    const options = q.options.filter((_, i) => i !== oi);
    let answer = q.answer;
    if (oi === answer) answer = 0;
    else if (oi < answer) answer -= 1;
    setQuestion(qi, { options, answer });
  };

  return (
    <div className="mt-4 rounded-[var(--radius-md)] border border-border p-3">
      <div className="flex items-center justify-between">
        <Label className="mb-0 flex items-center gap-1.5 text-xs text-muted-foreground">
          <ListChecks className="h-3.5 w-3.5" /> {t("admin.quizLabel")}
        </Label>
        <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
          <Plus className="h-4 w-4" /> {t("admin.addQuestion")}
        </Button>
      </div>

      {quiz.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">{t("admin.noQuestions")}</p>
      ) : (
        <div className="mt-3 space-y-4">
          {quiz.map((q, qi) => (
            <div key={q.id} className="rounded-[var(--radius-md)] bg-muted/40 p-3">
              <div className="flex items-start gap-2">
                <span className="mt-2 text-xs font-semibold text-muted-foreground">{qi + 1}.</span>
                <Input
                  value={q.question}
                  onChange={(e) => setQuestion(qi, { question: e.target.value })}
                  placeholder={t("admin.questionPlaceholder")}
                  className="flex-1"
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeQuestion(qi)} aria-label="Remove question">
                  <Trash2 className="h-4 w-4 text-danger" />
                </Button>
              </div>

              <p className="ml-5 mt-2 text-[11px] text-muted-foreground">{t("admin.correctHint")}</p>
              <div className="ml-5 mt-1 space-y-2">
                {q.options.map((opt, oi) => {
                  const correct = q.answer === oi;
                  return (
                    <div key={oi} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQuestion(qi, { answer: oi })}
                        aria-label="Mark correct"
                        className={correct ? "text-success" : "text-muted-foreground hover:text-foreground"}
                      >
                        {correct ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                      </button>
                      <Input
                        value={opt}
                        onChange={(e) => setOption(qi, oi, e.target.value)}
                        placeholder={`${t("admin.optionPlaceholder")} ${oi + 1}`}
                        className="flex-1"
                      />
                      {q.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(qi, oi)}
                          aria-label="Remove option"
                          className="text-muted-foreground hover:text-danger"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
                <Button type="button" variant="ghost" size="sm" onClick={() => addOption(qi)}>
                  <Plus className="h-3.5 w-3.5" /> {t("admin.addOption")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
