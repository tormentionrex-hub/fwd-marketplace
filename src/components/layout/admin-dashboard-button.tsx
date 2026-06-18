"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Acceso directo al panel de administración, fijo arriba a la derecha.
// Se muestra solo si el rol del usuario es administrador y no estamos ya en el panel.
export function AdminDashboardButton({
  userRole,
  locale,
}: {
  userRole: string | undefined;
  locale: string;
}) {
  const pathname = usePathname();

  if (userRole !== "admin") return null;

  // Ocultar si ya estamos dentro de las rutas del administrador (/es/admin..., /en/admin..., /admin...)
  const isAlreadyAdmin = pathname?.split("/").includes("admin");
  if (isAlreadyAdmin) return null;

  return (
    <Link
      href={`/${locale}/admin`}
      className="fixed right-4 top-4 z-[60] inline-flex items-center gap-2 rounded-full bg-fwd-magenta px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:scale-105 hover:bg-fwd-purple"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
      Panel de administración
    </Link>
  );
}

