import { Link } from "@/i18n/navigation";
import { rutaPorRol } from "@/server/auth/rutas";
import { IconShieldCheck } from "@/components/ui/icons";

const ROL_NOMBRE: Record<string, string> = {
  admin: "Administrador",
  empresario: "Empresario",
  estudiante: "Estudiante",
};

export function SinPermiso({
  locale,
  rolActual,
  rolRequerido,
}: {
  locale: string;
  rolActual: string;
  rolRequerido?: string;
}) {
  const nombreActual = ROL_NOMBRE[rolActual] ?? rolActual;
  const nombreRequerido = rolRequerido ? (ROL_NOMBRE[rolRequerido] ?? rolRequerido) : null;
  const dashboardPath = rutaPorRol(rolActual);

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: "radial-gradient(circle at 15% 0%, rgba(0,143,212,0.18), transparent 50%), radial-gradient(circle at 85% 20%, rgba(102,45,145,0.22), transparent 55%), #0b1120",
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-md shadow-2xl">

        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/15 border border-red-500/30">
          <IconShieldCheck width={32} height={32} className="text-red-400" />
        </div>

        <h1 className="mb-3 text-2xl font-extrabold text-white">
          Acceso restringido
        </h1>

        <p className="mb-2 text-sm text-white/60">
          Tu cuenta tiene el rol{" "}
          <span className="font-semibold text-white/90">{nombreActual}</span>.
        </p>

        {nombreRequerido && (
          <p className="mb-8 text-sm text-white/60">
            Esta página requiere el rol{" "}
            <span className="font-semibold text-white/90">{nombreRequerido}</span>.
          </p>
        )}

        {!nombreRequerido && (
          <p className="mb-8 text-sm text-white/60">
            No tienes permisos para acceder a esta sección.
          </p>
        )}

        <div className="flex flex-col gap-3">
          <Link
            href={dashboardPath}
            className="inline-flex items-center justify-center rounded-xl bg-fwd-azul px-6 py-3 text-sm font-bold text-white transition-all hover:brightness-110 hover:scale-105"
          >
            Ir a mi panel
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white/70 transition-all hover:bg-white/10 hover:text-white"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
