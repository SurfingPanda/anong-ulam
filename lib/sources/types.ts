import type { CanonicalUnit, MarketSource } from "@/lib/market-prices";

/** One commodity price as pulled from a source, before it hits the database. */
export interface RawMarketPrice {
  commodityKey: string;
  unit: CanonicalUnit;
  pricePhp: number;
  /** ISO date (YYYY-MM-DD) the figure represents. */
  asOf: string;
  source: MarketSource;
}
