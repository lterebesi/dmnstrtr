import type { Metadata } from "next";
import { getAdminFinancialReport } from "@/application/use-cases/get-admin-financial-report";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/format";
import { formatMonthLabel } from "@/lib/date";

export const metadata: Metadata = { title: "Rapoarte · Administrator" };

export default async function RapoartePage() {
  const rows = await getAdminFinancialReport();

  return (
    <Card>
      <h2 className="text-lg font-semibold text-gray-900">Raport financiar</h2>
      <p className="mt-1 text-sm text-gray-600">
        Total facturat vs. total încasat, pe lună, pentru blocurile tale.
      </p>

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">
          Nu există încă date — apar pe măsură ce generezi liste lunare și
          înregistrezi plăți.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="py-2 pr-4 font-medium">Lună</th>
                <th className="py-2 pr-4 font-medium">Total facturat</th>
                <th className="py-2 pr-4 font-medium">Total încasat</th>
                <th className="py-2 font-medium">Restanță</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.month} className="border-b border-gray-100">
                  <td className="py-2 pr-4 text-gray-900">{formatMonthLabel(row.month)}</td>
                  <td className="py-2 pr-4 text-gray-900">{formatCurrency(row.billed)}</td>
                  <td className="py-2 pr-4 text-gray-900">{formatCurrency(row.collected)}</td>
                  <td className="py-2 text-gray-900">{formatCurrency(row.outstanding)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
