import { getUser } from "@/server/auth/get-user";
import {
  AdminPageShell,
  AdminPageHeader,
} from "@/components/features/admin/admin-page-header";
import { redirect } from "next/navigation";
import { FileWarning } from "lucide-react";

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

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Reportes de Moderacion"
        subtitle="Revisa y gestiona reportes de conducta o spam enviados por los usuarios."
      />
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] p-16 text-center">
        <FileWarning className="mb-4 h-10 w-10 text-white/20" />
        <p className="text-sm font-semibold text-white/50">
          El sistema de reportes estara disponible proximamente.
        </p>
      </div>
    </AdminPageShell>
  );
}
