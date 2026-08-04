import "server-only";

import { createSupabaseServerClient } from "@/infrastructure/supabase/server";
import { currentMonthDateString } from "@/lib/date";

export interface AdminDashboardSummary {
  blockCount: number;
  apartmentCount: number;
  totalToCollectThisMonth: number;
  totalDebt: number;
  activeTicketsCount: number;
}

const EMPTY_SUMMARY: AdminDashboardSummary = {
  blockCount: 0,
  apartmentCount: 0,
  totalToCollectThisMonth: 0,
  totalDebt: 0,
  activeTicketsCount: 0,
};

/**
 * Toate query-urile de mai jos rulează cu sesiunea administratorului —
 * RLS restrânge automat rezultatele doar la blocurile/apartamentele lui,
 * fără join-uri explicite pe block_admins.
 */
export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  if (process.env.DISABLE_AUTH === "true") {
    return EMPTY_SUMMARY;
  }

  const supabase = await createSupabaseServerClient();
  const month = currentMonthDateString();

  const [blocksResult, apartmentsResult, costsResult, ticketsResult] = await Promise.all([
    supabase.from("blocks").select("id", { count: "exact", head: true }),
    supabase.from("apartments").select("id", { count: "exact", head: true }),
    supabase.from("monthly_costs").select("total_amount, debt").eq("month", month),
    supabase.from("tickets").select("id", { count: "exact", head: true }).neq("status", "REZOLVATA"),
  ]);

  const totalToCollectThisMonth =
    costsResult.data?.reduce((sum, row) => sum + row.total_amount, 0) ?? 0;
  const totalDebt = costsResult.data?.reduce((sum, row) => sum + row.debt, 0) ?? 0;

  return {
    blockCount: blocksResult.count ?? 0,
    apartmentCount: apartmentsResult.count ?? 0,
    totalToCollectThisMonth,
    totalDebt,
    activeTicketsCount: ticketsResult.count ?? 0,
  };
}
