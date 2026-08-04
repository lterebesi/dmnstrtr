import { getCurrentUser } from "@/lib/auth/current-user";
import { AppShell } from "@/components/layout/AppShell";

const NAV_LINKS = [
  { href: "/administrator", label: "Dashboard" },
  { href: "/administrator/blocuri", label: "Blocuri" },
  { href: "/administrator/consumuri", label: "Consumuri" },
  { href: "/administrator/plati", label: "Plăți" },
  { href: "/administrator/sesizari", label: "Sesizări" },
  { href: "/administrator/rapoarte", label: "Rapoarte" },
  { href: "/notificari", label: "Notificări" },
];

export default async function AdministratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <AppShell userName={user.name} roleLabel="Administrator" navLinks={NAV_LINKS}>
      {children}
    </AppShell>
  );
}
