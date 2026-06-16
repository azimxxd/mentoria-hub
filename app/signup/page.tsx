"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Users } from "lucide-react";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Button, Card, Input, Label } from "@/components/ui";
import { TelegramLoginButton } from "@/components/telegram-login-button";
import type { Role } from "@/lib/types";

export default function SignupPage() {
  const t = useT();
  const router = useRouter();
  const signup = useStore((s) => s.signup);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await signup(email, password, firstName, lastName, nickname, role);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    // Mentors go straight to their portal; students onboard first.
    router.push(role === "mentor" ? "/mentor" : "/onboarding");
  }

  const roleCard = (value: Role, icon: React.ElementType, title: string, desc: string) => {
    const Icon = icon;
    const active = role === value;
    return (
      <button
        type="button"
        onClick={() => setRole(value)}
        className={`flex-1 rounded-[var(--radius-md)] border p-3 text-left transition ${
          active ? "border-primary bg-secondary/50 ring-1 ring-primary" : "border-border hover:border-primary/40"
        }`}
      >
        <Icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
        <p className="mt-2 text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </button>
    );
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <Card className="p-8">
        <h1 className="text-2xl font-bold">{t("auth.signupTitle")}</h1>

        <div className="mt-5">
          <Label>{t("auth.roleLabel")}</Label>
          <div className="flex gap-2">
            {roleCard("student", GraduationCap, t("auth.roleStudent"), t("auth.roleStudentDesc"))}
            {roleCard("mentor", Users, t("auth.roleMentor"), t("auth.roleMentorDesc"))}
          </div>
        </div>

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
