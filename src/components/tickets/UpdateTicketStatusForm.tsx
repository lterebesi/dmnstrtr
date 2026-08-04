"use client";

import { useActionState } from "react";
import { updateTicketStatusAction, type ActionState } from "@/lib/tickets/actions";
import type { TicketStatus } from "@/types/database";

const INITIAL_STATE: ActionState = { error: null };

export function UpdateTicketStatusForm({
  ticketId,
  status,
}: {
  ticketId: string;
  status: TicketStatus;
}) {
  const [state, formAction, isPending] = useActionState(
    updateTicketStatusAction,
    INITIAL_STATE,
  );

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="ticketId" value={ticketId} />
      <select
        name="status"
        defaultValue={status}
        disabled={isPending}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded-md border border-gray-300 px-2 py-1 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="NOUA">Nouă</option>
        <option value="IN_LUCRU">În lucru</option>
        <option value="REZOLVATA">Rezolvată</option>
      </select>
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
