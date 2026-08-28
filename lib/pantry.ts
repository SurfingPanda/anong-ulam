/**
 * Pantry Check — common Filipino household staples a user may already own.
 * `keyword` is matched (case-insensitive substring) against a dish's
 * `ingredients[].item_name`; when it hits, that ingredient's cost is treated as
 * already-paid-for and subtracted from the dish's "Your Price" (see
 * `lib/pricing.ts`, which does the actual arithmetic client-side).
 */

export interface PantryItem {
  keyword: string; // substring matched against ingredient item_name
  label: string; // display name
  typicalPrice: number; // indicative palengke price, for the checklist hint
}

export interface PantryGroup {
  id: string;
  title: string;
  items: PantryItem[];
}

export const PANTRY_GROUPS: PantryGroup[] = [
  {
    id: "bigas",
    title: "Bigas / Grains",
    items: [
      { keyword: "Kanin", label: "Kanin (tira)", typicalPrice: 12 },
      { keyword: "Bigas", label: "Bigas", typicalPrice: 10 },
    ],
  },
  {
    id: "recado",
    title: "Sahog / Recado",
    items: [
      { keyword: "Bawang", label: "Bawang", typicalPrice: 5 },
      { keyword: "Sibuyas", label: "Sibuyas", typicalPrice: 8 },
      { keyword: "Kamatis", label: "Kamatis", typicalPrice: 6 },
      { keyword: "Luya", label: "Luya", typicalPrice: 5 },
    ],
  },
  {
    id: "bote",
    title: "Condiments / Bote",
    items: [
      { keyword: "Toyo", label: "Toyo", typicalPrice: 10 },
      { keyword: "Suka", label: "Suka", typicalPrice: 8 },
      { keyword: "Patis", label: "Patis", typicalPrice: 3 },
      { keyword: "Mantika", label: "Mantika", typicalPrice: 4 },
      { keyword: "Asin", label: "Asin", typicalPrice: 2 },
      { keyword: "Paminta", label: "Paminta", typicalPrice: 3 },
    ],
  },
];

export const PANTRY_ITEMS: PantryItem[] = PANTRY_GROUPS.flatMap((g) => g.items);

/** Returns the matching pantry keyword for an ingredient, or null. */
export function ingredientInPantry(
  itemName: string,
  keywords: string[],
): string | null {
  const name = itemName.toLowerCase();
  for (const kw of keywords) {
    if (kw && name.includes(kw.toLowerCase())) return kw;
  }
  return null;
}
