/**
 * Offline fallback dataset — mirrors `supabase/seed.sql` so the generator works
 * with zero configuration. Once Supabase env vars are set, the server action
 * queries the database instead and only falls back here on error / sparse hits.
 *
 * Prices are rough Philippine wet market (palengke) estimates (mid-2025).
 */

import { categoryImage } from "@/lib/utils";

export type DishCategory =
  | "Lutong Bahay"
  | "Tipid"
  | "Pang-Pasko"
  | "Gulay"
  | "Pang-Almusal";

export interface Ingredient {
  id?: string;
  dish_id?: string;
  item_name: string;
  amount: number;
  unit: string;
  est_market_price_php: number;
  /** Optional "Tipid Swap": a cheaper stand-in and the pesos it saves. */
  substitution_name?: string | null;
  substitution_savings_php?: number | null;
}

export interface Dish {
  id: string;
  name: string;
  category: DishCategory | string;
  est_total_cost: number;
  prep_time_mins: number;
  servings: number;
  instructions: string[];
  image_url: string | null;
  ingredients: Ingredient[];
}

/** Sum ingredient prices — handy when building AI or ad-hoc dishes. */
export function sumIngredients(ingredients: Ingredient[]): number {
  return ingredients.reduce((total, i) => total + i.est_market_price_php, 0);
}

