/**
 * DA "Bantay Presyo" price monitoring — the live source.
 *
 * The Department of Agriculture publishes NCR wet-market prices as text-layer
 * PDFs on https://www.da.gov.ph/price-monitoring/ :
 *   - "Weekly Average Retail Price …"  — one clean row per commodity, has an
 *     explicit unit column. This is the primary feed.
 *   - "Daily Price Index …"            — same commodities, updated daily, but a
 *     messier multi-row layout. Used as a fresher supplementary signal.
 *
 * Everything here is best-effort: any network / parse failure returns `[]` and
 * logs, so a DA site change never breaks the app — dishes just fall back to the
 * hardcoded estimates until the parser is updated.
 */

import { extractTextItems } from "unpdf";

import { COMMODITIES, type Commodity } from "@/lib/market-prices";
import type { RawMarketPrice } from "@/lib/sources/types";

const LISTING_URL = "https://www.da.gov.ph/price-monitoring/";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36";

const MONTHS: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

function isoDate(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** "…-August-24-30-2026.pdf" / "…-July-27-August-2-2026.pdf" -> end date. */
export function asOfFromWeeklyName(name: string): string | null {
  const m = name.match(
    /-([A-Za-z]+)-(\d{1,2})-(?:([A-Za-z]+)-)?(\d{1,2})-(\d{4})\.pdf/i,
  );
  if (!m) return null;
  const [, mon1, , mon2, day2, year] = m;
  const mon = MONTHS[(mon2 || mon1).toLowerCase()];
  if (!mon) return null;
  return isoDate(Number(year), mon, Number(day2));
}

/** "…-Daily-Price-Index-August-31-2026.pdf" -> that date. */
export function asOfFromDailyName(name: string): string | null {
  const m = name.match(/-([A-Za-z]+)-(\d{1,2})-(\d{4})\.pdf/i);
  if (!m) return null;
  const mon = MONTHS[m[1].toLowerCase()];
  if (!mon) return null;
  return isoDate(Number(m[3]), mon, Number(m[2]));
}

/**
 * DA has published this file under a few slug spellings over time
 * ("Weekly-Average-Prices-…", "Weekly-Average-Retail-Price-…"); match them all
 * so a rename on their end doesn't silently zero out the feed.
 */
const WEEKLY_SLUG_RE = /Weekly-Average(?:-Retail)?-Prices?-/i;
const DAILY_SLUG_RE = /Daily-Price-Index-/i;

async function scrapeListing(): Promise<{ weekly?: string; daily?: string }> {
  const res = await fetch(LISTING_URL, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`listing ${res.status}`);
  const html = await res.text();
  const re =
    /href="(https:\/\/www\.da\.gov\.ph\/wp-content\/uploads\/[^"]+\.pdf)"/gi;
  let weekly: string | undefined;
  let daily: string | undefined;
  for (const m of html.matchAll(re)) {
    const url = m[1];
    const file = url.split("/").pop() ?? "";
    if (!weekly && WEEKLY_SLUG_RE.test(file)) weekly = url;
    else if (!daily && DAILY_SLUG_RE.test(file)) daily = url;
    if (weekly && daily) break;
  }
  return { weekly, daily };
}

// ---------------------------------------------------------------------------
// PDF -> lines (reconstruct visual rows by y-position, then x-order)
// ---------------------------------------------------------------------------

interface Line {
  text: string;
  section: string;
}

function looksLikeHeader(text: string): boolean {
  if (text.length < 4 || text.length > 60) return false;
  if (/\d\.\d/.test(text)) return false;
  if (/^page\b/i.test(text) || /unit \(p\/unit\)/i.test(text)) return false;
  if (/^(commodity|specification|prevailing)/i.test(text)) return false;
  const letters = text.replace(/[^A-Za-z]/g, "");
  return letters.length >= 3 && letters === letters.toUpperCase();
}

