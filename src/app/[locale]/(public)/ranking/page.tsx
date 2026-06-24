import type { Metadata } from "next";
import { RankingSeccion } from "@/components/features/ranking/RankingSeccion";
import { listarRankingEstudiantes } from "@/server/services/ranking.service";

export const metadata: Metadata = {
  title: "Ranking | FWD Marketplace",
  description: "Los estudiantes mejor calificados del programa FWD, ordenados por puntuacion en proyectos reales.",
};

export default async function RankingPage() {
  const estudiantes = await listarRankingEstudiantes();
  const total = estudiantes.length;
  const totalProyectos = estudiantes.reduce((s, e) => s + e.totalCalificaciones, 0);
  const promedio =
    total > 0
      ? (estudiantes.reduce((s, e) => s + e.puntuacion, 0) / total).toFixed(1)
      : "—";

  return (
    <main className="min-h-screen" style={{ background: "#080f1e" }}>
      {/* ── Hero ── */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(180deg, #0d1a36 0%, #080f1e 100%)" }}>
        {/* Glows de fondo */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 60% 45% at 20% 50%, rgba(102,46,145,0.18) 0%, transparent 70%)," +
              "radial-gradient(ellipse 50% 40% at 80% 50%, rgba(0,143,213,0.14) 0%, transparent 70%)",
          }}
        />

        {/* Grid decorativo */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          aria-hidden
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
          {/* Chip */}
          <div className="flex justify-center mb-5">
            <span
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em]"
              style={{ background: "rgba(0,143,213,0.12)", border: "1px solid rgba(0,143,213,0.3)", color: "#20BEC7" }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#20BEC7" }} />
              Talento FWD
            </span>
          </div>

          {/* Titulo */}
          <h1
            className="font-heading font-black text-center leading-[1.08] text-4xl sm:text-5xl md:text-6xl"
            style={{
              background: "linear-gradient(135deg, #ffffff 30%, #C0C0C0 55%, #FFD700 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Ranking de Estudiantes
          </h1>
          <p className="text-center mt-4 text-white/45 text-base max-w-md mx-auto leading-relaxed">
            Clasificados por su puntuacion real en proyectos completados con empresarios de la comunidad.
          </p>

          {/* Stats */}
          {total > 0 && (
            <div className="flex flex-wrap justify-center gap-6 mt-12">
              {[
                { label: "Estudiantes rankeados", value: total },
                { label: "Proyectos completados", value: totalProyectos },
                { label: "Puntuacion promedio", value: promedio },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col items-center gap-1 px-6 py-4 rounded-2xl"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <span className="font-black text-white text-3xl leading-none">{s.value}</span>
                  <span className="text-white/35 text-[11px] uppercase tracking-widest">{s.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Contenido ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <RankingSeccion estudiantes={estudiantes} showVerMas={false} />
      </div>
    </main>
  );
}
