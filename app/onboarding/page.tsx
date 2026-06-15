"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Button, Card, Chip, Progress } from "@/components/ui";
import { DIRECTIONS, type Direction } from "@/lib/types";
import { GOAL_OPTIONS, SUBJECT_OPTIONS } from "@/lib/seed-data";

const GRADES = [8, 9, 10, 11, 12];

export default function OnboardingPage() {
  return <AuthGuard>{(user) => <Onboarding initialGrade={user.grade} />}</AuthGuard>;
}

function Onboarding({ initialGrade }: { initialGrade?: number }) {
  const t = useT();
  const router = useRouter();
  const updateProfile = useStore((s) => s.updateProfile);

  const [step, setStep] = useState(0);
  const [grade, setGrade] = useState<number | undefined>(initialGrade ?? 11);
  const [interests, setInterests] = useState<Direction[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);

  const toggle = <T,>(arr: T[], v: T, set: (a: T[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const steps = [t("onb.gradeQ"), t("onb.interestsQ"), t("onb.subjectsQ"), t("onb.goalsQ")];
  const canNext =
    (step === 0 && grade != null) ||
    (step === 1 && interests.length > 0) ||
    (step === 2 && subjects.length > 0) ||
    step === 3;

  async function finish() {
    await updateProfile({ grade, interests, subjects, goals, onboarded: true });
    router.push("/dashboard");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-sm font-medium text-muted-foreground">
        {t("onb.step")} {step + 1} {t("onb.of")} {steps.length}
      </p>
      <h1 className="mt-1 text-2xl font-bold">{t("onb.title")}</h1>
      <Progress value={((step + 1) / steps.length) * 100} className="mt-4" />

      <Card className="mt-6 p-6">
        <h2 className="text-lg font-semibold">{steps[step]}</h2>
        {step > 0 && <p className="mt-1 text-sm text-muted-foreground">{t("onb.pickMany")}</p>}

        <div className="mt-5 flex flex-wrap gap-2">
          {step === 0 &&
            GRADES.map((g) => (
              <Chip key={g} active={grade === g} onClick={() => setGrade(g)}>
                {t("common.grade")} {g}
              </Chip>
            ))}
          {step === 1 &&
            DIRECTIONS.map((d) => (
              <Chip key={d} active={interests.includes(d)} onClick={() => toggle(interests, d, setInterests)}>
                {d}
              </Chip>
            ))}
          {step === 2 &&
            SUBJECT_OPTIONS.map((s) => (
              <Chip key={s} active={subjects.includes(s)} onClick={() => toggle(subjects, s, setSubjects)}>
                {s}
              </Chip>
            ))}
          {step === 3 &&
            GOAL_OPTIONS.map((g) => (
              <Chip key={g} active={goals.includes(g)} onClick={() => toggle(goals, g, setGoals)}>
                {g}
              </Chip>
            ))}
        </div>

        <div className="mt-8 flex justify-between">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            {t("common.back")}
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
              {t("onb.next")} <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={finish}>
              {t("onb.finish")} <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
