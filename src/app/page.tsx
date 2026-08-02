import { redirect } from "next/navigation";

/**
 * Fallback — în mod normal `proxy.ts` redirecționează deja `/` către
 * `/login` (nedelogat) sau către dashboard-ul rolului (autentificat).
 */
export default function RootPage() {
  redirect("/login");
}
