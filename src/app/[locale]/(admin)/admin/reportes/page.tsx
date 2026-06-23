import { getUser } from '@/server/auth/get-user';
import { listarReportes } from '@/server/repositories/report.repository';
import { listarAuditorias } from '@/server/repositories/audit-log.repository';
import {
  AdminPageShell,
  AdminPageHeader,
} from '@/components/features/admin/admin-page-header';
import { ReportesPanel } from '@/components/features/admin/reportes-panel';
import { redirect } from 'next/navigation';

export default async function AdminReportesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getUser();

  if (!user || (user.roles.nombre !== 'admin' && user.roles.nombre !== 'staff')) {
    redirect(`/${locale}/login`);
  }

  const [reportesRaw, auditoriasRaw] = await Promise.all([
    listarReportes(),
    listarAuditorias(),
  ]);

  // Map Date objects to strings to prevent serialization errors
  const reportes = reportesRaw.map((r) => ({
    ...r,
    creado: r.creado.toISOString(),
    actualizado: r.actualizado.toISOString(),
  }));

  const auditorias = auditoriasRaw.map((a) => ({
    ...a,
    creado: a.creado.toISOString(),
  }));

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Moderación y Auditoría"
        subtitle="Revisá reportes de conducta o spam, y visualizá el registro histórico de acciones del staff."
      />
      <ReportesPanel
        initialReportes={reportes}
        initialAuditorias={auditorias}
        currentUserId={user.id}
      />
    </AdminPageShell>
  );
}
