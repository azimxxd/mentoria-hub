"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
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
  const [submitted, setSubmitted] = useState(false);

  if (questions.length === 0) return null;

  const correct = questions.filter((q) => answers[q.id] === q.answer).length;
  const pct = Math.round((correct / questions.length) * 100);
  const allAnswered = questions.every((q) => answers[q.id] != null);

  function submit() {
    setSubmitted(true);
    onScored(pct);
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold">{t("courses.quiz")}</h3>
      <div className="mt-4 space-y-5">
        {questions.map((q, qi) => (
          <div key={q.id}>
            <p className="font-medium">
              {qi + 1}. {q.question}
            </p>
            <div className="mt-2 grid gap-2">
              {q.options.map((opt, oi) => {
                const selected = answers[q.id] === oi;
                const isCorrect = oi === q.answer;
                const showState = submitted && (selected || isCorrect);
                return (
                  <button
                    key={oi}
                    disabled={submitted}
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                    className={cn(
                      "flex items-center justify-between rounded-[var(--radius-md)] border px-3 py-2 text-left text-sm transition",
                      !submitted && selected && "border-primary bg-secondary",
                      !submitted && !selected && "border-border hover:border-primary/50",
                      showState && isCorrect && "border-success bg-success/10",
                      showState && selected && !isCorrect && "border-danger bg-danger/10",
                      submitted && !showState && "border-border opacity-70",
                    )}
                  >
                    {opt}
                    {showState && isCorrect && <Check className="h-4 w-4 text-success" />}
                    {showState && selected && !isCorrect && <X className="h-4 w-4 text-danger" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {submitted ? (
        <p className="mt-5 rounded-[var(--radius-md)] bg-muted p-3 text-sm font-medium">
          {t("courses.quizResult")} {correct}/{questions.length} ({pct}%)
        </p>
      ) : (
        <Button className="mt-5" onClick={submit} disabled={!allAnswered}>
          {t("courses.submitQuiz")}
        </Button>
      )}
    </Card>
  );
}
