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
      {/* Hero — Liquid Glass */}
      <section className="relative overflow-hidden gradient-hero">
        {/* liquid-chrome background wash (full-bleed behind the glass panel) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/generated/hero-liquid.webp"
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-45 blur-xl [mask-image:linear-gradient(to_bottom,#000_60%,transparent)]"
        />
        <div className="pointer-events-none absolute inset-0 grid-bg" aria-hidden />
        <div className="pointer-events-none absolute inset-0 halftone opacity-[0.06]" aria-hidden />

        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-20 sm:pt-28">
          {/* Liquid glass panel keeps text on a readable frosted surface */}
          <div className="relative mx-auto max-w-3xl rounded-[2rem] border border-white/50 bg-card/45 px-6 py-12 text-center shadow-[0_24px_70px_-24px_color-mix(in_srgb,var(--brand-purple)_45%,transparent)] backdrop-blur-2xl animate-fade-up sm:px-10 dark:border-white/10">
            {/* emblem crest floating on the panel edge */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/generated/logo-emblem.webp"
              alt="Mentoria"
              className="absolute -top-11 left-1/2 h-22 w-22 -translate-x-1/2 animate-chrome-glow object-contain"
            />
            {/* corner decorations — anchored to all four panel corners (symmetric) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/generated/butterfly.webp" alt="" aria-hidden className="pointer-events-none absolute -left-8 -top-7 hidden h-20 w-20 -scale-x-100 animate-float drop-shadow-xl md:block" style={{ animationDelay: "0.9s" }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/generated/sparkle-1.webp" alt="" aria-hidden className="pointer-events-none absolute -right-5 -top-6 h-16 w-16 animate-float drop-shadow-lg sm:-right-8" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/generated/butterfly.webp" alt="" aria-hidden className="pointer-events-none absolute -bottom-8 -right-8 hidden h-24 w-24 animate-float drop-shadow-xl md:block" style={{ animationDelay: "1.2s" }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/generated/sparkle-2.webp" alt="" aria-hidden className="pointer-events-none absolute -bottom-7 -left-7 hidden h-16 w-16 animate-float drop-shadow-lg sm:block" style={{ animationDelay: "0.6s" }} />

            <div className="mt-6">
              <Badge tone="primary" className="mb-5">
                <Sparkles className="h-3.5 w-3.5" /> {t("hero.badge")}
              </Badge>
              <h1 className="text-balance text-[clamp(1.5rem,3.6vw,2.5rem)] font-extrabold leading-[1.12] tracking-tight">
                <span className="gradient-text">{t("hero.title")}</span>
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-lg text-foreground/75">{t("hero.subtitle")}</p>
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
            </div>
          </div>

          {/* Stats below the panel */}
          <div className="mx-auto mt-8 grid max-w-lg grid-cols-3 gap-4 animate-fade-up">
            {[
              { v: `${oppCount}+`, l: t("hero.statOpps") },
              { v: `${courseCount}`, l: t("hero.statCourses") },
              { v: "3", l: t("hero.statLangs") },
            ].map((s) => (
              <Card key={s.l} className="px-3 py-4 text-center">
                <p className="text-2xl font-bold gradient-text">{s.v}</p>
                <p className="text-xs text-muted-foreground">{s.l}</p>
              </Card>
            ))}
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
