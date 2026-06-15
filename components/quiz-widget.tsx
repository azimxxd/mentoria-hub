"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import type { QuizQuestion } from "@/lib/types";
import { useT } from "@/lib/i18n";
import { Button, Card } from "./ui";
import { cn } from "@/lib/utils";

export function QuizWidget({
  questions,
  onScored,
}: {
  questions: QuizQuestion[];
  onScored: (pct: number) => void;
}) {
  const t = useT();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [current, setCurrent] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  if (questions.length === 0) return null;

  const correct = questions.filter((q) => answers[q.id] === q.answer).length;
  const pct = Math.round((correct / questions.length) * 100);
  const allAnswered = questions.every((q) => answers[q.id] != null);
  const q = questions[current];
  const isLast = current === questions.length - 1;
  const isFirst = current === 0;

  function submit() {
    setSubmitted(true);
    onScored(pct);
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t("courses.quiz")}</h3>
        {!submitted && (
          <span className="text-sm text-muted-foreground">
            {t("courses.question")} {current + 1}/{questions.length}
          </span>
        )}
      </div>

      {/* Question progress dots — clickable so you can jump back to any question */}
      {!submitted && questions.length > 1 && (
        <div className="mt-3 flex gap-1.5">
          {questions.map((qq, i) => (
            <button
              key={qq.id}
              onClick={() => setCurrent(i)}
              aria-label={`${t("courses.question")} ${i + 1}`}
              className={cn(
                "h-1.5 flex-1 rounded-full transition",
                i === current
                  ? "bg-primary"
                  : answers[qq.id] != null
                    ? "bg-primary/40"
                    : "bg-muted",
              )}
            />
          ))}
        </div>
      )}

      {submitted ? (
        // Review: show every question with the correct / chosen answers.
        <div className="mt-4 space-y-5">
          {questions.map((qq, qi) => (
            <div key={qq.id}>
              <p className="font-medium">
                {qi + 1}. {qq.question}
              </p>
              <div className="mt-2 grid gap-2">
                {qq.options.map((opt, oi) => {
                  const selected = answers[qq.id] === oi;
                  const isCorrect = oi === qq.answer;
                  const show = selected || isCorrect;
                  return (
                    <div
                      key={oi}
                      className={cn(
                        "flex items-center justify-between rounded-[var(--radius-md)] border px-3 py-2 text-left text-sm",
                        show && isCorrect && "border-success bg-success/10",
                        show && selected && !isCorrect && "border-danger bg-danger/10",
                        !show && "border-border opacity-70",
                      )}
                    >
                      {opt}
                      {show && isCorrect && <Check className="h-4 w-4 text-success" />}
                      {show && selected && !isCorrect && <X className="h-4 w-4 text-danger" />}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <p className="rounded-[var(--radius-md)] bg-muted p-3 text-sm font-medium">
            {t("courses.quizResult")} {correct}/{questions.length} ({pct}%)
          </p>
        </div>
      ) : (
        <>
          <div className="mt-4">
            <p className="font-medium">
              {current + 1}. {q.question}
            </p>
            <div className="mt-3 grid gap-2">
              {q.options.map((opt, oi) => {
                const selected = answers[q.id] === oi;
                return (
                  <button
                    key={oi}
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                    className={cn(
                      "flex items-center justify-between rounded-[var(--radius-md)] border px-3 py-2 text-left text-sm transition",
                      selected ? "border-primary bg-secondary" : "border-border hover:border-primary/50",
                    )}
                  >
                    {opt}
                    {selected && <Check className="h-4 w-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-2">
            <Button variant="outline" onClick={() => setCurrent((c) => c - 1)} disabled={isFirst}>
              <ArrowLeft className="h-4 w-4" /> {t("courses.prevQuestion")}
            </Button>
            {isLast ? (
              <Button onClick={submit} disabled={!allAnswered}>
                {t("courses.submitQuiz")}
              </Button>
            ) : (
              <Button onClick={() => setCurrent((c) => c + 1)} disabled={answers[q.id] == null}>
                {t("courses.nextQuestion")} <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
