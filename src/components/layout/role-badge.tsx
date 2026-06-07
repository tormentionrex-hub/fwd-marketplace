import { getUser } from "@/server/auth/get-user";
import { LogoutButton } from "@/components/layout/logout-button";

// Badge flotante arriba a la derecha que muestra el ROL del usuario logueado.
// Es un Server Component: el rol se lee de la cookie/DB en el servidor (privado)
// y solo se renderiza el resultado. Sin sesión, no muestra nada.
export async function RoleBadge() {
  const user = await getUser();
  if (!user) return null;

  return (
    <div className="fixed right-4 top-4 z-50 flex items-center gap-3 rounded-full border border-fwd-ink/10 bg-white/90 px-4 py-2 shadow-lg backdrop-blur">
      <div className="flex flex-col leading-tight">
        <span className="text-[0.65rem] uppercase tracking-wide text-fwd-ink/50">
          Rol
        </span>
        <span className="text-sm font-semibold capitalize text-fwd-ink">
          {user.roles.nombre}
        </span>
      </div>
      <span className="hidden max-w-[10rem] truncate text-sm text-fwd-ink/70 sm:inline">
        {user.nombre}
      </span>
      <LogoutButton />
    </div>
  );
}
