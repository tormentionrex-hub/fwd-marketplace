import Link from "next/link";
import { getLocale } from "next-intl/server";
import { getUser } from "@/server/auth/get-user";

// Acceso directo al panel de administración, fijo arriba a la derecha.
// Server Component: el rol se lee en el servidor (privado) y solo se muestra a
// administradores. Usa el locale del servidor + next/link normal para no
// depender del contexto i18n del cliente.
export async function AdminDashboardButton() {
  const user = await getUser();
  if (user?.roles.nombre !== "admin") return null;

  const locale = await getLocale();

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
