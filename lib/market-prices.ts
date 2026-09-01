/**
 * Live commodity prices — the layer that turns hardcoded `est_market_price_php`
 * estimates into numbers backed by a real source.
 *
 * Flow:
 *   1. `app/api/cron/refresh-prices` parses the DA Bantay Presyo PDFs (see
 *      `lib/sources/da.ts`) and upserts one `market_prices` row per commodity.
 *   2. The server actions call `loadMarketPrices()` and `overlayDishPrices()` so
 *      each dish is priced from the freshest row available.
 *   3. Any ingredient we can't map to a commodity, or can't convert to the
 *      commodity's unit, keeps its original estimate — nothing ever breaks.
 *
 * This file is the single source of truth for the commodity catalog. It is
 * imported by both the cron route (Node) and the server actions.
 */

import type { Dish, Ingredient } from "@/lib/mock-ulam-data";

/**
 * DA is the only live feed. `psa` is retained in the union (and the DB CHECK
 * constraint) for a future backstop — PSA's OpenSTAT API tables are currently
 * unpopulated so nothing emits it.
 */
export type MarketSource = "da-daily" | "da-weekly" | "psa";
export type CanonicalUnit = "kg" | "pc" | "L";

export interface MarketPriceRow {
  commodity_key: string;
  region: string;
  unit: CanonicalUnit;
  price_php: number;
  source: MarketSource;
  /** ISO date (YYYY-MM-DD) the figure represents. */
  as_of: string;
}

/** How the DA PDF parser should locate this commodity's row(s). */
interface DaMatch {
  /** Section header (ALL CAPS line) the row must sit under, if ambiguous. */
  section?: RegExp;
  /** Matches the label portion (before the first column break) of a row. */
  label: RegExp;
  /** Rows to ignore even if `label` matched. */
  exclude?: RegExp;
  /** If a matched row also matches this, use it outright instead of the median. */
  prefer?: RegExp;
}

export interface Commodity {
  key: string;
  label: string;
  /** Unit that `price_php` is quoted in. */
  unit: CanonicalUnit;
  /** Lowercase substrings matched against an ingredient's `item_name`. */
  keywords: string[];
  /** If the item name contains any of these, it is NOT this commodity. */
  exclude?: string[];
  /** Plausible price band in `unit`; a parsed value outside this is discarded. */
  band: [min: number, max: number];
  /** Grams per piece — lets `pc`/`pcs`/`piece` ingredient rows convert to kg. */
  gramsPerPiece?: number;
  /** Grams for other odd units (clove, head, thumb, bunch, …). */
  gramsByUnit?: Record<string, number>;
  /** DA Bantay Presyo PDF locators. */
  da?: DaMatch;
}

/**
 * ~22 commodities — the ones that actually move a dish total. Seasonings and
 * processed goods (patis, toyo, bagoong, hotdog, keso, …) are deliberately
 * absent: no reliable public source, and they're cents on the peso anyway.
 */
