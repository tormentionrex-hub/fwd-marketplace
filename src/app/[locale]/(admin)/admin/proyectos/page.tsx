import { obtenerEstadisticasAdmin } from "@/server/repositories/estadisticas-admin.repository";
import { autoCerrarProyectosViejos } from "@/server/repositories/estadisticas-admin.repository";
import { listarProyectosAdmin } from "@/server/repositories/proyecto.repository";
import { AdminPageShell, AdminPageHeader } from "@/components/features/admin/admin-page-header";
import { GestionProyectosPanel } from "@/components/features/admin/gestion-proyectos-panel";
import { EstadisticasOperativasPanel } from "@/components/features/admin/estadisticas-operativas-panel";
import type { ProyectoAdmin } from "@/components/features/admin/gestion-proyectos-panel";


// URL: /es/admin/proyectos — resumen operativo + listado de proyectos.
export default async function AdminProyectosPage() {
  const [stats, rawProyectos] = await Promise.all([
    obtenerEstadisticasAdmin(),
    listarProyectosAdmin(),
    // Auto-cierre de proyectos sin ofertas después de 60 días (fuego y olvida).
    autoCerrarProyectosViejos(),
  ]);
  const proyectos = rawProyectos as ProyectoAdmin[];

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
      tipo: "activos" as const,
    },
    {
      label: "Cerrados este mes",
      valor: stats.proyectosCerradosMes,
      hint: "Proyectos finalizados",
      color: "#662D91",
      tipo: "cerrados" as const,
    },
    {
      label: "Ofertas del período",
      valor: stats.ofertasEnviadas,
      hint: `${stats.ofertasAdjudicadas} adjudicadas`,
      color: "#20BEC6",
      tipo: "ofertas" as const,
    },
  ];

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Proyectos"
        subtitle="Operación del marketplace durante el mes."
      />

      {/* Resumen operativo con botones Ver detalles */}
      <EstadisticasOperativasPanel operativas={operativas} />

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
