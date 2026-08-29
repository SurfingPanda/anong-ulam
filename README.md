# Anong Ulam? 🥘

Budget-first Filipino dish generator. Type a budget in Philippine Pesos and get
affordable ulam suggestions — each with an itemized wet-market (palengke) price
breakdown and simple cooking steps. Tick the staples you already own in the
**Pantry Check** and every dish re-prices itself against what you actually need
to buy.

## Tech stack

| Layer      | Choice                                                      |
| ---------- | --------------------------------------------------------- |
| Framework  | Next.js 14 (App Router, TypeScript, Server Actions)      |
| Styling    | Tailwind CSS                                              |
| UI         | shadcn/ui-style components + `lucide-react` icons         |
| Database   | Supabase (PostgreSQL) — schema + seed included           |
| AI (opt.)  | Google Gemini `gemini-3.6-flash` (free tier) via the AI SDK — sparse-result fallback |
| Deployment | Vercel (free-tier ready)                                  |

The app runs with **zero configuration**: the server action falls back to a
bundled dataset (`lib/mock-ulam-data.ts`) that mirrors the Supabase seed.

**Look & feel** — a "Carinderia / Fiesta" theme: terracotta + calamansi-yellow +
banana-leaf-green palette (tokens in `app/globals.css`), the **Baloo 2** display
font (loaded via `<link>` in `app/layout.tsx`, graceful system fallback), a woven
"solihiya" background pattern + warm gradient glows, a chalkboard hero sign,
palengke-chalkboard price stickers, colour-coded "Kusina badges", tactile pill
steppers, and floating kitchen doodles (`components/kusina-stickers.tsx`).

## Getting started

```bash
npm install

# optional: point at a real Supabase project
cp .env.example .env.local   # fill in NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY

npm run dev          # http://localhost:3000  (port busy? npm run dev -- -p 3999)
npm run build && npm run start
```

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor run, in order:
   - `supabase/migrations/01_create_ulam_tables.sql` — creates `dishes` +
     `ingredients` with public read RLS policies.
   - `supabase/seed.sql` — 10 dishes (₱84–₱488) with itemized palengke prices.
3. Copy the project URL + anon key into `.env.local`.
4. Dish photos ship bundled in `public/dishes/*.jpg` (real photos from Wikimedia
   Commons — see `public/dishes/ATTRIBUTION.txt`). The seed sets each row's
   `image_url` to the matching `/dishes/<slug>.jpg`, which resolves against the
   app origin — no extra hosting. To use your own, upload to a public Supabase
   Storage bucket (`supabase/storage-setup.md`) and swap the URLs. The category
   SVGs are the `onError` fallback for dishes without a photo (e.g. AI results).

With env vars present, `generateUlam()` queries the database and only falls back
to the bundled data on error or sparse results.

## Client-side pricing engine (`lib/pricing-engine.ts`)

`generateUlam()` runs when the **budget or region** changes — it returns raw
dishes. Everything else is instant, in the browser. Total price multiplier =
`servingsFactor × priceMode × region`.

| control        | effect                                                              |
| -------------- | ------------------------------------------------------------------ |
| **Servings**   | per-card "Pamilya" stepper; scales every quantity + price by `n / base` |
| **Price mode** | global Palengke ↔ Supermarket toggle (`SUPERMARKET_MULTIPLIER` = 1.18) |
| **Region**     | NCR / Luzon / Visayas / Mindanao multipliers (`REGIONS`); also stretches the backend budget filter |
| **Pantry**     | `components/pantry-check.tsx` — staples you own; their cost drops off "Your Price" |
| **Tipid Swaps**| per-ingredient cheaper stand-in (`substitution_name` / `substitution_savings_php`) applied in the drawer |
| **Filters**    | `lib/ulam-filters.ts` — craving/mood chips (Tag-ulan, Mabilis, Gulay Day, Lenten Fish), OR-matched |

`priceDish(dish, opts)` returns `srpTotal`, `swapSavings`, `pantrySavings`,
`yourPrice`, and a fully-scaled `ingredients[]`. Cards show **SRP** vs
**Your Price** with green "Saved from Pantry" / amber "Tipid Swap" badges; the
drawer shows the running breakdown:

