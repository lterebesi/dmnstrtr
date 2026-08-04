import { redirect } from "next/navigation";

/**
 * Fallback — în mod normal `proxy.ts` redirecționează deja `/` către
 * `/login` (nedelogat) sau către dashboard-ul rolului (autentificat).
 * Cu DISABLE_AUTH=true, proxy.ts lasă cererea să treacă fără verificare,
 * așa că fallback-ul trebuie să respecte același flag — altfel ai ajunge
 * mereu pe /login chiar și cu autentificarea dezactivată.
 */
export default function RootPage() {
  if (process.env.DISABLE_AUTH === "true") {
    const role = process.env.DISABLE_AUTH_ROLE === "ADMINISTRATOR"
      ? "/administrator"
      : "/locatar";
    redirect(role);
  }

  redirect("/login");
}
