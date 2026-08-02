import { describe, expect, it } from "vitest";
import {
  calculateMonthlyTotal,
  calculateSewageTotal,
  calculateWaterTotal,
} from "@/domain/services/calculateMonthlyTotal";
import {
  ZERO_MONTHLY_COST_INPUT,
  type MonthlyCostInput,
} from "@/domain/entities/monthly-costs";

const baseInput: MonthlyCostInput = {
  coldWaterConsumption: 10,
  sewageConsumption: 8,
  waterPrice: 6.5,
  sewagePrice: 4.2,
  electricityCost: 120,
  cleaningCost: 50,
  garbageCost: 30,
  repairsCost: 15,
  fundingFundCost: 25,
  otherCosts: 5,
  debt: 100,
  penalties: 10,
};

describe("calculateWaterTotal / calculateSewageTotal", () => {
  it("înmulțește consumul cu prețul", () => {
    expect(calculateWaterTotal(baseInput)).toBeCloseTo(65, 5);
    expect(calculateSewageTotal(baseInput)).toBeCloseTo(33.6, 5);
  });
});

describe("calculateMonthlyTotal", () => {
  it("întoarce 0 pentru toate componentele zero", () => {
    expect(calculateMonthlyTotal(ZERO_MONTHLY_COST_INPUT)).toBe(0);
  });

  it("calculează TOTAL DE PLATĂ conform formulei din cerință", () => {
    // apă: 10 * 6.5 = 65
    // canalizare: 8 * 4.2 = 33.6
    // + 120 + 50 + 30 + 15 + 25 + 5 + 100 + 10 = 355
    // total = 65 + 33.6 + 355 = 453.6
    expect(calculateMonthlyTotal(baseInput)).toBeCloseTo(453.6, 5);
  });

  it("rotunjește corect la 2 zecimale", () => {
    const input: MonthlyCostInput = {
      ...ZERO_MONTHLY_COST_INPUT,
      coldWaterConsumption: 1,
      waterPrice: 0.111,
    };
    expect(calculateMonthlyTotal(input)).toBe(0.11);
  });

  it("include restanțele și penalitățile în total", () => {
    const withoutDebt = calculateMonthlyTotal({
      ...baseInput,
      debt: 0,
      penalties: 0,
    });
    expect(calculateMonthlyTotal(baseInput)).toBeCloseTo(
      withoutDebt + baseInput.debt + baseInput.penalties,
      5,
    );
  });

  it("nu produce total negativ pentru input valid (toate componentele >= 0)", () => {
    expect(calculateMonthlyTotal(baseInput)).toBeGreaterThanOrEqual(0);
  });
});
