"use client";

import { useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  pedirMotivo,
  confirmarAccion,
  toastExito,
  alertaError,
} from "@/lib/sweetalert-admin";

type Usuario = {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  estado: string;
  creado: string;
};

type HistorialEntry = {
  id: string;
  accion: string;
  motivo: string | null;
  nombre_admin: string;
  creado: string;
};

const colorRol: Record<string, string> = {
  estudiante: "bg-fwd-blue/15 text-fwd-blue",
  empresario: "bg-fwd-purple/20 text-fwd-purple",
  admin: "bg-fwd-magenta/15 text-fwd-magenta",
};

const colorEstado: Record<string, string> = {
  activo: "text-emerald-400",
  suspendido: "text-amber-400",
  pendiente: "text-sky-400",
  rechazado: "text-red-400",
};

const TABS = [
  { key: "todos", label: "Todos" },
  { key: "activo", label: "Activos" },
  { key: "suspendido", label: "Suspendidos" },
  { key: "pendiente", label: "Pendientes" },
] as const;

export function GestionCuentasPanel({
  usuarios,
  currentUserId,
  totalSuspendidos,
}: {
  usuarios: Usuario[];
  currentUserId: string;
  totalSuspendidos: number;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("todos");
  const [loading, setLoading] = useState<string | null>(null);

  // Modal de historial
  const [historialModal, setHistorialModal] = useState<Usuario | null>(null);
  const [historial, setHistorial] = useState<HistorialEntry[]>([]);
  const [historialLoading, setHistorialLoading] = useState(false);

  const visibles = useMemo(() => {
    const f = q.trim().toLowerCase();
    let lista = usuarios;
    if (tab !== "todos") lista = lista.filter((u) => u.estado === tab);
    if (f) {
      lista = lista.filter(
        (u) =>
          u.nombre.toLowerCase().includes(f) ||
          u.correo.toLowerCase().includes(f) ||
          u.rol.toLowerCase().includes(f)
      );
    }
    return lista;
  }, [usuarios, q, tab]);

  // ── Suspender — SweetAlert con motivo ────────────────────
  async function suspenderCuenta(u: Usuario) {
    const motivo = await pedirMotivo({
      titulo: `Suspender a ${u.nombre}`,
      texto: "La cuenta no podrá iniciar sesión hasta reactivarla.",
      label: "Motivo de la suspensión",
      placeholder: "Describí el motivo de la suspensión…",
      confirmText: "Suspender",
      peligro: true,
    });
    if (motivo === null) return;
    setLoading(u.id);
    try {
      const res = await fetch(`/api/admin/usuarios/${u.id}/suspension`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motivo }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alertaError(data?.error ?? "No se pudo suspender la cuenta.");
        return;
      }
      toastExito(`Cuenta de ${u.nombre} suspendida.`);
      router.refresh();
    } catch {
      alertaError("Error de red. Intentá de nuevo.");
    } finally {
      setLoading(null);
    }
  }

  // ── Reactivar — SweetAlert de confirmación ───────────────
  async function reactivarCuenta(u: Usuario) {
    const ok = await confirmarAccion({
      titulo: `¿Reactivar a ${u.nombre}?`,
      texto: "La cuenta podrá volver a iniciar sesión.",
      confirmText: "Reactivar",
      icon: "question",
    });
    if (!ok) return;
    setLoading(u.id);
    try {
      const res = await fetch(`/api/admin/usuarios/${u.id}/suspension`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alertaError(data?.error ?? "No se pudo reactivar la cuenta.");
        return;
      }
      toastExito(`Cuenta de ${u.nombre} reactivada.`);
      router.refresh();
    } catch {
      alertaError("Error de red. Intentá de nuevo.");
    } finally {
      setLoading(null);
    }
  }

  // ── Historial ────────────────────────────────────────────
  async function abrirHistorial(u: Usuario) {
    setHistorialModal(u);
    setHistorialLoading(true);
    setHistorial([]);
    try {
      const res = await fetch(
        `/api/admin/usuarios/${u.id}/suspension/historial`
      );
      if (res.ok) {
        const data = await res.json();
        setHistorial(data);
      }
    } catch {
      // silencio
    } finally {
      setHistorialLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Resumen rápido */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <span
            className="absolute inset-y-0 left-0 w-1.5 bg-emerald-500"
            aria-hidden
          />
          <p className="text-sm text-white/50">Cuentas activas</p>
          <p className="mt-1 text-3xl font-black tabular-nums text-white">
            {usuarios.filter((u) => u.estado === "activo").length}
          </p>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
          <span
            className="absolute inset-y-0 left-0 w-1.5 bg-amber-500"
            aria-hidden
          />
          <p className="text-sm text-amber-400/70">Cuentas suspendidas</p>
          <p className="mt-1 text-3xl font-black tabular-nums text-amber-300">
            {totalSuspendidos}
          </p>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <span
            className="absolute inset-y-0 left-0 w-1.5 bg-sky-500"
            aria-hidden
          />
          <p className="text-sm text-white/50">Total cuentas</p>
          <p className="mt-1 text-3xl font-black tabular-nums text-white">
            {usuarios.length}
          </p>
        </div>
      </div>

      {/* Tabs por estado */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const activo = tab === t.key;
          const count =
            t.key === "todos"
              ? usuarios.length
              : usuarios.filter((u) => u.estado === t.key).length;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                activo
                  ? "bg-fwd-magenta text-white shadow-sm"
                  : "bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              {t.label}{" "}
              <span className="ml-1 text-xs opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Buscador */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre, correo o rol…"
          className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-fwd-blue focus:bg-white/10 focus:ring-4 focus:ring-fwd-blue/20 sm:max-w-xs"
        />
        <p className="text-sm text-white/50">
          {visibles.length} de {usuarios.length} cuenta
          {usuarios.length === 1 ? "" : "s"}
        </p>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-white/50">
            <tr>
              <th className="px-4 py-3 font-semibold">Nombre</th>
              <th className="px-4 py-3 font-semibold">Correo</th>
              <th className="px-4 py-3 font-semibold">Rol</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold">Registrado</th>
              <th className="px-4 py-3 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.07]">
            {visibles.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-white/40">
                  {usuarios.length === 0
                    ? "Aún no hay cuentas registradas."
                    : "Ninguna cuenta coincide con el filtro."}
                </td>
              </tr>
            ) : (
              visibles.map((u) => {
                const esYo = u.id === currentUserId;
                const suspendido = u.estado === "suspendido";
                const puedeAccion = !esYo && u.rol !== "admin";
                return (
                  <tr key={u.id} className="transition-colors hover:bg-white/5">
                    <td className="px-4 py-3 font-medium text-white">
                      {u.nombre}
                    </td>
                    <td className="px-4 py-3 text-white/55">{u.correo}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                          colorRol[u.rol] ?? "bg-white/10 text-white/70"
                        }`}
                      >
                        {u.rol}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 text-sm font-semibold capitalize ${
                          colorEstado[u.estado] ?? "text-white/65"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            suspendido
                              ? "bg-amber-400"
                              : u.estado === "activo"
                              ? "bg-emerald-400"
                              : u.estado === "pendiente"
                              ? "bg-sky-400"
                              : "bg-red-400"
                          }`}
                        />
                        {u.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/45">
                      {new Date(u.creado).toLocaleDateString("es-CR")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Historial — siempre visible */}
                        <button
                          type="button"
                          onClick={() => abrirHistorial(u)}
                          className="rounded-lg px-2.5 py-1 text-xs font-semibold text-fwd-turquoise transition hover:bg-fwd-turquoise/15"
                          title="Ver historial"
                        >
                          Historial
                        </button>

                        {puedeAccion && !suspendido && (
                          <button
                            type="button"
                            onClick={() => suspenderCuenta(u)}
                            disabled={loading === u.id}
                            className="rounded-lg px-2.5 py-1 text-xs font-semibold text-amber-400 transition hover:bg-amber-400/15 disabled:cursor-not-allowed disabled:text-white/25"
                            title="Suspender cuenta"
                          >
                            {loading === u.id ? "Procesando…" : "Suspender"}
                          </button>
                        )}

                        {puedeAccion && suspendido && (
                          <button
                            type="button"
                            onClick={() => reactivarCuenta(u)}
                            disabled={loading === u.id}
                            className="rounded-lg px-2.5 py-1 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-400/15 disabled:cursor-not-allowed disabled:text-white/25"
                            title="Reactivar cuenta"
                          >
                            {loading === u.id ? "Procesando…" : "Reactivar"}
                          </button>
                        )}

                        {esYo && (
                          <span className="px-2.5 py-1 text-xs text-white/25">
                            Tu cuenta
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Modal: Historial ──────────────────────────────── */}
      {historialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111827] p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Historial de cuenta
                </h3>
                <p className="mt-0.5 text-sm text-white/50">
                  {historialModal.nombre} — {historialModal.correo}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHistorialModal(null)}
                className="rounded-lg p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white"
                aria-label="Cerrar"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-4 max-h-80 overflow-y-auto">
              {historialLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-fwd-magenta" />
                </div>
              ) : historial.length === 0 ? (
                <p className="py-10 text-center text-sm text-white/40">
                  No hay registros de suspensiones o reactivaciones.
                </p>
              ) : (
                <div className="space-y-3">
                  {historial.map((h) => (
                    <div
                      key={h.id}
                      className={`rounded-xl border p-3 ${
                        h.accion === "suspender"
                          ? "border-amber-500/20 bg-amber-500/5"
                          : "border-emerald-500/20 bg-emerald-500/5"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide ${
                            h.accion === "suspender"
                              ? "text-amber-400"
                              : "text-emerald-400"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              h.accion === "suspender"
                                ? "bg-amber-400"
                                : "bg-emerald-400"
                            }`}
                          />
                          {h.accion === "suspender"
                            ? "Suspensión"
                            : "Reactivación"}
                        </span>
                        <span className="text-xs text-white/40">
                          {new Date(h.creado).toLocaleString("es-CR", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                      {h.motivo && (
                        <p className="mt-1.5 text-sm text-white/70">
                          {h.motivo}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-white/40">
                        Por: {h.nombre_admin}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setHistorialModal(null)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white/60 transition hover:text-white"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