export const MOCK_DISHES: Dish[] = [
  {
    id: "d0000000-0000-4000-8000-000000000001",
    name: "Ginisang Monggo",
    category: "Tipid",
    est_total_cost: 97,
    prep_time_mins: 40,
    servings: 4,
    image_url: null,
    instructions: [
      "Pakuluan ang munggo sa 4 tasang tubig hanggang lumambot (~25 min).",
      "Sa kawali, igisa ang bawang, sibuyas, at kamatis. Idagdag ang baboy at lutuin hanggang mag-brown.",
      "Ibuhos ang niluto na munggo pati sabaw. Pakuluan ng 10 minuto.",
      "Timplahan ng patis at paminta. Idagdag ang malunggay bago patayin ang apoy.",
    ],
    ingredients: [
      { item_name: "Munggo (mung beans)", amount: 250, unit: "g", est_market_price_php: 30 },
      { item_name: "Baboy (paksiw cut)", amount: 100, unit: "g", est_market_price_php: 35 },
      { item_name: "Bawang", amount: 3, unit: "cloves", est_market_price_php: 3 },
      { item_name: "Sibuyas", amount: 1, unit: "pc", est_market_price_php: 8 },
      { item_name: "Kamatis", amount: 1, unit: "pc", est_market_price_php: 6 },
      { item_name: "Dahon ng malunggay", amount: 1, unit: "bunch", est_market_price_php: 10 },
      { item_name: "Patis", amount: 2, unit: "tbsp", est_market_price_php: 3 },
      { item_name: "Mantika", amount: 2, unit: "tbsp", est_market_price_php: 2 },
    ],
  },
  {
    id: "d0000000-0000-4000-8000-000000000002",
    name: "Tortang Talong",
    category: "Tipid",
    est_total_cost: 84,
    prep_time_mins: 20,
    servings: 3,
    image_url: null,
    instructions: [
      "Ihawin o iprito ang talong hanggang lumambot ang laman, tapos balatan.",
      "Batihin ang itlog kasama ang tinadtad na sibuyas at bawang. Timplahan ng asin at paminta.",
      "Isawsaw ang bawat talong sa itlog, pipiin ng tinidor.",
      "Iprito sa mainit na mantika hanggang golden brown ang magkabilang gilid.",
    ],
    ingredients: [
      { item_name: "Talong", amount: 3, unit: "pcs", est_market_price_php: 33 },
      { item_name: "Itlog", amount: 3, unit: "pcs", est_market_price_php: 24 },
      { item_name: "Sibuyas", amount: 1, unit: "pc", est_market_price_php: 8 },
      { item_name: "Bawang", amount: 2, unit: "cloves", est_market_price_php: 3 },
      { item_name: "Asin at paminta", amount: 1, unit: "pinch", est_market_price_php: 2 },
      { item_name: "Mantika", amount: 0.25, unit: "cup", est_market_price_php: 14 },
    ],
  },
  {
    id: "d0000000-0000-4000-8000-000000000003",
    name: "Ginisang Sayote",
    category: "Gulay",
    est_total_cost: 88,
    prep_time_mins: 20,
    servings: 3,
    image_url: null,
    instructions: [
      "Igisa ang bawang, sibuyas, at kamatis hanggang malambot.",
      "Idagdag ang giniling na baboy, lutuin hanggang mag-brown.",
      "Ilagay ang hiniwang sayote, haluin, at timplahan ng patis.",
      "Takpan ng 5–7 minuto hanggang maluto ang sayote. Haluin at ihain.",
    ],
    ingredients: [
      { item_name: "Sayote", amount: 2, unit: "pcs", est_market_price_php: 25 },
      { item_name: "Giniling na baboy", amount: 100, unit: "g", est_market_price_php: 40 },
      { item_name: "Bawang", amount: 3, unit: "cloves", est_market_price_php: 3 },
      { item_name: "Sibuyas", amount: 1, unit: "pc", est_market_price_php: 8 },
      { item_name: "Kamatis", amount: 1, unit: "pc", est_market_price_php: 6 },
      { item_name: "Patis", amount: 2, unit: "tbsp", est_market_price_php: 3 },
      { item_name: "Mantika", amount: 2, unit: "tbsp", est_market_price_php: 3 },
    ],
  },
  {
    id: "d0000000-0000-4000-8000-000000000004",
    name: "Ginataang Gulay",
    category: "Gulay",
    est_total_cost: 142,
    prep_time_mins: 35,
    servings: 4,
    image_url: null,
    instructions: [
      "Igisa ang luya, bawang, at sibuyas. Idagdag ang bagoong at hipon, iprito sandali.",
      "Ilagay ang kalabasa at kaunting tubig, pakuluan hanggang halos malambot.",
      "Ibuhos ang gata, hinaan ang apoy, at huwag munang haluin.",
      "Idagdag ang sitaw, lutuin ng 5 minuto pa hanggang kumapal ang sarsa.",
    ],
    ingredients: [
      { item_name: "Kalabasa", amount: 0.25, unit: "piece", est_market_price_php: 25 },
      { item_name: "Sitaw", amount: 1, unit: "bunch", est_market_price_php: 15 },
      { item_name: "Gata (niyog)", amount: 200, unit: "ml", est_market_price_php: 30 },
      {
        item_name: "Hipon",
        amount: 100,
        unit: "g",
        est_market_price_php: 45,
        substitution_name: "Tokwa",
        substitution_savings_php: 25,
      },
      { item_name: "Luya", amount: 1, unit: "thumb", est_market_price_php: 5 },
      { item_name: "Bawang", amount: 4, unit: "cloves", est_market_price_php: 4 },
      { item_name: "Sibuyas", amount: 1, unit: "pc", est_market_price_php: 8 },
      { item_name: "Bagoong alamang", amount: 2, unit: "tbsp", est_market_price_php: 6 },
      { item_name: "Mantika", amount: 2, unit: "tbsp", est_market_price_php: 4 },
    ],
  },
  {
    id: "d0000000-0000-4000-8000-000000000005",
    name: "Pork Adobo",
    category: "Lutong Bahay",
    est_total_cost: 188,
    prep_time_mins: 50,
    servings: 4,
    image_url: null,
    instructions: [
      "Imarinate ang baboy sa toyo at bawang ng 15–30 minuto.",
      "Iprito ang baboy hanggang bahagyang mag-brown.",
      "Ibuhos ang marinade, suka, laurel, paminta, at 1 tasang tubig.",
      "Pakuluan tapos hinaan; lutuin 35–40 minuto hanggang lumambot at kumapal ang sarsa.",
    ],
    ingredients: [
      {
        item_name: "Liempo",
        amount: 500,
        unit: "g",
        est_market_price_php: 150,
        substitution_name: "Tokwa (firm tofu)",
        substitution_savings_php: 80,
      },
      { item_name: "Toyo", amount: 0.25, unit: "cup", est_market_price_php: 10 },
      { item_name: "Suka", amount: 0.25, unit: "cup", est_market_price_php: 8 },
      { item_name: "Bawang", amount: 1, unit: "head", est_market_price_php: 10 },
      { item_name: "Dahon ng laurel", amount: 3, unit: "pcs", est_market_price_php: 3 },
      { item_name: "Paminta (buo)", amount: 1, unit: "tsp", est_market_price_php: 3 },
      { item_name: "Mantika", amount: 2, unit: "tbsp", est_market_price_php: 4 },
    ],
  },
  {
    id: "d0000000-0000-4000-8000-000000000006",
    name: "Chicken Tinola",
    category: "Lutong Bahay",
    est_total_cost: 217,
    prep_time_mins: 45,
    servings: 4,
    image_url: null,
    instructions: [
      "Igisa ang luya, bawang, at sibuyas hanggang mabango.",
      "Idagdag ang manok, iprito hanggang mawala ang pink na kulay.",
      "Timplahan ng patis, ibuhos ang 4–5 tasang tubig, pakuluan ng 20 minuto.",
      "Ilagay ang sayote, lutuin hanggang malambot. Idagdag ang dahon ng sili bago ihain.",
    ],
    ingredients: [
      {
        item_name: "Manok (hiwa)",
        amount: 500,
        unit: "g",
        est_market_price_php: 160,
        substitution_name: "Manok (leeg at pakpak)",
        substitution_savings_php: 45,
      },
      { item_name: "Sayote", amount: 1, unit: "pc", est_market_price_php: 18 },
      { item_name: "Dahon ng sili", amount: 1, unit: "bunch", est_market_price_php: 10 },
      { item_name: "Luya", amount: 1, unit: "thumb", est_market_price_php: 8 },
      { item_name: "Bawang", amount: 4, unit: "cloves", est_market_price_php: 5 },
      { item_name: "Sibuyas", amount: 1, unit: "pc", est_market_price_php: 8 },
      { item_name: "Patis", amount: 3, unit: "tbsp", est_market_price_php: 4 },
      { item_name: "Mantika", amount: 2, unit: "tbsp", est_market_price_php: 4 },
    ],
  },
  {
    id: "d0000000-0000-4000-8000-000000000007",
    name: "Pork Sinigang",
    category: "Lutong Bahay",
    est_total_cost: 279,
    prep_time_mins: 60,
    servings: 5,
    image_url: null,
    instructions: [
      "Pakuluan ang baboy sa 6–7 tasang tubig hanggang lumambot (~40 min). Alisin ang bula.",
      "Idagdag ang kamatis at sibuyas, tapos ang gabi at labanos.",
      "Ilagay ang sinigang mix at okra, pakuluan ng 5 minuto.",
      "Idagdag ang sitaw, talong, at siling haba. Panghuli ang kangkong bago ihain.",
    ],
    ingredients: [
      {
        item_name: "Baboy (buto-buto)",
        amount: 500,
        unit: "g",
        est_market_price_php: 150,
        substitution_name: "Tokwa + dagdag na gulay",
        substitution_savings_php: 90,
      },
      { item_name: "Sinigang mix (sampalok)", amount: 1, unit: "pack", est_market_price_php: 15 },
      { item_name: "Gabi", amount: 2, unit: "pcs", est_market_price_php: 24 },
      { item_name: "Labanos", amount: 1, unit: "pc", est_market_price_php: 15 },
      { item_name: "Sitaw", amount: 1, unit: "bunch", est_market_price_php: 15 },
      { item_name: "Kangkong", amount: 1, unit: "bunch", est_market_price_php: 12 },
      { item_name: "Kamatis", amount: 2, unit: "pcs", est_market_price_php: 12 },
      { item_name: "Sibuyas", amount: 1, unit: "pc", est_market_price_php: 8 },
      { item_name: "Siling haba", amount: 2, unit: "pcs", est_market_price_php: 6 },
      { item_name: "Talong", amount: 1, unit: "pc", est_market_price_php: 10 },
      { item_name: "Okra", amount: 4, unit: "pcs", est_market_price_php: 12 },
    ],
  },
  {
    id: "d0000000-0000-4000-8000-000000000008",
    name: "Chicken Afritada",
    category: "Lutong Bahay",
    est_total_cost: 320,
    prep_time_mins: 50,
    servings: 5,
    image_url: null,
    instructions: [
      "Iprito ang patatas at karot hanggang bahagyang golden, tabi muna.",
      "Igisa ang bawang at sibuyas, idagdag ang manok hanggang mag-brown.",
      "Ibuhos ang tomato sauce at 1 tasang tubig, lagyan ng laurel. Pakuluan tapos hinaan 20 min.",
      "Ibalik ang patatas at karot, idagdag ang bell pepper. Lutuin 5 minuto pa.",
    ],
    ingredients: [
      {
        item_name: "Manok (hiwa)",
        amount: 750,
        unit: "g",
        est_market_price_php: 212,
        substitution_name: "Manok (paa / drumstick)",
        substitution_savings_php: 55,
      },
      { item_name: "Patatas", amount: 2, unit: "pcs", est_market_price_php: 25 },
      { item_name: "Karot", amount: 1, unit: "pc", est_market_price_php: 15 },
      { item_name: "Bell pepper", amount: 1, unit: "pc", est_market_price_php: 25 },
      { item_name: "Tomato sauce", amount: 200, unit: "g", est_market_price_php: 22 },
      { item_name: "Bawang", amount: 4, unit: "cloves", est_market_price_php: 5 },
      { item_name: "Sibuyas", amount: 1, unit: "pc", est_market_price_php: 8 },
      { item_name: "Dahon ng laurel", amount: 2, unit: "pcs", est_market_price_php: 2 },
      { item_name: "Mantika", amount: 3, unit: "tbsp", est_market_price_php: 6 },
    ],
  },
  {
    id: "d0000000-0000-4000-8000-000000000009",
    name: "Kare-Kare",
    category: "Lutong Bahay",
    est_total_cost: 488,
    prep_time_mins: 90,
    servings: 6,
    image_url: null,
    instructions: [
      "Pakuluan ang pata hanggang malambot (~1 oras). Itabi ang sabaw.",
      "Igisa ang bawang at sibuyas, idagdag ang atsuete na tubig at peanut butter.",
      "Ibuhos ang sabaw at karne, palaputin gamit ang toasted rice.",
      "Idagdag ang gulay: puso ng saging, sitaw, talong, pechay. Ihain na may bagoong.",
    ],
    ingredients: [
      {
        item_name: "Pata / buntot ng baka",
        amount: 500,
        unit: "g",
        est_market_price_php: 300,
        substitution_name: "Puro gulay + tokwa",
        substitution_savings_php: 170,
      },
      { item_name: "Peanut butter", amount: 0.5, unit: "cup", est_market_price_php: 40 },
      { item_name: "Pechay", amount: 1, unit: "bunch", est_market_price_php: 15 },
      { item_name: "Sitaw", amount: 1, unit: "bunch", est_market_price_php: 15 },
      { item_name: "Talong", amount: 2, unit: "pcs", est_market_price_php: 20 },
      { item_name: "Puso ng saging", amount: 1, unit: "pc", est_market_price_php: 25 },
      { item_name: "Atsuete", amount: 1, unit: "pack", est_market_price_php: 10 },
      { item_name: "Bawang", amount: 1, unit: "head", est_market_price_php: 10 },
      { item_name: "Sibuyas", amount: 1, unit: "pc", est_market_price_php: 8 },
      { item_name: "Toasted rice (giniling)", amount: 0.25, unit: "cup", est_market_price_php: 10 },
      { item_name: "Bagoong alamang", amount: 1, unit: "cup", est_market_price_php: 35 },
    ],
  },
  {
    id: "d0000000-0000-4000-8000-000000000010",
    name: "Embutido",
    category: "Pang-Pasko",
    est_total_cost: 462,
    prep_time_mins: 75,
    servings: 8,
    image_url: null,
    instructions: [
      "Paghaluin ang giniling na baboy, breadcrumbs, itlog na hilaw, at mga pampalasa.",
      "Idagdag ang tinadtad na karot, bell pepper, pasas, keso, at pickle relish.",
      "Ihain sa aluminum foil, ilagay ang hotdog sa gitna, tapos irolyo nang mahigpit.",
      "I-steam ng 45–60 minuto. Palamigin bago hiwain. Pwedeng i-fry bago ihain.",
    ],
    ingredients: [
      {
        item_name: "Giniling na baboy",
        amount: 500,
        unit: "g",
        est_market_price_php: 175,
        substitution_name: "Giniling na manok",
        substitution_savings_php: 35,
      },
      { item_name: "Karot", amount: 1, unit: "pc", est_market_price_php: 15 },
      { item_name: "Bell pepper", amount: 1, unit: "pc", est_market_price_php: 25 },
      { item_name: "Pickle relish", amount: 0.25, unit: "cup", est_market_price_php: 20 },
      { item_name: "Keso (quick melt)", amount: 1, unit: "bar", est_market_price_php: 40 },
      { item_name: "Hotdog", amount: 5, unit: "pcs", est_market_price_php: 60 },
      { item_name: "Itlog", amount: 3, unit: "pcs", est_market_price_php: 24 },
      { item_name: "Pasas (raisins)", amount: 0.25, unit: "cup", est_market_price_php: 25 },
      { item_name: "Breadcrumbs", amount: 0.5, unit: "cup", est_market_price_php: 20 },
      { item_name: "Sibuyas", amount: 1, unit: "pc", est_market_price_php: 8 },
      { item_name: "Bawang", amount: 3, unit: "cloves", est_market_price_php: 3 },
      { item_name: "Tomato sauce", amount: 100, unit: "g", est_market_price_php: 22 },
      { item_name: "Aluminum foil", amount: 1, unit: "roll", est_market_price_php: 25 },
    ],
  },
];

