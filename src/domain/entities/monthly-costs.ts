/**
 * Componentele de cost introduse de administrator pentru un apartament,
 * într-o lună. Oglindește coloanele din `monthly_costs`, mai puțin
 * `total_amount`, care e derivat (vezi `domain/services/calculateMonthlyTotal`).
 */
export interface MonthlyCostInput {
  coldWaterConsumption: number; // m³
  sewageConsumption: number; // m³
  waterPrice: number; // preț / m³
  sewagePrice: number; // preț / m³
  electricityCost: number;
  cleaningCost: number;
  garbageCost: number;
  repairsCost: number;
  fundingFundCost: number; // fond rulment
  otherCosts: number;
  debt: number; // restanțe
  penalties: number;
}

export interface MonthlyCosts extends MonthlyCostInput {
  id: string;
  apartmentId: string;
  /** Prima zi a lunii, ex. "2026-08-01". */
  month: string;
  totalAmount: number;
}

export const ZERO_MONTHLY_COST_INPUT: MonthlyCostInput = {
  coldWaterConsumption: 0,
  sewageConsumption: 0,
  waterPrice: 0,
  sewagePrice: 0,
  electricityCost: 0,
  cleaningCost: 0,
  garbageCost: 0,
  repairsCost: 0,
  fundingFundCost: 0,
  otherCosts: 0,
  debt: 0,
  penalties: 0,
};
