"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { GraduationCap, Menu, X } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useHydrated, useStore } from "@/lib/store";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";
import { Button } from "./ui";
import { cn, initials } from "@/lib/utils";

export function Navbar() {
  const t = useT();
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useHydrated();
  const user = useStore((s) => (s._hasHydrated ? s.users.find((u) => u.id === s.currentUserId) ?? null : null));
  const logout = useStore((s) => s.logout);
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/opportunities", label: t("nav.opportunities") },
    { href: "/courses", label: t("nav.courses") },
    ...(user ? [{ href: "/dashboard", label: t("nav.dashboard") }] : []),
    ...(user ? [{ href: "/roadmap", label: t("nav.roadmap") }] : []),
    ...(user?.role === "admin" ? [{ href: "/admin", label: t("nav.admin") }] : []),
  ];

  const NavLink = ({ href, label }: { href: string; label: string }) => (
    <Link
      href={href}
      onClick={() => setOpen(false)}
      className={cn(
        "rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition",
        pathname === href ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted",
      )}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-[var(--radius-md)] bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="text-lg">Mentoria<span className="gradient-text"> Hub</span></span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.href} {...l} />
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher />
          <ThemeToggle />
          {hydrated && user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground"
                title={user.name}
              >
                {initials(user.name)}
              </Link>
              <Button variant="ghost" size="sm" onClick={() => { logout(); router.push("/"); }}>
                {t("nav.logout")}
              </Button>
            </div>
          ) : hydrated ? (
            <div className="flex items-center gap-2">
              <Link href="/login"><Button variant="ghost" size="sm">{t("nav.login")}</Button></Link>
              <Link href="/signup"><Button size="sm">{t("nav.signup")}</Button></Link>
            </div>
          ) : (
            <div className="h-9 w-24" />
          )}
        </div>

        <button
          className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border border-border md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <NavLink key={l.href} {...l} />
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          <div className="mt-3 flex gap-2">
            {hydrated && user ? (
              <Button variant="outline" size="sm" className="flex-1" onClick={() => { logout(); router.push("/"); setOpen(false); }}>
                {t("nav.logout")}
              </Button>
            ) : (
              <>
                <Link href="/login" className="flex-1" onClick={() => setOpen(false)}><Button variant="outline" size="sm" className="w-full">{t("nav.login")}</Button></Link>
                <Link href="/signup" className="flex-1" onClick={() => setOpen(false)}><Button size="sm" className="w-full">{t("nav.signup")}</Button></Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