/**
 * Hyper-budget staples for the "under ₱50" edge case — always available, no DB
 * lookup. Meant to be paired with a friendly "stretch your budget" tip.
 */
export const HYPER_BUDGET_STAPLES: Dish[] = [
  {
    id: "staple-sinangag-itlog",
    name: "Sinangag at Itlog",
    category: "Pang-Almusal",
    est_total_cost: 26,
    prep_time_mins: 10,
    servings: 1,
    image_url: null,
    instructions: [
      "Igisa ang tinadtad na bawang sa mantika hanggang golden.",
      "Idagdag ang malamig na kanin, budburan ng asin, haluin hanggang mainit.",
      "Iprito ang itlog sa gilid — sunny side up o scrambled.",
      "Ihain ang sinangag na may itlog sa ibabaw.",
    ],
    ingredients: [
      { item_name: "Kanin (tira)", amount: 1, unit: "cup", est_market_price_php: 12 },
      { item_name: "Itlog", amount: 1, unit: "pc", est_market_price_php: 8 },
      { item_name: "Bawang", amount: 3, unit: "cloves", est_market_price_php: 3 },
      { item_name: "Mantika", amount: 1, unit: "tbsp", est_market_price_php: 2 },
      { item_name: "Asin", amount: 1, unit: "pinch", est_market_price_php: 1 },
    ],
  },
  {
    id: "staple-lugaw-itlog",
    name: "Lugaw with Egg",
    category: "Tipid",
    est_total_cost: 29,
    prep_time_mins: 25,
    servings: 2,
    image_url: null,
    instructions: [
      "Igisa ang bawang at luya, idagdag ang hugasang bigas.",
      "Ibuhos ang 5–6 tasang tubig, pakuluan habang hinahalo hanggang lumapot.",
      "Timplahan ng patis o asin at paminta.",
      "Ihain na may pinakuluang itlog at toasted garlic sa ibabaw.",
    ],
    ingredients: [
      { item_name: "Bigas", amount: 0.5, unit: "cup", est_market_price_php: 10 },
      { item_name: "Itlog", amount: 1, unit: "pc", est_market_price_php: 8 },
      { item_name: "Bawang", amount: 3, unit: "cloves", est_market_price_php: 3 },
      { item_name: "Luya", amount: 1, unit: "thumb", est_market_price_php: 4 },
      { item_name: "Patis / asin", amount: 1, unit: "tsp", est_market_price_php: 2 },
      { item_name: "Mantika", amount: 1, unit: "tbsp", est_market_price_php: 2 },
    ],
  },
  {
    id: "staple-itlog-maalat-kamatis",
    name: "Itlog na Maalat at Kamatis",
    category: "Tipid",
    est_total_cost: 28,
    prep_time_mins: 5,
    servings: 1,
    image_url: null,
    instructions: [
      "Balatan at hiwain ang itlog na maalat.",
      "Hiwain ang kamatis at sibuyas.",
      "Pagsamahin sa plato, ihalo nang bahagya.",
      "Ihain na kasama ng mainit na kanin.",
    ],
    ingredients: [
      { item_name: "Itlog na maalat", amount: 1, unit: "pc", est_market_price_php: 18 },
      { item_name: "Kamatis", amount: 1, unit: "pc", est_market_price_php: 6 },
      { item_name: "Sibuyas", amount: 0.5, unit: "pc", est_market_price_php: 4 },
    ],
  },
];

