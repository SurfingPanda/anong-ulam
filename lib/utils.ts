import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as Philippine Peso, e.g. 1250 -> "₱1,250" */
export function formatPHP(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  return `₱${rounded.toLocaleString("en-PH", {
    maximumFractionDigits: 2,
  })}`;
}

/** 45 -> "45 min", 90 -> "1 hr 30 min" */
export function formatMins(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}

/** Placeholder emoji per dish category, used when a dish's image fails to load. */
export function categoryEmoji(category: string): string {
  switch (category) {
    case "Tipid":
      return "🍲";
    case "Gulay":
      return "🥬";
    case "Pang-Pasko":
      return "🎄";
    case "Pang-Almusal":
      return "🍳";
    case "Lutong Bahay":
    default:
      return "🍛";
  }
}

/** Local placeholder photo per category (bundled in /public/dishes). */
export function categoryImage(category: string): string {
  switch (category) {
    case "Tipid":
      return "/dishes/tipid.svg";
    case "Gulay":
      return "/dishes/gulay.svg";
    case "Pang-Pasko":
      return "/dishes/pang-pasko.svg";
    case "Pang-Almusal":
      return "/dishes/pang-almusal.svg";
    case "Lutong Bahay":
    default:
      return "/dishes/lutong-bahay.svg";
  }
}
