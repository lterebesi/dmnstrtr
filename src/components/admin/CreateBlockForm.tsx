"use client";

import { useActionState } from "react";
import { createBlockAction, type ActionState } from "@/lib/admin/actions";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";

const INITIAL_STATE: ActionState = { error: null };

export function CreateBlockForm() {
  const [state, formAction, isPending] = useActionState(createBlockAction, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <TextField label="Nume bloc" name="name" required className="sm:w-48" />
      <TextField label="Adresă" name="address" required className="sm:w-72" />
      <Button type="submit" disabled={isPending}>
        {isPending ? "Se creează..." : "Creează bloc"}
      </Button>
      {state.error && <p className="text-sm text-red-600 sm:ml-2">{state.error}</p>}
    </form>
  );
}
