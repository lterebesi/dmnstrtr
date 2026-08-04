import "server-only";

import { createSupabaseServerClient } from "@/infrastructure/supabase/server";
import { findActiveResidentByUserId } from "@/infrastructure/supabase/repositories/residents.repository";
import { listMonthlyCosts } from "@/infrastructure/supabase/repositories/monthly-costs.repository";
import { listPayments } from "@/infrastructure/supabase/repositories/payments.repository";
import type { PaymentStatus } from "@/types/database";

export interface LocatarHistoryEntry {
  month: string;
  totalAmount: number;
  paymentStatus: PaymentStatus;
}

export async function getLocatarCostsHistory(
  userId: string,
): Promise<LocatarHistoryEntry[]> {
  if (process.env.DISABLE_AUTH === "true") {
    return [];
  }

  const supabase = await createSupabaseServerClient();

  const resident = await findActiveResidentByUserId(supabase, userId);
  if (!resident) return [];

  const [costs, payments] = await Promise.all([
    listMonthlyCosts(supabase, resident.apartment_id, 12),
    listPayments(supabase, resident.apartment_id, 24),
  ]);

  const statusByMonth = new Map(payments.map((p) => [p.month, p.status]));

  return costs.map((c) => ({
    month: c.month,
    totalAmount: c.total_amount,
    paymentStatus: statusByMonth.get(c.month) ?? "NEPLATIT",
  }));
}
