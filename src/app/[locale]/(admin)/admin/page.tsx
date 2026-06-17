import { Link } from "@/i18n/navigation";
import {
  listarUsuarios,
  contarUsuariosPendientes,
  contarUsuariosSuspendidos,
} from "@/server/repositories/usuario.repository";
import { AdminPageShell } from "@/components/features/admin/admin-page-header";
import AnimatedProjectsTitle from "@/components/AnimatedProjectsTitle";

// Ícono de alerta (SVG propio — sin emojis, conforme a la guía del proyecto).
function AlertIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

// Panel de administración — Dashboard (resumen general).
// URL: /es/admin — protegido por (admin)/layout.tsx (solo rol admin).
export default async function AdminPage() {
  const [usuarios, pendientes, suspendidos] = await Promise.all([
    listarUsuarios(),
    contarUsuariosPendientes(),
    contarUsuariosSuspendidos(),
  ]);

  const conteo = { estudiante: 0, empresario: 0, admin: 0 };
  for (const u of usuarios) {
    const rol = u.roles.nombre as keyof typeof conteo;
    if (rol in conteo) conteo[rol] += 1;
  }

  const tarjetas = [
    { rol: "Estudiantes", total: conteo.estudiante, color: "#008FD4" },
    { rol: "Empresarios", total: conteo.empresario, color: "#662D91" },
    { rol: "Admins", total: conteo.admin, color: "#EC008C" },
    { rol: "Total", total: usuarios.length, color: "#20BEC6" },
  ];

  return (
    <AdminPageShell>
      <header>
        <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-fwd-turquoise">
          <span className="text-fwd-blue">&#9654;&#9654;</span> FWD · Costa Rica
        </p>
        <AnimatedProjectsTitle
          text="Panel de administración"
          className="!text-3xl sm:!text-4xl"
        />
        <p className="mt-2 text-white/50">
          Resumen general. Usá el menú lateral para gestionar cada área.
        </p>
      </header>

      {/* Alerta de pendientes de validación */}
      <Link
        href="/admin/validaciones"
        className={`group relative block overflow-hidden rounded-2xl p-5 shadow-lg transition hover:scale-[1.01] ${
          pendientes > 0 ? "" : "border border-white/10 bg-white/[0.04]"
        }`}
        style={
          pendientes > 0
            ? { background: "linear-gradient(135deg, #F7901E, #EC008C)" }
            : undefined
        }
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {pendientes > 0 && <AlertIcon className="h-7 w-7 text-white" />}
            <div>
              <p
                className={`text-sm font-medium ${
                  pendientes > 0 ? "text-white/90" : "text-white/60"
                }`}
              >
                Cuentas pendientes de validación
              </p>
              <p className="text-3xl font-black tabular-nums text-white">
                {pendientes}
              </p>
            </div>
          </div>
          <span
            className={`text-sm font-semibold ${
              pendientes > 0 ? "text-white" : "text-fwd-turquoise"
            }`}
          >
            {pendientes > 0 ? "Revisar ahora" : "Ver validaciones"} &rarr;
          </span>
        </div>
      </Link>

      {/* Alerta de cuentas suspendidas */}
      <Link
        href="/admin/gestion-cuentas"
        className={`group relative block overflow-hidden rounded-2xl p-5 shadow-lg transition hover:scale-[1.01] ${
          suspendidos > 0
            ? "border border-amber-500/30 bg-amber-500/10"
            : "border border-white/10 bg-white/[0.04]"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <p
                className={`text-sm font-medium ${
                  suspendidos > 0 ? "text-amber-300/80" : "text-white/60"
                }`}
              >
                Cuentas suspendidas
              </p>
              <p className={`text-3xl font-black tabular-nums ${
                suspendidos > 0 ? "text-amber-300" : "text-white"
              }`}>
                {suspendidos}
              </p>
            </div>
          </div>
          <span
            className={`text-sm font-semibold ${
              suspendidos > 0 ? "text-amber-300" : "text-fwd-turquoise"
            }`}
          >
            Gestionar cuentas &rarr;
          </span>
        </div>
      </Link>

      {/* Usuarios por rol */}
      <div>
        <h2 className="mb-3 font-display text-lg font-bold text-white">
          Usuarios registrados
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {tarjetas.map((t) => (
            <div
              key={t.rol}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5"
            >
              <span
                className="absolute inset-y-0 left-0 w-1.5"
                style={{ backgroundColor: t.color }}
                aria-hidden
              />
              <p className="text-sm text-white/50">{t.rol}</p>
              <p className="mt-1 text-3xl font-black tabular-nums text-white">
                {t.total}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AdminPageShell>
  );
}
