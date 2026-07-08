import { FolderKanban, Users, Sparkles, Clock, TrendingUp, TrendingDown } from "lucide-react";
import type { DashboardKpis } from "@/server/services/dashboard-admin.service";

// Tarjetas de indicadores principales del dashboard admin.
// Componente de servidor (solo render). Los colores de marca van inline para
// mantenerse iguales en claro/oscuro; el resto usa las clases del panel que el
// override de globals.css adapta automáticamente al tema.

function Delta({ pct }: { pct: number }) {
  if (pct === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-white/50">
        0%
      </span>
    );
  }
  const positivo = pct > 0;
  const Icono = positivo ? TrendingUp : TrendingDown;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
        positivo
          ? "bg-emerald-500/10 text-emerald-500"
          : "bg-red-500/10 text-red-500"
      }`}
    >
      <Icono className="h-3 w-3" />
      {positivo ? "+" : ""}
      {pct}%
    </span>
  );
}

type Tarjeta = {
  label: string;
  valor: number;
  icono: typeof FolderKanban;
  color: string;
  tint: string;
  delta?: number;
  hint?: string;
};

export function KpiCards({ kpis }: { kpis: DashboardKpis }) {
  const tarjetas: Tarjeta[] = [
    {
      label: "Proyectos publicados",
      valor: kpis.proyectosTotal,
      icono: FolderKanban,
      color: "#008FD4",
      tint: "rgba(0,143,212,0.12)",
      delta: kpis.proyectosDeltaPct,
    },
    {
      label: "Usuarios activos",
      valor: kpis.usuariosActivos,
      icono: Users,
      color: "#662D91",
      tint: "rgba(102,45,145,0.14)",
      delta: kpis.usuariosDeltaPct,
    },
    {
      label: "Proyectos nuevos",
      valor: kpis.proyectosNuevosMes,
      icono: Sparkles,
      color: "#20BEC6",
      tint: "rgba(32,190,198,0.14)",
      hint: "Este mes",
    },
    {
      label: "Ofertas pendientes",
      valor: kpis.ofertasPendientes,
      icono: Clock,
      color: "#EC008C",
      tint: "rgba(236,0,140,0.12)",
      hint: `${kpis.estudiantesOfertaPendiente} estudiante${
        kpis.estudiantesOfertaPendiente === 1 ? "" : "s"
      }`,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {tarjetas.map((t) => {
        const Icono = t.icono;
        return (
          <div
            key={t.label}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
          >
            <div className="flex items-start justify-between gap-3">
              <span
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                style={{ background: t.tint, color: t.color }}
                aria-hidden
              >
                <Icono className="h-5 w-5" />
              </span>
              {t.delta !== undefined ? <Delta pct={t.delta} /> : null}
            </div>
            <p className="mt-4 text-3xl font-black tabular-nums text-white">
              {t.valor.toLocaleString("es-CR")}
            </p>
            <p className="mt-1 text-sm text-white/50">{t.label}</p>
            {t.hint ? (
              <p className="mt-0.5 text-xs text-white/35">{t.hint}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
