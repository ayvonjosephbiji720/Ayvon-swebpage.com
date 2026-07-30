import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Service-role Supabase client. Bypasses Row Level Security, so it only
 * ever runs on the server (the `server-only` import throws a build error if
 * it's pulled into a client bundle) — used exclusively by the reminder cron
 * route, which needs to read every user's upcoming events, not just one.
 */
export function getSupabaseAdminClient(): SupabaseClient<Database> | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
