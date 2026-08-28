/**
 * Renders a shareable "Tipid Breakdown" image on a canvas — no external libs.
 * Client-only (touches document/canvas).
 */

import { formatPHP } from "@/lib/utils";
import { REGIONS, PRICE_MODE_META, type PricedDish } from "@/lib/pricing-engine";
import type { Dish } from "@/lib/mock-ulam-data";

export interface ShareCardInput {
  dish: Dish;
  priced: PricedDish;
  servings: number;
}

const W = 1080;
const H = 1080;

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export interface RenderedCard {
  blob: Blob;
  dataUrl: string;
}

export async function renderShareCard(
  input: ShareCardInput,
): Promise<RenderedCard> {
  const { dish, priced, servings } = input;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D not supported");

  // background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#f7a94b");
  bg.addColorStop(1, "#a3271b");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // inner panel
  ctx.fillStyle = "#fff7ec";
  roundRect(ctx, 64, 64, W - 128, H - 128, 48);
  ctx.fill();

  const cx = W / 2;
  ctx.textAlign = "center";

  // kicker
  ctx.fillStyle = "#a3271b";
  ctx.font = "700 34px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
  ctx.fillText("ANONG ULAM?", cx, 190);

  // dish name
  ctx.fillStyle = "#2b1a12";
  ctx.font = "800 84px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
  const nameLines = wrap(ctx, dish.name, W - 260);
  let y = 200 + 96;
  for (const l of nameLines.slice(0, 2)) {
    ctx.fillText(l, cx, y);
    y += 96;
  }

  // "for N people"
  ctx.fillStyle = "#6b4a34";
  ctx.font = "500 40px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
  ctx.fillText(`Niluto para sa ${servings} tao`, cx, y + 20);

  // big price
  ctx.fillStyle = "#a3271b";
  ctx.font = "800 170px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
  ctx.fillText(formatPHP(priced.yourPrice), cx, y + 220);

  ctx.fillStyle = "#6b4a34";
  ctx.font = "600 36px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
  ctx.fillText("lang!", cx, y + 270);

  // savings / SRP line
  let metaY = y + 350;
  if (priced.totalSavings > 0) {
    ctx.font = "500 34px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
    ctx.fillStyle = "#8a6a52";
    ctx.fillText(
      `SRP ${formatPHP(priced.srpTotal)}  ·  tipid ${formatPHP(priced.totalSavings)}`,
      cx,
      metaY,
    );
    metaY += 52;
  }

  // chips row
  const region =
    REGIONS.find((r) => r.id === priced.region)?.short ?? priced.region;
  const chips = [
    `${dish.prep_time_mins} min`,
    `${PRICE_MODE_META[priced.priceMode].short}`,
    region,
  ];
  ctx.font = "600 30px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
  const gap = 24;
  const padX = 26;
  const widths = chips.map((c) => ctx.measureText(c).width + padX * 2);
  const totalW = widths.reduce((s, w) => s + w, 0) + gap * (chips.length - 1);
  let chipX = cx - totalW / 2;
  for (let i = 0; i < chips.length; i++) {
    ctx.fillStyle = "#f0dcc4";
    roundRect(ctx, chipX, metaY, widths[i], 56, 28);
    ctx.fill();
    ctx.fillStyle = "#5a3b28";
    ctx.textAlign = "center";
    ctx.fillText(chips[i], chipX + widths[i] / 2, metaY + 37);
    chipX += widths[i] + gap;
  }

  // hashtag
  ctx.fillStyle = "#a3271b";
  ctx.font = "800 44px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("#AnongUlam", cx, H - 120);

  const dataUrl = canvas.toDataURL("image/png");
  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      "image/png",
    ),
  );
  return { blob, dataUrl };
}

export function shareCaption(input: ShareCardInput): string {
  const { dish, priced, servings } = input;
  const base = `Niluto ko ang ${dish.name} para sa ${servings} tao sa halagang ${formatPHP(
    priced.yourPrice,
  )} lang! 🍲`;
  const tipid =
    priced.totalSavings > 0
      ? ` Tipid ng ${formatPHP(priced.totalSavings)}.`
      : "";
  return `${base}${tipid} #AnongUlam`;
}