export const COMMODITIES: Commodity[] = [
  {
    key: "beef",
    label: "Beef / karne ng baka",
    unit: "kg",
    keywords: ["baka", "beef", "buntot ng baka", "carabeef"],
    band: [180, 800],
    gramsByUnit: { thumb: 20 },
    da: {
      label: /^(beef|carabeef).*local/i,
      exclude: /imported|tongue|offal|liver|tripe/i,
      prefer: /brisket.*local|meat with bones.*local/i,
    },
  },
  {
    key: "pork",
    label: "Pork / baboy",
    unit: "kg",
    keywords: [
      "baboy",
      "liempo",
      "kasim",
      "pigue",
      "pork",
      "giniling na baboy",
      "pork belly",
      "buto-buto",
      "buto buto",
      "pata",
    ],
    exclude: ["baka", "manok", "chicken"],
    band: [150, 700],
    da: {
      label: /^pork.*local/i,
      exclude: /imported|rind|skin|offal|head|spare ribs/i,
      prefer: /picnic shoulder \(kasim\).*local/i,
    },
  },
  {
    key: "chicken",
    label: "Chicken / manok",
    unit: "kg",
    keywords: ["manok", "chicken"],
    band: [120, 400],
    da: {
      // median across all local chicken rows (parts + whole) — recipes that say
      // "manok" usually mean cut-up chicken, priced above whole.
      label: /^(whole chicken|chicken (breast|thigh|leg|drumstick|wing)).*local/i,
      exclude: /imported|rind|skin|feet|liver|neck/i,
    },
  },
  {
    key: "chicken-egg",
    label: "Egg / itlog",
    unit: "pc",
    keywords: ["itlog"],
    exclude: ["maalat", "pula", "balut", "century", "pugo"],
    band: [5, 15],
    da: { label: /^chicken egg \(white, medium\)/i },
  },
  {
    key: "mung-bean",
    label: "Mung bean / munggo",
    unit: "kg",
    keywords: ["munggo", "monggo", "mung bean", "mungbean", "mung beans"],
    band: [80, 260],
    da: { label: /^mungbean/i },
  },
  {
    key: "rice",
    label: "Rice / bigas",
    unit: "kg",
    keywords: ["bigas", "kanin", "rice"],
    exclude: ["toasted", "giniling"],
    band: [30, 90],
    gramsByUnit: { cup: 200 },
    da: {
      section: /local commercial rice/i,
      label: /^well milled/i,
    },
  },
  {
    key: "garlic",
    label: "Garlic / bawang",
    unit: "kg",
    keywords: ["bawang", "garlic"],
    band: [80, 500],
    gramsByUnit: { clove: 5, cloves: 5, head: 50, thumb: 20 },
    da: { label: /^garlic, native\/local/i },
  },
  {
    key: "red-onion",
    label: "Onion / sibuyas",
    unit: "kg",
    keywords: ["sibuyas", "onion"],
    exclude: ["dahon", "spring", "leek", "sibuyas na mura", "spring onion"],
    band: [40, 260],
    gramsPerPiece: 100,
    da: { label: /^red onion, local/i },
  },
  {
    key: "ginger",
    label: "Ginger / luya",
    unit: "kg",
    keywords: ["luya", "ginger"],
    band: [60, 320],
    gramsByUnit: { thumb: 22, thumbs: 22 },
    da: { label: /^ginger, local/i },
  },
  {
    key: "tomato",
    label: "Tomato / kamatis",
    unit: "kg",
    keywords: ["kamatis", "tomato"],
    exclude: ["sauce", "paste", "ketchup"],
    band: [25, 220],
    gramsPerPiece: 60,
    da: { label: /^tomato/i },
  },
  {
    key: "eggplant",
    label: "Eggplant / talong",
    unit: "kg",
    keywords: ["talong", "eggplant"],
    band: [30, 260],
    gramsPerPiece: 95,
    da: { label: /^eggplant/i },
  },
  {
    key: "squash",
    label: "Squash / kalabasa",
    unit: "kg",
    keywords: ["kalabasa", "squash"],
    band: [25, 160],
    gramsByUnit: { piece: 1500, pc: 1500, pcs: 1500 },
    da: { label: /^squash/i },
  },
  {
    key: "string-beans",
    label: "String beans / sitaw",
    unit: "kg",
    keywords: ["sitaw", "sitao", "string bean", "pole sitao"],
    band: [40, 220],
    gramsByUnit: { bunch: 200, bundle: 200 },
    da: { label: /^pole sitao/i },
  },
  {
    key: "chayote",
    label: "Chayote / sayote",
    unit: "kg",
    keywords: ["sayote", "chayote"],
    band: [20, 160],
    gramsPerPiece: 200,
    da: { label: /^chayote/i },
  },
  {
    key: "potato",
    label: "Potato / patatas",
    unit: "kg",
    keywords: ["patatas", "potato"],
    band: [60, 260],
    gramsPerPiece: 130,
    da: { label: /^white potato, local/i },
  },
  {
    key: "carrot",
    label: "Carrot / karot",
    unit: "kg",
    keywords: ["karot", "carrot"],
    band: [50, 220],
    gramsPerPiece: 120,
    da: { label: /^carrots?, local/i },
  },
  {
    key: "pechay",
    label: "Pechay",
    unit: "kg",
    keywords: ["pechay", "bok choy", "petchay"],
    band: [40, 260],
    gramsByUnit: { bunch: 250, bundle: 250 },
    da: { label: /^native pechay/i },
  },
  {
    key: "cabbage",
    label: "Cabbage / repolyo",
    unit: "kg",
    keywords: ["repolyo", "cabbage"],
    band: [40, 220],
    gramsPerPiece: 800,
    da: { label: /^cabbage \(.*ball\)/i },
  },
  {
    key: "kangkong",
    label: "Kangkong",
    unit: "kg",
    keywords: ["kangkong", "water spinach", "swamp cabbage"],
    band: [30, 200],
    gramsByUnit: { bunch: 200, bundle: 200 },
  },
  {
    key: "bell-pepper",
    label: "Bell pepper / atsal",
    unit: "kg",
    keywords: ["bell pepper", "atsal", "capsicum"],
    band: [80, 400],
    gramsPerPiece: 120,
    da: { label: /^bell pepper \(green\), local/i },
  },
  {
    key: "chili",
    label: "Chili / sili",
    unit: "kg",
    keywords: ["sili", "chili", "chilli", "siling"],
    exclude: ["dahon", "bell pepper"],
    band: [80, 600],
    da: { label: /^chilli \(green\), local/i },
  },
  {
    key: "sugar",
    label: "Sugar / asukal",
    unit: "kg",
    keywords: ["asukal", "sugar"],
    band: [45, 130],
    gramsByUnit: { cup: 200, tbsp: 12, tsp: 4 },
    da: { label: /^sugar \((washed|brown|refined)\)/i },
  },
  {
    key: "cooking-oil",
    label: "Cooking oil / mantika",
    unit: "L",
    keywords: ["mantika", "cooking oil", "vegetable oil", "canola", "langis"],
    band: [60, 260],
    da: {
      label: /^cooking oil \(palm\)/i,
      prefer: /1 liter\/bottle/i,
    },
  },
];

