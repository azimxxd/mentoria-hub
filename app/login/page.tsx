"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Button, Card, Input, Label } from "@/components/ui";

export default function LoginPage() {
  const t = useT();
  const router = useRouter();
  const login = useStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = login(email, password);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    const user = useStore.getState().currentUser();
    router.push(user && !user.onboarded ? "/onboarding" : user?.role === "admin" ? "/admin" : "/dashboard");
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <Card className="p-8">
        <h1 className="text-2xl font-bold">{t("auth.loginTitle")}</h1>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div>
            <Label htmlFor="password">{t("auth.password")}</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" className="w-full">{t("auth.loginBtn")}</Button>
        </form>
        <Link href="/signup" className="mt-4 block text-center text-sm text-primary hover:underline">
          {t("auth.toSignup")}
        </Link>
        <p className="mt-4 rounded-[var(--radius-md)] bg-muted p-3 text-center text-xs text-muted-foreground">
          {t("auth.demoHint")}
        </p>
      </Card>
    </div>
  );
}
