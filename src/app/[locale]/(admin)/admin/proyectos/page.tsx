import { obtenerEstadisticasAdmin } from "@/server/repositories/estadisticas-admin.repository";
import { listarProyectosAdmin } from "@/server/repositories/proyecto.repository";
import {
  AdminPageShell,
  AdminPageHeader,
} from "@/components/features/admin/admin-page-header";
import { GestionProyectosPanel } from "@/components/features/admin/gestion-proyectos-panel";


// URL: /es/admin/proyectos — resumen operativo + listado de proyectos.
export default async function AdminProyectosPage() {
  const [stats, proyectos] = await Promise.all([
    obtenerEstadisticasAdmin(),
    listarProyectosAdmin(),
  ]);

  const serializableProyectos = proyectos.map((p) => ({
    ...p,
    publicado: p.publicado instanceof Date ? p.publicado.toISOString() : p.publicado,
    cierre: p.cierre instanceof Date ? p.cierre.toISOString() : p.cierre,
  }));

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

      {/* Listado de proyectos */}
      <div>
        <h2 className="mb-3 font-display text-lg font-bold text-white transition-all duration-300 hover:text-fwd-magenta hover:translate-x-1 cursor-default select-none">
          Proyectos recientes
        </h2>
        <GestionProyectosPanel proyectos={serializableProyectos} />
      </div>
    </AdminPageShell>
  );
}

