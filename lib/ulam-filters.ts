/**
 * Craving & Mood filters. Applied client-side on top of the budget results —
 * a dish shows if it matches ANY selected filter.
 */

import type { Dish } from "@/lib/mock-ulam-data";

export type FilterId = "tag-ulan" | "mabilis" | "gulay-day" | "fish";

export interface FilterDef {
  id: FilterId;
  emoji: string;
  label: string;
  match: (dish: Dish) => boolean;
}

const nameHas = (dish: Dish, re: RegExp) => re.test(dish.name.toLowerCase());
const ingredientHas = (dish: Dish, re: RegExp) =>
  dish.ingredients.some((i) => re.test(i.item_name.toLowerCase()));

export const ULAM_FILTERS: FilterDef[] = [
  {
    id: "tag-ulan",
    emoji: "🌧️",
    label: "Tag-ulan Special",
    match: (d) =>
      nameHas(
        d,
        /sinigang|bulalo|sopas|tinola|nilaga|bulanglang|law-uy|munggo|monggo|lugaw|arroz/,
      ),
  },
  {
    id: "mabilis",
    emoji: "⚡",
    label: "Mabilis Lutuin",
    match: (d) => d.prep_time_mins <= 20,
  },
  {
    id: "gulay-day",
    emoji: "🥦",
    label: "Healthy / Gulay Day",
    match: (d) =>
      d.category === "Gulay" ||
      nameHas(
        d,
        /pakbet|pinakbet|chop\s?suey|chopsuey|gulay|sayote|talong|munggo|monggo|ampalaya|laing/,
      ),
  },
  {
    id: "fish",
    emoji: "🐟",
    label: "Lenten / Healthy Fish",
    match: (d) =>
      nameHas(
        d,
        /prito|paksiw|isda|bangus|tilapia|galunggong|daing|tuyo|hipon|sugpo|pusit/,
      ) || ingredientHas(d, /bangus|tilapia|hipon|isda|galunggong|pusit|tahong/),
  },
];

export function filterDishes(dishes: Dish[], active: FilterId[]): Dish[] {
  if (active.length === 0) return dishes;
  const defs = ULAM_FILTERS.filter((f) => active.includes(f.id));
  return dishes.filter((d) => defs.some((f) => f.match(d)));
}
