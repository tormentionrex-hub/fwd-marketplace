import type { Metadata } from "next";
import EstudianteShell from "@/components/layout/EstudianteShell";
import MisOfertasView from "@/components/features/ofertas/MisOfertasView";

export const metadata: Metadata = {
  title: "Mis Ofertas · FWD Marketplace",
  description: "Consulta y da seguimiento al estado de todas tus ofertas enviadas.",
};

export default async function MisOfertasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <EstudianteShell locale={locale}>
      <MisOfertasView locale={locale} />
    </EstudianteShell>
  );
}
