"use client";

import Link from "next/link";
import type { Role, User } from "@/lib/types";
import { useHydrated, useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Button, Skeleton } from "./ui";

export function AuthGuard({
  children,
  requireAdmin = false,
  roles,
}: {
  children: (user: User) => React.ReactNode;
  requireAdmin?: boolean;
  /** When set, the user's role must be one of these (admins always allowed). */
  roles?: Role[];
}) {
  const t = useT();
  const hydrated = useHydrated();
  const user = useStore((s) => s.users.find((u) => u.id === s.currentUserId) ?? null);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <Skeleton className="h-8 w-56" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <p className="text-lg font-semibold">{t("guard.signin")}</p>
        <Link href="/login" className="mt-4">
          <Button>{t("guard.goLogin")}</Button>
        </Link>
      </div>
    );
  }

  const roleDenied = requireAdmin
    ? user.role !== "admin"
    : roles
      ? !(roles.includes(user.role) || user.role === "admin")
      : false;

  if (roleDenied) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <p className="text-lg font-semibold">{t("admin.onlyAdmins")}</p>
        <Link href="/dashboard" className="mt-4">
          <Button variant="outline">{t("nav.dashboard")}</Button>
        </Link>
      </div>
    );
  }

  return <>{children(user)}</>;
}
