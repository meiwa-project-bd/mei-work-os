"use client";

import { createBrowserClient } from "@supabase/ssr";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "./config";

/** Browser Supabase client. Returns null when env vars are not configured. */
export function createClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  return createBrowserClient(supabaseUrl!, supabaseAnonKey!);
}
