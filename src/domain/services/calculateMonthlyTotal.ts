import type { MonthlyCostInput } from "@/domain/entities/monthly-costs";

/**
 * Rotunjire la 2 zecimale cu regulă "round half away from zero", identică
 * cu funcția `round(numeric, int)` din PostgreSQL folosită de coloana
 * generată `monthly_costs.total_amount`. Nu folosim `Math.round` direct
 * pentru a evita erorile de reprezentare în virgulă mobilă la bani.
 */
function roundToCents(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateWaterTotal(
  input: Pick<MonthlyCostInput, "coldWaterConsumption" | "waterPrice">,
): number {
  return input.coldWaterConsumption * input.waterPrice;
}

export function calculateSewageTotal(
  input: Pick<MonthlyCostInput, "sewageConsumption" | "sewagePrice">,
): number {
  return input.sewageConsumption * input.sewagePrice;
}

/**
 * TOTAL DE PLATĂ = (consum apă × preț apă) + (consum canalizare × preț
 * canalizare) + electricitate părți comune + curățenie + gunoi + reparații +
 * fond rulment + alte cheltuieli + restanțe + penalități.
 *
 * Funcție pură — oglindește 1:1 formula din migrația SQL
 * (`monthly_costs.total_amount generated always as (...)`), astfel încât UI-ul
 * poate afișa un total live (previzualizare) înainte de salvare.
 */
export function calculateMonthlyTotal(input: MonthlyCostInput): number {
  const total =
    calculateWaterTotal(input) +
    calculateSewageTotal(input) +
    input.electricityCost +
    input.cleaningCost +
    input.garbageCost +
    input.repairsCost +
    input.fundingFundCost +
    input.otherCosts +
    input.debt +
    input.penalties;

  return roundToCents(total);
}