/**
 * Real dish photos bundled in /public/dishes (sourced from Wikimedia Commons —
 * see public/dishes/ATTRIBUTION.txt). Keyed by dish name.
 */
export const DISH_PHOTOS: Record<string, string> = {
  "Ginisang Monggo": "/dishes/ginisang-monggo.jpg",
  "Tortang Talong": "/dishes/tortang-talong.jpg",
  "Ginisang Sayote": "/dishes/ginisang-sayote.jpg",
  "Ginataang Gulay": "/dishes/ginataang-gulay.jpg",
  "Pork Adobo": "/dishes/pork-adobo.jpg",
  "Chicken Tinola": "/dishes/chicken-tinola.jpg",
  "Pork Sinigang": "/dishes/pork-sinigang.jpg",
  "Chicken Afritada": "/dishes/chicken-afritada.jpg",
  "Kare-Kare": "/dishes/kare-kare.jpg",
  "Embutido": "/dishes/embutido.jpg",
  "Sinangag at Itlog": "/dishes/sinangag-itlog.jpg",
  "Lugaw with Egg": "/dishes/lugaw-itlog.jpg",
  "Itlog na Maalat at Kamatis": "/dishes/itlog-maalat-kamatis.jpg",
};

// Attach the real photo to every bundled dish; category illustration is the
// fallback for anything without one (e.g. AI-generated suggestions).
for (const dish of [...MOCK_DISHES, ...HYPER_BUDGET_STAPLES]) {
  if (!dish.image_url) {
    dish.image_url = DISH_PHOTOS[dish.name] ?? categoryImage(dish.category);
  }
}
