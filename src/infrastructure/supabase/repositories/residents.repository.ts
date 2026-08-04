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

export async function findActiveResidentByApartmentId(
  supabase: SupabaseClient<Database>,
  apartmentId: string,
) {
  const { data } = await supabase
    .from("residents")
    .select("id, user_id")
    .eq("apartment_id", apartmentId)
    .is("moved_out_at", null)
    .maybeSingle();

  return data;
}

export async function assignResident(
  supabase: SupabaseClient<Database>,
  input: { apartmentId: string; userId: string },
) {
  const { data, error } = await supabase
    .from("residents")
    .insert({ apartment_id: input.apartmentId, user_id: input.userId })
    .select("id, user_id, apartment_id")
    .single();

  if (error) throw error;
  return data;
}
