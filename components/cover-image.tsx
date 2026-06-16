"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { coverForTitle } from "@/lib/covers";

/**
 * Cover image for a course / opportunity. Loads /covers/<id>.png and, if the
 * file is missing (e.g. admin-created content), falls back to a branded
 * gradient with the item's emoji — so the UI never shows a broken image.
 */
export function CoverImage({
  id,
  alt,
  emoji = "✨",
  className,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false,
  src,
}: {
  id: string;
  alt: string;
  emoji?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Explicit image (admin-uploaded data URL or external URL). Overrides /covers/<id>.png. */
  src?: string;
}) {
  const [error, setError] = useState(false);

  // Admin-uploaded data URLs can't go through the Next/Image optimizer, so render
  // them with a plain <img>. Bundled covers still use the optimized <Image>.
  const isDataUrl = !!src && src.startsWith("data:");
  // Prefer an explicit src; otherwise resolve a bundled cover by title (works in
  // both local and Supabase mode, where ids differ); finally fall back to id.
  const resolvedSrc = src || coverForTitle(alt) || `/covers/${id}.png`;

  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      {!error && isDataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={resolvedSrc} alt={alt} className="absolute inset-0 h-full w-full object-cover" onError={() => setError(true)} />
      ) : !error ? (
        <Image
          src={resolvedSrc}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          onError={() => setError(true)}
          unoptimized={!!src}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center [background:linear-gradient(135deg,var(--primary),var(--violet))]">
          <span className="text-5xl drop-shadow-sm">{emoji}</span>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
    </div>
  );
}
