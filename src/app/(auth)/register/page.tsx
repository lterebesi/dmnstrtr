import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Înregistrare · Asociație de Locatari" };

export default function RegisterPage() {
  return <RegisterForm />;
}