const COMMODITY_BY_KEY = new Map(COMMODITIES.map((c) => [c.key, c]));

/** Map an ingredient name to a commodity, or `null` if we don't track it. */
export function matchCommodity(itemName: string): Commodity | null {
  const n = itemName.toLowerCase();
  for (const c of COMMODITIES) {
    if (c.exclude?.some((x) => n.includes(x))) continue;
    if (c.keywords.some((k) => n.includes(k))) return c;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Unit conversion — ingredient `amount`/`unit` -> the commodity's canonical unit
// ---------------------------------------------------------------------------

function normUnit(unit: string): string {
  return unit.trim().toLowerCase().replace(/\.$/, "");
}

const GRAMS: Record<string, number> = {
  g: 1,
  gram: 1,
  grams: 1,
  gm: 1,
  kg: 1000,
  kilo: 1000,
  kilos: 1000,
  kilogram: 1000,
  kilograms: 1000,
};

const ML: Record<string, number> = {
  ml: 1,
  milliliter: 1,
  milliliters: 1,
  l: 1000,
  liter: 1000,
  liters: 1000,
  litre: 1000,
  cup: 240,
  cups: 240,
  tbsp: 15,
  tablespoon: 15,
  tablespoons: 15,
  tsp: 5,
  teaspoon: 5,
  teaspoons: 5,
};

/** Grams for `amount` of `unit` of `commodity`, or null if not convertible. */
function toGrams(amount: number, unit: string, c: Commodity): number | null {
  const u = normUnit(unit);
  if (GRAMS[u] != null) return amount * GRAMS[u];
  if ((u === "pc" || u === "pcs" || u === "piece" || u === "pieces") && c.gramsPerPiece)
    return amount * c.gramsPerPiece;
  const byUnit = c.gramsByUnit?.[u];
  if (byUnit != null) return amount * byUnit;
  return null;
}

function toPieces(amount: number, unit: string): number | null {
  const u = normUnit(unit);
  if (u === "pc" || u === "pcs" || u === "piece" || u === "pieces" || u === "") return amount;
  return null;
}

function toLiters(amount: number, unit: string): number | null {
  const u = normUnit(unit);
  if (ML[u] != null) return (amount * ML[u]) / 1000;
  return null;
}

/**
 * What `ingredient` should cost at `row`'s price, or null if the units don't
 * line up (caller keeps the estimate).
 */
export function marketPriceForIngredient(
  ing: Pick<Ingredient, "amount" | "unit">,
  c: Commodity,
  row: MarketPriceRow,
): number | null {
  if (!(row.price_php > 0)) return null;
  let value: number | null = null;
  if (c.unit === "kg") {
    const g = toGrams(ing.amount, ing.unit, c);
    value = g == null ? null : (row.price_php * g) / 1000;
  } else if (c.unit === "pc") {
    const p = toPieces(ing.amount, ing.unit);
    value = p == null ? null : row.price_php * p;
  } else if (c.unit === "L") {
    const l = toLiters(ing.amount, ing.unit);
    value = l == null ? null : row.price_php * l;
  }
  if (value == null || !Number.isFinite(value) || value <= 0) return null;
  return Math.round(value * 100) / 100;
}

// ---------------------------------------------------------------------------
// Row selection — pick the single best row per commodity
// ---------------------------------------------------------------------------

/** A source's figure is ignored once it's older than this many days. */
export const MARKET_FRESHNESS_DAYS: Record<MarketSource, number> = {
  "da-daily": 12,
  "da-weekly": 24,
  psa: 120,
};

const SOURCE_RANK: Record<MarketSource, number> = {
  "da-daily": 3,
  "da-weekly": 2,
  psa: 1,
};

function ageInDays(iso: string, now: Date): number {
  const then = new Date(`${iso}T00:00:00Z`).getTime();
  return (now.getTime() - then) / 86_400_000;
}

/**
 * Reduce raw rows to one per commodity: drop stale ones, then prefer the
 * higher-ranked source, then the more recent date.
 */
export function pickBestRows(
  rows: MarketPriceRow[],
  now: Date = new Date(),
): Map<string, MarketPriceRow> {
  const best = new Map<string, MarketPriceRow>();
  for (const row of rows) {
    const c = COMMODITY_BY_KEY.get(row.commodity_key);
    if (!c) continue;
    const age = ageInDays(row.as_of, now);
    if (age < -2 || age > MARKET_FRESHNESS_DAYS[row.source]) continue;
    if (row.price_php < c.band[0] || row.price_php > c.band[1]) continue;

    const cur = best.get(row.commodity_key);
    if (
      !cur ||
      SOURCE_RANK[row.source] > SOURCE_RANK[cur.source] ||
      (SOURCE_RANK[row.source] === SOURCE_RANK[cur.source] && row.as_of > cur.as_of)
    ) {
      best.set(row.commodity_key, row);
    }
  }
  return best;
}

// ---------------------------------------------------------------------------
// Dish overlay
// ---------------------------------------------------------------------------

/**
 * Return a copy of `dish` with every mappable, unit-convertible ingredient
 * repriced from `marketByKey`, `est_total_cost` recomputed, and provenance
 * fields set. Ingredients with no fresh/convertible price keep their estimate.
 */
export function overlayDishPrices(
  dish: Dish,
  marketByKey: Map<string, MarketPriceRow>,
): Dish {
  if (marketByKey.size === 0) return dish;

  let anyMarket = false;
  let anyEstimate = false;
  let latestAsOf: string | null = null;

  const ingredients = dish.ingredients.map((ing) => {
    const c = matchCommodity(ing.item_name);
    const row = c ? marketByKey.get(c.key) : undefined;
    const priced = c && row ? marketPriceForIngredient(ing, c, row) : null;

    if (priced != null && row) {
      anyMarket = true;
      if (!latestAsOf || row.as_of > latestAsOf) latestAsOf = row.as_of;
      return { ...ing, est_market_price_php: priced, price_source: "market" as const };
    }
    anyEstimate = true;
    return { ...ing, price_source: "estimate" as const };
  });

  if (!anyMarket) return dish;

  const est_total_cost =
    Math.round(ingredients.reduce((s, i) => s + i.est_market_price_php, 0) * 100) / 100;

  return {
    ...dish,
    ingredients,
    est_total_cost,
    price_asof: latestAsOf,
    price_source: anyEstimate ? "mixed" : "market",
  };
}

/** Overlay a list of dishes in one call. */
export function overlayDishesPrices(
  dishes: Dish[],
  marketByKey: Map<string, MarketPriceRow>,
): Dish[] {
  if (marketByKey.size === 0) return dishes;
  return dishes.map((d) => overlayDishPrices(d, marketByKey));
}
