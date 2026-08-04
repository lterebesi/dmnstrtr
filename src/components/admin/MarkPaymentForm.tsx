"use client";

import { useActionState } from "react";
import { markPaymentAction, type ActionState } from "@/lib/admin/actions";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";

const INITIAL_STATE: ActionState = { error: null };

interface MarkPaymentFormProps {
  apartments: { id: string; label: string }[];
  currentMonth: string;
}

export function MarkPaymentForm({ apartments, currentMonth }: MarkPaymentFormProps) {
  const [state, formAction, isPending] = useActionState(markPaymentAction, INITIAL_STATE);

  if (apartments.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        Nu ai niciun apartament încă — adaugă unul din secțiunea Blocuri.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
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

      <TextField label="Sumă" name="amount" type="number" step="0.01" min={0} required />

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">Status</span>
        <select
          name="status"
          required
          className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="NEPLATIT">Neplătit</option>
          <option value="PARTIAL">Parțial plătit</option>
          <option value="PLATIT">Plătit</option>
        </select>
      </label>

      <TextField label="Data plății" name="paymentDate" type="date" />

      <Button type="submit" disabled={isPending}>
        {isPending ? "Se salvează..." : "Salvează"}
      </Button>

      {state.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
