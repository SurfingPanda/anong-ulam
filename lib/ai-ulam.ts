import { z } from "zod";

import { categoryImage } from "@/lib/utils";
import type { Dish } from "@/lib/mock-ulam-data";

/** Shape the AI is asked to return. */
export const aiUlamSchema = z.object({
  dishes: z
    .array(
      z.object({
        name: z.string(),
        prep_time_mins: z.number().int().positive(),
        servings: z.number().int().positive(),
        instructions: z.array(z.string()).min(3),
        ingredients: z
          .array(
            z.object({
              item_name: z.string(),
              amount: z.number().positive(),
              unit: z.string(),
              est_market_price_php: z.number().nonnegative(),
            }),
          )
          .min(3),
      }),
    )
    .min(2)
    .max(3),
});

export function aiUlamPrompt(budget: number, exclude: string[] = []): string {
  const avoid = exclude.length
    ? ` Do NOT repeat any of these dishes that are already on screen: ${exclude.join(", ")}.`
    : "";
  return [
    `Suggest 3 DIFFERENT budget Filipino "ulam" (main dish) ideas a household can cook,`,
    `each for a TOTAL ingredient budget of PHP ${budget} or less.`,
    `Aim for variety — different main proteins/vegetables and cooking methods (guisado, nilaga, prito, ginataan, etc.).`,
    `Use only common Philippine wet market (palengke) staples.`,
    `Give realistic per-item market prices in PHP; the sum of ingredient prices per dish must not exceed ${budget}.`,
    `Instructions should be short, plain steps in Taglish.` + avoid,
  ].join(" ");
}

// A streamed partial dish is deeply optional (and array slots may be undefined)
// while tokens are still arriving.
interface PartialAiDish {
  name?: string;
  prep_time_mins?: number;
  servings?: number;
  instructions?: (string | undefined)[];
  ingredients?: (
    | {
        item_name?: string;
        amount?: number;
        unit?: string;
        est_market_price_php?: number;
      }
    | undefined
  )[];
}

/**
 * Promote a streamed partial dish to a full `Dish` — but only once it has
 * enough fields to render a real card. Returns null while it's still forming.
 */
export function aiPartialToDish(input: unknown, index: number): Dish | null {
  const d = (input ?? {}) as PartialAiDish;
  if (!d.name || d.name.trim().length < 3) return null;
  if (!d.prep_time_mins || !d.servings) return null;

  const instructions = (d.instructions ?? []).filter(
    (s): s is string => typeof s === "string" && s.trim().length > 0,
  );
  if (instructions.length < 3) return null;

  const ingredients: Dish["ingredients"] = [];
  for (const i of d.ingredients ?? []) {
    if (
      i &&
      typeof i.item_name === "string" &&
      i.item_name.trim().length > 0 &&
      typeof i.est_market_price_php === "number" &&
      typeof i.amount === "number"
    ) {
      ingredients.push({
        item_name: i.item_name,
        amount: i.amount,
        unit: typeof i.unit === "string" && i.unit ? i.unit : "pc",
        est_market_price_php: i.est_market_price_php,
      });
    }
  }
  if (ingredients.length < 3) return null;

  const est_total_cost = ingredients.reduce(
    (sum, i) => sum + i.est_market_price_php,
    0,
  );

  return {
    id: `ai-${index}-${d.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name: d.name.trim(),
    category: "Tipid",
    est_total_cost: Math.round(est_total_cost * 100) / 100,
    prep_time_mins: d.prep_time_mins,
    servings: d.servings,
    instructions,
    image_url: categoryImage("Tipid"),
    ingredients,
  };
}
