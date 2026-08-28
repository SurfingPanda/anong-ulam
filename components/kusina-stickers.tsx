/**
 * Playful hand-drawn Filipino kitchen doodles floating in the page margins.
 * Purely decorative — hidden on small screens, never interactive.
 */

import { cn } from "@/lib/utils";

function Kaldero({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden fill="none">
      <path
        d="M16 34h48v22a10 10 0 0 1-10 10H26a10 10 0 0 1-10-10V34Z"
        stroke="currentColor"
        strokeWidth="3.5"
      />
      <path d="M12 34h56" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M8 40c-4 0-4 8 0 8h8M72 40c4 0 4 8 0 8h-8" stroke="currentColor" strokeWidth="3.5" />
      <path
        d="M30 20c0-6 6-6 6-12M44 22c0-6 6-6 6-12"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Kawali({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 60" className={className} aria-hidden fill="none">
      <path
        d="M8 22a26 22 0 0 0 52 0"
        stroke="currentColor"
        strokeWidth="3.5"
      />
      <path d="M4 22h60" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M64 22h26a4 4 0 0 1 0 8H64" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="24" cy="14" r="2.5" fill="currentColor" />
      <circle cx="36" cy="16" r="2.5" fill="currentColor" />
      <circle cx="46" cy="13" r="2.5" fill="currentColor" />
    </svg>
  );
}

function Bayong({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 72 78" className={className} aria-hidden fill="none">
      <path
        d="M14 26h44l-4 40a8 8 0 0 1-8 7H26a8 8 0 0 1-8-7l-4-40Z"
        stroke="currentColor"
        strokeWidth="3.5"
      />
      <path
        d="M22 26c0-14 28-14 28 0"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path d="M14 40h44M18 54h40" stroke="currentColor" strokeWidth="2.5" opacity="0.6" />
      <path d="M28 26v47M44 26v47" stroke="currentColor" strokeWidth="2.5" opacity="0.6" />
    </svg>
  );
}

function Sili({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 76" className={className} aria-hidden fill="none">
      <path
        d="M22 24c-8 8-12 24-6 36 6 11 24 12 30-2 5-12-1-26-10-32-3 6-9 6-14-2Z"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M28 20c-2-8-10-10-14-6 6 2 6 8 2 12 6 2 10-1 12-6Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function KusinaStickers() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 hidden overflow-hidden lg:block"
    >
      <Kaldero
        className={cn(
          "absolute left-[3%] top-28 h-20 w-20 rotate-[-12deg] text-primary/25 animate-float",
        )}
      />
      <Kawali
        className="absolute right-[4%] top-40 h-16 w-24 rotate-[10deg] text-leaf/25 animate-float [animation-delay:-2s]"
      />
      <Sili
        className="absolute left-[6%] top-[62%] h-16 w-12 rotate-[8deg] text-primary/25 animate-float [animation-delay:-1s]"
      />
      <Bayong
        className="absolute right-[5%] top-[58%] h-20 w-20 rotate-[-8deg] text-accent/40 animate-float [animation-delay:-3.5s]"
      />
    </div>
  );
}
