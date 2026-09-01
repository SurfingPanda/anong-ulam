/**
 * Renders a shareable "Tipid Breakdown" image on a canvas — no external libs.
 * Client-only (touches document/canvas). Carinderia / Fiesta styling.
 */

import { formatPHP } from "@/lib/utils";
import { REGIONS, PRICE_MODE_META, type PricedDish } from "@/lib/pricing-engine";
import type { Dish } from "@/lib/mock-ulam-data";

export interface ShareCardInput {
  dish: Dish;
  priced: PricedDish;
  servings: number;
}

export interface RenderedCard {
  blob: Blob;
  dataUrl: string;
}

const W = 1080;
const H = 1080;
const DISPLAY =
  "'Baloo 2', ui-rounded, 'Trebuchet MS', 'Segoe UI', system-ui, sans-serif";
const BODY = "'Nunito', system-ui, -apple-system, 'Segoe UI', sans-serif";

const CAT_STYLE: Record<string, [string, string]> = {
  Tipid: ["#3A7D44", "#ffffff"],
  Gulay: ["#4E9F3D", "#ffffff"],
  "Pang-Pasko": ["#C84B31", "#ffffff"],
  "Pang-Almusal": ["#F0C24B", "#3a2a12"],
  "Lutong Bahay": ["#E0863A", "#3a2a12"],
};

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
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

function pill(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  label: string,
  font: string,
  bg: string,
  fg: string,
): number {
  ctx.font = font;
  const padX = 26;
  const w = ctx.measureText(label).width + padX * 2;
  const h = 56;
  ctx.fillStyle = bg;
  roundRect(ctx, cx - w / 2, cy - h / 2, w, h, h / 2);
  ctx.fill();
  ctx.fillStyle = fg;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, cx, cy + 1);
  return w;
}

function sparkle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    ctx.rotate(Math.PI / 2);
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(r * 0.12, r * 0.12, 0, r);
    ctx.quadraticCurveTo(-r * 0.12, r * 0.12, 0, 0);
  }
  ctx.fill();
  ctx.restore();
}

