import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/infrastructure/supabase/admin";
import type { Database, NotificationType } from "@/types/database";

/**
 * `notifications` nu are politică RLS de INSERT (userul doar citește/
 * marchează propriile notificări) — sistemul le creează cu service role,
 * la fel ca `audit_log`.
 */
export async function createNotification(entry: {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  relatedEntity?: string;
  relatedId?: string;
}) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("notifications").insert({
    user_id: entry.userId,
    type: entry.type,
    title: entry.title,
    body: entry.body ?? null,
    related_entity: entry.relatedEntity ?? null,
    related_id: entry.relatedId ?? null,
  });

  if (error) {
    console.error("notifications insert failed", error);
  }
}

/** Notificările userului curent (sesiune normală — RLS aplicat, self-only). */
export async function listNotifications(
  supabase: SupabaseClient<Database>,
  userId: string,
  limit = 30,
) {
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}

export async function markNotificationRead(
  supabase: SupabaseClient<Database>,
  notificationId: string,
) {
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId);
}
