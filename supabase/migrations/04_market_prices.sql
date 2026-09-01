-- Anong Ulam? — live commodity prices from DA Bantay Presyo
-- Run after 01–03. Idempotent.
--
-- A nightly job (app/api/cron/refresh-prices) parses the DA "Weekly Average
-- Retail Price" and "Daily Price Index" PDFs and upserts one row per commodity
-- here. `lib/market-prices.ts` overlays these onto dish ingredients at load
-- time; anything without a fresh row keeps its hardcoded estimate.
-- ('psa' stays in the CHECK below as room for a future backstop — PSA's
-- OpenSTAT API tables are currently unpopulated.)

create table if not exists public.market_prices (
  id            bigint generated always as identity primary key,
  commodity_key text        not null,                 -- 'pork', 'mung-bean', ... (see lib/market-prices.ts)
  region        text        not null default 'ncr',   -- matches RegionId; DA only covers NCR
  unit          text        not null,                 -- canonical unit of price_php: 'kg' | 'pc' | 'L'
  price_php     numeric(10, 2) not null check (price_php >= 0),
  source        text        not null check (source in ('da-daily', 'da-weekly', 'psa')),
  as_of         date        not null,                 -- the date the source figure represents
  fetched_at    timestamptz not null default now(),
  unique (commodity_key, region, source, as_of)
);

create index if not exists market_prices_lookup_idx
  on public.market_prices (commodity_key, region, as_of desc);

-- ---------------------------------------------------------------------------
-- RLS — public read only. Writes go through the service-role client
-- (lib/supabase/admin.ts), which bypasses RLS.
-- ---------------------------------------------------------------------------
alter table public.market_prices enable row level security;

drop policy if exists "Public read market prices" on public.market_prices;
create policy "Public read market prices"
  on public.market_prices for select
  using (true);

-- Optional: keep the table from growing without bound — prune rows older than
-- ~180 days. Safe to run anytime; the refresh job also calls this.
create or replace function public.prune_market_prices()
returns void
language sql
as $$
  delete from public.market_prices where as_of < current_date - interval '180 days';
$$;
