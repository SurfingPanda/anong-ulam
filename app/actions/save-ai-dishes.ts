"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  MOCK_DISHES,
  HYPER_BUDGET_STAPLES,
  type Dish,
} from "@/lib/mock-ulam-data";
import { nameKey, isDuplicateName } from "@/lib/normalize";

export interface SaveAiDishesResult {
  saved: number;
  skipped: number;
  /** true when SUPABASE_SERVICE_ROLE_KEY isn't set (nothing was persisted). */
  disabled?: boolean;
}

const MAX_PER_CALL = 5;

/** Guards against hallucinated / malformed dishes before they enter the catalog. */
function isPlausibleDish(d: Dish): boolean {
  const name = d.name?.trim() ?? "";
  const letters = (name.match(/[a-zA-Z]/g) ?? []).length;
  if (name.length < 4 || name.length > 70 || letters < 3) return false;
  if (/https?:\/\//i.test(name)) return false;
  // "shouting" / gibberish
  const upper = (name.match(/[A-Z]/g) ?? []).length;
  if (letters >= 6 && upper / letters > 0.8) return false;

  if (!Number.isFinite(d.prep_time_mins) || d.prep_time_mins < 3 || d.prep_time_mins > 360)
    return false;
  if (!Number.isFinite(d.servings) || d.servings < 1 || d.servings > 20) return false;

  const steps = Array.isArray(d.instructions) ? d.instructions : [];
  if (steps.length < 3 || steps.length > 15) return false;
  if (!steps.every((s) => typeof s === "string" && s.trim().length >= 5 && s.length <= 400))
    return false;

  const ings = Array.isArray(d.ingredients) ? d.ingredients : [];
  if (ings.length < 3 || ings.length > 20) return false;
  if (
    !ings.every(
      (i) =>
        typeof i.item_name === "string" &&
        i.item_name.trim().length >= 2 &&
        i.item_name.length <= 60 &&
        Number.isFinite(i.amount) &&
        i.amount > 0 &&
        Number.isFinite(i.est_market_price_php) &&
        i.est_market_price_php >= 0 &&
        i.est_market_price_php <= 1000,
    )
  )
    return false;

  const total = ings.reduce((s, i) => s + i.est_market_price_php, 0);
  if (total < 15 || total > 3000) return false;

  return true;
}

/**
 * Persists newly AI-generated dishes into the Supabase `dishes` catalog so they
 * appear instantly (no AI wait) next time. De-duplicates against the bundled
 * dataset AND the existing DB rows (exact key, containment, trigram similarity).
 * A no-op when the service-role key isn't configured.
 */
export async function saveAiDishes(
  dishes: Dish[],
): Promise<SaveAiDishesResult> {
  if (!supabaseAdmin) return { saved: 0, skipped: 0, disabled: true };
  if (!Array.isArray(dishes) || dishes.length === 0)
    return { saved: 0, skipped: 0 };

  const candidates = dishes.slice(0, MAX_PER_CALL);

  // Every name we must not collide with: bundled + everything already in the DB.
  const knownKeys = new Set<string>();
  for (const d of [...MOCK_DISHES, ...HYPER_BUDGET_STAPLES]) {
    knownKeys.add(nameKey(d.name));
  }
  try {
    const { data } = await supabaseAdmin
      .from("dishes")
      .select("name_key")
      .limit(5000);
    for (const row of data ?? []) {
      if (row?.name_key) knownKeys.add(row.name_key as string);
    }
  } catch {
    /* if we can't read, we still have the bundled keys */
  }

  let saved = 0;
  let skipped = 0;

  for (const dish of candidates) {
    if (!isPlausibleDish(dish) || isDuplicateName(dish.name, knownKeys)) {
      skipped++;
      continue;
    }

    const total =
      Math.round(
        dish.ingredients.reduce((s, i) => s + i.est_market_price_php, 0) * 100,
      ) / 100;

    try {
      const { data: inserted, error } = await supabaseAdmin
        .from("dishes")
        .insert({
          name: dish.name.trim(),
          category: dish.category || "Tipid",
          est_total_cost: total,
          prep_time_mins: dish.prep_time_mins,
          servings: dish.servings,
          instructions: dish.instructions,
          image_url: null,
          source: "ai",
          approved: true,
        })
        .select("id")
        .single();

      if (error) {
        // 23505 = unique_violation on name_key (a concurrent save won the race)
        skipped++;
        continue;
      }

      const dishId = (inserted as { id: string }).id;
      const { error: ingErr } = await supabaseAdmin.from("ingredients").insert(
        dish.ingredients.map((i) => ({
          dish_id: dishId,
          item_name: i.item_name.trim(),
          amount: i.amount,
          unit: i.unit || "pc",
          est_market_price_php: i.est_market_price_php,
        })),
      );

      if (ingErr) {
        // don't leave a dish with no ingredients
        await supabaseAdmin.from("dishes").delete().eq("id", dishId);
        skipped++;
        continue;
      }

      knownKeys.add(nameKey(dish.name));
      saved++;
    } catch {
      skipped++;
    }
  }

  if (saved > 0) {
    console.log(`[save-ai-dishes] +${saved} new dish(es), ${skipped} skipped`);
  }
  return { saved, skipped };
}
