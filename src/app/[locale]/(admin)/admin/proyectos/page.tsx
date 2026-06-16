import { obtenerEstadisticasAdmin } from "@/server/repositories/estadisticas-admin.repository";
import { listarProyectosAdmin } from "@/server/repositories/proyecto.repository";
import {
  AdminPageShell,
  AdminPageHeader,
} from "@/components/features/admin/admin-page-header";

const estadoProyecto: Record<string, string> = {
  publicado: "bg-fwd-blue/15 text-fwd-blue",
  abierto: "bg-fwd-blue/15 text-fwd-blue",
  en_desarrollo: "bg-fwd-purple/20 text-fwd-purple",
  cerrado: "bg-white/10 text-white/60",
  borrador: "bg-fwd-yellow/15 text-fwd-yellow",
  cancelado: "bg-red-500/15 text-red-300",
};

// URL: /es/admin/proyectos — resumen operativo + listado de proyectos.
export default async function AdminProyectosPage() {
  const [stats, proyectos] = await Promise.all([
    obtenerEstadisticasAdmin(),
    listarProyectosAdmin(),
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
  ];

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Proyectos"
        subtitle="Operación del marketplace durante el mes."
      />

      {/* Resumen operativo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {operativas.map((m) => (
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

      {/* Listado de proyectos */}
      <div>
        <h2 className="mb-3 font-display text-lg font-bold text-white">
          Proyectos recientes
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-white/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Título</th>
                <th className="px-4 py-3 font-semibold">Empresario</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 text-right font-semibold">Ofertas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.07]">
              {proyectos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-white/40">
                    Aún no hay proyectos.
                  </td>
                </tr>
              ) : (
                proyectos.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-white/5">
                    <td className="max-w-xs truncate px-4 py-3 font-medium text-white">
                      {p.titulo}
                    </td>
                    <td className="px-4 py-3 text-white/55">
                      {p.perfiles_empresario?.usuarios?.nombre ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                          estadoProyecto[p.estado] ?? "bg-white/10 text-white/70"
                        }`}
                      >
                        {p.estado.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-white/70">
                      {p._count.ofertas}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPageShell>
  );
}
