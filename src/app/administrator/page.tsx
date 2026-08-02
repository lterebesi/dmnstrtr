import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/current-user";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Dashboard administrator" };

const SUMMARY_CARDS = [
  { label: "Număr blocuri" },
  { label: "Număr apartamente" },
  { label: "Total de încasat (luna curentă)" },
  { label: "Total restanțe" },
  { label: "Sesizări active" },
];

export default async function AdministratorDashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="text-lg font-semibold text-gray-900">Bine ai venit, {user.name}</h2>
        <p className="mt-1 text-sm text-gray-600">
          Contul tău e activ ca <strong>administrator</strong>. Gestionarea
          blocurilor, apartamentelor și consumurilor devine disponibilă în
          ETAPA 3.
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {SUMMARY_CARDS.map((item) => (
          <Card key={item.label} className="text-center">
            <p className="text-2xl font-semibold text-gray-400">—</p>
            <p className="mt-1 text-xs text-gray-600">{item.label}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
