"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createTicket } from "@/application/use-cases/create-ticket";
import { updateTicketStatus } from "@/application/use-cases/update-ticket-status";
import { createTicketSchema, updateTicketStatusSchema } from "@/lib/validation/tickets";

export interface ActionState {
  error: string | null;
}

const INITIAL_STATE: ActionState = { error: null };

export async function createTicketAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();

  const parsed = createTicketSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    description: formData.get("description"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Date invalide." };
  }

  const image = formData.get("image");

  const result = await createTicket({
    userId: user.id,
    ...parsed.data,
    image: image instanceof File && image.size > 0 ? image : null,
  });

  if (!result.ok) {
    return { error: "Nu ești asociat cu un apartament — nu poți trimite sesizări." };
  }

  revalidatePath("/locatar/sesizari");
  return INITIAL_STATE;
}

export async function updateTicketStatusAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (user.role !== "ADMINISTRATOR") {
    return { error: "Doar administratorii pot actualiza sesizări." };
  }

  const parsed = updateTicketStatusSchema.safeParse({
    ticketId: formData.get("ticketId"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Date invalide." };
  }

  await updateTicketStatus({ ...parsed.data, adminId: user.id });
  revalidatePath("/administrator/sesizari");
  return INITIAL_STATE;
}
