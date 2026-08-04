import "server-only";

import { createSupabaseServerClient } from "@/infrastructure/supabase/server";
import { upsertMonthlyCosts } from "@/infrastructure/supabase/repositories/monthly-costs.repository";
import { recordAuditLog } from "@/infrastructure/supabase/repositories/audit-log.repository";
import { calculateMonthlyTotal } from "@/domain/services/calculateMonthlyTotal";
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

  return saved;
}
