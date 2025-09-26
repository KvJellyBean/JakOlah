import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side instance
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

// Server-side instance for API routes
export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}
