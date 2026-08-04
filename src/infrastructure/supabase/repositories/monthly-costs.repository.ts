import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { MonthlyCostInput } from "@/domain/entities/monthly-costs";

export async function findMonthlyCosts(
  supabase: SupabaseClient<Database>,
  apartmentId: string,
  month: string,
) {
  const { data } = await supabase
    .from("monthly_costs")
    .select("*")
    .eq("apartment_id", apartmentId)
    .eq("month", month)
    .maybeSingle();

  return data;
}

export async function listMonthlyCosts(
  supabase: SupabaseClient<Database>,
  apartmentId: string,
  limit = 12,
) {
  const { data } = await supabase
    .from("monthly_costs")
    .select("*")
    .eq("apartment_id", apartmentId)
    .order("month", { ascending: false })
    .limit(limit);

  return data ?? [];
}

export async function upsertMonthlyCosts(
  supabase: SupabaseClient<Database>,
  input: {
    apartmentId: string;
    month: string;
    createdBy: string;
  } & MonthlyCostInput,
) {
  const { data, error } = await supabase
    .from("monthly_costs")
    .upsert(
      {
        apartment_id: input.apartmentId,
        month: input.month,
        cold_water_consumption: input.coldWaterConsumption,
        sewage_consumption: input.sewageConsumption,
        water_price: input.waterPrice,
        sewage_price: input.sewagePrice,
        electricity_cost: input.electricityCost,
        cleaning_cost: input.cleaningCost,
        garbage_cost: input.garbageCost,
        repairs_cost: input.repairsCost,
        funding_fund_cost: input.fundingFundCost,
        other_costs: input.otherCosts,
        debt: input.debt,
        penalties: input.penalties,
        created_by: input.createdBy,
      },
      { onConflict: "apartment_id,month" },
    )
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
