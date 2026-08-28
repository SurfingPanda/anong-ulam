/**
 * Pulls a cook time out of a free-text instruction step so Cooking Mode can
 * offer a timer. Handles Taglish forms: "25 min", "20 minuto", "5–7 minuto",
 * "~40 min", "1 oras", "1.5 hours".
 */

const RE =
  /(?:~|about|mga)?\s*(\d+(?:\.\d+)?)(?:\s*[–-]\s*(\d+(?:\.\d+)?))?\s*(oras|hr|hrs|hour|hours|min|mins|minuto|minutos|minute|minutes)\b/i;

export interface ParsedDuration {
  seconds: number;
  label: string; // e.g. "25 min", "1 hr 5 min"
}

export function parseDuration(text: string): ParsedDuration | null {
  const m = text.match(RE);
  if (!m) return null;

  const lo = parseFloat(m[1]);
  const hi = m[2] ? parseFloat(m[2]) : lo;
  const value = Math.max(lo, hi); // use the upper bound of a range
  const unit = m[3].toLowerCase();
  const isHours = unit.startsWith("oras") || unit.startsWith("hr") || unit.startsWith("hour");
  const seconds = Math.round(value * (isHours ? 3600 : 60));
  if (seconds <= 0) return null;

  return { seconds, label: formatDurationLabel(seconds) };
}

export function formatDurationLabel(seconds: number): string {
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `${h} hr ${rem} min` : `${h} hr`;
}

/** mm:ss for a live countdown. */
export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}
