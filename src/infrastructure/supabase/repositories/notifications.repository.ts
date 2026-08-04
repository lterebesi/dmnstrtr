import "server-only";

import { createSupabaseAdminClient } from "@/infrastructure/supabase/admin";
import type { NotificationType } from "@/types/database";

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
