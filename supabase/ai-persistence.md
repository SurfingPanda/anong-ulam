# Persisting AI-generated dishes

When Gemini streams new ulam ideas, the app can save the good ones into the
Supabase `dishes` catalog. Next time someone searches a similar budget those
dishes appear **instantly** (no AI wait) — the catalog grows and AI fires less
over time. Duplicates are rejected.

**Optional.** With no Supabase / service-role key, AI dishes are ephemeral and
nothing else changes.

## Setup

1. **Create a Supabase project** and run, in order, in the SQL editor:
   - `supabase/migrations/01_create_ulam_tables.sql`
   - `supabase/migrations/02_add_substitutions.sql`
   - `supabase/migrations/03_ai_dish_persistence.sql`  ← adds `source`, `name_key`
     (auto-maintained), `approved`, the `pg_trgm` extension + indexes, and a
     `closest_dish()` helper.
   - `supabase/seed.sql` (optional — seeds the 10 starter dishes)

2. **Env vars** (`.env.local`, and Vercel → Settings → Environment Variables):

   | Var | Where |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Settings → API → Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Settings → API → anon public |
   | `SUPABASE_SERVICE_ROLE_KEY` | Settings → API → **service_role** (secret!) |

   The service-role key is used **only** in `app/actions/save-ai-dishes.ts` (a
   `"use server"` action) — never sent to the browser. It bypasses RLS, so no
   INSERT policy is needed.

3. Restart / redeploy.

## How dedup works

`app/actions/save-ai-dishes.ts`, after the stream finishes:

1. **Validate** each dish — plausible name, 3–20 ingredients with sane prices,
   3–15 steps, total ₱15–₱3000. Hallucinations / gibberish are dropped.
2. **De-duplicate** against the bundled dataset **and** every existing DB row
   (`lib/normalize.ts`):
   - exact normalised key (`"Kare-Kare"` → `"kare kare"`)
   - containment (`"ginisang munggo"` vs `"ginisang munggo at baboy"`)
   - trigram (Jaccard) similarity ≥ `0.45`
3. Insert survivors with `source = 'ai'`, `approved = true`, `image_url = null`
   (category-emoji placeholder). A `UNIQUE(name_key)` index is the final
   race-condition guard.

The AI prompt is also given up to 40 already-known dish names for that budget so
it proposes genuinely new ones in the first place.

## Moderation

AI dishes are served immediately (`approved = true`). To hide one, set
`approved = false` in the Supabase table editor — `generateUlam()` only returns
`approved` rows. To review before publishing, change the default:

```sql
alter table public.dishes alter column approved set default false;
```

and flip AI dishes to `true` when you're happy with them.
