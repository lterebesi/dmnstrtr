import type { Metadata } from "next";
import { listApartmentOptionsForAdmin } from "@/application/use-cases/manage-blocks";
import { Card } from "@/components/ui/Card";
import { MonthlyCostsForm } from "@/components/admin/MonthlyCostsForm";
import { currentMonthDateString } from "@/lib/date";

export const metadata: Metadata = { title: "Consumuri · Administrator" };

export default async function ConsumuriPage() {
  const apartments = await listApartmentOptionsForAdmin();

  return (
    <Card>
      <h2 className="text-lg font-semibold text-gray-900">
        Introducere consumuri și calcul automat
      </h2>
      <p className="mt-1 text-sm text-gray-600">
        Totalul de plată se calculează automat din componentele de mai jos.
      </p>
      <div className="mt-4">
        <MonthlyCostsForm apartments={apartments} currentMonth={currentMonthDateString()} />
      </div>
    </Card>
  );
}
