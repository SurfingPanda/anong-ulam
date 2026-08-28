/**
 * Client-side pricing engine. Given a raw dish and the user's live controls
 * (servings, price mode, region, pantry, applied Tipid Swaps) it produces every
 * number the UI needs — instantly, with no server round-trip.
 *
 * Total price multiplier = servingsFactor × priceMode × region.
 */

import type { Dish, Ingredient } from "@/lib/mock-ulam-data";
import { ingredientInPantry } from "@/lib/pantry";

export type PriceMode = "palengke" | "supermarket";

/** Supermarket prices run ~15–20% above wet-market; we use +18%. */
export const SUPERMARKET_MULTIPLIER = 1.18;

export const PRICE_MODE_META: Record<
  PriceMode,
  { label: string; short: string; multiplier: number }
> = {
  palengke: { label: "Wet Market / Palengke", short: "Palengke", multiplier: 1 },
  supermarket: {
    label: "Supermarket (+18%)",
    short: "Supermarket",
    multiplier: SUPERMARKET_MULTIPLIER,
  },
};

/** Regional cost-of-living multipliers, relative to Metro Manila (NCR = 1.00). */
export type RegionId = "ncr" | "luzon" | "visayas" | "mindanao";

export const REGIONS: {
  id: RegionId;
  label: string;
  short: string;
  multiplier: number;
}[] = [
  { id: "ncr", label: "NCR / Metro Manila", short: "NCR", multiplier: 1 },
  {
    id: "luzon",
    label: "Probinsya / Local Palengke (Luzon)",
    short: "Luzon",
    multiplier: 0.92,
  },
  { id: "visayas", label: "Visayas", short: "Visayas", multiplier: 0.95 },
  { id: "mindanao", label: "Mindanao", short: "Mindanao", multiplier: 0.93 },
];

export const regionMultiplier = (id: RegionId) =>
  REGIONS.find((r) => r.id === id)?.multiplier ?? 1;

export interface PricedIngredient {
  index: number;
  /** Effective name — the swap name when a Tipid Swap is applied. */
  name: string;
  originalName: string;
  /** Quantity scaled to the chosen servings. */
  amount: number;
  unit: string;
  /** Full price for this row (all multipliers), swap NOT applied. */
  price: number;
  /** What you actually pay for this row (swap applied if any). */
  effectivePrice: number;
  inPantry: boolean;
  hasSwap: boolean;
  swapName: string | null;
  /** Swap saving, with all multipliers applied. */
  swapSavings: number;
  swapApplied: boolean;
}

export interface PricedDish {
  id: string;
  servings: number;
  baseServings: number;
  priceMode: PriceMode;
  region: RegionId;
  ingredients: PricedIngredient[];
  /** Full price at the chosen servings + mode + region (no pantry, no swaps). */
  srpTotal: number;
  /** Total knocked off by applied Tipid Swaps. */
  swapSavings: number;
  /** Total covered by the pantry selection. */
  pantrySavings: number;
  /** srpTotal − swapSavings − pantrySavings, floored at 0. */
  yourPrice: number;
  /** srpTotal − yourPrice. */
  totalSavings: number;
}

export interface PriceOptions {
  servings: number;
  priceMode: PriceMode;
  region: RegionId;
  /** Pantry staples the user owns, matched against ingredient names. */
  pantryKeywords: string[];
  /** Ingredient indices force-marked as already-owned (drawer checkboxes). */
  pantryIndices?: number[];
  /** Ingredient indices whose Tipid Swap the user has applied. */
  appliedSwaps: number[];
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

function priceIngredientWithFactor(
  ing: Ingredient,
  index: number,
  opts: PriceOptions,
  factor: number,
): PricedIngredient {
  const scale =
    factor *
    PRICE_MODE_META[opts.priceMode].multiplier *
    regionMultiplier(opts.region);

  const price = round2(ing.est_market_price_php * scale);
  const hasSwap =
    !!ing.substitution_name && (ing.substitution_savings_php ?? 0) > 0;
  const swapSavings = hasSwap
    ? round2((ing.substitution_savings_php as number) * scale)
    : 0;
  const swapApplied = hasSwap && opts.appliedSwaps.includes(index);

  const name = swapApplied ? (ing.substitution_name as string) : ing.item_name;
  const effectivePrice = swapApplied
    ? Math.max(0, round2(price - swapSavings))
    : price;

  return {
    index,
    name,
    originalName: ing.item_name,
    amount: round2(ing.amount * factor),
    unit: ing.unit,
    price,
    effectivePrice,
    inPantry:
      (opts.pantryIndices?.includes(index) ?? false) ||
      Boolean(ingredientInPantry(name, opts.pantryKeywords)),
    hasSwap,
    swapName: ing.substitution_name ?? null,
    swapSavings,
    swapApplied,
  };
}

export function priceDish(dish: Dish, opts: PriceOptions): PricedDish {
  const baseServings = dish.servings || 4;
  const factor = opts.servings / baseServings;

  const ingredients = dish.ingredients.map((ing, i) =>
    priceIngredientWithFactor(ing, i, opts, factor),
  );

  const srpTotal = round2(ingredients.reduce((sum, i) => sum + i.price, 0));
  const withSwaps = round2(
    ingredients.reduce((sum, i) => sum + i.effectivePrice, 0),
  );
  const swapSavings = round2(srpTotal - withSwaps);
  const pantrySavings = round2(
    ingredients.reduce((sum, i) => sum + (i.inPantry ? i.effectivePrice : 0), 0),
  );
  const yourPrice = Math.max(0, round2(withSwaps - pantrySavings));

  return {
    id: dish.id,
    servings: opts.servings,
    baseServings,
    priceMode: opts.priceMode,
    region: opts.region,
    ingredients,
    srpTotal,
    swapSavings,
    pantrySavings,
    yourPrice,
    totalSavings: round2(srpTotal - yourPrice),
  };
}

/** Trim trailing zeros: 0.5 -> "0.5", 3 -> "3", 1.25 -> "1.25". */
export function formatQty(n: number): string {
  return String(Math.round(n * 100) / 100);
}
