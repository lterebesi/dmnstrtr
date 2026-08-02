import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Conectare · Asociație de Locatari" };

export default function LoginPage() {
  return <LoginForm />;
}
