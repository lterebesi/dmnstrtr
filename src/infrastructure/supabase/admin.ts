import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { supabaseEnv } from "./env";

/**
 * Client Supabase cu service role key — ignoră RLS.
 *
 * Folosit STRICT server-side pentru operații privilegiate (ex: scriere
 * audit_log, joburi de sistem). Nu importa acest modul din cod care rulează
 * și în browser — importul `server-only` face build-ul să eșueze dacă se
 * întâmplă asta din greșeală.
 */
export function createSupabaseAdminClient() {
  return createClient<Database>(supabaseEnv.url, supabaseEnv.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
