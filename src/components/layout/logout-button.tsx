"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { cerrarSesionCliente } from "@/lib/logout-client";

// Botón de cierre de sesión reutilizable. Borra la cookie (vía /api/auth/logout),
// limpia el storage local, notifica a otras pestañas y manda a /login.
export function LogoutButton({
  className,
  style,
  label = "Cerrar sesión",
  children,
}: {
  className?: string;
  style?: React.CSSProperties;
  label?: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await cerrarSesionCliente();
      router.push("/login");
      router.refresh();
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      style={style}
      className={
        className ??
        "rounded-full bg-fwd-ink/5 px-3 py-1.5 text-xs font-medium text-fwd-ink/70 transition hover:bg-fwd-ink/10 disabled:opacity-60"
      }
    >
      {loading ? "Saliendo…" : (children || label)}
    </button>
  );
}
