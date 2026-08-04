import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata: Metadata = { title: "Blocuri · Administrator" };

export default function BlocuriPage() {
  return (
    <ComingSoon
      title="Gestionare blocuri, scări și apartamente"
      stage="ETAPA 3"
    />
  );
}
