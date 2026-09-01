/**
 * Orchestrates a full price refresh: pull every source, dedupe, and upsert into
 * `market_prices`. Called by `app/api/cron/refresh-prices` (nightly) and safe to
 * call by hand. Never throws — returns a summary.
 */

import { supabaseAdmin } from "@/lib/supabase/admin";
import { fetchDaWeekly, fetchDaDaily } from "@/lib/sources/da";
import type { RawMarketPrice } from "@/lib/sources/types";

export interface RefreshResult {
  ok: boolean;
  reason?: string;
  /** rows written */
  upserted: number;
  bySource: Record<string, number>;
  commodities: string[];
}

export async function refreshMarketPrices(): Promise<RefreshResult> {
  if (!supabaseAdmin) {
    return {
      ok: false,
      reason: "SUPABASE_SERVICE_ROLE_KEY not set — nothing persisted",
      upserted: 0,
      bySource: {},
      commodities: [],
    };
  }

  const settled = await Promise.allSettled([fetchDaWeekly(), fetchDaDaily()]);
  const raw: RawMarketPrice[] = settled.flatMap((s) =>
    s.status === "fulfilled" ? s.value : [],
  );

  // dedupe on the table's unique key
  const seen = new Set<string>();
  const rows = raw.filter((r) => {
    const k = `${r.commodityKey}|${r.source}|${r.asOf}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  const bySource: Record<string, number> = {};
  for (const r of rows) bySource[r.source] = (bySource[r.source] ?? 0) + 1;

  if (rows.length === 0) {
    return {
      ok: false,
      reason: "all sources returned nothing — kept existing rows",
      upserted: 0,
      bySource,
      commodities: [],
    };
  }

  const { error } = await supabaseAdmin.from("market_prices").upsert(
    rows.map((r) => ({
      commodity_key: r.commodityKey,
      region: "ncr",
      unit: r.unit,
      price_php: r.pricePhp,
      source: r.source,
      as_of: r.asOf,
    })),
    { onConflict: "commodity_key,region,source,as_of" },
  );

  if (error) {
    return { ok: false, reason: error.message, upserted: 0, bySource, commodities: [] };
  }

  // keep the table small; ignore failures (function may not exist yet)
  try {
    await supabaseAdmin.rpc("prune_market_prices");
  } catch {
    /* noop */
  }

  return {
    ok: true,
    upserted: rows.length,
    bySource,
    commodities: [...new Set(rows.map((r) => r.commodityKey))].sort(),
  };
}
