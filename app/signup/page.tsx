"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Button, Card, Input, Label } from "@/components/ui";

export default function SignupPage() {
  const t = useT();
  const router = useRouter();
  const signup = useStore((s) => s.signup);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = signup(email, password, name);
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
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="name">{t("auth.name")}</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Aru Student" required />
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
        <Link href="/login" className="mt-4 block text-center text-sm text-primary hover:underline">
          {t("auth.toLogin")}
        </Link>
      </Card>
    </div>
  );
}
