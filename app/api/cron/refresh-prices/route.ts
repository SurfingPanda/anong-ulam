/**
 * Nightly commodity-price refresh. Registered as a Vercel Cron in `vercel.json`
 * (`0 21 * * *` UTC ≈ 05:00 Manila, after DA posts the day's index).
 *
 * Auth: when `CRON_SECRET` is set, Vercel Cron sends it as `Authorization:
 * Bearer <secret>` automatically, and manual callers must do the same. Without
 * `CRON_SECRET` we only accept Vercel's own `x-vercel-cron` header.
 *
 * Always returns 200 with a JSON summary unless auth fails (401) — a bad source
 * day is not an error, the last good prices simply stay.
 */

import { refreshMarketPrices } from "@/lib/sources/refresh";
import { invalidateMarketPricesCache } from "@/lib/market-prices.server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    return req.headers.get("authorization") === `Bearer ${secret}`;
  }
  return req.headers.has("x-vercel-cron");
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const started = Date.now();
  const result = await refreshMarketPrices();
  if (result.ok) invalidateMarketPricesCache();

  return Response.json(
    { ...result, ms: Date.now() - started },
    { status: 200 },
  );
}
