/** Buckets a palengke shopping list into the stalls you actually walk to. */

export type MarketSection = "karnehan" | "isdaan" | "gulayan" | "pampalasa";

export const MARKET_SECTIONS: {
  id: MarketSection;
  emoji: string;
  title: string;
}[] = [
  { id: "karnehan", emoji: "🥩", title: "Karnehan (Meat & Poultry)" },
  { id: "isdaan", emoji: "🐟", title: "Isdaan (Seafood)" },
  { id: "gulayan", emoji: "🥦", title: "Gulayan (Produce)" },
  { id: "pampalasa", emoji: "🧂", title: "Pampalasa at Sari-sari" },
];

const KARNE = [
  "baboy",
  "liempo",
  "manok",
  "giniling",
  "hotdog",
  "pata",
  "buntot",
  "karne",
  "chicken",
  "pork",
  "chorizo",
  "longganisa",
];

const ISDA = [
  "bangus",
  "hipon",
  "isda",
  "tilapia",
  "galunggong",
  "tuyo",
  "daing",
  "pusit",
  "alimango",
  "tahong",
];

const GULAY = [
  "talong",
  "sitaw",
  "kangkong",
  "kalabasa",
  "kamatis",
  "sibuyas",
  "bawang",
  "luya",
  "patatas",
  "karot",
  "carrot",
  "pechay",
  "sayote",
  "labanos",
  "okra",
  "gabi",
  "malunggay",
  "sili",
  "puso ng saging",
  "munggo",
  "mung bean",
  "papaya",
  "ampalaya",
  "repolyo",
  "bell pepper",
  "tokwa",
  "gulay",
];

export function marketSection(itemName: string): MarketSection {
  const n = itemName.toLowerCase();
  if (KARNE.some((k) => n.includes(k))) return "karnehan";
  if (ISDA.some((k) => n.includes(k))) return "isdaan";
  if (GULAY.some((k) => n.includes(k))) return "gulayan";
  return "pampalasa";
}
