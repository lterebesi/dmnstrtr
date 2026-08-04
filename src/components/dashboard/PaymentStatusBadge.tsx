import clsx from "clsx";
import type { PaymentStatus } from "@/types/database";

const LABELS: Record<PaymentStatus, string> = {
  NEPLATIT: "Neplătit",
  PARTIAL: "Parțial plătit",
  PLATIT: "Plătit",
};

const CLASSES: Record<PaymentStatus, string> = {
  NEPLATIT: "bg-red-100 text-red-700",
  PARTIAL: "bg-amber-100 text-amber-700",
  PLATIT: "bg-green-100 text-green-700",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
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
