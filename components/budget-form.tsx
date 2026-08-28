"use client";

import * as React from "react";
import { Loader2, Search } from "lucide-react";

import { cn, formatPHP } from "@/lib/utils";

const PRESETS = [100, 200, 300, 500];

interface BudgetFormProps {
  onSearch: (budget: number) => void;
  pending?: boolean;
  initialBudget?: number | null;
}

export function BudgetForm({
  onSearch,
  pending = false,
  initialBudget,
}: BudgetFormProps) {
  const [value, setValue] = React.useState(
    initialBudget ? String(initialBudget) : "",
  );
  const [error, setError] = React.useState<string | null>(null);

  function submit(raw: string) {
    const amount = Number(raw);
    if (!raw.trim() || Number.isNaN(amount) || amount <= 0) {
      setError("Please enter a valid budget in PHP.");
      return;
    }
    setError(null);
    onSearch(Math.round(amount));
  }

  return (
    <form
      className="w-full max-w-xl"
      onSubmit={(e) => {
        e.preventDefault();
        submit(value);
      }}
    >
      {/* search hub */}
      <div className="flex flex-col gap-2 rounded-2xl border-2 border-primary/15 bg-card p-2 shadow-card sm:flex-row sm:items-center">
        <div className="relative flex flex-1 items-center gap-2 pl-2">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold font-display text-2xl font-extrabold text-primary shadow-inner">
            ₱
          </span>
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            aria-label="Budget in Philippine Peso"
            placeholder="Ilagay ang budget… hal. 250"
            value={value}
            disabled={pending}
            onChange={(e) => {
              setValue(e.target.value.replace(/[^0-9]/g, ""));
              setError(null);
            }}
            className="h-12 w-full bg-transparent font-display text-xl font-bold text-foreground placeholder:font-sans placeholder:text-base placeholder:font-medium placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-8 font-display text-lg font-extrabold text-primary-foreground",
            "shadow-pop transition-transform hover:brightness-105 active:translate-y-1 active:shadow-pop-sm disabled:opacity-60 disabled:active:translate-y-0",
          )}
        >
          {pending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Naghahanap…
            </>
          ) : (
            <>
              <Search className="h-5 w-5" strokeWidth={2.75} />
              Hanap Ulam!
            </>
          )}
        </button>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-2 text-center text-sm font-bold text-destructive"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <span className="font-display text-sm font-bold text-muted-foreground">
          Mabilis pumili:
        </span>
        {PRESETS.map((preset) => {
          const active = value === String(preset);
          return (
            <button
              key={preset}
              type="button"
              disabled={pending}
              onClick={() => {
                setValue(String(preset));
                submit(String(preset));
              }}
              className={cn(
                "rounded-full border-2 px-4 py-1.5 font-display text-sm font-extrabold transition-all disabled:opacity-50",
                active
                  ? "-translate-y-0.5 border-primary bg-primary text-primary-foreground shadow-pop-sm"
                  : "border-primary/25 bg-card text-primary hover:-translate-y-0.5 hover:border-primary hover:shadow-pop-sm",
              )}
            >
              {formatPHP(preset)}
            </button>
          );
        })}
      </div>
    </form>
  );
}
