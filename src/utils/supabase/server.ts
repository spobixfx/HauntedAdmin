import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Public anon client – safe for regular DB operations.
 */
export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are not set");
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Service-role client – for server-side admin operations only.
 * This MUST NEVER be exposed to the client.
 */
export function createServiceClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Supabase service role env vars are not set");
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceRoleKey);
}

