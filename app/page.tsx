"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  LayoutGrid,
  Rocket,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { useT } from "@/lib/i18n";
import { Badge, Button, Card } from "@/components/ui";
import { useStore } from "@/lib/store";
import { SEED_COURSES, SEED_OPPORTUNITIES } from "@/lib/seed-data";

export default function Home() {
  const t = useT();
  const oppCount = useStore((s) => (s._hasHydrated ? s.opportunities.length : SEED_OPPORTUNITIES.length));
  const courseCount = useStore((s) => (s._hasHydrated ? s.courses.length : SEED_COURSES.length));

  const features = [
    { icon: LayoutGrid, title: t("home.p1Title"), body: t("home.p1Body") },
    { icon: Rocket, title: t("home.p2Title"), body: t("home.p2Body") },
    { icon: Target, title: t("home.p3Title"), body: t("home.p3Body") },
    { icon: Trophy, title: t("home.p4Title"), body: t("home.p4Body") },
  ];
  const steps = [
    { n: 1, title: t("home.s1"), body: t("home.s1b") },
    { n: 2, title: t("home.s2"), body: t("home.s2b") },
    { n: 3, title: t("home.s3"), body: t("home.s3b") },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero">
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-16 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center animate-fade-up">
            <Badge tone="primary" className="mb-5">
              <Sparkles className="h-3.5 w-3.5" /> {t("hero.badge")}
            </Badge>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
              {t("hero.title")}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">{t("hero.subtitle")}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/opportunities">
                <Button size="lg">
                  {t("hero.ctaFind")} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/courses">
                <Button size="lg" variant="outline">
                  {t("hero.ctaLearn")}
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="secondary">
                  {t("hero.ctaJoin")}
                </Button>
              </Link>
            </div>

            <div className="mx-auto mt-12 grid max-w-lg grid-cols-3 gap-4">
              {[
                { v: `${oppCount}+`, l: t("hero.statOpps") },
                { v: `${courseCount}`, l: t("hero.statCourses") },
                { v: "3", l: t("hero.statLangs") },
              ].map((s) => (
                <Card key={s.l} className="px-3 py-4">
                  <p className="text-2xl font-bold gradient-text">{s.v}</p>
                  <p className="text-xs text-muted-foreground">{s.l}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold">{t("home.problemTitle")}</h2>
          <p className="mt-2 text-muted-foreground">{t("home.problemSubtitle")}</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card key={f.title} className="card-hover p-6">
              <span className="grid h-11 w-11 place-items-center rounded-[var(--radius-md)] bg-secondary text-secondary-foreground">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="text-center text-3xl font-bold">{t("home.howTitle")}</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="relative rounded-[var(--radius-lg)] border border-border bg-card p-6">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  {s.n}
                </span>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <Card className="overflow-hidden p-10 text-center gradient-hero">
          <CalendarCheck className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-4 text-3xl font-bold">{t("home.ctaTitle")}</h2>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">{t("home.ctaBody")}</p>
          <Link href="/signup" className="mt-6 inline-block">
            <Button size="lg">
              {t("hero.ctaJoin")} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </Card>
      </section>
    </div>
  );
}
