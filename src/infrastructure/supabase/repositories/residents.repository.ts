import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export async function findActiveResidentByUserId(
  supabase: SupabaseClient<Database>,
  userId: string,
) {
  const { data } = await supabase
    .from("residents")
    .select("id, apartment_id")
    .eq("user_id", userId)
    .is("moved_out_at", null)
    .maybeSingle();

  return data;
}
