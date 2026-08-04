import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata: Metadata = { title: "Consumuri · Administrator" };

export default function ConsumuriPage() {
  return (
    <ComingSoon
      title="Introducere consumuri și calcul automat costuri"
      stage="ETAPA 3"
    />
  );
}
