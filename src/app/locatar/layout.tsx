import { getCurrentUser } from "@/lib/auth/current-user";
import { AppShell } from "@/components/layout/AppShell";

const NAV_LINKS = [
  { href: "/locatar", label: "Dashboard" },
  { href: "/locatar/istoric", label: "Istoric" },
  { href: "/locatar/sesizari", label: "Sesizări" },
  { href: "/notificari", label: "Notificări" },
];

export default async function LocatarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <AppShell userName={user.name} roleLabel="Locatar" navLinks={NAV_LINKS}>
      {children}
    </AppShell>
  );
}
