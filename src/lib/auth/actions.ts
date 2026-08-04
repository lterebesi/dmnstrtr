"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server";
import { loginSchema, registerSchema } from "@/lib/validation/auth";

export interface AuthActionState {
  error: string | null;
  info?: string;
}

const GENERIC_LOGIN_ERROR = "Email sau parolă incorectă.";
const EMAIL_NOT_CONFIRMED_ERROR =
  "Contul nu e confirmat încă. Verifică emailul pentru linkul de confirmare.";

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Date invalide." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      error:
        error.code === "email_not_confirmed"
          ? EMAIL_NOT_CONFIRMED_ERROR
          : GENERIC_LOGIN_ERROR,
    };
  }

  redirect("/");
}

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Date invalide." };
  }

  const { name, email, phone, password, role } = parsed.data;
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, phone: phone || null, role },
    },
  });

  if (error) {
    return {
      error:
        error.code === "user_already_exists"
          ? "Există deja un cont cu acest email."
          : "Înregistrarea a eșuat. Încearcă din nou.",
    };
  }

  // Cu "Confirm email" activat în Supabase, signUp nu creează o sesiune —
  // contul trebuie confirmat prin linkul trimis pe email înainte de /login.
  if (!data.session) {
    return {
      error: null,
      info: "Cont creat! Verifică emailul pentru linkul de confirmare, apoi conectează-te.",
    };
  }

  redirect("/");
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
