/**
 * Server-side loader for the freshest `market_prices` rows. Kept separate from
 * `lib/market-prices.ts` (the pure catalog) so the catalog stays importable from
 * client components without pulling in the Supabase client.
 */

import { supabase } from "@/lib/supabase/client";
import {
  pickBestRows,
  type MarketPriceRow,
  type MarketSource,
  type CanonicalUnit,
} from "@/lib/market-prices";

const TTL_MS = 10 * 60 * 1000; // 10 min — prices only change daily/weekly
const EMPTY_TTL_MS = 60 * 1000; // don't hammer the DB when it's unavailable

let cache: { at: number; map: Map<string, MarketPriceRow> } | null = null;

/**
 * The best current price row per commodity, keyed by `commodity_key`. Returns an
 * empty map when Supabase isn't configured, the query fails, or the table is
 * empty — callers then fall back to the hardcoded estimates.
 */
export async function loadMarketPrices(): Promise<Map<string, MarketPriceRow>> {
  const now = Date.now();
  if (cache && now - cache.at < (cache.map.size === 0 ? EMPTY_TTL_MS : TTL_MS)) {
    return cache.map;
  }

  let map = new Map<string, MarketPriceRow>();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("market_prices")
        .select("commodity_key, region, unit, price_php, source, as_of")
        .eq("region", "ncr")
        .order("as_of", { ascending: false })
        .limit(500);

      if (!error && Array.isArray(data)) {
        const rows: MarketPriceRow[] = data.map((r) => ({
          commodity_key: String(r.commodity_key),
          region: String(r.region),
          unit: r.unit as CanonicalUnit,
          price_php: Number(r.price_php),
          source: r.source as MarketSource,
          as_of: String(r.as_of),
        }));
        map = pickBestRows(rows);
      }
    } catch {
      /* keep the empty map — estimates still work */
    }
  }

  cache = { at: now, map };
  return map;
}

/** Drop the cache so the next `loadMarketPrices()` re-queries (used after a refresh). */
export function invalidateMarketPricesCache(): void {
  cache = null;
}
