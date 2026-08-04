import type { Metadata } from "next";
import { getAdminTickets } from "@/application/use-cases/get-admin-tickets";
import { Card } from "@/components/ui/Card";
import { TicketStatusBadge } from "@/components/tickets/TicketStatusBadge";
import { UpdateTicketStatusForm } from "@/components/tickets/UpdateTicketStatusForm";

export const metadata: Metadata = { title: "Sesizări · Administrator" };

const CATEGORY_LABELS: Record<string, string> = {
  APA: "Apă",
  LIFT: "Lift",
  ELECTRICITATE: "Electricitate",
  CURATENIE: "Curățenie",
  REPARATII: "Reparații",
  ALTCEVA: "Altceva",
};

export default async function SesizariAdministratorPage() {
  const tickets = await getAdminTickets();

  return (
    <Card>
      <h2 className="text-lg font-semibold text-gray-900">Sesizări</h2>
      {tickets.length === 0 ? (
        <p className="mt-2 text-sm text-gray-500">Nicio sesizare încă.</p>
      ) : (
        <ul className="mt-4 divide-y divide-gray-100">
          {tickets.map((ticket) => (
            <li key={ticket.id} className="py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-medium text-gray-900">{ticket.title}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    {ticket.apartmentLabel} · {CATEGORY_LABELS[ticket.category]}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <TicketStatusBadge status={ticket.status} />
                  <UpdateTicketStatusForm ticketId={ticket.id} status={ticket.status} />
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-700">{ticket.description}</p>
              {ticket.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ticket.imageUrl}
                  alt="Fotografie sesizare"
                  className="mt-2 max-h-48 rounded-md border border-gray-200"
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
