"use client";

import { cn } from "@/lib/utils";
import { ULAM_FILTERS, type FilterId } from "@/lib/ulam-filters";

interface UlamFiltersProps {
  active: FilterId[];
  onChange: (next: FilterId[]) => void;
}

const TINT: Record<
  FilterId,
  { on: string; off: string; glow: string }
> = {
  "tag-ulan": {
    on: "border-sky-500 bg-sky-500 text-white",
    off: "border-sky-500/30 bg-sky-500/10 text-sky-800 hover:bg-sky-500/20",
    glow: "shadow-[0_0_18px_-2px_rgba(14,165,233,0.6)]",
  },
  mabilis: {
    on: "border-amber-500 bg-amber-500 text-white",
    off: "border-amber-500/30 bg-amber-500/10 text-amber-800 hover:bg-amber-500/20",
    glow: "shadow-[0_0_18px_-2px_rgba(245,158,11,0.65)]",
  },
  "gulay-day": {
    on: "border-leaf bg-leaf text-white",
    off: "border-leaf/30 bg-leaf/10 text-leaf hover:bg-leaf/20",
    glow: "shadow-[0_0_18px_-2px_hsl(129_37%_36%_/_0.6)]",
  },
  fish: {
    on: "border-teal-500 bg-teal-500 text-white",
    off: "border-teal-500/30 bg-teal-500/10 text-teal-800 hover:bg-teal-500/20",
    glow: "shadow-[0_0_18px_-2px_rgba(20,184,166,0.6)]",
  },
};

/** Craving & Mood filter chips (multi-select, OR-matched). */
export function UlamFilters({ active, onChange }: UlamFiltersProps) {
  function toggle(id: FilterId) {
    onChange(
      active.includes(id) ? active.filter((x) => x !== id) : [...active, id],
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <span className="font-display text-sm font-bold text-muted-foreground">
        Gusto ko ng:
      </span>
      {ULAM_FILTERS.map((f) => {
        const on = active.includes(f.id);
        const tint = TINT[f.id];
        return (
          <button
            key={f.id}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(f.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 font-display text-sm font-extrabold transition-all",
              on ? cn(tint.on, tint.glow, "-translate-y-0.5") : tint.off,
            )}
          >
            <span
              aria-hidden
              className={cn(
                "text-base transition-transform",
                on && "drop-shadow-[0_0_6px_rgba(255,255,255,0.9)] scale-110",
              )}
            >
              {f.emoji}
            </span>
            {f.label}
          </button>
        );
      })}
      {active.length > 0 ? (
        <button
          type="button"
          onClick={() => onChange([])}
          className="font-display text-sm font-bold text-primary hover:underline"
        >
          I-clear
        </button>
      ) : null}
    </div>
  );
}
