"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, RefreshCw, Send } from "lucide-react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Button, Card } from "./ui";

// Public bot username for the deep link (set NEXT_PUBLIC_TELEGRAM_BOT to override).
const BOT = process.env.NEXT_PUBLIC_TELEGRAM_BOT || "MentoriaHub_bot";

export function TelegramConnect() {
  const t = useT();
  const userId = useStore((s) => s.currentUserId);
  const mode = useStore((s) => s.syncMode);
  const [linked, setLinked] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const sb = getSupabase();
    if (!sb || !userId) return;
    const { data } = await sb.from("telegram_links").select("linked").eq("user_id", userId).maybeSingle();
    setLinked(Boolean(data?.linked));
  }, [userId]);

  useEffect(() => {
    void (async () => {
      await refresh();
    })();
  }, [refresh]);

  // Linking happens inside Telegram, so re-check when the user returns to the tab.
  useEffect(() => {
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  // Only meaningful with the Supabase backend (the link lives in the DB).
  if (!isSupabaseConfigured || mode !== "supabase" || !userId) return null;

  async function connect() {
    const sb = getSupabase();
    if (!sb || !userId) return;
    setBusy(true);
    const token = crypto.randomUUID();
    await sb.from("telegram_links").upsert({ user_id: userId, link_token: token, linked: false, chat_id: null });
    setBusy(false);
    window.open(`https://t.me/${BOT}?start=${token}`, "_blank", "noopener");
  }

  async function disconnect() {
    const sb = getSupabase();
    if (!sb || !userId) return;
    setBusy(true);
    await sb.from("telegram_links").delete().eq("user_id", userId);
    setBusy(false);
    setLinked(false);
  }

  return (
    <section>
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <Send className="h-5 w-5 text-primary" /> {t("tg.title")}
      </h2>
      <Card className="mt-3 p-4">
        {linked ? (
          <>
            <p className="flex items-center gap-2 text-sm font-medium text-success">
              <Check className="h-4 w-4" /> {t("tg.connected")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{t("tg.connectedHint")}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={disconnect} disabled={busy}>
              {t("tg.disconnect")}
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">{t("tg.hint")}</p>
            <div className="mt-3 flex items-center gap-2">
              <Button size="sm" onClick={connect} disabled={busy}>
                <Send className="h-4 w-4" /> {t("tg.connect")}
              </Button>
              <Button variant="ghost" size="sm" onClick={refresh} aria-label={t("tg.recheck")}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </Card>
    </section>
  );
}
