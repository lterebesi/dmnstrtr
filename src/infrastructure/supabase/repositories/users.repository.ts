import "server-only";

import { createSupabaseAdminClient } from "@/infrastructure/supabase/admin";

/**
 * Caută un user după email, cu privilegii de administrator (service role).
 *
 * Necesar pentru asocierea unui locatar cu un apartament: administratorul nu
 * are, prin RLS, vizibilitate asupra unui user care nu e încă rezident într-
 * unul din blocurile lui — e exact relația pe care vrea s-o creeze acum.
 * Apelantul TREBUIE să fi verificat deja (via getCurrentUser()) că cererea
 * vine de la un ADMINISTRATOR autentificat.
 */
export async function findUserByEmailAsAdmin(email: string) {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("users")
    .select("id, name, email, role")
    .eq("email", email)
    .maybeSingle();

  return data;
}
