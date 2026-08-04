import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, TicketCategory, TicketStatus } from "@/types/database";

export async function createTicket(
  supabase: SupabaseClient<Database>,
  input: {
    apartmentId: string;
    createdBy: string;
    title: string;
    category: TicketCategory;
    description: string;
    imagePath: string | null;
  },
) {
  const { data, error } = await supabase
    .from("tickets")
    .insert({
      apartment_id: input.apartmentId,
      created_by: input.createdBy,
      title: input.title,
      category: input.category,
      description: input.description,
      image_path: input.imagePath,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function listTicketsByApartment(
  supabase: SupabaseClient<Database>,
  apartmentId: string,
) {
  const { data } = await supabase
    .from("tickets")
    .select("*")
    .eq("apartment_id", apartmentId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

/** Toate sesizările vizibile administratorului curent — RLS le scopează automat. */
export async function listTicketsForAdmin(supabase: SupabaseClient<Database>) {
  const { data } = await supabase
    .from("tickets")
    .select("*")
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function findTicketById(
  supabase: SupabaseClient<Database>,
  ticketId: string,
) {
  const { data } = await supabase
    .from("tickets")
    .select("*")
    .eq("id", ticketId)
    .maybeSingle();

  return data;
}

export async function updateTicketStatus(
  supabase: SupabaseClient<Database>,
  ticketId: string,
  status: TicketStatus,
) {
  const { data, error } = await supabase
    .from("tickets")
    .update({ status })
    .eq("id", ticketId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
