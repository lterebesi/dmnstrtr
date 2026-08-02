import type { ReactNode } from "react";
import { LogoutButton } from "@/components/layout/LogoutButton";

interface NavLink {
  href: string;
  label: string;
}

interface AppShellProps {
  userName: string;
  roleLabel: string;
  navLinks: NavLink[];
  children: ReactNode;
}

export function AppShell({ userName, roleLabel, navLinks, children }: AppShellProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">Asociație de Locatari</p>
            <p className="text-xs text-gray-500">
              {userName} · {roleLabel}
            </p>
          </div>
          <LogoutButton />
        </div>
        {navLinks.length > 0 && (
          <nav className="mx-auto flex max-w-5xl gap-4 px-4 pb-2 text-sm text-gray-600">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-blue-600">
                {link.label}
              </a>
            ))}
          </nav>
        )}
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
