"use client";

import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { I18nProvider } from "@/lib/i18n";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { useStore } from "@/lib/store";

export function Providers({ children }: { children: React.ReactNode }) {
  // Boot the data layer once on the client: loads catalog + session from
  // Supabase when configured, otherwise falls back to local seed data.
  useEffect(() => {
    void useStore.getState().init();
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      <I18nProvider>
        <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
        <Toaster position="top-center" richColors />
      </I18nProvider>
    </ThemeProvider>
  );
}
