import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export async function findBlockById(
  supabase: SupabaseClient<Database>,
  blockId: string,
) {
  const { data } = await supabase
    .from("blocks")
    .select("id, name, address")
    .eq("id", blockId)
    .maybeSingle();

  return data;
}

export async function listBlocksForAdmin(supabase: SupabaseClient<Database>) {
  const { data } = await supabase
    .from("blocks")
    .select("id, name, address, created_at")
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function createBlock(
  supabase: SupabaseClient<Database>,
  input: { name: string; address: string; createdBy: string },
) {
  const { data, error } = await supabase
    .from("blocks")
    .insert({ name: input.name, address: input.address, created_by: input.createdBy })
    .select("id, name, address")
    .single();

  if (error) throw error;

  await supabase
    .from("block_admins")
    .insert({ block_id: data.id, user_id: input.createdBy });

  return data;
}
