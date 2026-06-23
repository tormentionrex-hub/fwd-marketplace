import {
  AdminPageShell,
  AdminPageHeader,
} from "@/components/features/admin/admin-page-header";
import { obtenerDashboardAdmin } from "@/server/services/dashboard-admin.service";
import { PanelCard } from "@/components/features/admin/dashboard/panel-card";
import { ActividadChart } from "@/components/features/admin/dashboard/actividad-chart";
import { ActividadReciente } from "@/components/features/admin/dashboard/actividad-reciente";
import { ProyectosRecientes } from "@/components/features/admin/dashboard/proyectos-recientes";

// URL: /es/admin/reportes — reporte de actividad del marketplace con datos
// reales: evolución mensual, eventos recientes y últimos proyectos.
export default async function AdminReportesPage() {
  const data = await obtenerDashboardAdmin();

  const totales = data.serie.reduce(
    (acc, s) => ({
      usuarios: acc.usuarios + s.usuarios,
      proyectos: acc.proyectos + s.proyectos,
      ofertas: acc.ofertas + s.ofertas,
    }),
    { usuarios: 0, proyectos: 0, ofertas: 0 }
  );

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Reportes de Actividad"
        subtitle="Evolución mensual, eventos recientes y proyectos del marketplace."
      />

      {/* Evolución mensual (gráfico) */}
      <PanelCard title="Actividad de los últimos 6 meses">
        <ActividadChart data={data.serie} />
      </PanelCard>

      {/* Desglose mensual (tabla) */}
      <PanelCard title="Resumen mensual" bodyClassName="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-white/50">
            <tr className="border-b border-white/10">
              <th className="py-2 pr-4 font-semibold">Mes</th>
              <th className="py-2 pr-4 text-right font-semibold">Usuarios</th>
              <th className="py-2 pr-4 text-right font-semibold">Proyectos</th>
              <th className="py-2 pr-4 text-right font-semibold">Ofertas</th>
              <th className="py-2 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.07]">
            {data.serie.map((s) => (
              <tr key={s.mes} className="transition-colors hover:bg-white/5">
                <td className="py-2.5 pr-4 font-medium text-white">{s.mes}</td>
                <td className="py-2.5 pr-4 text-right tabular-nums text-white/70">
                  {s.usuarios}
                </td>
                <td className="py-2.5 pr-4 text-right tabular-nums text-white/70">
                  {s.proyectos}
                </td>
                <td className="py-2.5 pr-4 text-right tabular-nums text-white/70">
                  {s.ofertas}
                </td>
                <td className="py-2.5 text-right font-semibold tabular-nums text-white">
                  {s.usuarios + s.proyectos + s.ofertas}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-white/10 font-bold text-white">
              <td className="py-2.5 pr-4">Total</td>
              <td className="py-2.5 pr-4 text-right tabular-nums">{totales.usuarios}</td>
              <td className="py-2.5 pr-4 text-right tabular-nums">{totales.proyectos}</td>
              <td className="py-2.5 pr-4 text-right tabular-nums">{totales.ofertas}</td>
              <td className="py-2.5 text-right tabular-nums">
                {totales.usuarios + totales.proyectos + totales.ofertas}
              </td>
            </tr>
          </tfoot>
        </table>
      </PanelCard>

      {/* Eventos recientes + proyectos */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <ActividadReciente items={data.actividad} />
        <ProyectosRecientes items={data.proyectosRecientes} />
      </div>
    </AdminPageShell>
  );
}
