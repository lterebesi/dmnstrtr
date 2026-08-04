import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getLocatarTickets } from "@/application/use-cases/get-locatar-tickets";
import { Card } from "@/components/ui/Card";
import { CreateTicketForm } from "@/components/tickets/CreateTicketForm";
import { TicketStatusBadge } from "@/components/tickets/TicketStatusBadge";

export const metadata: Metadata = { title: "Sesizări · Locatar" };

const CATEGORY_LABELS: Record<string, string> = {
  APA: "Apă",
  LIFT: "Lift",
  ELECTRICITATE: "Electricitate",
  CURATENIE: "Curățenie",
  REPARATII: "Reparații",
  ALTCEVA: "Altceva",
};

export default async function SesizariLocatarPage() {
  const user = await getCurrentUser();
  const tickets = await getLocatarTickets(user.id);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="text-lg font-semibold text-gray-900">Trimite o sesizare</h2>
        <div className="mt-3">
          <CreateTicketForm />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900">Sesizările tale</h2>
        {tickets.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">Nu ai trimis nicio sesizare încă.</p>
        ) : (
          <ul className="mt-4 divide-y divide-gray-100">
            {tickets.map((ticket) => (
              <li key={ticket.id} className="py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-gray-900">{ticket.title}</span>
                  <TicketStatusBadge status={ticket.status} />
                </div>
                <p className="text-xs text-gray-500">
                  {CATEGORY_LABELS[ticket.category]} ·{" "}
                  {new Date(ticket.createdAt).toLocaleDateString("ro-RO")}
                </p>
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
    </div>
  );
}
