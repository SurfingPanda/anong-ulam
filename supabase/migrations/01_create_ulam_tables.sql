-- Anong Ulam? — core schema
-- Run in the Supabase SQL editor, or via `supabase db push` with the CLI.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- dishes
-- ---------------------------------------------------------------------------
create table if not exists public.dishes (
  id             uuid primary key default gen_random_uuid(),
  name           text        not null,
  category       text        not null default 'Lutong Bahay',
  est_total_cost numeric(10, 2) not null check (est_total_cost >= 0),
  prep_time_mins integer     not null default 30 check (prep_time_mins >= 0),
  servings       integer     not null default 4 check (servings > 0),
  instructions   text[]      not null default '{}',
  image_url      text,
  created_at     timestamptz not null default now()
);

comment on column public.dishes.category is
  'Lutong Bahay, Tipid, Pang-Pasko, Gulay, Pang-Almusal, etc.';

create index if not exists dishes_est_total_cost_idx
  on public.dishes (est_total_cost);
create index if not exists dishes_category_idx
  on public.dishes (category);

-- ---------------------------------------------------------------------------
-- ingredients
-- ---------------------------------------------------------------------------
create table if not exists public.ingredients (
  id                       uuid primary key default gen_random_uuid(),
  dish_id                  uuid not null references public.dishes (id) on delete cascade,
  item_name                text not null,
  amount                   numeric(10, 2) not null default 1 check (amount >= 0),
  unit                     text not null default 'pc',
  est_market_price_php     numeric(10, 2) not null default 0 check (est_market_price_php >= 0),
  -- optional "Tipid Swap": a cheaper stand-in and the pesos it saves
  substitution_name        text,
  substitution_savings_php numeric(10, 2) check (substitution_savings_php >= 0)
);

create index if not exists ingredients_dish_id_idx
  on public.ingredients (dish_id);

-- ---------------------------------------------------------------------------
-- Row Level Security — the landing page only needs public read access.
-- ---------------------------------------------------------------------------
alter table public.dishes      enable row level security;
alter table public.ingredients enable row level security;

drop policy if exists "Public read dishes" on public.dishes;
create policy "Public read dishes"
  on public.dishes for select
  using (true);

drop policy if exists "Public read ingredients" on public.ingredients;
create policy "Public read ingredients"
  on public.ingredients for select
  using (true);
