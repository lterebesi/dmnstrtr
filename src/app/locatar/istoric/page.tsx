import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getLocatarCostsHistory } from "@/application/use-cases/get-locatar-costs-history";
import { Card } from "@/components/ui/Card";
import { PaymentStatusBadge } from "@/components/dashboard/PaymentStatusBadge";
import { formatCurrency } from "@/lib/format";
import { formatMonthLabel } from "@/lib/date";

export const metadata: Metadata = { title: "Istoric · Locatar" };

export default async function IstoricPage() {
  const user = await getCurrentUser();
  const history = await getLocatarCostsHistory(user.id);

  return (
    <Card>
      <h2 className="text-lg font-semibold text-gray-900">Istoric luni precedente</h2>

      {history.length === 0 ? (
        <p className="mt-2 text-sm text-gray-500">
          Nu există încă niciun istoric — apare pe măsură ce administratorul
          generează liste lunare.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="py-2 pr-4 font-medium">Lună</th>
                <th className="py-2 pr-4 font-medium">Total de plată</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 font-medium">PDF</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry) => (
                <tr key={entry.month} className="border-b border-gray-100">
                  <td className="py-2 pr-4 text-gray-900">
                    {formatMonthLabel(entry.month)}
                  </td>
                  <td className="py-2 pr-4 text-gray-900">
                    {formatCurrency(entry.totalAmount)}
                  </td>
                  <td className="py-2 pr-4">
                    <PaymentStatusBadge status={entry.paymentStatus} />
                  </td>
                  <td className="py-2">
                    <a
                      href={`/api/locatar/pdf?month=${entry.month.slice(0, 7)}`}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      Descarcă
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
