import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the SERVICE ROLE key. Bypasses RLS, so it
 * must never be imported into client code. Used only to persist AI-generated
 * dishes (see app/actions/save-ai-dishes.ts).
 *
 * `null` when NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is unset —
 * in that case AI dishes simply aren't saved and everything else is unchanged.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const aiPersistenceEnabled = Boolean(url && serviceKey);

export const supabaseAdmin: SupabaseClient | null = aiPersistenceEnabled
  ? createClient(url as string, serviceKey as string, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;
