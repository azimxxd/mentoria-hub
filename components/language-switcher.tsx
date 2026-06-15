"use client";

import { Check, Globe } from "lucide-react";
import { LANGS, useI18n } from "@/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAMES: Record<string, string> = { en: "English", ru: "Русский", kk: "Қазақша" };

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Change language"
          className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-card px-2.5 text-xs font-semibold text-foreground transition hover:bg-muted"
        >
          <Globe className="h-4 w-4" />
          {lang.toUpperCase()}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        {LANGS.map((l) => (
          <DropdownMenuItem key={l.code} onClick={() => setLang(l.code)} className="justify-between">
            {NAMES[l.code]}
            {lang === l.code && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
