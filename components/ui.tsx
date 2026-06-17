"use client";

import React from "react";
import { cn } from "@/lib/utils";

/* ---------------- Button ---------------- */
type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "btn-liquid text-white font-bold uppercase tracking-wide [background:linear-gradient(120deg,var(--brand-chrome),var(--violet)_45%,var(--brand-lavender))]",
  secondary:
    "border border-primary/30 bg-secondary/60 text-secondary-foreground hover:bg-secondary hover:border-primary/50",
  outline: "border border-primary/30 bg-card text-foreground hover:bg-muted hover:border-primary/50",
  ghost: "text-foreground hover:bg-muted",
  danger: "bg-danger text-white hover:brightness-105",
};
const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-semibold transition-all duration-200 active:scale-[.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    />
  );
}

/* ---------------- Card ---------------- */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-xl)] border border-primary/10 bg-card/60 text-card-foreground shadow-sm shadow-primary/[0.05] backdrop-blur-md",
        className,
      )}
      {...props}
    />
  );
}

/* ---------------- Badge ---------------- */
type BadgeTone = "default" | "primary" | "info" | "success" | "warning" | "danger" | "violet" | "muted";
const badgeTones: Record<BadgeTone, string> = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-secondary text-secondary-foreground",
  info: "bg-info/12 text-info",
  success: "bg-success/12 text-success",
  warning: "bg-warning/12 text-warning",
  danger: "bg-danger/12 text-danger",
  violet: "bg-violet/12 text-violet",
  muted: "bg-muted text-muted-foreground",
};
export function Badge({
  tone = "default",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        badgeTones[tone],
        className,
      )}
      {...props}
    />
  );
}

/* ---------------- Inputs ---------------- */
export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-[var(--radius-lg)] border border-input bg-card/60 px-3 text-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-[var(--radius-lg)] border border-input bg-card/60 px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent",
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-[var(--radius-lg)] border border-input bg-card/60 px-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1.5 block text-sm font-medium", className)} {...props} />;
}

/* ---------------- Progress ---------------- */
export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className="h-full rounded-full transition-all duration-500 [background:linear-gradient(90deg,var(--primary),var(--violet))]"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

/* ---------------- Chip (toggle) ---------------- */
export function Chip({
  active,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/25"
          : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-muted",
        className,
      )}
      {...props}
    />
  );
}

/* ---------------- Dialog ---------------- */
export function Dialog({
  open,
  onClose,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={cn(
          "max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[var(--radius-xl)] border border-border bg-card p-6 shadow-2xl animate-fade-up",
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

/* ---------------- Skeleton ---------------- */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}
