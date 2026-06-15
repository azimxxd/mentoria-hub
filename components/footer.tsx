"use client";

import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { useT } from "@/lib/i18n";

export function Footer() {
  const t = useT();
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
            <GraduationCap className="h-4 w-4" />
          </span>
          Mentoria Hub
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          <Link href="/opportunities" className="hover:text-foreground">{t("nav.opportunities")}</Link>
          <Link href="/courses" className="hover:text-foreground">{t("nav.courses")}</Link>
          <Link href="/dashboard" className="hover:text-foreground">{t("nav.dashboard")}</Link>
        </nav>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Mentoria · Hackathon MVP</p>
      </div>
    </footer>
  );
}
