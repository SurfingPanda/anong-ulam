# Live ingredient prices (DA Bantay Presyo)

By default every ingredient price in the app is a hardcoded estimate
(`lib/mock-ulam-data.ts` / `supabase/seed.sql`). This optional feature refreshes
the base per-kilo price of ~22 common commodities from a real source on a
schedule. Anything not covered — patis, toyo, bagoong, hotdog, keso, seasonings —
keeps its estimate, and the app works unchanged if you skip all of this.

## Sources

| Source | What | Cadence | Role |
| ------ | ---- | ------- | ---- |
| **DA "Weekly Average Retail Price"** PDF | NCR wet-market average per commodity | weekly (~1 day lag) | primary |
| **DA "Daily Price Index"** PDF | same commodities, NCR | daily | fresher supplement |

> PSA OpenSTAT was evaluated as a backstop and dropped — its PXWeb "2018-based"
> commodity tables return a placeholder for every query (no data), and the older
> "2012-based" series stops at 2021. `'psa'` is still allowed by the schema and
> the `MarketSource` type if a usable PSA feed appears later.

DA figures are NCR. For a non-NCR region the app scales them by the existing
`regionMultiplier()` in `lib/pricing-engine.ts`, same as it already does for the
estimates.

Everything is best-effort. A failed fetch or a DA layout change logs and returns
nothing — the last good rows stay, and any commodity without a fresh row falls
back to the hardcoded estimate. Parsed values are also range-checked per
commodity (`COMMODITIES[].band` in `lib/market-prices.ts`), so a mangled PDF row
can't push an absurd price into the UI.

## One-time setup

1. **Run the migration.** In the Supabase SQL editor run
   `supabase/migrations/04_market_prices.sql` — creates `market_prices` (public
   read, service-role write) plus a `prune_market_prices()` helper.

2. **Service role key.** `SUPABASE_SERVICE_ROLE_KEY` + `NEXT_PUBLIC_SUPABASE_URL`
   must be set (already required for AI-dish persistence). The refresh writes
   with the service-role client so it bypasses RLS.

3. **`CRON_SECRET`.** Add a random string as `CRON_SECRET` in the Vercel project
   (Settings → Environment Variables). Vercel automatically sends it as
   `Authorization: Bearer <secret>` on cron requests; without it the endpoint
   only accepts Vercel's internal `x-vercel-cron` header.

4. **Deploy.** `vercel.json` registers the cron:

   ```json
   { "crons": [{ "path": "/api/cron/refresh-prices", "schedule": "0 21 * * *" }] }
   ```

   `0 21 * * *` UTC ≈ 05:00 Manila, after DA posts the day's index.

5. **Seed immediately** (don't wait for the first cron):

   ```bash
   curl -H "Authorization: Bearer $CRON_SECRET" \
     https://<your-app>.vercel.app/api/cron/refresh-prices
   ```

   Expected response:

   ```json
   { "ok": true, "upserted": 44,
     "bySource": { "da-weekly": 22, "da-daily": 22 },
     "commodities": ["beef", "bell-pepper", "..."], "ms": 4000 }
   ```

## Verifying

```sql
select commodity_key, price_php, unit, source, as_of
from market_prices order by commodity_key, source;
```

In the app: search a budget, open a dish, and the price panel shows
`Presyo: DA Bantay Presyo (NCR) · <date>`. Ingredients that mapped to a live
commodity use it; the rest stay estimates.

## How it fits together

```
vercel cron ──> GET /api/cron/refresh-prices
                  └─ lib/sources/refresh.ts
                       └─ lib/sources/da.ts    (scrape listing, fetch weekly+daily
                                                PDF, unpdf → coordinate parse)
                     upsert → market_prices

generateUlam() / streamAiUlam()
  └─ lib/market-prices.server.ts  loadMarketPrices()   (10-min cache)
       └─ lib/market-prices.ts    overlayDishPrices()  (match commodity, convert
                                   units, swap in price, recompute est_total_cost)
```

## Tuning

Everything commodity-specific lives in `COMMODITIES` in `lib/market-prices.ts`:
name `keywords`, sanity `band`, unit conversions (`gramsPerPiece`, `gramsByUnit`),
and the DA row locators (`da.label` / `da.section` / `da.exclude` / `da.prefer`).
Add a commodity by appending an entry — no schema change.

If DA changes their PDF layout and a commodity stops resolving, the refresh
response's `commodities` list will be short; adjust that commodity's `da`
regexes. The parser reconstructs rows from text coordinates
(`pdfToLines` in `lib/sources/da.ts`), so it tolerates column drift but not a
wholesale redesign.
