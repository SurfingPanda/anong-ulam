"use server";

import { supabase } from "@/lib/supabase/client";
import {
  MOCK_DISHES,
  HYPER_BUDGET_STAPLES,
  type Dish,
} from "@/lib/mock-ulam-data";
import { regionMultiplier, type RegionId } from "@/lib/pricing-engine";
import { geminiConfigured } from "@/lib/gemini";
import { overlayDishesPrices } from "@/lib/market-prices";
import { loadMarketPrices } from "@/lib/market-prices.server";

export type UlamSource = "database" | "mock" | "ai" | "staples";

export interface GenerateUlamResult {
  ok: boolean;
  /** Present only when ok === false. */
  error?: string;
  /** The user's entered budget (for display). */
  budget: number;
  /** The region the budget was stretched against. */
  region: RegionId;
  source: UlamSource;
  /** Friendly context line for the UI (fallback reason, tips, etc.). */
  note?: string;
  /**
   * When true, `dishes` are the instant dataset results AND the client should
   * call `streamAiUlam()` to stream extra AI-generated dishes in on top of them
   * (Gemini key present). The AI dishes are additive, not a replacement.
   */
  streaming?: boolean;
  /**
   * Dish names already known for this budget (DB + bundled) — passed to the AI
   * stream so it doesn't re-propose things we already have.
   */
  excludeNames: string[];
  dishes: Dish[];
  /**
   * Newest `as_of` (ISO date) among the live DA/PSA prices applied to `dishes`,
   * or null when everything is still a hardcoded estimate.
   */
  priceAsOf?: string | null;
}

const HYPER_BUDGET_THRESHOLD = 50; // ₱ — below this we suggest staples only
const MAX_RESULTS = 6;
const SPARSE_THRESHOLD = 2; // fewer than this triggers the low-cost default set
/**
 * Only stream extra AI dishes when the catalog has FEWER than this many
 * affordable dishes for the budget. Once a budget bracket fills up, searches
 * there are fully instant (no AI wait). Set to a higher number to keep AI
 * contributing longer.
 */
const AI_STREAM_THRESHOLD = 5;

const VALIDATION_ERROR = "Please enter a valid budget in PHP.";

/**
 * Budget -> ranked affordable dishes (with full ingredient rows). All the
 * downstream math — servings scaling, Palengke/Supermarket price mode, Pantry
 * Check, Tipid Swaps — happens client-side in `lib/pricing.ts`, so this action
 * only runs when the budget itself changes.
 *
 * Resolution order:
 *   1. Validate the budget (zero / negative / NaN -> error).
 *   2. Budget < ₱50 -> hyper-budget staples + stretch tip (AI streams if on).
 *   3. Query Supabase (approved rows) for dishes at or under budget.
 *   4. Fall back to the bundled mock dataset when the DB is unavailable.
 *   5. `streaming` is set only when Gemini is configured AND the catalog has
 *      fewer than AI_STREAM_THRESHOLD affordable dishes for this budget — so a
 *      full bracket is served instantly with no AI wait.
 *   6. If almost nothing matches -> also show the 3 cheapest bundled dishes.
 */
