import "server-only";

import { createSupabaseServerClient } from "@/infrastructure/supabase/server";
import { findActiveResidentByUserId } from "@/infrastructure/supabase/repositories/residents.repository";
import { findApartmentById } from "@/infrastructure/supabase/repositories/apartments.repository";
import { findStaircaseById } from "@/infrastructure/supabase/repositories/staircases.repository";
import { findBlockById } from "@/infrastructure/supabase/repositories/blocks.repository";
import { findMonthlyCosts } from "@/infrastructure/supabase/repositories/monthly-costs.repository";
import { findLatestPayment } from "@/infrastructure/supabase/repositories/payments.repository";
import type { LocatarCurrentMonth, LocatarApartmentContext } from "./get-locatar-dashboard";

export interface LocatarPaymentSlip {
  residentName: string;
  apartment: LocatarApartmentContext;
  costs: LocatarCurrentMonth;
}

/** Date pentru lista de plată PDF a unei luni specifice (nu neapărat cea curentă). */
export async function getLocatarPaymentSlip(
  userId: string,
  residentName: string,
  month: string,
): Promise<LocatarPaymentSlip | null> {
  const supabase = await createSupabaseServerClient();

  const resident = await findActiveResidentByUserId(supabase, userId);
  if (!resident) return null;

  const apartment = await findApartmentById(supabase, resident.apartment_id);
  if (!apartment) return null;

  const [staircase, block, costs, payment] = await Promise.all([
    findStaircaseById(supabase, apartment.staircase_id),
    findBlockById(supabase, apartment.block_id),
    findMonthlyCosts(supabase, apartment.id, month),
    findLatestPayment(supabase, apartment.id, month),
  ]);

  if (!costs) return null;

  return {
    residentName,
    apartment: {
      apartmentId: apartment.id,
      apartmentNumber: apartment.number,
      staircaseName: staircase?.name ?? "—",
      blockName: block?.name ?? "—",
    },
    costs: {
      month: costs.month,
      coldWaterConsumption: costs.cold_water_consumption,
      sewageConsumption: costs.sewage_consumption,
      waterPrice: costs.water_price,
      sewagePrice: costs.sewage_price,
      electricityCost: costs.electricity_cost,
      cleaningCost: costs.cleaning_cost,
      garbageCost: costs.garbage_cost,
      repairsCost: costs.repairs_cost,
      fundingFundCost: costs.funding_fund_cost,
      otherCosts: costs.other_costs,
      debt: costs.debt,
      penalties: costs.penalties,
      totalAmount: costs.total_amount,
      paymentStatus: payment?.status ?? "NEPLATIT",
    },
  };
}
