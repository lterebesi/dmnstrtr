"use client";

import { useActionState } from "react";
import { createTicketAction, type ActionState } from "@/lib/tickets/actions";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";

const INITIAL_STATE: ActionState = { error: null };

const CATEGORIES: { value: string; label: string }[] = [
  { value: "APA", label: "Apă" },
  { value: "LIFT", label: "Lift" },
  { value: "ELECTRICITATE", label: "Electricitate" },
  { value: "CURATENIE", label: "Curățenie" },
  { value: "REPARATII", label: "Reparații" },
  { value: "ALTCEVA", label: "Altceva" },
];

export function CreateTicketForm() {
  const [state, formAction, isPending] = useActionState(createTicketAction, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <TextField label="Titlu" name="title" required />

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">Categorie</span>
        <select
          name="category"
          required
          className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">Descriere</span>
        <textarea
          name="description"
          required
          rows={4}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">Fotografie (opțional)</span>
        <input type="file" name="image" accept="image/*" className="text-sm" />
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Se trimite..." : "Trimite sesizare"}
      </Button>
    </form>
  );
}
