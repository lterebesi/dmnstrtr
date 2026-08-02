import { NextResponse, type NextRequest } from "next/server";
import { refreshSupabaseSession } from "@/infrastructure/supabase/proxy-session";

const PUBLIC_ROUTES = ["/login", "/register"];

function roleHomePath(role: "ADMINISTRATOR" | "LOCATAR" | null) {
  return role === "ADMINISTRATOR" ? "/administrator" : "/locatar";
}

/**
 * Control optimist de acces pe baza sesiunii + rolului. Este prima linie de
 * apărare (UX: redirect rapid) — autorizarea reală, obligatorie, e impusă de
 * RLS în PostgreSQL și verificată din nou în use-cases.
 */
export async function proxy(request: NextRequest) {
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

  if (isPublicRoute || pathname === "/") {
    return NextResponse.redirect(new URL(roleHomePath(role), request.url));
  }

  if (pathname.startsWith("/administrator") && role !== "ADMINISTRATOR") {
    return NextResponse.redirect(new URL(roleHomePath(role), request.url));
  }

  if (pathname.startsWith("/locatar") && role !== "LOCATAR") {
    return NextResponse.redirect(new URL(roleHomePath(role), request.url));
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
