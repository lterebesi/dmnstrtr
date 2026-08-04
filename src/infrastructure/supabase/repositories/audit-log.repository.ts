import "server-only";

import { createSupabaseAdminClient } from "@/infrastructure/supabase/admin";

/**
 * Înregistrează o mutație a administratorului (cerință: "audit pentru
 * modificările administratorului"). `audit_log` nu are politică RLS de
 * INSERT (e append-only, doar admin poate citi) — scrierea se face
 * deliberat cu clientul service role. Eșecul de audit nu trebuie să
 * blocheze acțiunea principală — se loghează, dar nu aruncă.
 */
export async function recordAuditLog(entry: {
  actorId: string;
  action: string;
  entity: string;
  entityId?: string | null;
  diff?: Record<string, unknown> | null;
}) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("audit_log").insert({
    actor_id: entry.actorId,
    action: entry.action,
    entity: entry.entity,
    entity_id: entry.entityId ?? null,
    diff: entry.diff ?? null,
  });

  if (error) {
    console.error("audit_log insert failed", error);
  }
}
