"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { confirmarEliminacion, toastExito, alertaError } from "@/lib/sweetalert-admin";
import {
  normalizarEstadoOferta,
  ESTADO_OFERTA_META,
  EstadoOfertaDetalle,
} from "@/lib/oferta-estado";

// Estados editables por el admin (orden canónico).
const ESTADOS_OFERTA: EstadoOfertaDetalle[] = [
  "enviada",
  "en_revision",
  "preseleccionado",
  "aceptado",
  "rechazado",
  "cancelado",
];

type OfertaAdmin = {
  id: string;
  estado: string;
  enviado: string | Date;
  propuesta: string;
  prototipo_url: string | null;
  documentacion_url: string | null;
  proyectos: { id: string; titulo: string } | null;
  perfiles_estudiante: {
    usuarios: { nombre: string; correo: string } | null;
  } | null;
};

const TABS = [
  { key: "todos", label: "Todas" },
  { key: "enviada", label: "Enviadas" },
  { key: "en_revision", label: "En Revisión" },
  { key: "preseleccionado", label: "Preseleccionadas" },
  { key: "aceptado", label: "Aceptadas" },
  { key: "rechazado", label: "Rechazadas" },
] as const;

export function GestionOfertasPanel({ ofertas }: { ofertas: OfertaAdmin[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]["key"] | EstadoOfertaDetalle>("todos");
  const [detalleModal, setDetalleModal] = useState<OfertaAdmin | null>(null);

  // Edición de estado + eliminación dentro del modal de detalle
  const [editando, setEditando] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState<EstadoOfertaDetalle>("enviada");
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  // Salir del modo edición al abrir/cerrar/cambiar la oferta.
  useEffect(() => {
    setEditando(false);
  }, [detalleModal?.id]);

  function iniciarEdicion(o: OfertaAdmin) {
    setNuevoEstado(normalizarEstadoOferta(o.estado));
    setEditando(true);
  }

  async function guardarEstado() {
    if (!detalleModal) return;
    setGuardando(true);
    try {
      const res = await fetch(`/api/admin/ofertas/${detalleModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alertaError(data?.error ?? "No se pudo actualizar la oferta.");
        return;
      }
      setDetalleModal({ ...detalleModal, estado: nuevoEstado });
      setEditando(false);
      toastExito("Estado de la oferta actualizado.");
      router.refresh();
    } catch {
      alertaError("Error de red. Intentá de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarOferta() {
    if (!detalleModal) return;
    const ok = await confirmarEliminacion({
      titulo: "¿Eliminar esta oferta?",
      texto: "Esta acción no se puede deshacer.",
      confirmText: "Eliminar oferta",
    });
    if (!ok) return;
    setEliminando(true);
    try {
      const res = await fetch(`/api/admin/ofertas/${detalleModal.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alertaError(data?.error ?? "No se pudo eliminar la oferta.");
        return;
      }
      setDetalleModal(null);
      toastExito("Oferta eliminada.");
      router.refresh();
    } catch {
      alertaError("Error de red. Intentá de nuevo.");
    } finally {
      setEliminando(false);
    }
  }

  const visibles = useMemo(() => {
    const query = q.trim().toLowerCase();
    let lista = ofertas;
    if (tab !== "todos") {
      lista = lista.filter((o) => normalizarEstadoOferta(o.estado) === tab);
    }
    if (query) {
      lista = lista.filter(
        (o) =>
          (o.proyectos?.titulo ?? "").toLowerCase().includes(query) ||
          (o.perfiles_estudiante?.usuarios?.nombre ?? "").toLowerCase().includes(query) ||
          (o.perfiles_estudiante?.usuarios?.correo ?? "").toLowerCase().includes(query)
      );
    }
    return lista;
  }, [ofertas, q, tab]);

  return (
    <div className="flex flex-col gap-5">
      {/* Tabs por estado */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const activo = tab === t.key;
          const count =
            t.key === "todos"
              ? ofertas.length
              : ofertas.filter((o) => normalizarEstadoOferta(o.estado) === t.key).length;
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
          placeholder="Buscar por estudiante, correo o proyecto…"
          className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-fwd-blue focus:bg-white/10 focus:ring-4 focus:ring-fwd-blue/20 sm:max-w-xs"
        />
        <p className="text-sm text-white/50">
          {visibles.length} de {ofertas.length} oferta
          {ofertas.length === 1 ? "" : "s"}
        </p>
      </div>

      {/* Tabla de ofertas */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-white/50">
            <tr>
              <th className="px-4 py-3 font-semibold">Estudiante</th>
              <th className="px-4 py-3 font-semibold">Proyecto</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold">Enviada</th>
              <th className="px-4 py-3 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.07]">
            {visibles.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-white/40">
                  Ninguna oferta coincide con el filtro.
                </td>
              </tr>
            ) : (
              visibles.map((o) => {
                const meta = ESTADO_OFERTA_META[normalizarEstadoOferta(o.estado)];
                const fechaEnvio = new Date(o.enviado);
                return (
                  <tr key={o.id} className="transition-colors hover:bg-white/5">
                    <td className="px-4 py-3 font-medium text-white">
                      <button
                        type="button"
                        onClick={() => setDetalleModal(o)}
                        className="text-left font-semibold text-white hover:text-fwd-blue hover:underline transition-colors focus:outline-none"
                      >
                        {o.perfiles_estudiante?.usuarios?.nombre ?? "—"}
                      </button>
                      <div className="text-xs text-white/40">
                        {o.perfiles_estudiante?.usuarios?.correo}
                      </div>
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-white/75">
                      {o.proyectos?.titulo ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.badge}`}
                      >
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/55 tabular-nums">
                      {fechaEnvio.toLocaleDateString("es-CR")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setDetalleModal(o)}
                        className="rounded-lg px-2.5 py-1 text-xs font-semibold text-fwd-blue transition hover:bg-fwd-blue/15"
                      >
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Detalle de Oferta */}
      {detalleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#111827] p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold mb-2 ${
                    ESTADO_OFERTA_META[normalizarEstadoOferta(detalleModal.estado)].badge
                  }`}
                >
                  {ESTADO_OFERTA_META[normalizarEstadoOferta(detalleModal.estado)].label}
                </span>
                <h3 className="text-xl font-bold text-white leading-tight">
                  Oferta de {detalleModal.perfiles_estudiante?.usuarios?.nombre ?? "Estudiante"}
                </h3>
                <p className="text-sm text-white/50">
                  {detalleModal.perfiles_estudiante?.usuarios?.correo}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {!editando && (
                  <button
                    type="button"
                    onClick={() => iniciarEdicion(detalleModal)}
                    title="Editar estado"
                    aria-label="Editar estado"
                    className="rounded-lg p-2 text-fwd-blue transition hover:bg-fwd-blue/15"
                  >
                    <Pencil className="h-[18px] w-[18px]" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={eliminarOferta}
                  disabled={eliminando}
                  title="Eliminar oferta"
                  aria-label="Eliminar oferta"
                  className="rounded-lg bg-red-500/15 p-2 text-red-500 transition hover:bg-red-500/25 disabled:opacity-50"
                >
                  <Trash2 className="h-5 w-5" strokeWidth={2.4} />
                </button>
                <button
                  type="button"
                  onClick={() => setDetalleModal(null)}
                  className="text-white/40 hover:text-white transition-colors text-2xl font-bold px-2"
                  aria-label="Cerrar"
                >
                  &times;
                </button>
              </div>
            </div>

            {editando && (
              <div className="mt-4 rounded-xl border border-fwd-blue/20 bg-fwd-blue/5 p-4">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-fwd-blue">
                    Cambiar estado de la oferta
                  </span>
                  <select
                    value={nuevoEstado}
                    onChange={(e) => setNuevoEstado(e.target.value as EstadoOfertaDetalle)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-fwd-blue focus:ring-2 focus:ring-fwd-blue/20"
                  >
                    {ESTADOS_OFERTA.map((est) => (
                      <option key={est} value={est} className="bg-[#111827] text-white">
                        {ESTADO_OFERTA_META[est].label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            <div className="mt-4 space-y-4">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Proyecto</h4>
                <p className="mt-1 text-base text-white font-semibold leading-relaxed">
                  {detalleModal.proyectos?.titulo ?? "—"}
                </p>
              </div>

              <div className="border-t border-white/5 pt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Propuesta del Estudiante</h4>
                <p className="mt-2 text-sm text-white/80 whitespace-pre-wrap leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/5">
                  {detalleModal.propuesta || "Sin propuesta detallada."}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-white/5 pt-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Fecha de Envío</h4>
                  <p className="mt-1 text-sm text-white font-medium">
                    {new Date(detalleModal.enviado).toLocaleDateString("es-CR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Hora de Envío</h4>
                  <p className="mt-1 text-sm text-white font-medium">
                    {new Date(detalleModal.enviado).toLocaleTimeString("es-CR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {(detalleModal.prototipo_url || detalleModal.documentacion_url) && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-white/5 pt-4">
                  {detalleModal.prototipo_url && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Prototipo</h4>
                      <a
                        href={detalleModal.prototipo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-fwd-blue hover:underline"
                      >
                        Ver Prototipo <span className="text-xs">↗</span>
                      </a>
                    </div>
                  )}
                  {detalleModal.documentacion_url && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Documentación</h4>
                      <a
                        href={detalleModal.documentacion_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-fwd-blue hover:underline"
                      >
                        Ver Documentación <span className="text-xs">↗</span>
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-4">
              {editando ? (
                <>
                  <button
                    type="button"
                    onClick={() => setEditando(false)}
                    disabled={guardando}
                    className="rounded-xl px-4 py-2 text-sm font-semibold text-white/60 transition hover:text-white disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={guardarEstado}
                    disabled={guardando}
                    className="rounded-xl bg-fwd-blue px-5 py-2 text-sm font-bold text-white shadow transition hover:bg-fwd-blue/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {guardando ? "Guardando…" : "Guardar estado"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setDetalleModal(null)}
                  className="rounded-xl bg-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Cerrar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
