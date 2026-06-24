import { getUser } from "@/server/auth/get-user";
import { listarReportes } from "@/server/repositories/report.repository";
import { listarAuditorias } from "@/server/repositories/audit-log.repository";
import {
  AdminPageShell,
  AdminPageHeader,
} from "@/components/features/admin/admin-page-header";
import { ReportesPanel } from "@/components/features/admin/reportes-panel";
import { redirect } from "next/navigation";

// URL: /es/staff/reportes — revisar y moderar reportes de conducta/spam.
// Protegido por (staff)/layout.tsx (solo staff y moderator).
export default async function StaffReportesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const [reportesRaw, auditoriasRaw] = await Promise.all([
    listarReportes(),
    listarAuditorias(),
  ]);

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
        title="Reportes de Moderacion"
        subtitle="Revisa y gestiona reportes de conducta o spam enviados por los usuarios."
      />
      <ReportesPanel
        initialReportes={reportes}
        initialAuditorias={auditorias}
        currentUserId={user.id}
      />
    </AdminPageShell>
  );
}
