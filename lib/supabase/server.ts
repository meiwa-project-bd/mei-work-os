import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "./config";

/**
 * Server-side Supabase client for use in Server Components, Server Actions,
 * and Route Handlers. Returns null when env vars are not configured.
 */
export async function createClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component render — session refresh is
          // handled in proxy.ts instead, so this can be safely ignored.
        }
      },
    },
  });
}
