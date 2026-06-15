import { obtenerEstadisticasAdmin } from "@/server/repositories/estadisticas-admin.repository";
import { listarOfertasAdmin } from "@/server/repositories/oferta.repository";
import {
  normalizarEstadoOferta,
  ESTADO_OFERTA_META,
} from "@/lib/oferta-estado";
import {
  AdminPageShell,
  AdminPageHeader,
} from "@/components/features/admin/admin-page-header";

// URL: /es/admin/ofertas — métricas de ofertas + listado reciente.
export default async function AdminOfertasPage() {
  const [stats, ofertas] = await Promise.all([
    obtenerEstadisticasAdmin(),
    listarOfertasAdmin(),
  ]);

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
            className="rounded-2xl p-5 shadow-lg"
            style={{ backgroundColor: m.color }}
          >
            <p className="text-sm font-medium text-white/80">{m.label}</p>
            <p className="mt-1 text-4xl font-black tabular-nums text-white">
              {m.valor}
            </p>
            <p className="mt-1 text-xs text-white/70">{m.hint}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-bold text-white">
          Ofertas recientes
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-white/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Estudiante</th>
                <th className="px-4 py-3 font-semibold">Proyecto</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Enviada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.07]">
              {ofertas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-white/40">
                    Aún no hay ofertas.
                  </td>
                </tr>
              ) : (
                ofertas.map((o) => {
                  const meta = ESTADO_OFERTA_META[normalizarEstadoOferta(o.estado)];
                  return (
                    <tr key={o.id} className="transition-colors hover:bg-white/5">
                      <td className="px-4 py-3 font-medium text-white">
                        {o.perfiles_estudiante?.usuarios?.nombre ?? "—"}
                      </td>
                      <td className="max-w-xs truncate px-4 py-3 text-white/55">
                        {o.proyectos?.titulo ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.badge}`}
                        >
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/45">
                        {o.enviado.toLocaleDateString("es-CR")}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPageShell>
  );
}
