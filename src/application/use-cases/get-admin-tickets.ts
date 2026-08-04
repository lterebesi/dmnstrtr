import "server-only";

import { createSupabaseServerClient } from "@/infrastructure/supabase/server";
import { listTicketsForAdmin } from "@/infrastructure/supabase/repositories/tickets.repository";
import { findApartmentById } from "@/infrastructure/supabase/repositories/apartments.repository";
import { getTicketImageSignedUrl } from "@/infrastructure/supabase/repositories/ticket-images.repository";
import type { Ticket } from "@/domain/entities/ticket";

export async function getAdminTickets(): Promise<Ticket[]> {
  if (process.env.DISABLE_AUTH === "true") return [];

  const supabase = await createSupabaseServerClient();
  const tickets = await listTicketsForAdmin(supabase);

  const apartmentCache = new Map<string, string>();

  return Promise.all(
    tickets.map(async (t) => {
      let apartmentLabel = apartmentCache.get(t.apartment_id);
      if (!apartmentLabel) {
        const apartment = await findApartmentById(supabase, t.apartment_id);
        apartmentLabel = apartment ? `Ap. ${apartment.number}` : "—";
        apartmentCache.set(t.apartment_id, apartmentLabel);
      }
      return {
        id: t.id,
        title: t.title,
        category: t.category,
        description: t.description,
        status: t.status,
        createdAt: t.created_at,
        imageUrl: t.image_path
          ? await getTicketImageSignedUrl(supabase, t.image_path)
          : null,
        apartmentLabel,
      };
    }),
  );
}
