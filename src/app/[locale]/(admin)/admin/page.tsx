import { listarUsuarios } from "@/server/repositories/usuario.repository";
import { getUser } from "@/server/auth/get-user";
import { LogoutButton } from "@/components/features/admin/logout-button";
import { UsuariosTabla } from "@/components/features/admin/usuarios-tabla";

// Panel de administración (presentación / solo lectura + borrado).
// URL: /es/admin — protegido por (admin)/layout.tsx (solo rol admin).
export default async function AdminPage() {
  const [data, me] = await Promise.all([listarUsuarios(), getUser()]);

  const usuarios = data.map((u) => ({
    id: u.id,
    nombre: u.nombre,
    correo: u.correo,
    rol: u.roles.nombre,
    estado: u.estado,
    creado: u.creado.toISOString(),
  }));

  const conteo = { estudiante: 0, empresario: 0, admin: 0 };
  for (const u of usuarios) {
    const rol = u.rol as keyof typeof conteo;
    if (rol in conteo) conteo[rol] += 1;
  }

  const tarjetas = [
    { rol: "Estudiantes", total: conteo.estudiante, color: "#008FD4" },
    { rol: "Empresarios", total: conteo.empresario, color: "#662D91" },
    { rol: "Admins", total: conteo.admin, color: "#EC008C" },
    { rol: "Total", total: usuarios.length, color: "#20BEC6" },
  ];

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-6 sm:p-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-fwd-blue">
            FWD · Costa Rica
          </p>
          <h1 className="font-display text-3xl font-black tracking-tight text-fwd-ink">
            Panel de administración
          </h1>
          <p className="text-fwd-ink/60">
            Gestión de usuarios registrados.
          </p>
        </div>
        <LogoutButton />
      </header>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tarjetas.map((t) => (
          <div
            key={t.rol}
            className="relative overflow-hidden rounded-2xl border border-fwd-ink/10 bg-white p-5 shadow-sm"
          >
            <span
              className="absolute inset-y-0 left-0 w-1.5"
              style={{ backgroundColor: t.color }}
              aria-hidden
            />
            <p className="text-sm text-fwd-ink/55">{t.rol}</p>
            <p className="mt-1 text-3xl font-black tabular-nums text-fwd-ink">
              {t.total}
            </p>
          </div>
        ))}
      </div>

      {/* Tabla con filtros por rol, buscador, orden y borrado */}
      <UsuariosTabla usuarios={usuarios} currentUserId={me?.id ?? ""} />
    </section>
  );
}