```
Original Price      ₱280.00
Tipid Swaps        − ₱ 80.00  (Liempo → Tokwa)
Pantry Savings     − ₱ 22.00  (Bawang, Mantika)
────────────────────────────
Your Final Cost     ₱178.00   (Pasok sa budget!)
```

## Palengke Checklist (`components/palengke-checklist.tsx`)

Tick **"Isama sa Palengke List"** on any cards, then **Gawin ang Palengke List**.
Ingredients across the picked dishes are merged (by name + unit, respecting each
dish's servings / price mode / applied swaps), bucketed into
🥩 **Karnehan** · 🐟 **Isdaan** · 🥦 **Gulayan** · 🧂 **Pampalasa at Sari-sari**
(`lib/market-sections.ts`), checkable as "bought", and **copied to the clipboard**
as a plain-text list ready to paste into Messenger/SMS.

## Cooking Mode & Tipid Card

From the dish drawer:

- **Simulan ang Pagluluto** (`components/cooking-mode-modal.tsx`) — full-screen,
  one step at a time, extra-large type, progress bar, keeps the screen awake.
  Steps that mention a time ("~40 min", "5–7 minuto") get a **Start/Pause timer**;
  `hooks/use-cooking-timers.ts` runs any number of them off one wall-clock
  interval and beeps + flashes on expiry.
- **Tipid Card** (`components/tipid-share-card.tsx`) — renders a square PNG on a
  `<canvas>` ("Niluto ang {dish} para sa {N} tao sa ₱{price} lang! #AnongUlam")
  with **download**, **copy caption**, and native **Share** (`navigator.share`).

## AI extra dishes (optional, always-on, streamed & additive)

When `GOOGLE_GENERATIVE_AI_API_KEY` is set, **every** search returns its dataset
matches **instantly** and also carries `streaming: true`. The client then calls
**`streamAiUlam()`** (`app/actions/stream-ulam-ai.ts`) — `streamObject` +
`@ai-sdk/rsc`'s `createStreamableValue` — which streams 3 more
`gemini-3.6-flash` dishes **on top of** the dataset results (the prompt is told
which dish names are already on screen so it adds variety, not duplicates).

Each AI dish is deduped by name and merged into the grid the moment it's
complete (`lib/ai-ulam.ts` → `aiPartialToDish`), sorting in by price like any
other dish. No blank wait: first paint ~70 ms, AI dishes land over the next
~10 s with a *"nagluluto ang AI…"* pill + skeleton placeholders. A ₱250 search
goes from 6 dataset dishes to ~9.

Cost: one Gemini call per search. Free tier (15 req/min, ~1,500/day) covers
normal use comfortably.

```bash
npm i ai @ai-sdk/google@ai-v6 @ai-sdk/rsc@ai-v6 zod
# then set GOOGLE_GENERATIVE_AI_API_KEY in .env.local (free key: https://aistudio.google.com/apikey)
```

Without the key, a pre-configured low-cost default set is returned instead (no stream).

### Persisting AI dishes into the catalog (optional)

With Supabase + a **service-role** key set, `app/actions/save-ai-dishes.ts`
writes each newly-streamed dish into the `dishes` table (`source = 'ai'`), so it
shows up **instantly** next time — the catalog grows and AI fires less over
time. Duplicates are rejected against the bundled data *and* every DB row via
exact key + containment + trigram similarity (`lib/normalize.ts`), backed by a
`UNIQUE(name_key)` index (migration `03_ai_dish_persistence.sql`). Malformed /
hallucinated dishes are filtered by a plausibility check. Full setup:
**`supabase/ai-persistence.md`**. No service-role key → AI dishes stay ephemeral.

## How the generator resolves a budget

`app/actions/generate-ulam.ts`:

1. **Validate** — zero / negative / non-numeric → `"Please enter a valid budget in PHP."`
2. **Stretch by region** — `effectiveBudget = budget / regionMultiplier`
   (a ₱300 budget in a −8% region filters against ~₱326 of NCR-priced dishes).
3. **Budget < ₱50** → hyper-budget staples (Sinangag at Itlog, Lugaw with Egg…)
   plus a "stretch your budget" tip.
4. **Query Supabase** for `est_total_cost <= effectiveBudget`, ranked highest-first.
5. **Fall back to bundled data** if the DB is unreachable.
6. **Still sparse (< 2)** → AI generation, else the low-cost default set.

Results are ranked "best use of budget first"; the UI adds client-side
**Cheapest First** / **Quickest to Cook** sorts.

## Project structure

```
app/
  actions/generate-ulam.ts   # server action: {budgetPhp, region} -> ranked raw dishes (+ streaming flag)
  actions/stream-ulam-ai.ts  # server action: streams gemini-3.6-flash dish suggestions
  layout.tsx  page.tsx  globals.css
components/
  ui/                        # button, input, badge, card, sheet, checkbox
  ulam-generator.tsx         # orchestrator: servings / mode / region / pantry / swaps / filters / selection
  budget-form.tsx            # ₱ input, presets, validation, pending state
  pantry-check.tsx           # expandable "meron na ako" checklist
  price-mode-toggle.tsx      # Palengke ↔ Supermarket (+18%)
  region-select.tsx          # NCR / Luzon / Visayas / Mindanao
  servings-stepper.tsx       # "Pamilya" −/+ control
  ulam-filters.tsx           # craving / mood filter chips
  ulam-card.tsx              # SRP vs Your Price, servings, swap/pantry badges, list select
  dish-image.tsx             # image_url with emoji/gradient onError fallback
  dish-detail-drawer.tsx     # itemized prices, Tipid Swaps, Cooking Mode + Tipid Card triggers
  cooking-mode-modal.tsx     # full-screen step-by-step + multi-step timers
  tipid-share-card.tsx       # canvas share image + download / copy / share
  palengke-checklist.tsx     # merged shopping list by market section + copy to clipboard
  ulam-loading.tsx           # playful "Nagluluto ng suggestions…" skeleton
  kusina-stickers.tsx        # decorative floating kaldero / kawali / bayong / sili doodles
  site-footer.tsx
hooks/
  use-cooking-timers.ts      # N independent countdowns off one wall-clock interval
lib/
  mock-ulam-data.ts          # bundled dataset (mirrors seed) + hyper-budget staples + swaps
  pricing-engine.ts          # priceDish(): servings + price-mode + region + pantry + swap math
  pantry.ts                  # PANTRY_GROUPS + ingredientInPantry()
  ulam-filters.ts            # craving/mood FilterDef predicates
  market-sections.ts         # ingredient -> Karnehan / Isdaan / Gulayan / Pampalasa
  parse-duration.ts          # "~40 min" / "5–7 minuto" -> seconds, mm:ss formatter
  ai-ulam.ts                 # AI zod schema + prompt + streamed-partial -> Dish
  share-card.ts              # canvas renderer + share caption
  supabase/client.ts         # client, null until env vars are set
  utils.ts                   # cn(), formatPHP(), formatMins(), categoryEmoji/Image()
public/dishes/               # real dish photos (jpg, Wikimedia Commons) + category svg fallbacks
supabase/
  migrations/01_create_ulam_tables.sql   # dishes + ingredients (incl. substitution cols)
  migrations/02_add_substitutions.sql    # same cols for pre-existing DBs
  seed.sql                               # 10 dishes + ingredients + image_url + Tipid Swaps
  storage-setup.md                       # how to host real dish photos
.env.example
```

## PWA

Installable, offline-capable:

- `app/manifest.ts` — standalone display, `#C84B31` theme, maskable icons
  (rendered from `public/icons/icon.svg` via `sharp`), `?b=<budget>` shortcuts.
- `public/sw.js` — hand-rolled service worker (no Workbox): network-first for
  pages with a cached-shell fallback; cache-first for `/_next/static`,
  `/dishes`, `/icons`, and Google Fonts.
- `components/pwa-register.tsx` registers it (production only);
  `components/pwa-install-button.tsx` shows an "I-install ang app" chip on
  `beforeinstallprompt`.
- **Offline search:** when the server action can't be reached,
  `ulam-generator.tsx` falls back to a client-side filter over the bundled
  dataset (AI extras need network and degrade gracefully).

## Deploy to Vercel

1. Push to GitHub, import in Vercel (Next.js auto-detected).
2. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   (and `GOOGLE_GENERATIVE_AI_API_KEY` if using the AI fallback) in Project Settings →
   Environment Variables.
