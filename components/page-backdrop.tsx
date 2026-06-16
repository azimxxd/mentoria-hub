/* Global decorative backdrop — Y2K / Liquid Chrome ambiance behind every page.
   Purely decorative: fixed, non-interactive, sits behind all content (-z-10). */
export function PageBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* soft brand gradient glow */}
      <div className="absolute inset-0 gradient-hero" />

      {/* ambient liquid chrome — colour, not texture (heavily blurred + masked) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/generated/hero-liquid.png"
        alt=""
        className="absolute left-1/2 top-[-18%] h-[70%] w-[140%] -translate-x-1/2 object-cover opacity-25 blur-3xl [mask-image:radial-gradient(55%_55%_at_50%_45%,#000,transparent_75%)]"
      />

      {/* halftone dot grid */}
      <div className="absolute inset-0 halftone opacity-[0.05]" />
    </div>
  );
}
