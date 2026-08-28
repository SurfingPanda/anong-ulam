"use client";

import { Store, ShoppingCart } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PriceMode } from "@/lib/pricing-engine";

interface PriceModeToggleProps {
  value: PriceMode;
  onChange: (mode: PriceMode) => void;
}

const OPTIONS: { key: PriceMode; label: string; icon: typeof Store }[] = [
  { key: "palengke", label: "Palengke", icon: Store },
  { key: "supermarket", label: "Supermarket", icon: ShoppingCart },
];

export function PriceModeToggle({ value, onChange }: PriceModeToggleProps) {
  return (
    <div className="inline-flex items-center gap-2">
      <span className="font-display text-sm font-bold text-muted-foreground">
        Presyo base sa:
      </span>
      <div className="inline-flex rounded-full border-2 border-primary/20 bg-card p-1">
        {OPTIONS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            aria-pressed={value === key}
            onClick={() => onChange(key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-display text-sm font-extrabold transition-colors",
              value === key
                ? "bg-primary text-primary-foreground shadow-pop-sm"
                : "text-foreground hover:bg-secondary",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
            {key === "supermarket" ? (
              <span className="text-xs font-bold opacity-80">+18%</span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}
