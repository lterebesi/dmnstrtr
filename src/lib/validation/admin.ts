import { z } from "zod";

export const createBlockSchema = z.object({
  name: z.string().trim().min(2, "Numele blocului e obligatoriu"),
  address: z.string().trim().min(3, "Adresa e obligatorie"),
});

export const createStaircaseSchema = z.object({
  blockId: z.string().uuid(),
  name: z.string().trim().min(1, "Numele scării e obligatoriu"),
});

export const createApartmentSchema = z.object({
  staircaseId: z.string().uuid(),
  number: z.string().trim().min(1, "Numărul apartamentului e obligatoriu"),
  floor: z.coerce.number().int().optional(),
});

export const assignResidentSchema = z.object({
  apartmentId: z.string().uuid(),
  email: z.string().trim().email("Email invalid"),
});

const nonNegativeNumber = z.coerce.number().min(0, "Trebuie să fie ≥ 0");

/** Acceptă "YYYY-MM" (input type="month") sau "YYYY-MM-01" și normalizează la a doua formă. */
const monthField = z
  .string()
  .regex(/^\d{4}-\d{2}(-01)?$/, "Lună invalidă")
  .transform((value) => (value.length === 7 ? `${value}-01` : value));

export const monthlyCostsSchema = z.object({
  apartmentId: z.string().uuid(),
  month: monthField,
  coldWaterConsumption: nonNegativeNumber,
  sewageConsumption: nonNegativeNumber,
  waterPrice: nonNegativeNumber,
  sewagePrice: nonNegativeNumber,
  electricityCost: nonNegativeNumber,
  cleaningCost: nonNegativeNumber,
  garbageCost: nonNegativeNumber,
  repairsCost: nonNegativeNumber,
  fundingFundCost: nonNegativeNumber,
  otherCosts: nonNegativeNumber,
  debt: nonNegativeNumber,
  penalties: nonNegativeNumber,
});

export const markPaymentSchema = z.object({
  apartmentId: z.string().uuid(),
  month: monthField,
  amount: nonNegativeNumber,
  status: z.enum(["NEPLATIT", "PARTIAL", "PLATIT"]),
  paymentDate: z.string().optional().or(z.literal("")),
});
