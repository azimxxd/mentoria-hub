"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Button } from "./ui";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * "Log in with Telegram" — opens the bot via a deep link, then polls the
 * server route until the bot confirms the Telegram identity, and signs the
 * user into Supabase with the issued credentials. Needs the Supabase backend
 * and a running bot (`npm run bot`).
 */
export function TelegramLoginButton() {
  const t = useT();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const cancelled = useRef(false);

  useEffect(() => () => { cancelled.current = true; }, []);

  const routeAfterLogin = useCallback(async () => {
    // Wait for the store's auth listener to load the profile, then route.
    const start = Date.now();
    while (Date.now() - start < 5000) {
      const u = useStore.getState().currentUser();
      if (u) {
        router.push(!u.onboarded ? "/onboarding" : u.role === "admin" ? "/admin" : "/dashboard");
        return;
      }
      await sleep(150);
    }
    router.push("/dashboard");
  }, [router]);

  async function start() {
    setError("");
    setBusy(true);
    cancelled.current = false;
    try {
      const res = await fetch("/api/auth/telegram/start", { method: "POST" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Telegram login unavailable.");
      }
      const { token, url } = await res.json();
      window.open(url, "_blank", "noopener");

      // Poll for completion (~2.5 min).
      for (let i = 0; i < 75 && !cancelled.current; i++) {
        await sleep(2000);
        const r = await fetch("/api/auth/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await r.json();
        if (data.status === "ok") {
          const sb = getSupabase();
          if (!sb) throw new Error("Supabase not configured.");
          const { error: signErr } = await sb.auth.signInWithPassword({
            email: data.email,
            password: data.password,
          });
          if (signErr) throw new Error(signErr.message);
          await routeAfterLogin();
          return;
        }
        if (data.status === "expired") throw new Error(t("tgLogin.expired"));
      }
      if (!cancelled.current) setError(t("tgLogin.timeout"));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  // Always render the button so it's visible everywhere. If the backend isn't
  // configured, the click surfaces a clear error instead of hiding silently.
  return (
    <div className="mt-4">
      <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> {t("tgLogin.or")} <span className="h-px flex-1 bg-border" />
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full border-[#229ED9]/40 text-[#229ED9] hover:bg-[#229ED9]/10"
        onClick={start}
        disabled={busy}
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {busy ? t("tgLogin.waiting") : t("tgLogin.button")}
      </Button>
      {busy && <p className="mt-2 text-center text-xs text-muted-foreground">{t("tgLogin.hint")}</p>}
      {error && <p className="mt-2 text-center text-sm text-danger">{error}</p>}
    </div>
  );
}
