import "server-only";

import { createSupabaseServerClient } from "@/infrastructure/supabase/server";

export interface FinancialReportRow {
  month: string;
  billed: number;
  collected: number;
  outstanding: number;
}

/**
 * Raport financiar per lună, pe ultimele luni cu date — RLS scopează
 * automat query-urile la blocurile administratorului curent.
 */
export async function getAdminFinancialReport(): Promise<FinancialReportRow[]> {
  if (process.env.DISABLE_AUTH === "true") return [];

  const supabase = await createSupabaseServerClient();

  const [costsResult, paymentsResult] = await Promise.all([
    supabase.from("monthly_costs").select("month, total_amount").limit(1000),
    supabase.from("payments").select("month, amount, status").limit(1000),
  ]);

  const billedByMonth = new Map<string, number>();
  for (const row of costsResult.data ?? []) {
    billedByMonth.set(row.month, (billedByMonth.get(row.month) ?? 0) + row.total_amount);
  }

  const collectedByMonth = new Map<string, number>();
  for (const row of paymentsResult.data ?? []) {
    if (row.status !== "PLATIT") continue;
    collectedByMonth.set(row.month, (collectedByMonth.get(row.month) ?? 0) + row.amount);
  }

  const months = Array.from(billedByMonth.keys()).sort((a, b) => b.localeCompare(a));

  return months.slice(0, 12).map((month) => {
    const billed = billedByMonth.get(month) ?? 0;
    const collected = collectedByMonth.get(month) ?? 0;
    return { month, billed, collected, outstanding: billed - collected };
  });
}
