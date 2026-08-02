import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/current-user";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Dashboard locatar" };

const COST_LINES = [
  "Consum apă rece",
  "Consum canalizare",
  "Cost apă rece",
  "Cost canalizare",
  "Electricitate părți comune",
  "Curățenie",
  "Gunoi",
  "Reparații",
  "Fond rulment",
  "Alte cheltuieli",
  "Restanțe",
  "Penalități",
];

export default async function LocatarDashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="text-lg font-semibold text-gray-900">Bine ai venit, {user.name}</h2>
        <p className="mt-1 text-sm text-gray-600">
          Contul tău e activ ca <strong>locatar</strong>. De îndată ce
          administratorul blocului te asociază cu un apartament, vei vedea
          aici situația financiară a lunii curente.
        </p>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">
            Situație financiară — luna curentă
          </h3>
          <Button variant="secondary" disabled>
            ASISTENȚĂ
          </Button>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Disponibil din ETAPA 2, după asocierea cu un apartament.
        </p>
        <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
          {COST_LINES.map((label) => (
            <div key={label} className="flex justify-between border-b border-gray-100 py-1.5 text-sm">
              <dt className="text-gray-600">{label}</dt>
              <dd className="text-gray-400">—</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 flex justify-between border-t border-gray-200 pt-3">
          <span className="font-semibold text-gray-900">TOTAL DE PLATĂ</span>
          <span className="font-semibold text-gray-400">—</span>
        </div>
      </Card>
    </div>
  );
}
