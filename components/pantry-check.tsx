"use client";

import * as React from "react";
import { ChevronDown, Refrigerator, RotateCcw } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn, formatPHP } from "@/lib/utils";
import { PANTRY_GROUPS } from "@/lib/pantry";

interface PantryCheckProps {
  selected: string[];
  onChange: (keywords: string[]) => void;
}

/**
 * Expandable "Pantry Check": the user ticks staples they already own. Selected
 * keywords flow into the pricing engine so each dish shows a discounted
 * "Your Price".
 */
export function PantryCheck({ selected, onChange }: PantryCheckProps) {
  const [open, setOpen] = React.useState(false);
  const selectedSet = React.useMemo(() => new Set(selected), [selected]);

  function toggle(keyword: string) {
    const next = new Set(selectedSet);
    if (next.has(keyword)) next.delete(keyword);
    else next.add(keyword);
    onChange([...next]);
  }

  return (
    <div className="mx-auto mt-6 w-full max-w-xl overflow-hidden rounded-2xl border-2 border-primary/15 bg-card shadow-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 font-display font-extrabold text-foreground">
          <Refrigerator className="h-5 w-5 text-primary" />
          Pantry Check — anong meron ka na?
          {selected.length > 0 ? (
            <Badge variant="accent">{selected.length} napili</Badge>
          ) : null}
        </span>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div className="border-t px-4 pb-4 pt-3">
          <p className="mb-3 text-sm text-muted-foreground">
            I-check ang mga meron ka na sa bahay — ibabawas namin ang halaga
            nila sa &ldquo;Your Price&rdquo; ng bawat ulam.
          </p>

          <div className="space-y-4">
            {PANTRY_GROUPS.map((group) => (
              <fieldset key={group.id}>
                <legend className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {group.title}
                </legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {group.items.map((item) => {
                    const checked = selectedSet.has(item.keyword);
                    return (
                      <label
                        key={item.keyword}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-xl border-2 px-2.5 py-2 text-sm transition-colors",
                          checked
                            ? "border-leaf bg-leaf/10 font-bold text-foreground"
                            : "border-primary/15 hover:border-primary/40",
                        )}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggle(item.keyword)}
                        />
                        <span className="flex-1">{item.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatPHP(item.typicalPrice)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>

          {selected.length > 0 ? (
            <button
              type="button"
              onClick={() => onChange([])}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              <RotateCcw className="h-4 w-4" />
              I-clear ang pantry
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
