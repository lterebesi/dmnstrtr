"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { supabaseEnv } from "./env";

/**
 * Client Supabase pentru Client Components. Folosește cheia publică (anon) —
 * accesul la date rămâne limitat de RLS, niciodată de acest client.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(supabaseEnv.url, supabaseEnv.anonKey);
}
