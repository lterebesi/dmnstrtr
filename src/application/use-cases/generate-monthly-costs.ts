import "server-only";

import { createSupabaseServerClient } from "@/infrastructure/supabase/server";
import { upsertMonthlyCosts } from "@/infrastructure/supabase/repositories/monthly-costs.repository";
import { findActiveResidentByApartmentId } from "@/infrastructure/supabase/repositories/residents.repository";
import { recordAuditLog } from "@/infrastructure/supabase/repositories/audit-log.repository";
import { createNotification } from "@/infrastructure/supabase/repositories/notifications.repository";
import { calculateMonthlyTotal } from "@/domain/services/calculateMonthlyTotal";
import { formatCurrency } from "@/lib/format";
import { formatMonthLabel } from "@/lib/date";
import type { MonthlyCostInput } from "@/domain/entities/monthly-costs";

/**
 * Salvează consumurile/costurile unei luni pentru un apartament.
 * `total_amount` e recalculat de Postgres (coloană generată) — apelăm
 * `calculateMonthlyTotal` doar ca să includem totalul așteptat în audit log,
 * nu ca sursă de adevăr.
 */
export async function generateMonthlyCosts(
  input: {
    apartmentId: string;
    month: string;
    adminId: string;
  } & MonthlyCostInput,
) {
  const supabase = await createSupabaseServerClient();

  const { adminId, ...costInput } = input;
  const saved = await upsertMonthlyCosts(supabase, { ...costInput, createdBy: adminId });

  await recordAuditLog({
    actorId: input.adminId,
    action: "GENERATE_MONTHLY_COSTS",
    entity: "monthly_costs",
    entityId: saved.id,
    diff: {
      apartmentId: input.apartmentId,
      month: input.month,
      expectedTotal: calculateMonthlyTotal(input),
      savedTotal: saved.total_amount,
    },
  });

  const resident = await findActiveResidentByApartmentId(supabase, input.apartmentId);
  if (resident) {
    await createNotification({
      userId: resident.user_id,
      type: "LISTA_GENERATA",
      title: `Lista de plată pentru ${formatMonthLabel(input.month)} a fost generată`,
      body: `TOTAL DE PLATĂ: ${formatCurrency(saved.total_amount)}`,
      relatedEntity: "monthly_costs",
      relatedId: saved.id,
    });

    if (input.debt > 0) {
      await createNotification({
        userId: resident.user_id,
        type: "RESTANTA",
        title: `Restanță înregistrată pentru ${formatMonthLabel(input.month)}`,
        body: `Suma restantă: ${formatCurrency(input.debt)}`,
        relatedEntity: "monthly_costs",
        relatedId: saved.id,
      });
    }
  }

  return saved;
}
