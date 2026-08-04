import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getLocatarDashboard } from "@/application/use-cases/get-locatar-dashboard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PaymentStatusBadge } from "@/components/dashboard/PaymentStatusBadge";
import { formatCurrency } from "@/lib/format";
import { formatMonthLabel, currentMonthDateString } from "@/lib/date";
import type { MonthlyCostInput } from "@/domain/entities/monthly-costs";

export const metadata: Metadata = { title: "Dashboard locatar" };

const COST_LINES: { key: keyof MonthlyCostInput; label: string }[] = [
  { key: "coldWaterConsumption", label: "Consum apă rece (m³)" },
  { key: "sewageConsumption", label: "Consum canalizare (m³)" },
  { key: "electricityCost", label: "Electricitate părți comune" },
  { key: "cleaningCost", label: "Curățenie" },
  { key: "garbageCost", label: "Gunoi" },
  { key: "repairsCost", label: "Reparații" },
  { key: "fundingFundCost", label: "Fond rulment" },
  { key: "otherCosts", label: "Alte cheltuieli" },
  { key: "debt", label: "Restanțe" },
  { key: "penalties", label: "Penalități" },
];

export default async function LocatarDashboardPage() {
  const user = await getCurrentUser();
  const { apartment, currentMonth } = await getLocatarDashboard(user.id);

  if (!apartment) {
    return (
      <Card>
        <h2 className="text-lg font-semibold text-gray-900">Bine ai venit, {user.name}</h2>
        <p className="mt-2 text-sm text-gray-600">
          Contul tău nu e încă asociat cu un apartament. Administratorul
          blocului trebuie să te asocieze — după aceea vei vedea aici
          situația financiară lunară.
        </p>
      </Card>
    );
  }

  const waterTotal = currentMonth
    ? currentMonth.coldWaterConsumption * currentMonth.waterPrice
    : 0;
  const sewageTotal = currentMonth
    ? currentMonth.sewageConsumption * currentMonth.sewagePrice
    : 0;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="text-lg font-semibold text-gray-900">Bine ai venit, {user.name}</h2>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-gray-500">Bloc</dt>
            <dd className="font-medium text-gray-900">{apartment.blockName}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Scară</dt>
            <dd className="font-medium text-gray-900">{apartment.staircaseName}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Apartament</dt>
            <dd className="font-medium text-gray-900">{apartment.apartmentNumber}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Luna curentă</dt>
            <dd className="font-medium text-gray-900">
              {formatMonthLabel(currentMonthDateString())}
            </dd>
          </div>
        </dl>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">
            Situație financiară — luna curentă
          </h3>
          <div className="flex items-center gap-2">
            {currentMonth && (
              <a href="/api/locatar/pdf">
                <Button variant="secondary">Descarcă PDF</Button>
              </a>
            )}
            <Link href="/locatar/sesizari">
              <Button variant="secondary">ASISTENȚĂ</Button>
            </Link>
          </div>
        </div>

        {!currentMonth ? (
          <p className="mt-3 text-sm text-gray-500">
            Administratorul nu a generat încă lista de plată pentru luna
            curentă.
          </p>
        ) : (
          <>
            <div className="mt-3 flex items-center gap-2">
              <PaymentStatusBadge status={currentMonth.paymentStatus} />
            </div>
            <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
              <div className="flex justify-between border-b border-gray-100 py-1.5 text-sm">
                <dt className="text-gray-600">Cost apă rece</dt>
                <dd className="text-gray-900">{formatCurrency(waterTotal)}</dd>
              </div>
              <div className="flex justify-between border-b border-gray-100 py-1.5 text-sm">
                <dt className="text-gray-600">Cost canalizare</dt>
                <dd className="text-gray-900">{formatCurrency(sewageTotal)}</dd>
              </div>
              {COST_LINES.map(({ key, label }) => (
                <div
                  key={key}
                  className="flex justify-between border-b border-gray-100 py-1.5 text-sm"
                >
                  <dt className="text-gray-600">{label}</dt>
                  <dd className="text-gray-900">
                    {key === "coldWaterConsumption" || key === "sewageConsumption"
                      ? currentMonth[key]
                      : formatCurrency(currentMonth[key])}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex justify-between border-t border-gray-200 pt-3">
              <span className="font-semibold text-gray-900">TOTAL DE PLATĂ</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(currentMonth.totalAmount)}
              </span>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
