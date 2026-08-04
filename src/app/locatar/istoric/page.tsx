import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata: Metadata = { title: "Istoric · Locatar" };

export default function IstoricPage() {
  return <ComingSoon title="Istoric luni precedente" stage="ETAPA 2" />;
}
