"use client";

import { useEffect, useState } from "react";

// Menti — the Mentoria Hub mascot. Frames are AI-generated (gpt-image-1) in the
// site's Y2K / liquid-chrome style, sliced + normalized by scripts/slice-mascot.mjs.
// We stack every frame and cross-fade between them so playback is flicker-free
// (each frame is preloaded and already in the DOM).
const IDLE_FRAMES = ["idle-0", "idle-1", "idle-2", "idle-3"] as const;
const TALK_FRAMES = ["talk-0", "talk-1", "talk-2", "talk-3"] as const;
const ALL_FRAMES = [...IDLE_FRAMES, ...TALK_FRAMES] as const;
type Frame = (typeof ALL_FRAMES)[number];

const src = (f: Frame) => `/generated/mascot/${f}.webp`;

// idle-0: eyes open · idle-1: blink · idle-2: happy ^_^ · idle-3: open (variant)
const OPEN: Frame = "idle-0";
const BLINK: Frame = "idle-1";
const HAPPY: Frame = "idle-2";

// Mouth cycle for talking: closed → open → wide → half → … (looks like chatter).
const MOUTH: Frame[] = ["talk-0", "talk-1", "talk-2", "talk-3", "talk-2", "talk-1"];

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Drives the frame-by-frame animation.
 * - "talking": lip-syncs through the mouth frames for a lively chatty feel.
 * - "idle": rests with natural blinks and the occasional happy beat.
 * Respects prefers-reduced-motion (locks to a single frame).
 */
function useMascotFrame(state: "idle" | "talking"): Frame {
  const [frame, setFrame] = useState<Frame>(OPEN);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setFrame(state === "talking" ? "talk-0" : OPEN);
      return;
    }

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const after = (ms: number, fn: () => void) => {
      if (!cancelled) timers.push(setTimeout(fn, ms));
    };

    if (state === "talking") {
      let i = 0;
      const tick = () => {
        setFrame(MOUTH[i % MOUTH.length]);
        i++;
        after(150 + Math.random() * 70, tick);
      };
      tick();
    } else {
      setFrame(OPEN);
      const loop = () => {
        const delay = 2200 + Math.random() * 3200;
        const roll = Math.random();
        if (roll < 0.25) {
          // Happy beat — a warm closed-eye smile, held a moment.
          after(delay, () => {
            setFrame(HAPPY);
            after(700, () => {
              setFrame(OPEN);
              loop();
            });
          });
        } else {
          // Blink (sometimes a double blink).
          after(delay, () => {
            setFrame(BLINK);
            after(140, () => {
              setFrame(OPEN);
              if (Math.random() < 0.3) {
                after(170, () => {
                  setFrame(BLINK);
                  after(140, () => setFrame(OPEN));
                });
              }
              loop();
            });
          });
        }
      };
      loop();
    }

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [state]);

  return frame;
}

interface MascotProps {
  /** Render size in pixels (square). */
  size?: number;
  /** "talking" plays the mouth animation; "idle" plays blinks/happy beats. */
  state?: "idle" | "talking";
  /** Add a gentle floating bob (good for the launcher). */
  float?: boolean;
  className?: string;
}

export function Mascot({ size = 56, state = "idle", float = false, className = "" }: MascotProps) {
  const active = useMascotFrame(state);

  return (
    <div
      className={`relative select-none ${float ? "animate-float" : ""} ${className}`}
      style={{
        width: size,
        height: size,
        // Shadow lives on the container (not each frame) so it never shimmers.
        filter: "drop-shadow(0 4px 10px rgba(136, 78, 160, 0.28))",
      }}
      aria-hidden
    >
      {ALL_FRAMES.map((f) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={f}
          src={src(f)}
          alt=""
          width={size}
          height={size}
          draggable={false}
          // Clean cut between frames (no cross-fade) — fading two different poses
          // at once causes a ghosting/flicker. Only the active frame is painted.
          className="absolute inset-0 h-full w-full object-contain"
          style={{ opacity: f === active ? 1 : 0, visibility: f === active ? "visible" : "hidden" }}
        />
      ))}
    </div>
  );
}

/** Tiny static mascot for inline use (message avatars) — no animation timers. */
export function MascotStatic({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      // eslint-disable-next-line @next/next/no-img-element
      src={src(OPEN)}
      alt="Menti"
      width={size}
      height={size}
      draggable={false}
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
