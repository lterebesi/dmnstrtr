import "server-only";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server";
import type { User, UserRole } from "@/domain/entities/user";

/**
 * DOAR pentru development: DISABLE_AUTH=true întoarce un user fals, fără
 * să interogheze Supabase — util ca să vezi paginile cât timp Auth e
 * neconfigurat. Rolul afișat e configurabil via DISABLE_AUTH_ROLE.
 * NU seta asta pe un mediu accesibil public — dezactivează complet
 * verificarea de identitate.
 */
const MOCK_USER: User = {
  id: "00000000-0000-0000-0000-000000000000",
  name: "Utilizator test (DISABLE_AUTH)",
  email: "test@local.dev",
  phone: null,
  role: (process.env.DISABLE_AUTH_ROLE as UserRole | undefined) ?? "LOCATAR",
};

/**
 * Citește userul curent + profilul din `public.users`. `proxy.ts` a impus
 * deja optimist accesul pe rută, dar Server Components trebuie să obțină
 * datele oricum — acest helper e sursa unică pentru asta.
 */
export async function getCurrentUser(): Promise<User> {
  if (process.env.DISABLE_AUTH === "true") {
    return MOCK_USER;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("users")
    .select("id, name, email, phone, role")
    .eq("id", authUser.id)
    .single();

  if (error || !profile) {
    redirect("/login");
  }

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    role: profile.role,
  };
}
