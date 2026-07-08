import { getUser } from "@/server/auth/get-user";
import { listarUsuariosPendientes } from "@/server/repositories/usuario.repository";
import {
  AdminPageShell,
  AdminPageHeader,
} from "@/components/features/admin/admin-page-header";
import { ShieldCheck, FileWarning, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

const ROL_LABEL: Record<string, string> = {
  staff: "Staff",
  moderator: "Moderador",
};

export default async function StaffPage() {
  const [user, pendientes] = await Promise.all([
    getUser(),
    listarUsuariosPendientes(),
  ]);

  const nombre = user?.nombre ?? "Staff";
  const rolLabel = ROL_LABEL[user?.roles.nombre ?? ""] ?? "Staff";
  const totalPendientes = pendientes.length;

  const kpis = [
    {
      titulo: "Validaciones pendientes",
      valor: totalPendientes,
      icon: ShieldCheck,
      color: "#20bec6",
      href: "/staff/validaciones",
    },
    {
      titulo: "Reportes activos",
      valor: 0,
      icon: FileWarning,
      color: "#ec008c",
      href: "/staff/reportes",
    },
  ];

  return (
    <AdminPageShell>
      <AdminPageHeader
        title={`Bienvenido, ${nombre}`}
        subtitle={`Panel de ${rolLabel} — FWD Costa Rica`}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {kpis.map((c) => (
          <Link
            key={c.titulo}
            href={c.href}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-all hover:border-white/20 hover:bg-white/[0.07]"
          >
            <span
              className="absolute inset-y-0 left-0 w-1.5"
              style={{ backgroundColor: c.color }}
              aria-hidden
            />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-white/50">{c.titulo}</p>
                <p className="mt-1 text-4xl font-black tabular-nums text-white">
                  {c.valor}
                </p>
              </div>
              <div className="flex flex-col items-end gap-3">
                <div
                  className="rounded-lg p-2"
                  style={{ backgroundColor: `${c.color}20` }}
                >
                  <c.icon className="h-5 w-5" style={{ color: c.color }} />
                </div>
                <span
                  className="flex items-center gap-1 text-xs font-semibold transition group-hover:gap-2"
                  style={{ color: c.color }}
                >
                  Ver <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Mensaje de contexto */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-sm font-semibold text-white/70">
          Tu acceso como <span className="text-fwd-turquoise">{rolLabel}</span> está
          limitado a las funciones de moderación. Si necesitas acceso adicional, contacta a un
          administrador.
        </p>
      </div>
    </AdminPageShell>
  );
}
