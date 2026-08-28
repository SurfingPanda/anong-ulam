import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client. Integration is scaffolded but not required yet — the
 * landing page runs entirely on the mock dataset. Once you add credentials to
 * `.env.local`, `supabase` becomes a live client instead of `null`.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null;
