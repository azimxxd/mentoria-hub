"use client";

import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { Button, Input, Label } from "./ui";

const MAX_BYTES = 800 * 1024; // ~800 KB — keeps localStorage from bloating

/**
 * Cover-photo picker for the admin panel. Accepts either a pasted URL or an
 * uploaded file (stored inline as a data URL). Shows a live preview.
 */
export function ImagePicker({
  value,
  onChange,
  label = "Cover photo",
}: {
  value?: string;
  onChange: (v: string | undefined) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(value && !value.startsWith("data:") ? value : "");

  function onFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Image is too large (max 800 KB). Pick a smaller one or use a URL.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-start gap-3">
        <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-[var(--radius-md)] border border-border bg-muted">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="cover preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ImagePlus className="h-6 w-6" />
            </div>
          )}
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange(undefined);
                setUrl("");
              }}
              aria-label="Remove photo"
              className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-card/90 text-foreground hover:bg-card"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            <ImagePlus className="h-4 w-4" /> Upload
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              e.target.value = "";
            }}
          />
          <Input
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              onChange(e.target.value.trim() || undefined);
            }}
            placeholder="…or paste an image URL"
          />
        </div>
      </div>
    </div>
  );
}
