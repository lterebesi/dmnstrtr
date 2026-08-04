"use client";

import { useActionState, useMemo, useState } from "react";
import { generateMonthlyCostsAction, type ActionState } from "@/lib/admin/actions";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { calculateMonthlyTotal } from "@/domain/services/calculateMonthlyTotal";
import { ZERO_MONTHLY_COST_INPUT, type MonthlyCostInput } from "@/domain/entities/monthly-costs";
import { formatCurrency } from "@/lib/format";

const INITIAL_STATE: ActionState = { error: null };

const FIELDS: { key: keyof MonthlyCostInput; label: string }[] = [
  { key: "coldWaterConsumption", label: "Consum apă rece (m³)" },
  { key: "sewageConsumption", label: "Consum canalizare (m³)" },
  { key: "waterPrice", label: "Preț apă / m³" },
  { key: "sewagePrice", label: "Preț canalizare / m³" },
  { key: "electricityCost", label: "Electricitate părți comune" },
  { key: "cleaningCost", label: "Curățenie" },
  { key: "garbageCost", label: "Gunoi" },
  { key: "repairsCost", label: "Reparații" },
  { key: "fundingFundCost", label: "Fond rulment" },
  { key: "otherCosts", label: "Alte cheltuieli" },
  { key: "debt", label: "Restanțe" },
  { key: "penalties", label: "Penalități" },
];

interface MonthlyCostsFormProps {
  apartments: { id: string; label: string }[];
  currentMonth: string;
}

export function MonthlyCostsForm({ apartments, currentMonth }: MonthlyCostsFormProps) {
  const [state, formAction, isPending] = useActionState(
    generateMonthlyCostsAction,
    INITIAL_STATE,
  );
  const [values, setValues] = useState<MonthlyCostInput>(ZERO_MONTHLY_COST_INPUT);

  const previewTotal = useMemo(() => calculateMonthlyTotal(values), [values]);

  function updateField(key: keyof MonthlyCostInput, raw: string) {
    const parsed = Number(raw);
    setValues((prev) => ({ ...prev, [key]: Number.isFinite(parsed) ? parsed : 0 }));
  }

  if (apartments.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        Nu ai niciun apartament încă — adaugă unul din secțiunea Blocuri.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Apartament</span>
          <select
            name="apartmentId"
            required
            className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {apartments.map((apartment) => (
              <option key={apartment.id} value={apartment.id}>
                {apartment.label}
              </option>
            ))}
          </select>
        </label>
        <TextField
          label="Lună"
          name="month"
          type="month"
          defaultValue={currentMonth.slice(0, 7)}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FIELDS.map(({ key, label }) => (
          <TextField
            key={key}
            label={label}
            name={key}
            type="number"
            step="0.01"
            min={0}
            defaultValue={0}
            onChange={(e) => updateField(key, e.target.value)}
          />
        ))}
      </div>

      <div className="flex items-center justify-between rounded-md bg-gray-50 px-4 py-3">
        <span className="text-sm font-medium text-gray-700">
          TOTAL DE PLATĂ (previzualizare)
        </span>
        <span className="text-lg font-semibold text-gray-900">
          {formatCurrency(previewTotal)}
        </span>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Se salvează..." : "Salvează lista de plată"}
      </Button>
    </form>
  );
}
