"use client";

import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/layout/logout-button";
import ThemeToggle from "@/components/theme/ThemeToggle";

type ClientUser = {
  nombre: string;
  rol: string;
};

// Badge flotante que muestra rol, tema y logout (solo si no es admin).
// Al estar en rutas de admin, se oculta. En rutas públicas donde hay
// el botón "Panel de administración", se coloca en la esquina inferior derecha
// para no colisionar.
export function RoleBadgeClient({ user }: { user: ClientUser | undefined }) {
  const pathname = usePathname();

  const isAdminRoute = pathname?.split("/").includes("admin");
  const isAdmin = user?.rol === "admin";

  // En rutas de admin, no renderizamos nada (el sidebar ya tiene logout)
  if (isAdminRoute) return null;

  // Sin usuario no hay nada que mostrar (ThemeToggle está en SettingsPanel)
  if (!user) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[9999] flex items-center gap-3 rounded-full border border-fwd-ink/10 dark:border-white/10 bg-white/95 dark:bg-[#111827]/95 px-4 py-2 shadow-lg backdrop-blur text-fwd-ink dark:text-white">
      <div className="flex flex-col leading-tight">
        <span className="text-[0.65rem] uppercase tracking-wide text-fwd-ink/50 dark:text-white/50">
          Rol
        </span>
        <span className="text-sm font-semibold capitalize">
          {user.rol}
        </span>
      </div>
      <span className="hidden max-w-[10rem] truncate text-sm text-fwd-ink/70 dark:text-white/70 sm:inline">
        {user.nombre}
      </span>
      <span className="h-4 w-px bg-fwd-ink/10 dark:bg-white/10" />

      <ThemeToggle className="h-6 w-6 border-none bg-transparent hover:bg-fwd-ink/5 dark:hover:bg-white/5 text-fwd-ink dark:text-white" />

      {/* Solo mostrar logout si no es admin (los admins cierran sesión desde su panel) */}
      {!isAdmin && (
        <>
          <span className="h-4 w-px bg-fwd-ink/10 dark:bg-white/10" />
          <LogoutButton className="rounded-full bg-fwd-ink/5 dark:bg-white/10 px-3 py-1.5 text-xs font-medium text-fwd-ink/70 dark:text-white/80 transition hover:bg-fwd-ink/10 dark:hover:bg-white/20 disabled:opacity-60" />
        </>
      )}
    </div>
  );
}
