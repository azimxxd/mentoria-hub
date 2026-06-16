"use client";

import { useEffect, useRef, useState } from "react";
import { PlayCircle } from "lucide-react";

/* ----------------------------- url helpers ----------------------------- */

function youTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  return m ? m[1] : null;
}

function isDirectVideo(url: string): boolean {
  return (
    /\.(mp4|webm|ogv|ogg|mov|m4v)(\?|#|$)/i.test(url) ||
    url.startsWith("blob:") ||
    url.startsWith("data:video") ||
    /\/storage\/v1\/object\/public\/lesson-videos\//.test(url)
  );
}

declare global {
  interface Window {
    YT?: { Player: new (el: HTMLElement, opts: unknown) => unknown };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let ytApiPromise: Promise<void> | null = null;
function loadYouTubeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT && window.YT.Player) return Promise.resolve();
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(s);
  });
  return ytApiPromise;
}

/* ----------------------------- component ----------------------------- */

/**
 * Lesson video player that reports the furthest-watched percentage (0–100).
 * Direct files use a native <video> with forward-seek locked to what's been
 * watched (so 90% gating can't be skipped). YouTube uses the IFrame API to
 * sample progress. Other embeds can't be tracked, so they report 100%.
 */
export function VideoPlayer({
  url,
  durationMin,
  onProgress,
}: {
  url: string;
  durationMin?: number;
  onProgress: (pct: number) => void;
}) {
  const ytId = youTubeId(url);
  const direct = !ytId && isDirectVideo(url);
  const trackable = Boolean(ytId) || direct;

  const watchedRef = useRef(0); // furthest fraction watched (0..1)
  const ytHostRef = useRef<HTMLDivElement>(null);

  // Untrackable embeds (e.g. Vimeo) can't be gated — report complete on mount.
  useEffect(() => {
    if (!trackable) onProgress(100);
  }, [trackable, onProgress]);

  function report(fraction: number) {
    const f = Math.min(1, Math.max(0, fraction));
    if (f > watchedRef.current) {
      watchedRef.current = f;
      onProgress(Math.round(f * 100));
    }
  }

  /* ---- YouTube ---- */
  useEffect(() => {
    if (!ytId || !ytHostRef.current) return;
    let player: { getCurrentTime?: () => number; getDuration?: () => number; destroy?: () => void } | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;
    let disposed = false;

    void loadYouTubeApi().then(() => {
      if (disposed || !ytHostRef.current || !window.YT) return;
      player = new window.YT.Player(ytHostRef.current, {
        videoId: ytId,
        playerVars: { rel: 0, modestbranding: 1 },
        events: {
          onReady: () => {
            timer = setInterval(() => {
              const cur = player?.getCurrentTime?.() ?? 0;
              const dur = player?.getDuration?.() ?? 0;
              if (dur > 0) report(cur / dur);
            }, 1000);
          },
        },
      }) as typeof player;
    });

    return () => {
      disposed = true;
      if (timer) clearInterval(timer);
      try {
        player?.destroy?.();
      } catch {
        /* ignore */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ytId]);

  if (ytId) {
    return (
      <div className="mt-5 aspect-video w-full overflow-hidden rounded-[var(--radius-lg)] border border-border bg-black">
        <div ref={ytHostRef} className="h-full w-full" />
      </div>
    );
  }

  if (direct) {
    return <DirectVideo url={url} report={report} />;
  }

  if (url) {
    // Unknown embed (e.g. Vimeo): show it, but progress can't be enforced.
    return (
      <div className="mt-5 aspect-video w-full overflow-hidden rounded-[var(--radius-lg)] border border-border bg-black">
        <iframe src={url} className="h-full w-full" allow="autoplay; fullscreen" allowFullScreen title="Lesson video" />
      </div>
    );
  }

  // No video — render a placeholder; the lesson isn't gated.
  return (
    <div className="mt-5 flex aspect-video w-full flex-col items-center justify-center rounded-[var(--radius-lg)] border border-border bg-gradient-to-br from-secondary/40 to-muted text-muted-foreground">
      <PlayCircle className="h-14 w-14 text-primary" />
      <p className="mt-2 text-sm">{durationMin ? `${durationMin}:00` : "No video"}</p>
    </div>
  );
}

function DirectVideo({ url, report }: { url: string; report: (f: number) => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  const watchedSec = useRef(0);
  const [blocked, setBlocked] = useState(false);

  return (
    <div className="mt-5">
      <video
        ref={ref}
        src={url}
        controls
        playsInline
        className="aspect-video w-full rounded-[var(--radius-lg)] border border-border bg-black"
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          if (v.currentTime > watchedSec.current) watchedSec.current = v.currentTime;
          if (v.duration > 0) report(watchedSec.current / v.duration);
        }}
        onSeeking={(e) => {
          // Lock forward seeking past what's actually been watched (anti-skip).
          const v = e.currentTarget;
          if (v.currentTime > watchedSec.current + 1.5 && !v.ended) {
            v.currentTime = watchedSec.current;
            setBlocked(true);
            setTimeout(() => setBlocked(false), 1800);
          }
        }}
      />
      {blocked && (
        <p className="mt-2 text-center text-xs text-warning">⏩ Skipping ahead is disabled — watch to unlock.</p>
      )}
    </div>
  );
}
