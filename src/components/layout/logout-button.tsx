"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";

// Botón de cierre de sesión reutilizable. Borra la cookie (vía /api/auth/logout),
// limpia el perfil público de localStorage y manda a /login.
export function LogoutButton({
  className,
  label = "Cerrar sesión",
  children,
}: {
  className?: string;
  label?: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      localStorage.removeItem("fwd_perfil");
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
      className={
        className ??
        "rounded-full bg-fwd-ink/5 px-3 py-1.5 text-xs font-medium text-fwd-ink/70 transition hover:bg-fwd-ink/10 disabled:opacity-60"
      }
    >
      {loading ? "Saliendo…" : (children || label)}
    </button>
  );
}
