import "server-only";

import { createSupabaseServerClient } from "@/infrastructure/supabase/server";
import { recordPayment } from "@/infrastructure/supabase/repositories/payments.repository";
import { findApartmentById } from "@/infrastructure/supabase/repositories/apartments.repository";
import { recordAuditLog } from "@/infrastructure/supabase/repositories/audit-log.repository";
import { formatMonthLabel } from "@/lib/date";
import type { PaymentStatus } from "@/types/database";

export interface RecentPayment {
  id: string;
  apartmentLabel: string;
  month: string;
  amount: number;
  status: PaymentStatus;
  paymentDate: string | null;
}

/** Ultimele plăți înregistrate, pe blocurile administratorului (RLS aplicat). */
export async function listRecentPaymentsForAdmin(): Promise<RecentPayment[]> {
  if (process.env.DISABLE_AUTH === "true") return [];

  const supabase = await createSupabaseServerClient();
  const { data: payments } = await supabase
    .from("payments")
    .select("id, apartment_id, month, amount, status, payment_date")
    .order("created_at", { ascending: false })
    .limit(20);

  if (!payments || payments.length === 0) return [];

  const apartmentCache = new Map<string, string>();
  const results: RecentPayment[] = [];

  for (const payment of payments) {
    let label = apartmentCache.get(payment.apartment_id);
    if (!label) {
      const apartment = await findApartmentById(supabase, payment.apartment_id);
      label = apartment ? `Ap. ${apartment.number}` : "—";
      apartmentCache.set(payment.apartment_id, label);
    }
    results.push({
      id: payment.id,
      apartmentLabel: label,
      month: formatMonthLabel(payment.month),
      amount: payment.amount,
      status: payment.status,
      paymentDate: payment.payment_date,
    });
  }

  return results;
}

export async function markPayment(input: {
  apartmentId: string;
  month: string;
  amount: number;
  status: PaymentStatus;
  paymentDate: string | null;
  adminId: string;
}) {
  const supabase = await createSupabaseServerClient();

  const payment = await recordPayment(supabase, {
    apartmentId: input.apartmentId,
    month: input.month,
    amount: input.amount,
    status: input.status,
    paymentDate: input.paymentDate,
    recordedBy: input.adminId,
  });

  await recordAuditLog({
    actorId: input.adminId,
    action: "RECORD_PAYMENT",
    entity: "payments",
    entityId: payment.id,
    diff: {
      apartmentId: input.apartmentId,
      month: input.month,
      amount: input.amount,
      status: input.status,
    },
  });

  return payment;
}
