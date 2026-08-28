"use client";

import { MapPin } from "lucide-react";

import { REGIONS, type RegionId } from "@/lib/pricing-engine";

interface RegionSelectProps {
  value: RegionId;
  onChange: (region: RegionId) => void;
  disabled?: boolean;
}

export function RegionSelect({ value, onChange, disabled }: RegionSelectProps) {
  return (
    <label className="inline-flex items-center gap-2">
      <span className="inline-flex items-center gap-1 font-display text-sm font-bold text-muted-foreground">
        <MapPin className="h-4 w-4" />
        Lugar:
      </span>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as RegionId)}
        className="rounded-full border-2 border-primary/20 bg-card px-3 py-1.5 font-display text-sm font-extrabold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      >
        {REGIONS.map((r) => (
          <option key={r.id} value={r.id}>
            {r.label}
            {r.multiplier !== 1
              ? `  (${Math.round((r.multiplier - 1) * 100)}%)`
              : ""}
          </option>
        ))}
      </select>
    </label>
  );
}
