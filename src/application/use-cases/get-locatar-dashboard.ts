import "server-only";

import { createSupabaseServerClient } from "@/infrastructure/supabase/server";
import { findActiveResidentByUserId } from "@/infrastructure/supabase/repositories/residents.repository";
import { findApartmentById } from "@/infrastructure/supabase/repositories/apartments.repository";
import { findStaircaseById } from "@/infrastructure/supabase/repositories/staircases.repository";
import { findBlockById } from "@/infrastructure/supabase/repositories/blocks.repository";
import { findMonthlyCosts } from "@/infrastructure/supabase/repositories/monthly-costs.repository";
import { findLatestPayment } from "@/infrastructure/supabase/repositories/payments.repository";
import { currentMonthDateString } from "@/lib/date";
import type { PaymentStatus } from "@/types/database";
import type { MonthlyCostInput } from "@/domain/entities/monthly-costs";

export interface LocatarApartmentContext {
  apartmentId: string;
  apartmentNumber: string;
  staircaseName: string;
  blockName: string;
}

export interface LocatarCurrentMonth extends MonthlyCostInput {
  month: string;
  totalAmount: number;
  paymentStatus: PaymentStatus;
}

export interface LocatarDashboardData {
  apartment: LocatarApartmentContext | null;
  currentMonth: LocatarCurrentMonth | null;
}

const EMPTY_DASHBOARD: LocatarDashboardData = {
  apartment: null,
  currentMonth: null,
};

export async function getLocatarDashboard(
  userId: string,
): Promise<LocatarDashboardData> {
  if (process.env.DISABLE_AUTH === "true") {
    return EMPTY_DASHBOARD;
  }

  const supabase = await createSupabaseServerClient();

  const resident = await findActiveResidentByUserId(supabase, userId);
  if (!resident) return EMPTY_DASHBOARD;

  const apartment = await findApartmentById(supabase, resident.apartment_id);
  if (!apartment) return EMPTY_DASHBOARD;

  const month = currentMonthDateString();

  const [staircase, block, costs, payment] = await Promise.all([
    findStaircaseById(supabase, apartment.staircase_id),
    findBlockById(supabase, apartment.block_id),
    findMonthlyCosts(supabase, apartment.id, month),
    findLatestPayment(supabase, apartment.id, month),
  ]);

  return {
    apartment: {
      apartmentId: apartment.id,
      apartmentNumber: apartment.number,
      staircaseName: staircase?.name ?? "—",
      blockName: block?.name ?? "—",
    },
    currentMonth: costs
      ? {
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
        }
      : null,
  };
}
