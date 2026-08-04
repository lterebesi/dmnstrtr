import "server-only";

import { createSupabaseServerClient } from "@/infrastructure/supabase/server";
import { findActiveResidentByUserId } from "@/infrastructure/supabase/repositories/residents.repository";
import { listTicketsByApartment } from "@/infrastructure/supabase/repositories/tickets.repository";
import { getTicketImageSignedUrl } from "@/infrastructure/supabase/repositories/ticket-images.repository";
import type { Ticket } from "@/domain/entities/ticket";

export async function getLocatarTickets(userId: string): Promise<Ticket[]> {
  if (process.env.DISABLE_AUTH === "true") return [];

  const supabase = await createSupabaseServerClient();
  const resident = await findActiveResidentByUserId(supabase, userId);
  if (!resident) return [];

  const tickets = await listTicketsByApartment(supabase, resident.apartment_id);

  return Promise.all(
    tickets.map(async (t) => ({
      id: t.id,
      title: t.title,
      category: t.category,
      description: t.description,
      status: t.status,
      createdAt: t.created_at,
      imageUrl: t.image_path
        ? await getTicketImageSignedUrl(supabase, t.image_path)
        : null,
      apartmentLabel: null,
    })),
  );
}
