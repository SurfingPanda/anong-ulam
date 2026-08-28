"use client";

import {
  Clock,
  ChevronRight,
  Receipt,
  Sprout,
  ArrowLeftRight,
  ListPlus,
  Check,
} from "lucide-react";

import { DishImage } from "@/components/dish-image";
import { ServingsStepper } from "@/components/servings-stepper";
import { cn, formatMins, formatPHP } from "@/lib/utils";
import type { Dish } from "@/lib/mock-ulam-data";
import type { PricedDish } from "@/lib/pricing-engine";

interface UlamCardProps {
  dish: Dish;
  priced: PricedDish;
  budget: number;
  servings: number;
  onServingsChange: (next: number) => void;
  isSelected: boolean;
  onToggleSelect: () => void;
  onOpen: () => void;
}

const HOT_RE =
  /sinigang|bulalo|sopas|tinola|nilaga|bulanglang|law-uy|munggo|monggo|lugaw|arroz caldo/i;

function kusinaBadge(category: string): { label: string; className: string } {
  switch (category) {
    case "Tipid":
      return {
        label: "Tipid Mode",
        className: "bg-leaf text-leaf-foreground",
      };
    case "Gulay":
      return {
        label: "Gulay Day",
        className: "bg-leaf-bright text-white",
      };
    case "Pang-Pasko":
      return { label: "Pang-Pasko", className: "bg-primary text-primary-foreground" };
    case "Pang-Almusal":
      return { label: "Almusal", className: "bg-gold text-primary" };
    case "Lutong Bahay":
    default:
      return {
        label: "Lutong Bahay",
        className: "bg-accent text-accent-foreground",
      };
  }
}

export function UlamCard({
  dish,
  priced,
  budget,
  servings,
  onServingsChange,
  isSelected,
  onToggleSelect,
  onOpen,
}: UlamCardProps) {
  const hasPantry = priced.pantrySavings > 0;
  const hasSwap = priced.swapSavings > 0;
  const withinBudget = priced.yourPrice <= budget;
  const isHot = HOT_RE.test(dish.name);
  const badge = kusinaBadge(dish.category);

  return (
    <div
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border-2 bg-card transition-all duration-200",
        "hover:-translate-y-1.5 hover:shadow-glow",
        isSelected
          ? "border-leaf shadow-glow"
          : "border-primary/10 shadow-card",
      )}
    >
      <button
        type="button"
        onClick={onOpen}
        className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-label={`Tingnan ang breakdown ng presyo para sa ${dish.name}`}
      >
        <div className="relative">
          <DishImage
            dish={dish}
            className="h-40 rounded-t-[0.9rem] text-6xl shadow-[inset_0_-30px_40px_-24px_rgba(0,0,0,0.35)]"
          />

          {/* animated steam over hot meals */}
          {isHot ? (
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-6 flex -translate-x-1/2 gap-2"
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="block h-5 w-1 rounded-full bg-white/70 animate-steam"
                  style={{ animationDelay: `${i * -0.7}s` }}
                />
              ))}
            </div>
          ) : null}

          {/* kusina badges */}
          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 font-display text-xs font-extrabold shadow-sm",
                badge.className,
              )}
            >
              {badge.label}
            </span>
            {hasPantry ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-leaf-bright px-2 py-0.5 font-display text-[11px] font-extrabold text-white shadow-sm">
                <Sprout className="h-3 w-3" />
                {formatPHP(priced.pantrySavings)} Pantry
              </span>
            ) : null}
            {hasSwap ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 font-display text-[11px] font-extrabold text-primary-foreground shadow-sm">
                <ArrowLeftRight className="h-3 w-3" />
                Tipid Swap
              </span>
            ) : null}
          </div>

          {/* palengke chalkboard price sticker */}
          <div className="absolute right-3 top-3 rotate-6 transition-transform duration-200 group-hover:rotate-2">
            <span className="block rounded-lg bg-[hsl(var(--chalkboard))] px-2.5 py-1 font-display text-sm font-extrabold text-gold shadow-sticker ring-2 ring-white/20">
              {formatPHP(priced.srpTotal)}
            </span>
          </div>
        </div>

        <div className="flex items-start justify-between gap-2 px-4 pt-4">
          <h3 className="font-display text-lg font-extrabold leading-tight text-foreground group-hover:text-primary">
            {dish.name}
          </h3>
        </div>
      </button>

      <div className="flex flex-1 flex-col gap-3 p-4 pt-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatMins(dish.prep_time_mins)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Receipt className="h-4 w-4" />
            {priced.ingredients.length} sangkap
          </span>
        </div>

        <ServingsStepper value={servings} onChange={onServingsChange} />

        {/* dual pricing */}
        <div className="rounded-xl bg-secondary/50 p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-muted-foreground">
              SRP ({priced.priceMode === "supermarket" ? "Supermarket" : "Palengke"})
            </span>
            <span
              className={cn(
                "font-bold tabular-nums",
                priced.totalSavings > 0 &&
                  "text-muted-foreground line-through decoration-1",
              )}
            >
              {formatPHP(priced.srpTotal)}
            </span>
          </div>
          <div className="mt-0.5 flex items-center justify-between">
            <span className="font-display text-sm font-extrabold text-foreground">
              Your Price
            </span>
            <span
              className={cn(
                "font-display text-lg font-extrabold tabular-nums",
                withinBudget ? "text-leaf-bright" : "text-destructive",
              )}
            >
              {formatPHP(priced.yourPrice)}
            </span>
          </div>
          {priced.totalSavings > 0 ? (
            <p className="mt-1 text-right text-xs font-semibold text-muted-foreground">
              {hasPantry ? `− ${formatPHP(priced.pantrySavings)} pantry` : ""}
              {hasPantry && hasSwap ? " · " : ""}
              {hasSwap ? `− ${formatPHP(priced.swapSavings)} swap` : ""}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onToggleSelect}
          aria-pressed={isSelected}
          className={cn(
            "flex items-center gap-2 rounded-full border-2 px-3 py-1.5 font-display text-sm font-bold transition-colors",
            isSelected
              ? "border-leaf bg-leaf text-leaf-foreground"
              : "border-primary/20 text-foreground hover:border-primary/50",
          )}
        >
          {isSelected ? (
            <Check className="h-4 w-4" strokeWidth={3} />
          ) : (
            <ListPlus className="h-4 w-4 text-primary" />
          )}
          {isSelected ? "Nasa Palengke List" : "Isama sa Palengke List"}
        </button>

        <button
          type="button"
          onClick={onOpen}
          className="mt-auto inline-flex items-center gap-1 pt-1 font-display text-sm font-extrabold text-primary hover:gap-2"
        >
          Tingnan ang presyo at recipe
          <ChevronRight className="h-4 w-4" strokeWidth={2.75} />
        </button>
      </div>
    </div>
  );
}
