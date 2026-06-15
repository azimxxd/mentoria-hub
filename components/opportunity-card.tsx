"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bookmark, BookmarkCheck, CalendarClock } from "lucide-react";
import type { Opportunity } from "@/lib/types";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Badge, Button, Card } from "./ui";
import { deadlineLabel, formatDate } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export function OpportunityCard({ opp }: { opp: Opportunity }) {
  const t = useT();
  const { lang } = useI18n();
  const router = useRouter();
  const saved = useStore((s) => (s._hasHydrated ? (s.saved[s.currentUserId ?? ""] ?? []).includes(opp.id) : false));
  const user = useStore((s) => s.currentUserId);
  const toggleSave = useStore((s) => s.toggleSave);

  const dl = deadlineLabel(opp.deadline);
  const dayWord = Math.abs(dl.days) === 1 ? t("common.dayLeft") : t("common.daysLeft");

  function onSave() {
    if (!user) {
      router.push("/login");
      return;
    }
    toggleSave(opp.id);
    toast.success(saved ? t("toast.removed") : t("toast.saved"));
  }

  return (
    <Card className="card-hover flex flex-col p-5">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <Badge tone="primary">{opp.direction}</Badge>
          <Badge tone="muted">{opp.category}</Badge>
        </div>
        <button
          onClick={onSave}
          aria-label="Save"
          className="text-muted-foreground transition hover:text-primary"
        >
          {saved ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5" />}
        </button>
      </div>

      <Link href={`/opportunities/${opp.id}`} className="group">
        <h3 className="text-base font-semibold leading-snug group-hover:text-primary">{opp.title}</h3>
      </Link>
      <p className="mt-1 text-xs text-muted-foreground">{opp.organizer}</p>
      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{opp.description}</p>

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
    </Card>
  );
}
