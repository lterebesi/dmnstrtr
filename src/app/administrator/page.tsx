import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getAdminDashboardSummary } from "@/application/use-cases/get-admin-dashboard-summary";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard administrator" };

export default async function AdministratorDashboardPage() {
  const user = await getCurrentUser();
  const summary = await getAdminDashboardSummary();

  const cards = [
    { label: "Număr blocuri", value: summary.blockCount },
    { label: "Număr apartamente", value: summary.apartmentCount },
    {
      label: "Total de încasat (luna curentă)",
      value: formatCurrency(summary.totalToCollectThisMonth),
    },
    { label: "Total restanțe", value: formatCurrency(summary.totalDebt) },
    { label: "Sesizări active", value: summary.activeTicketsCount },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="text-lg font-semibold text-gray-900">Bine ai venit, {user.name}</h2>
        <p className="mt-1 text-sm text-gray-600">
          Gestionează blocurile, consumurile lunare și plățile din meniul de mai sus.
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((item) => (
          <Card key={item.label} className="text-center">
            <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
            <p className="mt-1 text-xs text-gray-600">{item.label}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
