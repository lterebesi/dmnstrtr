import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export async function findStaircaseById(
  supabase: SupabaseClient<Database>,
  staircaseId: string,
) {
  const { data } = await supabase
    .from("staircases")
    .select("id, name, block_id")
    .eq("id", staircaseId)
    .maybeSingle();

  return data;
}

export async function listStaircasesByBlock(
  supabase: SupabaseClient<Database>,
  blockId: string,
) {
  const { data } = await supabase
    .from("staircases")
    .select("id, name, block_id")
    .eq("block_id", blockId)
    .order("name");

  return data ?? [];
}

export async function createStaircase(
  supabase: SupabaseClient<Database>,
  input: { blockId: string; name: string },
) {
  const { data, error } = await supabase
    .from("staircases")
    .insert({ block_id: input.blockId, name: input.name })
    .select("id, name, block_id")
    .single();

  if (error) throw error;
  return data;
}
