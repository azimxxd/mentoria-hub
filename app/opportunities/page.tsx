"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Button, Card, Input, Select } from "@/components/ui";
import { OpportunityCard } from "@/components/opportunity-card";
import { CATEGORIES, DIRECTIONS } from "@/lib/types";
import { scoreOpportunities } from "@/lib/recommend";
import { daysUntil } from "@/lib/utils";

const FORMATS = ["Online", "In-person", "Hybrid"];
const GRADES = [8, 9, 10, 11, 12];

export default function OpportunitiesPage() {
  const t = useT();
  const opportunities = useStore((s) => s.opportunities);
  const user = useStore((s) => s.users.find((u) => u.id === s.currentUserId) ?? null);

  const [q, setQ] = useState("");
  const [direction, setDirection] = useState("");
  const [category, setCategory] = useState("");
  const [format, setFormat] = useState("");
  const [grade, setGrade] = useState("");
  const [sort, setSort] = useState(user ? "recommended" : "deadline");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = opportunities.filter((o) => {
      if (direction && o.direction !== direction) return false;
      if (category && o.category !== category) return false;
      if (format && o.format !== format) return false;
      if (grade) {
        const g = Number(grade);
        if (g < o.gradeMin || g > o.gradeMax) return false;
      }
      if (q) {
        const hay = `${o.title} ${o.description} ${o.organizer} ${o.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });

    if (sort === "recommended" && user) {
      const scored = scoreOpportunities(user, list);
      list = scored.map((s) => s.item);
    } else if (sort === "deadline") {
      list = [...list].sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline));
    }
    return list;
  }, [opportunities, direction, category, format, grade, q, sort, user]);

  function reset() {
    setQ("");
    setDirection("");
    setCategory("");
    setFormat("");
    setGrade("");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{t("opps.title")}</h1>
          <p className="mt-1 text-muted-foreground">{t("opps.subtitle")}</p>
        </div>
        <p className="text-sm text-muted-foreground">
          {filtered.length} {t("opps.resultsCount")}
        </p>
      </div>

      {/* Search + sort */}
      <Card className="mt-6 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("opps.searchPlaceholder")}
              className="pl-9"
            />
          </div>
          <Select value={sort} onChange={(e) => setSort(e.target.value)} className="sm:w-48">
            {user && <option value="recommended">⭐ {t("common.recommended")}</option>}
            <option value="deadline">{t("common.deadline")}</option>
            <option value="default">{t("common.all")}</option>
          </Select>
          <Button variant="outline" onClick={() => setShowFilters((v) => !v)} className="sm:w-auto">
            <SlidersHorizontal className="h-4 w-4" /> {t("common.filters")}
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 sm:grid-cols-4">
            <Select value={direction} onChange={(e) => setDirection(e.target.value)}>
              <option value="">{t("common.direction")}: {t("common.all")}</option>
              {DIRECTIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Select>
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">{t("common.category")}: {t("common.all")}</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
            <Select value={format} onChange={(e) => setFormat(e.target.value)}>
              <option value="">{t("common.format")}: {t("common.all")}</option>
              {FORMATS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </Select>
            <Select value={grade} onChange={(e) => setGrade(e.target.value)}>
              <option value="">{t("common.grade")}: {t("common.all")}</option>
              {GRADES.map((g) => (
                <option key={g} value={g}>{t("common.grade")} {g}</option>
              ))}
            </Select>
            <Button variant="ghost" size="sm" onClick={reset} className="col-span-2 sm:col-span-4 sm:w-32">
              {t("common.clear")}
            </Button>
          </div>
        )}
      </Card>

      {filtered.length === 0 ? (
        <p className="mt-16 text-center text-muted-foreground">{t("common.noResults")}</p>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((o) => (
            <OpportunityCard key={o.id} opp={o} />
          ))}
        </div>
      )}
    </div>
  );
}
