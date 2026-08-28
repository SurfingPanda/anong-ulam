"use client";

import { Minus, Plus, Users } from "lucide-react";

import { cn } from "@/lib/utils";

interface ServingsStepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

/** Tactile pill-shaped "Pamilya / Servings" multiplier control. */
export function ServingsStepper({
  value,
  onChange,
  min = 1,
  max = 12,
  className,
}: ServingsStepperProps) {
  const set = (n: number) => onChange(Math.min(max, Math.max(min, n)));

  const btn =
    "flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-pop-sm transition-transform hover:bg-accent active:translate-y-0.5 active:shadow-none disabled:opacity-40 disabled:active:translate-y-0";

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <span className="inline-flex items-center gap-1 font-display text-sm font-bold text-muted-foreground">
        <Users className="h-4 w-4" />
        Pamilya
      </span>
      <div className="inline-flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Bawasan ang servings"
          disabled={value <= min}
          onClick={() => set(value - 1)}
          className={btn}
        >
          <Minus className="h-4 w-4" strokeWidth={3} />
        </button>
        <span className="min-w-[3.75rem] rounded-full bg-card px-2 py-1 text-center font-display text-sm font-extrabold tabular-nums text-foreground ring-2 ring-primary/15">
          {value} pax
        </span>
        <button
          type="button"
          aria-label="Dagdagan ang servings"
          disabled={value >= max}
          onClick={() => set(value + 1)}
          className={btn}
        >
          <Plus className="h-4 w-4" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
