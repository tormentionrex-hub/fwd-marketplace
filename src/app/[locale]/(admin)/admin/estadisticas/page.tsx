import {
  AdminPageShell,
  AdminPageHeader,
} from "@/components/features/admin/admin-page-header";
import { obtenerEstadisticasAdmin } from "@/server/repositories/estadisticas-admin.repository";
import { obtenerDashboardAdmin } from "@/server/services/dashboard-admin.service";
import { KpiCards } from "@/components/features/admin/dashboard/kpi-cards";
import { PanelCard } from "@/components/features/admin/dashboard/panel-card";
import { ActividadChart } from "@/components/features/admin/dashboard/actividad-chart";

// URL: /es/admin/estadisticas — métricas globales del marketplace con datos
// reales (mismas fuentes que el dashboard + estadísticas operativas del mes).
export default async function AdminEstadisticasPage() {
  const [stats, data] = await Promise.all([
    obtenerEstadisticasAdmin(),
    obtenerDashboardAdmin(),
  ]);

  const operativas = [
    {
      label: "Proyectos activos",
      valor: stats.proyectosActivos,
      hint: "Recibiendo ofertas ahora",
      color: "#008FD4",
    },
    {
      label: "Cerrados este mes",
      valor: stats.proyectosCerradosMes,
      hint: "Proyectos finalizados",
      color: "#662D91",
    },
    {
      label: "Ofertas del período",
      valor: stats.ofertasEnviadas,
      hint: `${stats.ofertasAdjudicadas} adjudicadas`,
      color: "#20BEC6",
    },
    {
      label: "Pendientes de validación",
      valor: stats.estudiantesPendientes,
      hint: "Esperando aprobación",
      color: "#F7901E",
    },
  ];

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Estadísticas"
        subtitle="Métricas globales del marketplace y operación del mes."
      />

      {/* Indicadores principales (reutiliza las tarjetas del dashboard) */}
      <KpiCards kpis={data.kpis} />

      {/* Operación del mes */}
      <div>
        <h2 className="mb-3 font-display text-lg font-bold text-white">
          Operación del mes
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {operativas.map((m) => (
            <div
              key={m.label}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-sm"
            >
              <span
                className="absolute inset-y-0 left-0 w-1.5"
                style={{ backgroundColor: m.color }}
                aria-hidden
              />
              <p className="text-sm text-white/50">{m.label}</p>
              <p className="mt-1 text-3xl font-black tabular-nums text-white">
                {m.valor.toLocaleString("es-CR")}
              </p>
              <p className="mt-0.5 text-xs text-white/35">{m.hint}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Evolución de la actividad */}
      <PanelCard title="Actividad de los últimos 6 meses">
        <ActividadChart data={data.serie} />
      </PanelCard>
    </AdminPageShell>
  );
}
