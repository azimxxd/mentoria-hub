"use client";

import { useEffect } from "react";
import { Award, Medal, Trophy } from "lucide-react";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Badge, Card } from "@/components/ui";
import { initials } from "@/lib/utils";

export default function LeaderboardPage() {
  const t = useT();
  const loadLeaderboard = useStore((s) => s.loadLeaderboard);
  const rows = useStore((s) => s.leaderboard);
  const currentUserId = useStore((s) => s.currentUserId);
  // re-derive when progress/certs change so the board stays fresh in local mode
  const progress = useStore((s) => s.progress);
  const certificates = useStore((s) => s.certificates);

  useEffect(() => {
    void loadLeaderboard();
  }, [loadLeaderboard, progress, certificates]);

  const top = rows.slice(0, 3);
  const rest = rows.slice(3);
  const medals = ["text-[#FFD700]", "text-[#C0C0C0]", "text-[#CD7F32]"];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="text-center">
        <h1 className="flex items-center justify-center gap-2 text-3xl font-bold">
          <Trophy className="h-7 w-7 text-primary" /> {t("leaderboard.title")}
        </h1>
        <p className="mt-1 text-muted-foreground">{t("leaderboard.subtitle")}</p>
      </div>

      {rows.length === 0 ? (
        <Card className="mt-8 p-10 text-center text-muted-foreground">{t("leaderboard.empty")}</Card>
      ) : (
        <>
          {/* Podium */}
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {top.map((r, i) => (
              <Card
                key={r.userId}
                className={`flex flex-col items-center p-5 text-center ${i === 0 ? "sm:order-2 sm:-translate-y-2 border-primary/40" : i === 1 ? "sm:order-1" : "sm:order-3"} ${r.userId === currentUserId ? "ring-2 ring-primary" : ""}`}
              >
                <Medal className={`h-8 w-8 ${medals[i]}`} />
                <div className="mt-2 grid h-12 w-12 place-items-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
                  {initials(r.name)}
                </div>
                <p className="mt-2 truncate font-semibold">{r.name}</p>
                <p className="text-2xl font-bold text-primary">{r.points}</p>
                <p className="text-xs text-muted-foreground">{t("leaderboard.points")}</p>
              </Card>
            ))}
          </div>

          {/* The rest */}
          {rest.length > 0 && (
            <Card className="mt-6 divide-y divide-border overflow-hidden">
              {rest.map((r, i) => (
                <div
                  key={r.userId}
                  className={`flex items-center gap-3 p-3 ${r.userId === currentUserId ? "bg-secondary/40" : ""}`}
                >
                  <span className="w-6 text-center text-sm font-semibold text-muted-foreground">{i + 4}</span>
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-muted text-xs font-bold">
                    {initials(r.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {r.name}
                      {r.userId === currentUserId && (
                        <Badge tone="primary" className="ml-2">{t("leaderboard.you")}</Badge>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {r.completedLessons} {t("leaderboard.lessons")} · {r.certificates} <Award className="inline h-3 w-3" />
                    </p>
                  </div>
                  <span className="text-sm font-bold text-primary">{r.points}</span>
                </div>
              ))}
            </Card>
          )}

          <p className="mt-4 text-center text-xs text-muted-foreground">{t("leaderboard.formula")}</p>
        </>
      )}
    </div>
  );
}
