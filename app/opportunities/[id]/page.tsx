"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Bookmark, BookmarkCheck, CalendarClock, ExternalLink } from "lucide-react";
import { useStore } from "@/lib/store";
import { useI18n, useT } from "@/lib/i18n";
import { Badge, Button, Card } from "@/components/ui";
import { CoverImage } from "@/components/cover-image";
import { deadlineLabel, formatDate } from "@/lib/utils";

const DIRECTION_EMOJI: Record<string, string> = {
  Business: "💼", STEM: "🔬", "Social Impact": "🌍", Finance: "💹", Coding: "💻", Science: "🧬",
};

export default function OpportunityDetailPage() {
  const t = useT();
  const { lang } = useI18n();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const opp = useStore((s) => s.opportunities.find((o) => o.id === id));
  const user = useStore((s) => s.currentUserId);
  const saved = useStore((s) => (s._hasHydrated ? (s.saved[s.currentUserId ?? ""] ?? []).includes(id) : false));
  const toggleSave = useStore((s) => s.toggleSave);

  if (!opp) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-muted-foreground">{t("common.noResults")}</p>
        <Link href="/opportunities" className="mt-4 inline-block">
          <Button variant="outline">{t("common.back")}</Button>
        </Link>
      </div>
    );
  }

  const dl = deadlineLabel(opp.deadline);

  function onSave() {
    if (!user) return router.push("/login");
    toggleSave(opp!.id);
    toast.success(saved ? t("toast.removed") : t("toast.saved"));
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/opportunities" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {t("opps.title")}
      </Link>

      <div className="relative mt-4 overflow-hidden rounded-[var(--radius-xl)] border border-border">
        <CoverImage
          id={opp.id}
          alt={opp.title}
          emoji={DIRECTION_EMOJI[opp.direction] ?? "✨"}
          className="aspect-[21/9] w-full"
          sizes="(max-width: 768px) 100vw, 768px"
          priority
        />
      </div>

      <Card className="mt-4 p-7">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="primary">{opp.direction}</Badge>
          <Badge tone="muted">{opp.category}</Badge>
          <Badge tone="info">{opp.format}</Badge>
          <Badge tone="muted">{t("common.grade")} {opp.gradeMin}–{opp.gradeMax}</Badge>
        </div>

        <h1 className="mt-4 text-3xl font-bold">{opp.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("opps.organizer")}: {opp.organizer}
        </p>

        <div
          className={`mt-4 inline-flex items-center gap-1.5 rounded-[var(--radius-md)] px-3 py-1.5 text-sm font-medium ${
            dl.tone === "danger" ? "bg-danger/10 text-danger" : dl.tone === "warning" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
          }`}
        >
          <CalendarClock className="h-4 w-4" />
          {dl.days < 0 ? t("common.closed") : `${dl.days} ${t("common.daysLeft")}`} · {formatDate(opp.deadline, lang)}
        </div>

        <p className="mt-6 leading-relaxed">{opp.description}</p>

        <h2 className="mt-6 font-semibold">{t("opps.requirements")}</h2>
        <p className="mt-1 text-muted-foreground">{opp.requirements}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {opp.tags.map((tg) => (
            <Badge key={tg} tone="muted">#{tg}</Badge>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3 border-t border-border pt-6">
          <a href={opp.applyUrl} target="_blank" rel="noopener noreferrer">
            <Button>
              {t("common.applyNow")} <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
          <Button variant="outline" onClick={onSave}>
            {saved ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
            {saved ? t("common.saved") : t("common.save")}
          </Button>
        </div>
      </Card>
    </div>
  );
}
