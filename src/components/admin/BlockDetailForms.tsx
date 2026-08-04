"use client";

import { useActionState } from "react";
import {
  createStaircaseAction,
  createApartmentAction,
  assignResidentAction,
  type ActionState,
} from "@/lib/admin/actions";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";

const INITIAL_STATE: ActionState = { error: null };

export function StaircaseForm({ blockId }: { blockId: string }) {
  const [state, formAction, isPending] = useActionState(createStaircaseAction, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="blockId" value={blockId} />
      <TextField label="Scară nouă (ex: A)" name="name" required />
      <Button type="submit" disabled={isPending} variant="secondary">
        {isPending ? "Se adaugă..." : "Adaugă scară"}
      </Button>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}

export function ApartmentForm({
  blockId,
  staircaseId,
}: {
  blockId: string;
  staircaseId: string;
}) {
  const [state, formAction, isPending] = useActionState(createApartmentAction, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="blockId" value={blockId} />
      <input type="hidden" name="staircaseId" value={staircaseId} />
      <TextField label="Nr. apartament" name="number" required className="w-28" />
      <TextField label="Etaj" name="floor" type="number" className="w-20" />
      <Button type="submit" disabled={isPending} variant="secondary">
        {isPending ? "Se adaugă..." : "Adaugă apartament"}
      </Button>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}

export function AssignResidentForm({
  blockId,
  apartmentId,
}: {
  blockId: string;
  apartmentId: string;
}) {
  const [state, formAction, isPending] = useActionState(assignResidentAction, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="blockId" value={blockId} />
      <input type="hidden" name="apartmentId" value={apartmentId} />
      <TextField
        label="Email locatar"
        name="email"
        type="email"
        required
        className="w-56"
      />
      <Button type="submit" disabled={isPending} variant="secondary">
        {isPending ? "Se asociază..." : "Asociază"}
      </Button>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
