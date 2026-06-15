"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

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
}: {
  id: string;
  alt: string;
  emoji?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const [error, setError] = useState(false);

  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      {!error ? (
        <Image
          src={`/covers/${id}.png`}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          onError={() => setError(true)}
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
