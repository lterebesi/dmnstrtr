import { NextResponse, type NextRequest } from "next/server";
import { refreshSupabaseSession } from "@/infrastructure/supabase/proxy-session";

const PUBLIC_ROUTES = ["/login", "/register"];

/**
 * `null` înseamnă "rol necunoscut" (ex: profilul din `public.users` nu a
 * putut fi citit încă). Nu trebuie NICIODATĂ tradus într-un path implicit —
 * altfel un mismatch pe /administrator sau /locatar ar redirecționa către
 * chiar pagina curentă, producând o buclă infinită de redirect-uri.
 */
function roleHomePath(role: "ADMINISTRATOR" | "LOCATAR" | null): string | null {
  if (role === "ADMINISTRATOR") return "/administrator";
  if (role === "LOCATAR") return "/locatar";
  return null;
}

/**
 * Control optimist de acces pe baza sesiunii + rolului. Este prima linie de
 * apărare (UX: redirect rapid) — autorizarea reală, obligatorie, e impusă de
 * RLS în PostgreSQL și verificată din nou în use-cases.
 */
export async function proxy(request: NextRequest) {
  // DOAR pentru development: DISABLE_AUTH=true lasă orice rută să treacă,
  // fără verificare de sesiune sau rol. Vezi și getCurrentUser() în
  // lib/auth/current-user.ts. NU seta asta pe un mediu accesibil public.
  if (process.env.DISABLE_AUTH === "true") {
    return NextResponse.next();
  }

  const { response, user, supabase } = await refreshSupabaseSession(request);
  const { pathname } = request.nextUrl;

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  if (!user) {
    if (isPublicRoute) return response;
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? null;
  const homePath = roleHomePath(role);

  // Rol necunoscut: nu redirecționăm în buclă către ruta protejată curentă.
  // `getCurrentUser()` (folosit în layout-urile /administrator și /locatar)
  // va trimite explicit către /login dacă profilul chiar nu există.
  if (homePath === null) {
    if (isPublicRoute) return response;
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return response;
  }

  if (isPublicRoute || pathname === "/") {
    return NextResponse.redirect(new URL(homePath, request.url));
  }

  if (pathname.startsWith("/administrator") && role !== "ADMINISTRATOR") {
    return NextResponse.redirect(new URL(homePath, request.url));
  }

  if (pathname.startsWith("/locatar") && role !== "LOCATAR") {
    return NextResponse.redirect(new URL(homePath, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Rulează pe toate rutele, mai puțin fișierele statice și interne Next.js.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
