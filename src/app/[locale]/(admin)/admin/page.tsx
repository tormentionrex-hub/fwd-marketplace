import { getUser } from "@/server/auth/get-user";
import { obtenerDashboardAdmin } from "@/server/services/dashboard-admin.service";
import { DashboardTopbar } from "@/components/features/admin/dashboard/dashboard-topbar";
import { KpiCards } from "@/components/features/admin/dashboard/kpi-cards";
import { PanelCard } from "@/components/features/admin/dashboard/panel-card";
import { ActividadChart } from "@/components/features/admin/dashboard/actividad-chart";
import { AprobacionesPanel } from "@/components/features/admin/dashboard/aprobaciones-panel";
import { ActividadReciente } from "@/components/features/admin/dashboard/actividad-reciente";
import { ProyectosRecientes } from "@/components/features/admin/dashboard/proyectos-recientes";
import { InvitacionesPanel } from "@/components/features/admin/dashboard/invitaciones-panel";

// Etiqueta legible del rol de staff que se muestra en la barra superior.
const ROL_LABEL: Record<string, string> = {
  owner: "Owner",
  admin: "Administrador",
  editor: "Editor",
  moderator: "Moderador",
};

// Panel de administración — Dashboard (resumen general).
// URL: /es/admin — protegido por (admin)/layout.tsx (solo owner/admin).
// Todos los datos provienen de la base de datos (Prisma); las secciones sin
// datos quedan en 0 / estado vacío y se actualizan al refrescar la BD.
export default async function AdminPage() {
  const [user, data] = await Promise.all([getUser(), obtenerDashboardAdmin()]);

  const nombre = user?.nombre ?? "Administrador";
  const rolLabel = ROL_LABEL[user?.roles.nombre ?? ""] ?? "Administrador";

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 pt-20 lg:px-8 lg:pt-8">
      <DashboardTopbar
        nombre={nombre}
        rolLabel={rolLabel}
        imageUrl={user?.image_url ?? null}
        pendientes={data.pendientesValidacion}
      />

      <KpiCards kpis={data.kpis} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Columna principal */}
        <div className="flex flex-col gap-5 lg:col-span-2">
          <PanelCard title="Resumen de actividad">
            <ActividadChart data={data.serie} />
          </PanelCard>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <AprobacionesPanel items={data.aprobaciones} />
            <ActividadReciente items={data.actividad} />
          </div>

          <ProyectosRecientes items={data.proyectosRecientes} />
        </div>

        {/* Columna lateral: invitaciones y solicitudes */}
        <div className="lg:col-span-1">
          <InvitacionesPanel
            invitaciones={data.invitaciones}
            solicitudes={data.solicitudes}
          />
        </div>
      </div>
    </section>
  );
}
