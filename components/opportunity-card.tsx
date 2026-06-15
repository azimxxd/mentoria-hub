"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bookmark, BookmarkCheck, CalendarClock } from "lucide-react";
import type { Opportunity } from "@/lib/types";
import { useStore } from "@/lib/store";
import { useI18n, useT } from "@/lib/i18n";
import { Badge, Button, Card } from "./ui";
import { CoverImage } from "./cover-image";
import { deadlineLabel, formatDate } from "@/lib/utils";

const DIRECTION_EMOJI: Record<string, string> = {
  Business: "💼",
  STEM: "🔬",
  "Social Impact": "🌍",
  Finance: "💹",
  Coding: "💻",
  Science: "🧬",
};

export function OpportunityCard({ opp }: { opp: Opportunity }) {
  const t = useT();
  const { lang } = useI18n();
  const router = useRouter();
  const saved = useStore((s) => (s._hasHydrated ? (s.saved[s.currentUserId ?? ""] ?? []).includes(opp.id) : false));
  const user = useStore((s) => s.currentUserId);
  const toggleSave = useStore((s) => s.toggleSave);

  const dl = deadlineLabel(opp.deadline);
  const dayWord = Math.abs(dl.days) === 1 ? t("common.dayLeft") : t("common.daysLeft");

  function onSave(e: React.MouseEvent) {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }
    toggleSave(opp.id);
    toast.success(saved ? t("toast.removed") : t("toast.saved"));
  }

  return (
    <Card className="card-hover flex flex-col overflow-hidden p-0">
      <Link href={`/opportunities/${opp.id}`} className="relative block">
        <CoverImage id={opp.id} alt={opp.title} emoji={DIRECTION_EMOJI[opp.direction] ?? "✨"} src={opp.image} className="aspect-[16/9] w-full" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <Badge tone="primary" className="backdrop-blur">{opp.direction}</Badge>
          <Badge tone="muted" className="backdrop-blur">{opp.category}</Badge>
        </div>
        <button
          onClick={onSave}
          aria-label={saved ? t("common.saved") : t("common.save")}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-card/85 text-foreground backdrop-blur transition hover:bg-card"
        >
          {saved ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5" />}
        </button>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link href={`/opportunities/${opp.id}`} className="group">
          <h3 className="text-base font-semibold leading-snug group-hover:text-primary">{opp.title}</h3>
        </Link>
        <p className="mt-1 text-xs text-muted-foreground">{opp.organizer}</p>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">{opp.description}</p>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <Badge tone="info">{opp.format}</Badge>
          <Badge tone="muted">{t("common.grade")} {opp.gradeMin}–{opp.gradeMax}</Badge>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium ${
              dl.tone === "danger" ? "text-danger" : dl.tone === "warning" ? "text-warning" : "text-muted-foreground"
            }`}
          >
            <CalendarClock className="h-3.5 w-3.5" />
            {dl.days < 0 ? t("common.closed") : `${dl.days} ${dayWord}`}
            <span className="text-muted-foreground">· {formatDate(opp.deadline, lang)}</span>
          </span>
          <Link href={`/opportunities/${opp.id}`}>
            <Button size="sm" variant="outline">{t("common.apply")}</Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
