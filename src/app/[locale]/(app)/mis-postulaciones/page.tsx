import type { Metadata } from "next";
import EstudianteShell from "@/components/layout/EstudianteShell";
import MisPostulacionesView from "@/components/features/postulaciones/MisPostulacionesView";

export const metadata: Metadata = {
  title: "Mis Postulaciones · FWD Marketplace",
  description: "Consulta y da seguimiento al estado de las vacantes a las que te postulaste.",
};

export default async function MisPostulacionesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <EstudianteShell locale={locale}>
      <MisPostulacionesView locale={locale} />
    </EstudianteShell>
  );
}
