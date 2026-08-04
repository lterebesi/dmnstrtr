import type { Metadata } from "next";
import { listApartmentOptionsForAdmin } from "@/application/use-cases/manage-blocks";
import { listRecentPaymentsForAdmin } from "@/application/use-cases/manage-payments";
import { Card } from "@/components/ui/Card";
import { MarkPaymentForm } from "@/components/admin/MarkPaymentForm";
import { PaymentStatusBadge } from "@/components/dashboard/PaymentStatusBadge";
import { formatCurrency } from "@/lib/format";
import { currentMonthDateString } from "@/lib/date";

export const metadata: Metadata = { title: "Plăți · Administrator" };

export default async function PlatiPage() {
  const [apartments, recentPayments] = await Promise.all([
    listApartmentOptionsForAdmin(),
    listRecentPaymentsForAdmin(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="text-lg font-semibold text-gray-900">Marchează plată</h2>
        <div className="mt-3">
          <MarkPaymentForm apartments={apartments} currentMonth={currentMonthDateString()} />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900">Istoric plăți recente</h2>
        {recentPayments.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">Nicio plată înregistrată încă.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="py-2 pr-4 font-medium">Apartament</th>
                  <th className="py-2 pr-4 font-medium">Lună</th>
                  <th className="py-2 pr-4 font-medium">Sumă</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-100">
                    <td className="py-2 pr-4 text-gray-900">{payment.apartmentLabel}</td>
                    <td className="py-2 pr-4 text-gray-900">{payment.month}</td>
                    <td className="py-2 pr-4 text-gray-900">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="py-2">
                      <PaymentStatusBadge status={payment.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
