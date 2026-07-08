import { obtenerEstadisticasAdmin } from "@/server/repositories/estadisticas-admin.repository";
import { listarOfertasAdmin } from "@/server/repositories/oferta.repository";
import {
  AdminPageShell,
  AdminPageHeader,
} from "@/components/features/admin/admin-page-header";
import { GestionOfertasPanel } from "@/components/features/admin/gestion-ofertas-panel";

// URL: /es/admin/ofertas — métricas de ofertas + listado reciente.
export default async function AdminOfertasPage() {
  const [stats, ofertas] = await Promise.all([
    obtenerEstadisticasAdmin(),
    listarOfertasAdmin(),
  ]);

  const serializableOfertas = ofertas.map((o) => ({
    ...o,
    enviado: o.enviado instanceof Date ? o.enviado.toISOString() : o.enviado,
  }));

  const metricas = [
    {
      label: "Ofertas enviadas",
      valor: stats.ofertasEnviadas,
      hint: "Este mes",
      color: "#20BEC6",
    },
    {
      label: "Adjudicadas",
      valor: stats.ofertasAdjudicadas,
      hint: "Este mes",
      color: "#008FD4",
    },
  ];

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Ofertas"
        subtitle="Ofertas enviadas por los estudiantes a los proyectos."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:max-w-md">
        {metricas.map((m) => (
          <div
            key={m.label}
            className="rounded-2xl p-5 shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-xl cursor-default"
            style={{ backgroundColor: m.color }}
          >
            <p className="text-sm font-medium text-white/80 transition-all duration-300 hover:translate-x-1 hover:text-white select-none">{m.label}</p>
            <p className="mt-1 text-4xl font-black tabular-nums text-white transition-all duration-300 hover:translate-x-1 hover:scale-105 origin-left select-none">
              {m.valor}
            </p>
            <p className="mt-1 text-xs text-white/70 transition-all duration-300 hover:translate-x-1 hover:text-white/90 select-none">{m.hint}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-bold text-white transition-all duration-300 hover:text-fwd-magenta hover:translate-x-1 cursor-default select-none">
          Ofertas recientes
        </h2>
        <GestionOfertasPanel ofertas={serializableOfertas} />
      </div>
    </AdminPageShell>
  );
}