function drawBowl(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);

  // steam
  ctx.strokeStyle = "rgba(120, 70, 40, 0.28)";
  ctx.lineWidth = 11;
  ctx.lineCap = "round";
  const steam = (dx: number) => {
    ctx.beginPath();
    ctx.moveTo(dx, -92);
    ctx.bezierCurveTo(dx - 16, -118, dx + 16, -134, dx, -164);
    ctx.stroke();
  };
  steam(-42);
  steam(2);
  steam(44);

  // plate
  ctx.fillStyle = "rgba(0,0,0,0.10)";
  ctx.beginPath();
  ctx.ellipse(0, 66, 152, 32, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#F4D160";
  ctx.beginPath();
  ctx.ellipse(0, 60, 148, 30, 0, 0, Math.PI * 2);
  ctx.fill();

  // ulam mound
  ctx.fillStyle = "#8E4224";
  ctx.beginPath();
  ctx.moveTo(-94, 0);
  ctx.bezierCurveTo(-80, -52, -32, -76, 0, -76);
  ctx.bezierCurveTo(32, -76, 80, -52, 94, 0);
  ctx.quadraticCurveTo(98, 20, 74, 20);
  ctx.lineTo(-74, 20);
  ctx.quadraticCurveTo(-98, 20, -94, 0);
  ctx.fill();
  ctx.fillStyle = "#C06A34";
  ctx.beginPath();
  ctx.ellipse(-26, -14, 19, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#A9552A";
  ctx.beginPath();
  ctx.ellipse(30, -4, 21, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#4E9F3D";
  ctx.beginPath();
  ctx.arc(-6, -30, 9, 0, Math.PI * 2);
  ctx.arc(40, -24, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#F4D160";
  ctx.beginPath();
  ctx.arc(12, -42, 6, 0, Math.PI * 2);
  ctx.fill();

  // bowl body
  const grad = ctx.createLinearGradient(0, 0, 0, 130);
  grad.addColorStop(0, "#FFF6E9");
  grad.addColorStop(1, "#E7D2B2");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(-118, 8);
  ctx.lineTo(118, 8);
  ctx.bezierCurveTo(118, 96, 66, 132, 0, 132);
  ctx.bezierCurveTo(-66, 132, -118, 96, -118, 8);
  ctx.fill();
  // rim
  ctx.fillStyle = "#FFF7EC";
  ctx.beginPath();
  ctx.ellipse(0, 8, 118, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#D9C09B";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(0, 8, 118, 26, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
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

  try {
    await Promise.all([
      document.fonts.load(`800 90px 'Baloo 2'`),
      document.fonts.load(`800 170px 'Baloo 2'`),
      document.fonts.load(`700 40px 'Baloo 2'`),
      document.fonts.load(`700 26px 'Nunito'`),
    ]);
  } catch {
    /* fall back to system font */
  }

  const cx = W / 2;
  const hasTipid = priced.totalSavings > 0;

  // ---------------------------------------------------------------- background
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#F3AC52");
  bg.addColorStop(0.5, "#D5542B");
  bg.addColorStop(1, "#972C1A");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const glow = (x: number, y: number, r: number, color: string) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  };
  glow(170, 110, 540, "rgba(255,222,150,0.5)");
  glow(1000, 1010, 560, "rgba(70,15,8,0.4)");

  // woven "solihiya" dots
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = "#2b1206";
  for (let yy = 26; yy < H; yy += 44)
    for (let xx = 26; xx < W; xx += 44) {
      ctx.beginPath();
      ctx.arc(xx, yy, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  ctx.restore();

  // ---------------------------------------------------------------- card panel
  const M = 54;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.38)";
  ctx.shadowBlur = 44;
  ctx.shadowOffsetY = 20;
  ctx.fillStyle = "#FFF6E9";
  roundRect(ctx, M, M, W - M * 2, H - M * 2, 58);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = "#EBBB4E";
  ctx.lineWidth = 4;
  roundRect(ctx, M + 22, M + 22, W - (M + 22) * 2, H - (M + 22) * 2, 42);
  ctx.stroke();

  // ---------------------------------------------------------------- chalkboard
  const bX = M + 44;
  const bY = M + 44;
  const bW = W - bX * 2;
  const bH = 232;
  ctx.save();
  ctx.translate(cx, bY + bH / 2);
  ctx.rotate(-0.018);
  ctx.translate(-cx, -(bY + bH / 2));
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 26;
  ctx.shadowOffsetY = 14;
  ctx.fillStyle = "#262F2A";
  roundRect(ctx, bX, bY, bW, bH, 34);
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "rgba(255,255,255,0.10)";
  ctx.lineWidth = 3;
  roundRect(ctx, bX + 10, bY + 10, bW - 20, bH - 20, 26);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#F4D160";
  ctx.font = `700 24px ${BODY}`;
  ctx.fillText("A N O N G   U L A M ?", cx, bY + 50);

  // Auto-size the dish name so it never spills past the board — cap by BOTH
  // line count (<= 2) and the vertical room left below the kicker.
  const availH = bH - 104;
  const maxNameW = bW - 92;
  let nameSize = 86;
  let nameLines: string[] = [dish.name];
  for (; nameSize >= 38; nameSize -= 4) {
    ctx.font = `800 ${nameSize}px ${DISPLAY}`;
    nameLines = wrap(ctx, dish.name, maxNameW);
    if (nameLines.length <= 2 && nameLines.length * nameSize * 1.14 <= availH)
      break;
  }
  nameLines = nameLines.slice(0, 2);
  ctx.font = `800 ${nameSize}px ${DISPLAY}`;
  ctx.fillStyle = "#FFF7EC";
  const lineStep = nameSize * 1.14;
  const blockH = nameLines.length * lineStep;
  const firstBaseline =
    bY + 70 + (availH - blockH) / 2 + nameSize * 0.8;
  nameLines.forEach((l, i) =>
    ctx.fillText(l, cx, firstBaseline + i * lineStep),
  );
  ctx.restore();

  // ---------------------------------------------------------------- bowl art
  drawBowl(ctx, cx, 460, 0.68);

  // ---------------------------------------------------------------- servings
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#8A5A38";
  ctx.font = `700 37px ${DISPLAY}`;
  ctx.fillText(`Niluto para sa ${servings} tao`, cx, 566);

  // ---------------------------------------------------------------- big price
  const priceStr = formatPHP(priced.yourPrice);
  const priceFont = `800 156px ${DISPLAY}`;
  const langFont = `700 42px ${DISPLAY}`;
  ctx.font = priceFont;
  const priceW = ctx.measureText(priceStr).width;
  ctx.font = langFont;
  const langW = ctx.measureText("lang!").width;
  const groupGap = 14;
  const groupX = cx - (priceW + groupGap + langW) / 2;
  const priceBaseline = 692;

  ctx.save();
  ctx.fillStyle = "#C0402A";
  ctx.font = priceFont;
  ctx.textAlign = "left";
  ctx.shadowColor = "rgba(192,64,42,0.26)";
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 7;
  ctx.fillText(priceStr, groupX, priceBaseline);
  ctx.restore();

  ctx.fillStyle = "#8A5A38";
  ctx.font = langFont;
  ctx.textAlign = "left";
  ctx.fillText("lang!", groupX + priceW + groupGap, priceBaseline);
  ctx.textAlign = "center";

  sparkle(ctx, groupX - 30, priceBaseline - 118, 22, "#F4D160");
  sparkle(ctx, groupX + priceW + langW + 4, priceBaseline - 92, 15, "#EEB74A");
  sparkle(ctx, groupX + priceW + 30, priceBaseline - 132, 12, "#F4D160");

  // ---------------------------------------------------------------- tipid strip
  const chipsY = hasTipid ? 900 : 848;
  if (hasTipid) {
    const sX = 132;
    const sW = W - sX * 2;
    const sY = 758;
    const sH = 88;
    ctx.fillStyle = "#FBEAD1";
    roundRect(ctx, sX, sY, sW, sH, 24);
    ctx.fill();
    ctx.strokeStyle = "#E7C79E";
    ctx.lineWidth = 2;
    roundRect(ctx, sX, sY, sW, sH, 24);
    ctx.stroke();

    const midY = sY + sH / 2;
    // left: SRP (struck) -> your price
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    let lx = sX + 34;
    ctx.font = `700 30px ${BODY}`;
    ctx.fillStyle = "#A07B58";
    ctx.fillText("SRP ", lx, midY);
    lx += ctx.measureText("SRP ").width;
    const srpTxt = formatPHP(priced.srpTotal);
    const srpW = ctx.measureText(srpTxt).width;
    ctx.fillText(srpTxt, lx, midY);
    ctx.strokeStyle = "#C0402A";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(lx - 2, midY);
    ctx.lineTo(lx + srpW + 2, midY);
    ctx.stroke();
    lx += srpW + 14;
    ctx.fillStyle = "#8A5A38";
    ctx.font = `800 32px ${DISPLAY}`;
    ctx.fillText("→", lx, midY);
    lx += ctx.measureText("→").width + 14;
    ctx.fillStyle = "#2B1A12";
    ctx.font = `800 34px ${DISPLAY}`;
    ctx.fillText(formatPHP(priced.yourPrice), lx, midY);

    // right: green TIPID badge
    ctx.font = `800 30px ${DISPLAY}`;
    const badgeTxt = `TIPID ${formatPHP(priced.totalSavings)}`;
    const badgeW = ctx.measureText(badgeTxt).width + 74;
    const badgeH = 60;
    const badgeX = sX + sW - 20 - badgeW;
    ctx.fillStyle = "#3A7D44";
    roundRect(ctx, badgeX, midY - badgeH / 2, badgeW, badgeH, badgeH / 2);
    ctx.fill();
    ctx.fillStyle = "#BFE6B5";
    ctx.beginPath();
    ctx.arc(badgeX + 30, midY, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.fillText(badgeTxt, badgeX + 48, midY + 1);
  } else {
    // No pantry / swap savings — a small chalk-dash divider keeps the
    // lower half from feeling empty.
    ctx.strokeStyle = "#E7C79E";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.setLineDash([6, 14]);
    ctx.beginPath();
    ctx.moveTo(cx - 150, 764);
    ctx.lineTo(cx + 150, 764);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // ---------------------------------------------------------------- chips
  const region =
    REGIONS.find((r) => r.id === priced.region)?.short ?? priced.region;
  const cat = CAT_STYLE[dish.category] ?? ["#E0863A", "#3a2a12"];
  const chipDefs: [string, string, string][] = [
    [dish.category, cat[0], cat[1]],
    [`${dish.prep_time_mins} min`, "#F1DDBF", "#5A3B28"],
    [
      `${PRICE_MODE_META[priced.priceMode].short} · ${region}`,
      "#F1DDBF",
      "#5A3B28",
    ],
  ];
  ctx.font = `800 28px ${DISPLAY}`;
  const chipW = chipDefs.map(
    ([t]) => ctx.measureText(t).width + 52,
  );
  const gap = 20;
  let cxRun =
    cx - (chipW.reduce((s, w) => s + w, 0) + gap * (chipDefs.length - 1)) / 2;
  chipDefs.forEach(([t, b, f], i) => {
    pill(ctx, cxRun + chipW[i] / 2, chipsY, t, `800 28px ${DISPLAY}`, b, f);
    cxRun += chipW[i] + gap;
  });

  // ---------------------------------------------------------------- footer
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#C0402A";
  ctx.font = `800 42px ${DISPLAY}`;
  ctx.fillText("#AnongUlam", cx, H - 112);
  ctx.fillStyle = "#9A7B5E";
  ctx.font = `700 24px ${BODY}`;
  ctx.fillText("hanap-ulam.vercel.app", cx, H - 76);

  // ---------------------------------------------------------------- corner ribbon
  if (hasTipid) {
    ctx.save();
    const rc = W - M; // top-right corner x/y
    ctx.translate(rc, M);
    ctx.rotate(Math.PI / 4);
    ctx.shadowColor = "rgba(0,0,0,0.28)";
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = "#3A7D44";
    ctx.fillRect(-260, -34, 520, 66);
    ctx.shadowColor = "transparent";
    ctx.fillStyle = "#BFE6B5";
    ctx.fillRect(-260, 26, 520, 4);
    ctx.fillStyle = "#ffffff";
    ctx.font = `800 34px ${DISPLAY}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("S U L I T !", 0, -1);
    ctx.restore();
  }

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
