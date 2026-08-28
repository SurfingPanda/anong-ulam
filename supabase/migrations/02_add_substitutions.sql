-- Anong Ulam? — "Tipid Swaps"
-- Adds optional cheaper-substitute columns to ingredients (for DBs created
-- before these columns were part of 01_create_ulam_tables.sql).

alter table public.ingredients
  add column if not exists substitution_name text;

alter table public.ingredients
  add column if not exists substitution_savings_php numeric(10, 2);

do $$
begin
  if not exists (
    select 1 from information_schema.constraint_column_usage
    where table_name = 'ingredients'
      and constraint_name = 'ingredients_substitution_savings_php_check'
  ) then
    alter table public.ingredients
      add constraint ingredients_substitution_savings_php_check
      check (substitution_savings_php is null or substitution_savings_php >= 0);
  end if;
end $$;
