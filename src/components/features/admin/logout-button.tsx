"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function salir() {
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
      onClick={salir}
      disabled={loading}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-fwd-ink/15 bg-white px-4 text-sm font-semibold text-fwd-ink transition hover:bg-fwd-mist/60 disabled:opacity-60"
    >
      {loading ? "Saliendo…" : "Cerrar sesión"}
    </button>
  );
}
