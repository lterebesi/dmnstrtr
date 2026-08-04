import "server-only";

import { createSupabaseServerClient } from "@/infrastructure/supabase/server";
import {
  findTicketById,
  updateTicketStatus as updateTicketStatusRepo,
} from "@/infrastructure/supabase/repositories/tickets.repository";
import { createNotification } from "@/infrastructure/supabase/repositories/notifications.repository";
import { recordAuditLog } from "@/infrastructure/supabase/repositories/audit-log.repository";
import type { TicketStatus } from "@/types/database";

const STATUS_LABELS: Record<TicketStatus, string> = {
  NOUA: "Nouă",
  IN_LUCRU: "În lucru",
  REZOLVATA: "Rezolvată",
};

export async function updateTicketStatus(input: {
  ticketId: string;
  status: TicketStatus;
  adminId: string;
}) {
  const supabase = await createSupabaseServerClient();

  const updated = await updateTicketStatusRepo(supabase, input.ticketId, input.status);

  const ticket = await findTicketById(supabase, input.ticketId);

  await recordAuditLog({
    actorId: input.adminId,
    action: "UPDATE_TICKET_STATUS",
    entity: "tickets",
    entityId: input.ticketId,
    diff: { status: input.status },
  });

  if (ticket) {
    await createNotification({
      userId: ticket.created_by,
      type: "SESIZARE_ACTUALIZATA",
      title: `Sesizare actualizată: ${ticket.title}`,
      body: `Status nou: ${STATUS_LABELS[input.status]}`,
      relatedEntity: "tickets",
      relatedId: ticket.id,
    });
  }

  return updated;
}
