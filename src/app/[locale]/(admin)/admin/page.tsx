import { listarUsuarios } from "@/server/repositories/usuario.repository";
import { getUser } from "@/server/auth/get-user";
import { LogoutButton } from "@/components/features/admin/logout-button";
import { UsuariosTabla } from "@/components/features/admin/usuarios-tabla";
import AnimatedProjectsTitle from "@/components/AnimatedProjectsTitle";

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
      {/* Hero morado — paleta FWD, tipografía y efecto de letras del home,
          con el patrón de flechas (elemento gráfico secundario de la marca). */}
      <header
        className="relative overflow-hidden rounded-3xl p-8 shadow-lg sm:p-10"
        style={{
          background:
            "linear-gradient(135deg, #662D91 0%, #4a2070 55%, #7d3aad 100%)",
        }}
      >
        {/* Diseñitos: flechas de avance multicolor, en patrón sutil */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.13]"
        >
          <div className="grid grid-cols-8 gap-5 rotate-[-8deg] scale-125 p-6">
            {Array.from({ length: 40 }).map((_, i) => (
              <svg key={i} viewBox="0 0 100 100" className="h-7 w-7">
                <polygon
                  points="22,15 85,50 22,85"
                  fill={
                    [
                      "#20BEC6",
                      "#FFCB05",
                      "#EC008C",
                      "#008FD4",
                      "#F7901E",
                      "#FFFFFF",
                    ][i % 6]
                  }
                />
              </svg>
            ))}
          </div>
        </div>
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-fwd-turquoise">
              <span className="text-fwd-blue">▶▶</span> FWD · Costa Rica
            </p>
            <AnimatedProjectsTitle
              text="Panel de administración"
              className="!text-3xl sm:!text-4xl"
            />
            <p className="mt-3 max-w-md text-gray-300">
              Gestión de usuarios registrados.
            </p>
          </div>
          <LogoutButton />
        </div>
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
