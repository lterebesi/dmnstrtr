import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { supabaseEnv } from "./env";

/**
 * Client Supabase pentru Server Components, Server Actions și Route
 * Handlers. Sesiunea vine din cookies httpOnly — accesul la date e limitat
 * de RLS pe baza `auth.uid()` din acea sesiune.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseEnv.url, supabaseEnv.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Poate fi apelat dintr-un Server Component (fără scriere de
          // cookies) — sesiunea e oricum reîmprospătată în proxy.ts.
        }
      },
    },
  });
}