export async function generateUlam(
  budgetInput:
    | number
    | string
    | { budgetPhp: number | string; region?: RegionId },
): Promise<GenerateUlamResult> {
  const raw =
    typeof budgetInput === "object" ? budgetInput.budgetPhp : budgetInput;
  const region: RegionId =
    (typeof budgetInput === "object" && budgetInput.region) || "ncr";
  const budget = typeof raw === "number" ? raw : Number(raw);

  // 1. Validation — zero, negative, empty, or non-numeric
  if (!Number.isFinite(budget) || budget <= 0) {
    return {
      ok: false,
      error: VALIDATION_ERROR,
      budget: 0,
      region,
      source: "mock",
      excludeNames: [],
      dishes: [],
    };
  }

  const roundedBudget = Math.round(budget);
  // A cheaper region stretches the budget: ₱300 in a 0.92 region buys ~₱326 of
  // NCR-priced ingredients. Dishes are filtered against this stretched figure.
  const effectiveBudget = Math.round(roundedBudget / regionMultiplier(region));

  // Live DA/PSA prices (empty map when Supabase / the cron aren't set up — then
  // `overlayDishesPrices` is a no-op and every price stays the hardcoded guess).
  const marketByKey = await loadMarketPrices();
  const withMarket = (dishes: Dish[]): Dish[] =>
    overlayDishesPrices(dishes, marketByKey);
  const latestAsOf = (dishes: Dish[]): string | null =>
    dishes.reduce<string | null>(
      (m, d) => (d.price_asof && (!m || d.price_asof > m) ? d.price_asof : m),
      null,
    );

  // 2. Edge case: hyper-low budget — only 3 staples, so AI always helps here.
  if (roundedBudget < HYPER_BUDGET_THRESHOLD) {
    const affordable = HYPER_BUDGET_STAPLES.filter(
      (d) => d.est_total_cost <= effectiveBudget,
    );
    const dishes = withMarket(
      affordable.length > 0 ? affordable : HYPER_BUDGET_STAPLES,
    );
    return {
      ok: true,
      budget: roundedBudget,
      region,
      source: "staples",
      streaming: geminiConfigured,
      excludeNames: HYPER_BUDGET_STAPLES.map((d) => d.name),
      note: "Sobrang tipid na budget — pero kaya pa! Tip: magdagdag ng ₱30–₱50 para may maisama nang gulay o karne.",
      dishes,
      priceAsOf: latestAsOf(dishes),
    };
  }

  // 3. Try Supabase (approved dishes only)
  let dbDishes: Dish[] | null = null;
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("dishes")
        .select(
          "id, name, category, est_total_cost, prep_time_mins, servings, instructions, image_url, ingredients(id, dish_id, item_name, amount, unit, est_market_price_php, substitution_name, substitution_savings_php)",
        )
        .eq("approved", true)
        .lte("est_total_cost", effectiveBudget)
        .order("est_total_cost", { ascending: false })
        .limit(24);

      if (!error && Array.isArray(data)) {
        dbDishes = data as unknown as Dish[];
      }
    } catch {
      dbDishes = null;
    }
  }

  // 4. Fall back to bundled data when the DB is not available
  const pool: Dish[] =
    dbDishes ?? MOCK_DISHES.filter((d) => d.est_total_cost <= effectiveBudget);
  const usingDb = dbDishes !== null;

  // Everything already known in this budget range (DB rows + bundled) — the AI
  // stream is told to avoid these so it adds genuinely new dishes.
  const excludeNames = [
    ...new Set([
      ...pool.map((d) => d.name),
      ...MOCK_DISHES.filter((d) => d.est_total_cost <= effectiveBudget).map(
        (d) => d.name,
      ),
    ]),
  ].slice(0, 40);

  const affordable = pool.filter((d) => d.est_total_cost <= effectiveBudget);

  // Only stream AI when this budget bracket is still thin in the catalog.
  const canStream =
    geminiConfigured && affordable.length < AI_STREAM_THRESHOLD;

  // Rank: best use of budget first (highest cost <= budget), quicker cook breaks
  // ties. Live prices are overlaid first, then we rank on the real total.
  const ranked = withMarket(
    [...affordable]
      .sort(
        (a, b) =>
          b.est_total_cost - a.est_total_cost ||
          a.prep_time_mins - b.prep_time_mins,
      )
      .slice(0, MAX_RESULTS),
  ).sort(
    (a, b) =>
      b.est_total_cost - a.est_total_cost || a.prep_time_mins - b.prep_time_mins,
  );

  // 5. Too few exact matches -> show the 3 cheapest as a starting point.
  //    The AI stream (below, when configured) fills the rest of the grid.
  if (ranked.length < SPARSE_THRESHOLD) {
    const defaults = withMarket(
      [...MOCK_DISHES].sort((a, b) => a.est_total_cost - b.est_total_cost).slice(0, 3),
    );
    return {
      ok: true,
      budget: roundedBudget,
      region,
      source: "mock",
      streaming: canStream,
      excludeNames,
      note: canStream
        ? "Kaunti ang eksaktong tugma sa budget na ito — ito muna, may dagdag pang ideya ang AI. ✨"
        : "Kakaunti ang direktang tugma sa budget na ito — ito ang pinaka-abot-kayang mga opsyon.",
      dishes: defaults,
      priceAsOf: latestAsOf(defaults),
    };
  }

  return {
    ok: true,
    budget: roundedBudget,
    region,
    source: usingDb ? "database" : "mock",
    streaming: canStream,
    excludeNames,
    note: canStream
      ? "May dagdag pang ideya ang AI para sa budget na ito. ✨"
      : undefined,
    dishes: ranked,
    priceAsOf: latestAsOf(ranked),
  };
}
