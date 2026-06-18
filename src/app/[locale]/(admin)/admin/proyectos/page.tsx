import { obtenerEstadisticasAdmin } from "@/server/repositories/estadisticas-admin.repository";
import { listarProyectosAdmin } from "@/server/repositories/proyecto.repository";
import {
  AdminPageShell,
  AdminPageHeader,
} from "@/components/features/admin/admin-page-header";
import { GestionProyectosPanel } from "@/components/features/admin/gestion-proyectos-panel";
import type { ProyectoAdmin } from "@/components/features/admin/gestion-proyectos-panel";


// URL: /es/admin/proyectos — resumen operativo + listado de proyectos.
export default async function AdminProyectosPage() {
  const [stats, rawProyectos] = await Promise.all([
    obtenerEstadisticasAdmin(),
    listarProyectosAdmin(),
  ]);
  const proyectos = rawProyectos as ProyectoAdmin[];

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
            className="rounded-2xl p-5 shadow-lg bg-fwd-azul"
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
        <GestionProyectosPanel proyectos={proyectos} />
      </div>
    </AdminPageShell>
  );
}

