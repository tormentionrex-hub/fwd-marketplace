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

export type SolicitudInvitacion = {
  id: string;
  email: string;
  solicitado: string; // ISO
};

export function ValidacionesLista({
  pendientes,
  solicitudes = [],
}: {
  pendientes: CuentaPendiente[];
  solicitudes?: SolicitudInvitacion[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"cuentas" | "invitaciones">("cuentas");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function actuarCuenta(id: string, accion: "aprobar" | "rechazar") {
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

  async function actuarSolicitud(id: string, accion: "aprobar" | "rechazar") {
    if (
      accion === "rechazar" &&
      !confirm("¿Rechazar esta solicitud de invitación?")
    ) {
      return;
    }
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/verificaciones`, {
        method: accion === "aprobar" ? "PATCH" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "No se pudo procesar la solicitud.");
        return;
      }
      router.refresh();
    } catch {
      setError("Error de red. Intentá de nuevo.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Selector de pestañas */}
      <div className="flex border-b border-white/10 mb-2 gap-6">
        <button
          type="button"
          onClick={() => {
            setActiveTab("cuentas");
            setError(null);
          }}
          className={`pb-3 text-sm font-semibold transition-colors relative ${
            activeTab === "cuentas" ? "text-white" : "text-white/45 hover:text-white"
          }`}
        >
          Cuentas registradas ({pendientes.length})
          {activeTab === "cuentas" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-fwd-magenta" />
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("invitaciones");
            setError(null);
          }}
          className={`pb-3 text-sm font-semibold transition-colors relative ${
            activeTab === "invitaciones" ? "text-white" : "text-white/45 hover:text-white"
          }`}
        >
          Solicitudes de invitación ({solicitudes.length})
          {activeTab === "invitaciones" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-fwd-magenta" />
          )}
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </p>
      )}

      {/* Vista de Cuentas Registradas */}
      {activeTab === "cuentas" && (
        <div className="flex flex-col gap-3">
          {pendientes.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-12 text-center text-white/45">
              No hay cuentas pendientes de validación.
            </div>
          ) : (
            pendientes.map((c) => (
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
                    onClick={() => actuarCuenta(c.id, "aprobar")}
                    disabled={busyId === c.id}
                    className="rounded-full bg-[#10b981] hover:bg-[#059669] px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-60"
                  >
                    {busyId === c.id ? "..." : "Aprobar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => actuarCuenta(c.id, "rechazar")}
                    disabled={busyId === c.id}
                    className="rounded-full border border-fwd-magenta/40 px-4 py-2 text-sm font-semibold text-fwd-magenta transition hover:bg-fwd-magenta/15 disabled:opacity-60"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Vista de Solicitudes de Invitación */}
      {activeTab === "invitaciones" && (
        <div className="flex flex-col gap-3">
          {solicitudes.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-12 text-center text-white/45">
              No hay solicitudes de invitación pendientes.
            </div>
          ) : (
            solicitudes.map((s) => (
              <div
                key={s.id}
                className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-white truncate max-w-xs sm:max-w-md">{s.email}</p>
                    <span className="inline-flex rounded-full bg-fwd-blue/15 px-2.5 py-0.5 text-xs font-semibold text-fwd-blue">
                      Solicitud
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-white/35">
                    Solicitada el {new Date(s.solicitado).toLocaleDateString("es-CR")}
                  </p>
                </div>

                <div className="flex flex-shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => actuarSolicitud(s.id, "aprobar")}
                    disabled={busyId === s.id}
                    className="rounded-full bg-[#10b981] hover:bg-[#059669] px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-60"
                  >
                    {busyId === s.id ? "..." : "Aprobar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => actuarSolicitud(s.id, "rechazar")}
                    disabled={busyId === s.id}
                    className="rounded-full border border-fwd-magenta/40 px-4 py-2 text-sm font-semibold text-fwd-magenta transition hover:bg-fwd-magenta/15 disabled:opacity-60"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
