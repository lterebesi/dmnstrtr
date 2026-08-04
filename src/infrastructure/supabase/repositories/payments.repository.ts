import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, PaymentStatus } from "@/types/database";

export async function findLatestPayment(
  supabase: SupabaseClient<Database>,
  apartmentId: string,
  month: string,
) {
  const { data } = await supabase
    .from("payments")
    .select("*")
    .eq("apartment_id", apartmentId)
    .eq("month", month)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data;
}

export async function listPayments(
  supabase: SupabaseClient<Database>,
  apartmentId: string,
  limit = 24,
) {
  const { data } = await supabase
    .from("payments")
    .select("*")
    .eq("apartment_id", apartmentId)
    .order("month", { ascending: false })
    .limit(limit);

  return data ?? [];
}

export async function recordPayment(
  supabase: SupabaseClient<Database>,
  input: {
    apartmentId: string;
    month: string;
    amount: number;
    status: PaymentStatus;
    paymentDate: string | null;
    recordedBy: string;
  },
) {
  const { data, error } = await supabase
    .from("payments")
    .insert({
      apartment_id: input.apartmentId,
      month: input.month,
      amount: input.amount,
      status: input.status,
      payment_date: input.paymentDate,
      recorded_by: input.recordedBy,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
