"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/layout/logout-button";

// Menú lateral del estudiante (Sefora · Página 08).
// Se repite en TODAS las páginas del estudiante a través del layout
// (app)/dashboard/estudiante/layout.tsx. Resalta el enlace activo.
export default function SidebarEstudiante({ locale }: { locale: string }) {
  const pathname = usePathname();
  const base = `/${locale}/dashboard/estudiante`;

  const enlaces = [
    { href: base, label: "Inicio" },
    { href: `${base}/perfil`, label: "Mi perfil" },
    { href: `${base}/ofertas`, label: "Mis ofertas" },
    { href: `${base}/proyecto-activo`, label: "Proyecto activo" },
    { href: `${base}/notificaciones`, label: "Notificaciones" },
  ];

  return (
    <aside className="flex shrink-0 flex-col gap-1 sm:w-56">
      <nav className="flex flex-col gap-1">
        {enlaces.map((enlace) => {
          // "Inicio" solo se marca activo en la ruta exacta; el resto admite
          // sub-rutas para que también se resalten sus pantallas internas.
          const activo =
            enlace.href === base
              ? pathname === base
              : pathname.startsWith(enlace.href);

          return (
            <Link
              key={enlace.href}
              href={enlace.href}
              className={`rounded-md px-3 py-2 text-sm transition-colors ${
                activo
                  ? "bg-fwd-azul/10 font-medium text-fwd-azul"
                  : "text-zinc-600 hover:bg-black/[.04] dark:text-zinc-300 dark:hover:bg-white/[.06]"
              }`}
            >
              {enlace.label}
            </Link>
          );
        })}
      </nav>

      {/* Cerrar sesión */}
      <LogoutButton className="mt-2 rounded-md px-3 py-2 text-left text-sm text-fwd-magenta transition-colors hover:bg-fwd-magenta/10 disabled:opacity-60" />
    </aside>
  );
}
