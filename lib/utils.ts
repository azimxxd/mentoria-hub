import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function daysUntil(iso: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / 86400000);
}

export function formatDate(iso: string, locale = "en"): string {
  const map: Record<string, string> = { en: "en-US", ru: "ru-RU", kk: "kk-KZ" };
  try {
    return new Date(iso).toLocaleDateString(map[locale] ?? "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function deadlineLabel(iso: string): { tone: "danger" | "warning" | "muted"; days: number } {
  const days = daysUntil(iso);
  if (days < 0) return { tone: "muted", days };
  if (days <= 7) return { tone: "danger", days };
  if (days <= 21) return { tone: "warning", days };
  return { tone: "muted", days };
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
