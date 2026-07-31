export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True once real Supabase credentials are present in the environment. */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}
