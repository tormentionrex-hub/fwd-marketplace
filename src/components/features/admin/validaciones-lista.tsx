"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";

export type CuentaPendiente = {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  creado: string; // ISO
};

export function ValidacionesLista({
  pendientes,
}: {
  pendientes: CuentaPendiente[];
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function actuar(id: string, accion: "aprobar" | "rechazar") {
    if (
      accion === "rechazar" &&
      !confirm("¿Rechazar esta cuenta? No podrá iniciar sesión.")
    ) {
      return;
    }
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/usuarios/${id}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "No se pudo actualizar la cuenta.");
        return;
      }
      router.refresh();
    } catch {
      setError("Error de red. Intentá de nuevo.");
    } finally {
      setBusyId(null);
    }
  }

  if (pendientes.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-12 text-center text-white/45">
        No hay cuentas pendientes de validación.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {pendientes.map((c) => (
          <div
            key={c.id}
            className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-white">{c.nombre}</p>
                <span className="inline-flex rounded-full bg-fwd-yellow/15 px-2.5 py-0.5 text-xs font-semibold capitalize text-fwd-yellow">
                  {c.rol}
                </span>
                <span className="inline-flex rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white/60">
                  Pendiente
                </span>
              </div>
              <p className="mt-1 truncate text-sm text-white/55">{c.correo}</p>
              <p className="mt-0.5 text-xs text-white/35">
                Registrada el {new Date(c.creado).toLocaleDateString("es-CR")}
              </p>
            </div>

            <div className="flex flex-shrink-0 gap-2">
              <button
                type="button"
                onClick={() => actuar(c.id, "aprobar")}
                disabled={busyId === c.id}
                className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60"
              >
                {busyId === c.id ? "..." : "Aprobar"}
              </button>
              <button
                type="button"
                onClick={() => actuar(c.id, "rechazar")}
                disabled={busyId === c.id}
                className="rounded-full border border-fwd-magenta/40 px-4 py-2 text-sm font-semibold text-fwd-magenta transition hover:bg-fwd-magenta/15 disabled:opacity-60"
              >
                Rechazar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
