"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Button, Card, Input, Label } from "@/components/ui";
import { TelegramLoginButton } from "@/components/telegram-login-button";

export default function SignupPage() {
  const t = useT();
  const router = useRouter();
  const signup = useStore((s) => s.signup);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    // Public signup always creates a student account. Mentor accounts are
    // created by an admin in the admin panel (see /api/admin/create-mentor).
    const res = await signup(email, password, firstName, lastName, nickname);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.push("/onboarding");
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <Card className="p-8">
        <h1 className="text-2xl font-bold">{t("auth.signupTitle")}</h1>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="firstName">{t("auth.firstName")}</Label>
              <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Aru" autoComplete="given-name" required />
            </div>
            <div>
              <Label htmlFor="lastName">{t("auth.lastName")}</Label>
              <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Student" autoComplete="family-name" required />
            </div>
          </div>
          <div>
            <Label htmlFor="nickname">{t("auth.nickname")}</Label>
            <Input id="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="aru_07" autoComplete="nickname" />
            <p className="mt-1 text-xs text-muted-foreground">{t("auth.nicknameHint")}</p>
          </div>
          <div>
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div>
            <Label htmlFor="password">{t("auth.password")}</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" required />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" className="w-full">{t("auth.signupBtn")}</Button>
        </form>

        <TelegramLoginButton />

        <Link href="/login" className="mt-4 block text-center text-sm text-primary hover:underline">
          {t("auth.toLogin")}
        </Link>
      </Card>
    </div>
  );
}
