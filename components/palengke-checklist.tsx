"use client";

import * as React from "react";
import { Copy, Check, ClipboardList } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn, formatPHP } from "@/lib/utils";
import { formatQty, PRICE_MODE_META, type PricedDish } from "@/lib/pricing-engine";
import {
  MARKET_SECTIONS,
  marketSection,
  type MarketSection,
} from "@/lib/market-sections";
import type { Dish } from "@/lib/mock-ulam-data";

export interface ChecklistEntry {
  dish: Dish;
  priced: PricedDish;
  servings: number;
}

interface PalengkeChecklistProps {
  entries: ChecklistEntry[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Line {
  key: string;
  name: string;
  unit: string;
  amount: number;
  price: number;
  section: MarketSection;
  fromPantry: boolean;
}

function buildLines(entries: ChecklistEntry[], includeOwned: boolean): Line[] {
  const map = new Map<string, Line>();
  for (const { priced } of entries) {
    for (const ing of priced.ingredients) {
      if (ing.inPantry && !includeOwned) continue;
      const key = `${ing.name.toLowerCase()}|${ing.unit.toLowerCase()}`;
      const existing = map.get(key);
      if (existing) {
        existing.amount += ing.amount;
        existing.price += ing.effectivePrice;
        existing.fromPantry = existing.fromPantry && ing.inPantry;
      } else {
        map.set(key, {
          key,
          name: ing.name,
          unit: ing.unit,
          amount: ing.amount,
          price: ing.effectivePrice,
          section: marketSection(ing.name),
          fromPantry: ing.inPantry,
        });
      }
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function PalengkeChecklist({
  entries,
  open,
  onOpenChange,
}: PalengkeChecklistProps) {
  const [bought, setBought] = React.useState<Set<string>>(new Set());
  const [includeOwned, setIncludeOwned] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  // Drop "bought" ticks for lines that no longer exist when the selection changes.
  React.useEffect(() => {
    setBought(new Set());
    setCopied(false);
  }, [entries.length, includeOwned]);

  const lines = React.useMemo(
    () => buildLines(entries, includeOwned),
    [entries, includeOwned],
  );

  const bySection = React.useMemo(() => {
    const groups = new Map<MarketSection, Line[]>();
    for (const line of lines) {
      const arr = groups.get(line.section) ?? [];
      arr.push(line);
      groups.set(line.section, arr);
    }
    return groups;
  }, [lines]);

  const remainingTotal = lines
    .filter((l) => !bought.has(l.key))
    .reduce((s, l) => s + l.price, 0);
  const grandTotal = lines.reduce((s, l) => s + l.price, 0);

  const priceMode = entries[0]?.priced.priceMode ?? "palengke";
  const dishSummary = entries
    .map((e) => `${e.dish.name} (${e.servings} pax)`)
    .join(", ");

  function toggle(key: string) {
    setBought((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function copyList() {
    const parts: string[] = [
      "🛒 Palengke List — Anong Ulam?",
      `${dishSummary} · ${PRICE_MODE_META[priceMode].short} prices`,
      "",
    ];
    for (const section of MARKET_SECTIONS) {
      const items = bySection.get(section.id);
      if (!items || items.length === 0) continue;
      parts.push(`${section.emoji} ${section.title.toUpperCase()}`);
      for (const l of items) {
        parts.push(
          `${bought.has(l.key) ? "[x]" : "[ ]"} ${formatQty(l.amount)} ${l.unit} ${l.name} — ${formatPHP(l.price)}`,
        );
      }
      parts.push("");
    }
    parts.push("----------------------------");
    parts.push(`Kabuuan: ${formatPHP(grandTotal)}`);

    try {
      await navigator.clipboard.writeText(parts.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        <div className="border-b bg-secondary/50 p-6 pr-14">
          <SheetHeader className="space-y-1 text-left">
            <SheetTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Palengke List
            </SheetTitle>
            <SheetDescription>
              {entries.length} ulam · {lines.length} item ·{" "}
              {PRICE_MODE_META[priceMode].short} prices
            </SheetDescription>
          </SheetHeader>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={copyList}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground hover:bg-primary/90"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" /> Nakopya!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" /> Kopyahin (Messenger/SMS)
                </>
              )}
            </button>
            <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Checkbox
                checked={includeOwned}
                onCheckedChange={() => setIncludeOwned((v) => !v)}
              />
              Isama ang meron na ako
            </label>
          </div>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {lines.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Walang item sa listahan. Pumili ng ulam gamit ang &ldquo;Isama sa
              Palengke List&rdquo; sa bawat card.
            </p>
          ) : (
            MARKET_SECTIONS.map((section) => {
              const items = bySection.get(section.id);
              if (!items || items.length === 0) return null;
              const subtotal = items
                .filter((l) => !bought.has(l.key))
                .reduce((s, l) => s + l.price, 0);
              return (
                <section key={section.id}>
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                      <span aria-hidden>{section.emoji}</span>
                      {section.title}
                      <Badge variant="secondary">{items.length}</Badge>
                    </h4>
                    <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                      {formatPHP(subtotal)}
                    </span>
                  </div>
                  <ul className="divide-y divide-border rounded-lg border">
                    {items.map((line) => {
                      const isBought = bought.has(line.key);
                      return (
                        <li key={line.key}>
                          <label className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm">
                            <Checkbox
                              checked={isBought}
                              onCheckedChange={() => toggle(line.key)}
                            />
                            <span
                              className={cn(
                                "flex-1",
                                isBought &&
                                  "text-muted-foreground line-through",
                              )}
                            >
                              <span className="text-muted-foreground">
                                {formatQty(line.amount)} {line.unit}
                              </span>{" "}
                              {line.name}
                              {line.fromPantry ? (
                                <Badge
                                  variant="outline"
                                  className="ml-1.5 text-[10px]"
                                >
                                  meron na
                                </Badge>
                              ) : null}
                            </span>
                            <span
                              className={cn(
                                "shrink-0 font-semibold tabular-nums",
                                isBought
                                  ? "text-muted-foreground line-through"
                                  : "text-foreground",
                              )}
                            >
                              {formatPHP(line.price)}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })
          )}
        </div>

        {lines.length > 0 ? (
          <div className="border-t bg-card p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Natitira pang bibilhin
              </span>
              <span className="font-semibold tabular-nums">
                {formatPHP(remainingTotal)}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="font-bold text-foreground">Kabuuan</span>
              <span className="text-lg font-extrabold tabular-nums text-primary">
                {formatPHP(grandTotal)}
              </span>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