async function pdfToLines(bytes: Uint8Array): Promise<Line[]> {
  const { totalPages, items } = await extractTextItems(bytes);
  const out: Line[] = [];
  let section = "";

  for (let p = 0; p < totalPages; p++) {
    const rows: { y: number; parts: { x: number; str: string }[] }[] = [];
    for (const it of items[p] as { str: string; x: number; y: number }[]) {
      if (!it.str || !it.str.trim()) continue;
      let row = rows.find((r) => Math.abs(r.y - it.y) <= 3);
      if (!row) {
        row = { y: it.y, parts: [] };
        rows.push(row);
      }
      row.parts.push({ x: it.x, str: it.str });
    }
    rows.sort((a, b) => b.y - a.y);
    for (const r of rows) {
      const text = r.parts
        .sort((a, b) => a.x - b.x)
        .map((x) => x.str)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      if (!text) continue;
      if (looksLikeHeader(text)) {
        section = text;
        continue;
      }
      out.push({ text, section });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// lines -> prices
// ---------------------------------------------------------------------------

const PRICE_RE = /\b(\d{1,3}(?:,\d{3})*\.\d{2})\b/g;

/** Trailing peso figure on a line, or null (specs like "8-10 pcs/kg" have no ".NN"). */
function priceOf(text: string): number | null {
  const matches = text.match(PRICE_RE);
  if (!matches) return null;
  const v = Number(matches[matches.length - 1].replace(/,/g, ""));
  return Number.isFinite(v) ? v : null;
}

/**
 * Does the weekly row's unit column contradict the commodity's canonical unit?
 * Weekly rows end "… <unit> <price>" (e.g. "… kg 268.53", "… pc 8.04"); the
 * token must be space-delimited and sit immediately before the trailing price so
 * spec fragments like "(151-250gm/pc)" or "15-18 pcs/kg" don't trip it. Daily
 * rows have no unit column -> no token -> assume canonical.
 */
function unitMismatch(text: string, c: Commodity): boolean {
  const u = text.match(/\s(kg|pc|pcs|ml|l|liter)\s+\d[\d,]*\.\d{2}\s*$/i);
  if (!u) return false;
  const tok = u[1].toLowerCase();
  const isPiece = tok === "pc" || tok === "pcs";
  if (c.unit === "pc") return !isPiece;
  return isPiece; // kg / L commodities never priced per piece
}

function median(nums: number[]): number {
  const s = [...nums].sort((a, b) => a - b);
  const mid = s.length >> 1;
  return s.length % 2 ? s[mid] : Math.round(((s[mid - 1] + s[mid]) / 2) * 100) / 100;
}

export function parseDaLines(
  lines: Line[],
  asOf: string,
  source: RawMarketPrice["source"],
): RawMarketPrice[] {
  const out: RawMarketPrice[] = [];

  for (const c of COMMODITIES) {
    if (!c.da) continue;
    const hits = lines.filter(
      (l) =>
        (!c.da!.section || c.da!.section.test(l.section)) &&
        c.da!.label.test(l.text) &&
        !(c.da!.exclude && c.da!.exclude.test(l.text)) &&
        !unitMismatch(l.text, c),
    );
    if (hits.length === 0) continue;

    const preferred = c.da.prefer
      ? hits.filter((l) => c.da!.prefer!.test(l.text))
      : [];
    const pool = preferred.length ? preferred : hits;

    const prices = pool
      .map((l) => priceOf(l.text))
      .filter((v): v is number => v != null && v >= c.band[0] && v <= c.band[1]);
    if (prices.length === 0) continue;

    out.push({
      commodityKey: c.key,
      unit: c.unit,
      pricePhp: median(prices),
      asOf,
      source,
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// public entry points
// ---------------------------------------------------------------------------

async function fetchPdfLines(url: string): Promise<Line[]> {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  const buf = new Uint8Array(await res.arrayBuffer());
  return pdfToLines(buf);
}

/** Fetch one PDF and turn it into price rows; never throws. */
async function fetchOne(
  url: string | undefined,
  kind: "weekly" | "daily",
  source: RawMarketPrice["source"],
  asOfFromName: (name: string) => string | null,
): Promise<RawMarketPrice[]> {
  if (!url) {
    console.error(`[da] no ${kind} PDF link found`);
    return [];
  }
  try {
    const asOf = asOfFromName(url) ?? new Date().toISOString().slice(0, 10);
    const rows = parseDaLines(await fetchPdfLines(url), asOf, source);
    console.log(`[da] ${kind} ${url.split("/").pop()} -> ${rows.length} commodities`);
    return rows;
  } catch (err) {
    console.error(`[da] ${kind} fetch failed:`, err);
    return [];
  }
}

/**
 * Both DA feeds (weekly + daily) from a single listing scrape. Best-effort: a
 * failure in either half returns `[]` for that half, never throws.
 */
export async function fetchDaPrices(): Promise<RawMarketPrice[]> {
  let listing: { weekly?: string; daily?: string };
  try {
    listing = await scrapeListing();
  } catch (err) {
    console.error("[da] listing scrape failed:", err);
    return [];
  }

  const [weekly, daily] = await Promise.all([
    fetchOne(listing.weekly, "weekly", "da-weekly", asOfFromWeeklyName),
    fetchOne(listing.daily, "daily", "da-daily", asOfFromDailyName),
  ]);
  return [...weekly, ...daily];
}
