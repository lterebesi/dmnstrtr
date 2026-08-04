import clsx from "clsx";
import type { TicketStatus } from "@/types/database";

const LABELS: Record<TicketStatus, string> = {
  NOUA: "Nouă",
  IN_LUCRU: "În lucru",
  REZOLVATA: "Rezolvată",
};

const CLASSES: Record<TicketStatus, string> = {
  NOUA: "bg-blue-100 text-blue-700",
  IN_LUCRU: "bg-amber-100 text-amber-700",
  REZOLVATA: "bg-green-100 text-green-700",
};

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        CLASSES[status],
      )}
    >
      {LABELS[status]}
    </span>
  );
}
