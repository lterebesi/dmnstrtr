import "server-only";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server";
import type { User } from "@/domain/entities/user";

/**
 * Citește userul curent + profilul din `public.users`. `proxy.ts` a impus
 * deja optimist accesul pe rută, dar Server Components trebuie să obțină
 * datele oricum — acest helper e sursa unică pentru asta.
 */
export async function getCurrentUser(): Promise<User> {
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
