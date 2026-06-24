import type { Metadata } from "next";
import { RankingSeccion } from "@/components/features/ranking/RankingSeccion";
import { listarRankingEstudiantes } from "@/server/services/ranking.service";

export const metadata: Metadata = {
  title: "Ranking de Estudiantes | FWD Marketplace",
  description: "Los estudiantes mejor calificados del programa FWD, ordenados por reputación y desempeño en proyectos.",
};

export default async function RankingPage() {
  const estudiantes = await listarRankingEstudiantes();

  return (
    <main className="min-h-screen bg-[#0e1628] py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="text-center mb-16">
          <p className="text-[#20BEC7] text-xs font-semibold uppercase tracking-widest mb-3">
            Talento FWD
          </p>
          <h1 className="font-heading font-black text-white text-4xl md:text-5xl leading-tight">
            Ranking de Estudiantes FWD
          </h1>
          <p className="text-white/50 text-base mt-4 max-w-lg mx-auto">
            Clasificados por puntuación obtenida en proyectos reales completados con empresarios.
          </p>
        </div>

        {/* Contenido del ranking */}
        <RankingSeccion estudiantes={estudiantes} showVerMas={false} />

        {estudiantes.length === 0 && (
          <p className="text-white/30 text-center text-sm mt-4">
            Los estudiantes aparecen aquí una vez que completan y son calificados en un proyecto.
          </p>
        )}
      </div>
    </main>
  );
}
