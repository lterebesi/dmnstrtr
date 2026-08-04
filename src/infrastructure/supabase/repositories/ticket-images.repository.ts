import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const BUCKET = "ticket-images";
const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 oră

export async function uploadTicketImage(
  supabase: SupabaseClient<Database>,
  input: { userId: string; fileName: string; file: File },
) {
  const path = `${input.userId}/${Date.now()}-${input.fileName}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, input.file, {
    contentType: input.file.type,
    upsert: false,
  });

  if (error) throw error;
  return path;
}

export async function getTicketImageSignedUrl(
  supabase: SupabaseClient<Database>,
  path: string,
) {
  const { data } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  return data?.signedUrl ?? null;
}
