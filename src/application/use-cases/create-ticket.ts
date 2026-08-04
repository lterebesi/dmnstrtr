import "server-only";

import { createSupabaseServerClient } from "@/infrastructure/supabase/server";
import { findActiveResidentByUserId } from "@/infrastructure/supabase/repositories/residents.repository";
import { createTicket as createTicketRepo } from "@/infrastructure/supabase/repositories/tickets.repository";
import { uploadTicketImage } from "@/infrastructure/supabase/repositories/ticket-images.repository";
import type { TicketCategory } from "@/types/database";

export type CreateTicketResult =
  | { ok: true }
  | { ok: false; error: "NO_APARTMENT" };

export async function createTicket(input: {
  userId: string;
  title: string;
  category: TicketCategory;
  description: string;
  image: File | null;
}): Promise<CreateTicketResult> {
  const supabase = await createSupabaseServerClient();

  const resident = await findActiveResidentByUserId(supabase, input.userId);
  if (!resident) return { ok: false, error: "NO_APARTMENT" };

  let imagePath: string | null = null;
  if (input.image && input.image.size > 0) {
    imagePath = await uploadTicketImage(supabase, {
      userId: input.userId,
      fileName: input.image.name,
      file: input.image,
    });
  }

  await createTicketRepo(supabase, {
    apartmentId: resident.apartment_id,
    createdBy: input.userId,
    title: input.title,
    category: input.category,
    description: input.description,
    imagePath,
  });

  return { ok: true };
}
