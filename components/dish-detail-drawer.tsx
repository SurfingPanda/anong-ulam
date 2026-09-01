"use client";

import * as React from "react";
import { Clock, Sprout, ArrowLeftRight, ChefHat, Share2 } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DishImage } from "@/components/dish-image";
import { ServingsStepper } from "@/components/servings-stepper";
import { cn, formatMins, formatPHP } from "@/lib/utils";
import { ingredientInPantry } from "@/lib/pantry";
import {
  priceDish,
  formatQty,
  PRICE_MODE_META,
  type PriceMode,
  type PricedDish,
  type RegionId,
} from "@/lib/pricing-engine";
import type { Dish } from "@/lib/mock-ulam-data";

interface DishDetailDrawerProps {
  dish: Dish | null;
  budget: number;
  servings: number;
  onServingsChange: (next: number) => void;
  priceMode: PriceMode;
  region: RegionId;
  pantryKeywords: string[];
  appliedSwaps: number[];
  onToggleSwap: (index: number) => void;
  onStartCooking: () => void;
  onShare: (priced: PricedDish) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DISCLAIMER =
  "Market prices may vary depending on local wet market (palengke) or supermarket rates.";

/** "Presyo: DA Bantay Presyo · Aug 30, 2026" or a "tantiya lang" note. */
function priceProvenance(asOf?: string | null): string {
  if (!asOf) return "Presyo: tantiya lang — walang live na datos ngayon.";
  const d = new Date(asOf);
  const when = Number.isNaN(d.getTime())
    ? asOf
    : d.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
  return `Presyo: DA Bantay Presyo (NCR) · ${when}`;
}

const peso2 = (n: number) =>
  `₱${n.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export function DishDetailDrawer({
  dish,
  budget,
  servings,
  onServingsChange,
  priceMode,
  region,
  pantryKeywords,
  appliedSwaps,
  onToggleSwap,
  onStartCooking,
  onShare,
  open,
  onOpenChange,
}: DishDetailDrawerProps) {
  // Per-ingredient "I already have this" — seeded from the Pantry Check, then
  // fully user-controlled inside the drawer.
  const [owned, setOwned] = React.useState<Set<number>>(new Set());

  React.useEffect(() => {
    if (!dish) return;
    const seeded = new Set<number>();
    dish.ingredients.forEach((ing, i) => {
      if (ingredientInPantry(ing.item_name, pantryKeywords)) seeded.add(i);
    });
    setOwned(seeded);
  }, [dish, pantryKeywords]);

  const priced = React.useMemo(() => {
    if (!dish) return null;
    return priceDish(dish, {
      servings,
      priceMode,
      region,
      pantryKeywords: [],
      pantryIndices: [...owned],
      appliedSwaps,
    });
  }, [dish, servings, priceMode, region, owned, appliedSwaps]);

  if (!dish || !priced) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full p-0 sm:max-w-md" />
      </Sheet>
    );
  }

  const toggleOwned = (i: number) =>
    setOwned((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const withinBudget = priced.yourPrice <= budget;
  const swapRows = priced.ingredients.filter((i) => i.hasSwap);
  const appliedSwapLabels = priced.ingredients
    .filter((i) => i.swapApplied)
    .map((i) => `${i.originalName} → ${i.swapName}`);
  const pantryLabels = priced.ingredients
    .filter((i) => i.inPantry)
    .map((i) => i.name);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        <div className="relative">
          <DishImage dish={dish} className="h-40 w-full text-6xl" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4 pr-14">
            <SheetHeader className="space-y-0.5 text-left">
              <SheetTitle className="font-display text-2xl font-extrabold text-white">
                {dish.name}
              </SheetTitle>
              <SheetDescription className="font-semibold text-white/90">
                {dish.category} · {formatMins(dish.prep_time_mins)} ·{" "}
                {PRICE_MODE_META[priceMode].short} prices
              </SheetDescription>
            </SheetHeader>
          </div>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onStartCooking}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2.5 font-display text-sm font-extrabold text-primary-foreground shadow-pop-sm transition-transform active:translate-y-0.5 active:shadow-none"
            >
              <ChefHat className="h-4 w-4" />
              Simulan ang Pagluluto
            </button>
            <button
              type="button"
              onClick={() => onShare(priced)}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-primary/40 px-3 py-2.5 font-display text-sm font-extrabold text-primary hover:bg-primary/10"
            >
              <Share2 className="h-4 w-4" />
              Tipid Card
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <ServingsStepper value={servings} onChange={onServingsChange} />
            <span className="text-xs text-muted-foreground">
              base: {priced.baseServings} pax
            </span>
          </div>

          {/* Dynamic price summary */}
          <section className="rounded-xl border-2 border-primary/20 bg-secondary/40 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Original Price</span>
              <span className="font-semibold tabular-nums">
                {peso2(priced.srpTotal)}
              </span>
            </div>

            {priced.swapSavings > 0 ? (
              <div className="mt-1 flex items-start justify-between gap-3 text-sm">
                <span className="text-muted-foreground">Tipid Swaps</span>
                <span className="text-right">
                  <span className="font-semibold tabular-nums text-amber-600">
                    − {peso2(priced.swapSavings)}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    ({appliedSwapLabels.join(", ")})
                  </span>
                </span>
              </div>
            ) : null}

            <div className="mt-1 flex items-start justify-between gap-3 text-sm">
              <span className="text-muted-foreground">Pantry Savings</span>
              <span className="text-right">
                <span
                  className={cn(
                    "font-semibold tabular-nums",
                    priced.pantrySavings > 0
                      ? "text-emerald-600"
                      : "text-muted-foreground",
                  )}
                >
                  − {peso2(priced.pantrySavings)}
                </span>
                {pantryLabels.length > 0 ? (
                  <span className="block text-xs text-muted-foreground">
                    ({pantryLabels.slice(0, 4).join(", ")}
                    {pantryLabels.length > 4
                      ? ` +${pantryLabels.length - 4}`
                      : ""}
                    )
                  </span>
                ) : null}
              </span>
            </div>

            <div className="my-3 border-t-2 border-dashed border-primary/20" />

            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-foreground">
                Your Final Cost
              </span>
              <span
                className={cn(
                  "text-lg font-extrabold tabular-nums",
                  withinBudget ? "text-emerald-600" : "text-destructive",
                )}
              >
                {peso2(priced.yourPrice)}
              </span>
            </div>
            <p
              className={cn(
                "mt-1 text-right text-xs font-semibold",
                withinBudget ? "text-emerald-600" : "text-destructive",
              )}
            >
              {withinBudget
                ? "Pasok sa budget!"
                : `Lampas ng ${formatPHP(priced.yourPrice - budget)} sa budget`}
            </p>

            {priced.pantrySavings > 0 ? (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-600/10 px-3 py-2 text-sm font-bold text-emerald-700">
                <Sprout className="h-4 w-4" />
                Nakatipid ka ng {formatPHP(priced.pantrySavings)} mula sa iyong
                Pantry!
              </div>
            ) : null}
          </section>

          {/* Tipid Swaps */}
          {swapRows.length > 0 ? (
            <section>
              <h4 className="mb-2 flex items-center gap-1.5 text-base font-bold text-foreground">
                <ArrowLeftRight className="h-4 w-4 text-amber-600" />
                Tipid Swaps
              </h4>
              <div className="space-y-2">
                {swapRows.map((row) => (
                  <div
                    key={row.index}
                    className="rounded-lg border-2 border-amber-500/30 bg-amber-500/10 p-3 text-sm"
                  >
                    <p className="text-foreground">
                      Gusto mo mas tipid? Swap{" "}
                      <span className="font-semibold">{row.originalName}</span>{" "}
                      for{" "}
                      <span className="font-semibold">{row.swapName}</span> to
                      save{" "}
                      <span className="font-bold text-amber-700">
                        {formatPHP(row.swapSavings)}
                      </span>
                      .
                    </p>
                    <button
                      type="button"
                      onClick={() => onToggleSwap(row.index)}
                      className={cn(
                        "mt-2 rounded-md px-3 py-1.5 text-xs font-bold transition-colors",
                        row.swapApplied
                          ? "bg-muted text-foreground hover:bg-muted/70"
                          : "bg-amber-600 text-white hover:bg-amber-700",
                      )}
                    >
                      {row.swapApplied ? "I-undo ang Swap" : "Apply Swap"}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {/* Interactive itemized ingredients */}
          <section>
            <div className="mb-1 flex items-center justify-between">
              <h4 className="text-base font-bold text-foreground">
                Mga Sangkap at Presyo
              </h4>
              <span className="text-xs text-muted-foreground">
                I-check ang meron ka na
              </span>
            </div>
            <ul className="divide-y divide-border rounded-lg border">
              {priced.ingredients.map((item) => {
                const isOwned = owned.has(item.index);
                return (
                  <li key={item.index}>
                    <label className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm">
                      <Checkbox
                        checked={isOwned}
                        onCheckedChange={() => toggleOwned(item.index)}
                      />
                      <span
                        className={cn(
                          "flex-1",
                          isOwned && "text-muted-foreground line-through",
                        )}
                      >
                        <span className="text-muted-foreground">
                          {formatQty(item.amount)} {item.unit}
                        </span>{" "}
                        {item.name}
                        {item.swapApplied ? (
                          <Badge
                            variant="outline"
                            className="ml-1.5 border-amber-500/50 text-[10px] text-amber-700"
                          >
                            swapped
                          </Badge>
                        ) : null}
                      </span>
                      <span className="shrink-0 text-right tabular-nums">
                        {item.swapApplied && item.effectivePrice !== item.price ? (
                          <span className="mr-1 text-xs text-muted-foreground line-through">
                            {formatPHP(item.price)}
                          </span>
                        ) : null}
                        <span
                          className={cn(
                            "font-semibold",
                            isOwned
                              ? "text-emerald-600 line-through"
                              : "text-foreground",
                          )}
                        >
                          {formatPHP(item.effectivePrice)}
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}
              <li className="flex items-center justify-between gap-3 bg-secondary/60 px-3 py-2.5 text-sm font-bold">
                <span>Your Price ({servings} pax)</span>
                <span className="tabular-nums text-primary">
                  {formatPHP(priced.yourPrice)}
                </span>
              </li>
            </ul>
            <p className="mt-2 text-xs font-medium text-muted-foreground">
              {priceProvenance(dish.price_asof)}
            </p>
            <p className="mt-1 text-xs italic text-muted-foreground">
              {DISCLAIMER}
            </p>
          </section>

          {/* Instructions */}
          <section>
            <h4 className="mb-3 text-base font-bold text-foreground">
              Paraan ng Pagluluto
            </h4>
            <ol className="space-y-3">
              {dish.instructions.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <span className="pt-0.5 text-foreground/90">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <Badge variant="outline">
            <Clock className="mr-1 h-3 w-3" />
            {formatMins(dish.prep_time_mins)}
          </Badge>
        </div>
      </SheetContent>
    </Sheet>
  );
}
