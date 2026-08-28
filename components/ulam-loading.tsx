"use client";

import * as React from "react";

const MESSAGES = [
  "Sinusukat ang budget mo…",
  "Naghahalungkat sa palengke…",
  "Tinitimbang ang tipid…",
  "Nagluluto ng mga suggestion…",
];

export function UlamLoading() {
  const [idx, setIdx] = React.useState(0);

  React.useEffect(() => {
    const t = setInterval(
      () => setIdx((i) => (i + 1) % MESSAGES.length),
      1200,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <div className="mx-auto mt-12 max-w-5xl">
      <div className="mb-6 flex flex-col items-center gap-2 text-center">
        <div className="relative text-5xl">
          <span className="inline-block animate-bounce">🍲</span>
          <span className="absolute -top-2 left-1/2 h-4 w-1 -translate-x-1/2 rounded-full bg-primary/50 animate-steam" />
          <span className="absolute -top-2 left-[38%] h-4 w-1 rounded-full bg-primary/40 animate-steam [animation-delay:-1s]" />
        </div>
        <p
          key={idx}
          className="animate-in fade-in font-display text-base font-extrabold text-foreground"
          aria-live="polite"
        >
          {MESSAGES[idx]}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border-2 border-primary/10 bg-card shadow-card"
          >
            <div className="h-40 animate-pulse bg-gradient-to-br from-accent/40 via-muted to-secondary" />
            <div className="space-y-3 p-4">
              <div className="h-5 w-2/3 animate-pulse rounded-full bg-muted" />
              <div className="flex gap-2">
                <div className="h-4 w-16 animate-pulse rounded-full bg-muted" />
                <div className="h-4 w-16 animate-pulse rounded-full bg-muted" />
              </div>
              <div className="h-10 w-full animate-pulse rounded-xl bg-muted" />
              <div className="h-4 w-1/3 animate-pulse rounded-full bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
