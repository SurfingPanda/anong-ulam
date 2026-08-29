-- Anong Ulam? — persist AI-generated dishes into the catalog
-- Run after 01 and 02. Idempotent.

create extension if not exists pg_trgm;

-- ---------------------------------------------------------------------------
-- new columns
-- ---------------------------------------------------------------------------
alter table public.dishes
  add column if not exists source text not null default 'seed',   -- 'seed' | 'ai'
  add column if not exists name_key text,
  add column if not exists approved boolean not null default true;

comment on column public.dishes.source is 'Where the row came from: seed | ai';
comment on column public.dishes.name_key is
  'Normalised name for de-duplication (lower, non-alnum -> space, trimmed). Auto-maintained.';
comment on column public.dishes.approved is
  'Only approved dishes are served. AI dishes default to true; flip to false to hide.';

-- ---------------------------------------------------------------------------
-- keep name_key in sync (matches lib/normalize.ts nameKey())
-- ---------------------------------------------------------------------------
create or replace function public.set_dish_name_key()
returns trigger
language plpgsql
as $$
begin
  new.name_key := btrim(regexp_replace(lower(new.name), '[^a-z0-9]+', ' ', 'g'));
  return new;
end;
$$;

drop trigger if exists dishes_name_key_biu on public.dishes;
create trigger dishes_name_key_biu
  before insert or update of name on public.dishes
  for each row execute function public.set_dish_name_key();

-- backfill existing rows
update public.dishes
  set name_key = btrim(regexp_replace(lower(name), '[^a-z0-9]+', ' ', 'g'))
  where name_key is null or name_key = '';

-- ---------------------------------------------------------------------------
-- indexes
-- ---------------------------------------------------------------------------
create unique index if not exists dishes_name_key_uidx on public.dishes (name_key);
create index if not exists dishes_name_key_trgm_idx
  on public.dishes using gin (name_key gin_trgm_ops);
create index if not exists dishes_source_idx on public.dishes (source);
create index if not exists dishes_approved_cost_idx
  on public.dishes (approved, est_total_cost);

-- ---------------------------------------------------------------------------
-- RPC: closest existing dish by trigram similarity (used to reject near-dupes)
-- SECURITY DEFINER so it works with the anon key too, but the app calls it
-- with the service-role client.
-- ---------------------------------------------------------------------------
create or replace function public.closest_dish(p_name_key text, p_threshold real default 0.45)
returns table (name text, name_key text, sim real)
language sql
stable
security definer
set search_path = public
as $$
  select d.name, d.name_key, similarity(d.name_key, p_name_key) as sim
  from public.dishes d
  where d.name_key % p_name_key
    and similarity(d.name_key, p_name_key) >= p_threshold
  order by sim desc
  limit 1;
$$;
