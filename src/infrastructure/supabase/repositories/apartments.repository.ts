import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export async function findApartmentById(
  supabase: SupabaseClient<Database>,
  apartmentId: string,
) {
  const { data } = await supabase
    .from("apartments")
    .select("id, number, floor, staircase_id, block_id")
    .eq("id", apartmentId)
    .maybeSingle();

  return data;
}

export async function listApartmentsByBlock(
  supabase: SupabaseClient<Database>,
  blockId: string,
) {
  const { data } = await supabase
    .from("apartments")
    .select("id, number, floor, staircase_id, block_id")
    .eq("block_id", blockId)
    .order("number");

  return data ?? [];
}

export async function listApartmentsByStaircase(
  supabase: SupabaseClient<Database>,
  staircaseId: string,
) {
  const { data } = await supabase
    .from("apartments")
    .select("id, number, floor, staircase_id, block_id")
    .eq("staircase_id", staircaseId)
    .order("number");

  return data ?? [];
}

export async function createApartment(
  supabase: SupabaseClient<Database>,
  input: { staircaseId: string; number: string; floor: number | null },
) {
  const { data, error } = await supabase
    .from("apartments")
    .insert({
      staircase_id: input.staircaseId,
      number: input.number,
      floor: input.floor,
    })
    .select("id, number, floor, staircase_id, block_id")
    .single();

  if (error) throw error;
  return data;
}
