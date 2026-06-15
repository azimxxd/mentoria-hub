"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Award, CalendarClock, Compass, Sparkles } from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { useStore } from "@/lib/store";
import { useI18n, useT } from "@/lib/i18n";
import { Badge, Button, Card, Progress } from "@/components/ui";
import { OpportunityCard } from "@/components/opportunity-card";
import { CertificateModal } from "@/components/certificate-modal";
import { TelegramConnect } from "@/components/telegram-connect";
import { recommendCourses, recommendOpportunities } from "@/lib/recommend";
import { daysUntil, formatDate } from "@/lib/utils";
import type { Certificate, User } from "@/lib/types";

const EMPTY_CERTS: Certificate[] = [];

export default function DashboardPage() {
  return <AuthGuard>{(user) => <Dashboard user={user} />}</AuthGuard>;
}

function Dashboard({ user }: { user: User }) {
  const t = useT();
  const { lang } = useI18n();
  const opportunities = useStore((s) => s.opportunities);
  const courses = useStore((s) => s.courses);
  const savedMap = useStore((s) => s.saved);
  const enrollMap = useStore((s) => s.enrollments);
  const progressMap = useStore((s) => s.progress);
  const certMap = useStore((s) => s.certificates);
  const courseProgressPct = useStore((s) => s.courseProgressPct);

  const savedOpportunities = useMemo(() => {
    const ids = savedMap[user.id] ?? [];
    return opportunities.filter((o) => ids.includes(o.id));
  }, [savedMap, user.id, opportunities]);

  const enrolledCourses = useMemo(() => {
    const ids = (enrollMap[user.id] ?? []).map((e) => e.courseId);
    return courses.filter((c) => ids.includes(c.id));
  }, [enrollMap, user.id, courses]);

  const certificates = certMap[user.id] ?? EMPTY_CERTS;
  // progressMap subscription keeps progress bars reactive on completion.
  void progressMap;

  const [activeCert, setActiveCert] = useState<Certificate | null>(null);

  const recOpps = recommendOpportunities(user, opportunities, 3);
  const recCourses = recommendCourses(user, courses, 3);

  const deadlines = [...savedOpportunities, ...recOpps.map((r) => r.item)]
    .filter((o, i, arr) => arr.findIndex((x) => x.id === o.id) === i)
    .filter((o) => daysUntil(o.deadline) >= 0)
    .sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline))
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">
            {t("dash.hi")}, {user.name.split(" ")[0]} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">{t("dash.title")}</p>
        </div>
        <Link href="/onboarding">
          <Button variant="outline" size="sm">{t("dash.editProfile")}</Button>
        </Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-8 lg:col-span-2">
          {/* Recommended */}
          <section>
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Sparkles className="h-5 w-5 text-primary" /> {t("common.recommended")}
            </h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {recOpps.map((r) => (
                <OpportunityCard key={r.item.id} opp={r.item} />
              ))}
            </div>
          </section>

          {/* My courses */}
          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t("dash.myCourses")}</h2>
              <Link href="/courses" className="text-sm text-primary hover:underline">{t("dash.browseCourses")}</Link>
            </div>
            {enrolledCourses.length === 0 ? (
              <EmptyState text={t("dash.noCourses")} href="/courses" cta={t("dash.browseCourses")} />
            ) : (
              <div className="mt-3 space-y-3">
                {enrolledCourses.map((c) => {
                  const pct = courseProgressPct(c.id);
                  return (
                    <Link key={c.id} href={`/courses/${c.id}`}>
                      <Card className="card-hover flex items-center gap-4 p-4">
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[var(--radius-md)] bg-secondary text-2xl">
                          {c.emoji}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium">{c.title}</p>
                          <Progress value={pct} className="mt-2" />
                        </div>
                        <span className="text-sm font-semibold">{pct}%</span>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* Recommended courses */}
          {recCourses.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold">{t("courses.title")}</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {recCourses.map((r) => (
                  <Link key={r.item.id} href={`/courses/${r.item.id}`}>
                    <Card className="card-hover h-full p-4">
                      <span className="text-2xl">{r.item.emoji}</span>
                      <p className="mt-2 text-sm font-medium leading-snug">{r.item.title}</p>
                      {r.reasons[0] && <p className="mt-1 text-xs text-primary">{r.reasons[0]}</p>}
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Deadlines */}
          <section>
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <CalendarClock className="h-5 w-5 text-primary" /> {t("dash.deadlines")}
            </h2>
            <Card className="mt-3 divide-y divide-border">
              {deadlines.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">{t("dash.noDeadlines")}</p>
              ) : (
                deadlines.map((o) => {
                  const d = daysUntil(o.deadline);
                  return (
                    <Link key={o.id} href={`/opportunities/${o.id}`} className="flex items-center justify-between gap-2 p-3 hover:bg-muted">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{o.title}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(o.deadline, lang)}</p>
                      </div>
                      <Badge tone={d <= 7 ? "danger" : d <= 21 ? "warning" : "muted"}>
                        {d} {t("common.daysLeft")}
                      </Badge>
                    </Link>
                  );
                })
              )}
            </Card>
          </section>

          {/* Saved */}
          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t("dash.saved")}</h2>
              <Link href="/opportunities" className="text-sm text-primary hover:underline">{t("dash.browseOpps")}</Link>
            </div>
            {savedOpportunities.length === 0 ? (
              <EmptyState text={t("dash.noSaved")} href="/opportunities" cta={t("dash.browseOpps")} />
            ) : (
              <Card className="mt-3 divide-y divide-border">
                {savedOpportunities.map((o) => (
                  <Link key={o.id} href={`/opportunities/${o.id}`} className="block p-3 hover:bg-muted">
                    <p className="truncate text-sm font-medium">{o.title}</p>
                    <p className="text-xs text-muted-foreground">{o.direction} · {o.category}</p>
                  </Link>
                ))}
              </Card>
            )}
          </section>

          {/* Certificates */}
          <section>
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Award className="h-5 w-5 text-primary" /> {t("dash.certs")}
            </h2>
            {certificates.length === 0 ? (
              <p className="mt-3 rounded-[var(--radius-lg)] border border-dashed border-border p-4 text-sm text-muted-foreground">
                {t("dash.noCerts")}
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                {certificates.map((c) => (
                  <button key={c.id} onClick={() => setActiveCert(c)} className="w-full text-left">
                    <Card className="card-hover flex items-center gap-3 p-3">
                      <Award className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{c.courseTitle}</p>
                        <p className="text-xs text-muted-foreground">{c.code}</p>
                      </div>
                    </Card>
                  </button>
                ))}
              </div>
            )}
          </section>

          <TelegramConnect />
        </div>
      </div>

      <CertificateModal cert={activeCert} open={!!activeCert} onClose={() => setActiveCert(null)} />
    </div>
  );
}

function EmptyState({ text, href, cta }: { text: string; href: string; cta: string }) {
  return (
    <Card className="mt-3 flex flex-col items-center gap-3 border-dashed p-6 text-center">
      <Compass className="h-8 w-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{text}</p>
      <Link href={href}>
        <Button variant="outline" size="sm">{cta}</Button>
      </Link>
    </Card>
  );
}
