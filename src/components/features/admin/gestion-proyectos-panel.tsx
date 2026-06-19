export type ProyectoAdmin = {
  id: string;
  titulo: string;
  descripcion: string;
  estado: string;
  publicado: string | Date | null;
  cierre: string | Date | null;
  motivo_estado: string | null;
  estado_previo: string | null;
  area_negocio: string | null;
  plazo_dias: number | null;
  usa_ia: boolean;
  perfiles_empresario: { usuarios: { nombre: string } } | null;
  _count: { ofertas: number };
};

"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";

// ... rest of the file remains unchanged ...
export function GestionProyectosPanel({
  proyectos,
}: {
  proyectos: ProyectoAdmin[];
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("todos");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal de detalle
  const [detalleModal, setDetalleModal] = useState<ProyectoAdmin | null>(null);

  // Modal de suspensión (pendiente de revisión)
  const [suspendModal, setSuspendModal] = useState<ProyectoAdmin | null>(null);
  const [motivoSuspender, setMotivoSuspender] = useState("");

  // Modal de eliminación
  const [eliminarModal, setEliminarModal] = useState<ProyectoAdmin | null>(null);
  const [motivoEliminar, setMotivoEliminar] = useState("");

  const visibles = useMemo(() => {
    const query = q.trim().toLowerCase();
    let lista = proyectos;
    if (tab !== "todos") {
      lista = lista.filter((p) => p.estado === tab);
    }
    if (query) {
      lista = lista.filter(
        (p) =>
          p.titulo.toLowerCase().includes(query) ||
          (p.perfiles_empresario?.usuarios?.nombre ?? "").toLowerCase().includes(query)
      );
    }
    return lista;
  }, [proyectos, q, tab]);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  // ── Suspender (Pendiente de revisión) ───────────────────
  async function handleSuspender() {
    if (!suspendModal || !motivoSuspender.trim()) return;
    clearMessages();
    setLoading(suspendModal.id);
    try {
      const res = await fetch(`/api/admin/proyectos/${suspendModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "suspender",
          motivo: motivoSuspender.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "No se pudo suspender el proyecto.");
        return;
      }
      setSuccess(`Proyecto "${suspendModal.titulo}" puesto en pendiente de revisión.`);
      setSuspendModal(null);
      setMotivoSuspender("");
      router.refresh();
    } catch {
      setError("Error de red. Intentá de nuevo.");
    } finally {
      setLoading(null);
    }
  }

  // ── Dar Visto Bueno (Reactivar) ──────────────────────────
  async function handleVistoBueno(proyecto: ProyectoAdmin) {
    if (!proyecto) return;
    clearMessages();
    setLoading(proyecto.id);
    try {
      const res = await fetch(`/api/admin/proyectos/${proyecto.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "visto_bueno",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "No se pudo reactivar el proyecto.");
        return;
      }
      setSuccess(`Proyecto "${proyecto.titulo}" reactivado correctamente.`);
      router.refresh();
    } catch {
      setError("Error de red. Intentá de nuevo.");
    } finally {
      setLoading(null);
    }
  }

  // ── Eliminar Proyecto ──────────────────────────────────
  async function handleEliminar() {
    if (!eliminarModal || !motivoEliminar.trim()) return;
    clearMessages();
    setLoading(eliminarModal.id);
    try {
      const res = await fetch(`/api/admin/proyectos/${eliminarModal.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          motivo: motivoEliminar.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "No se pudo eliminar el proyecto.");
        return;
      }
      setSuccess(`Proyecto "${eliminarModal.titulo}" eliminado exitosamente.`);
      setEliminarModal(null);
      setMotivoEliminar("");
      router.refresh();
    } catch {
      setError("Error de red. Intentá de nuevo.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Resumen rápido */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-all duration-300 hover:scale-[1.03] hover:bg-white/[0.08] hover:shadow-lg cursor-default">
          <span
            className="absolute inset-y-0 left-0 w-1.5 bg-fwd-blue"
            aria-hidden
          />
          <p className="text-sm text-white/50 transition-all duration-300 hover:text-white/80 hover:translate-x-1 select-none">Proyectos publicados</p>
          <p className="mt-1 text-3xl font-black tabular-nums text-white transition-all duration-300 hover:scale-105 origin-left select-none">
            {proyectos.filter((p) => p.estado === "publicado" || p.estado === "abierto").length}
          </p>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5 transition-all duration-300 hover:scale-[1.03] hover:bg-orange-500/10 hover:shadow-lg cursor-default">
          <span
            className="absolute inset-y-0 left-0 w-1.5 bg-orange-500"
            aria-hidden
          />
          <p className="text-sm text-orange-400/70 transition-all duration-300 hover:text-orange-300 hover:translate-x-1 select-none">Pendientes de revisión</p>
          <p className="mt-1 text-3xl font-black tabular-nums text-orange-300 transition-all duration-300 hover:scale-105 origin-left select-none">
            {proyectos.filter((p) => p.estado === "pendiente_revision").length}
          </p>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-all duration-300 hover:scale-[1.03] hover:bg-white/[0.08] hover:shadow-lg cursor-default">
          <span
            className="absolute inset-y-0 left-0 w-1.5 bg-fwd-purple"
            aria-hidden
          />
          <p className="text-sm text-white/50 transition-all duration-300 hover:text-white/80 hover:translate-x-1 select-none">Total proyectos</p>
          <p className="mt-1 text-3xl font-black tabular-nums text-white transition-all duration-300 hover:scale-105 origin-left select-none">
            {proyectos.length}
          </p>
        </div>
      </div>

      {/* Tabs por estado */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const activo = tab === t.key;
          const count =
            t.key === "todos"
              ? proyectos.length
              : proyectos.filter((p) => p.estado === t.key).length;
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
          placeholder="Buscar por título o empresario…"
          className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-fwd-blue focus:bg-white/10 focus:ring-4 focus:ring-fwd-blue/20 sm:max-w-xs"
        />
        <p className="text-sm text-white/50">
          {visibles.length} de {proyectos.length} proyecto
          {proyectos.length === 1 ? "" : "s"}
        </p>
      </div>

      {/* Alertas */}
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </p>
      )}
      {success && (
        <p
          role="status"
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
        >
          {success}
        </p>
      )}

      {/* Tabla de proyectos */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-white/50">
            <tr>
              <th className="px-4 py-3 font-semibold">Título</th>
              <th className="px-4 py-3 font-semibold">Empresario</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 text-right font-semibold">Ofertas</th>
              <th className="px-4 py-3 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.07]">
            {visibles.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-white/40">
                  Ningún proyecto coincide con el filtro.
                </td>
              </tr>
            ) : (
              visibles.map((p) => {
                const enRevision = p.estado === "pendiente_revision";
                return (
                  <tr key={p.id} className="transition-colors hover:bg-white/5">
                    <td className="max-w-xs truncate px-4 py-3 font-medium text-white">
                      <button
                        type="button"
                        onClick={() => setDetalleModal(p)}
                        className="text-left font-semibold text-white hover:text-fwd-blue hover:underline transition-colors focus:outline-none"
                      >
                        {p.titulo}
                      </button>
                      {enRevision && p.motivo_estado && (
                        <div className="mt-1 text-xs text-orange-300/80 italic">
                          Motivo: {p.motivo_estado}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white/55">
                      {p.perfiles_empresario?.usuarios?.nombre ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                          estadoProyectoColor[p.estado] ?? "bg-white/10 text-white/70"
                        }`}
                      >
                        {p.estado.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-white/70">
                      {p._count.ofertas}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {enRevision ? (
                          <button
                            type="button"
                            onClick={() => handleVistoBueno(p)}
                            disabled={loading === p.id}
                            className="rounded-lg px-2.5 py-1 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-400/15 disabled:opacity-40"
                            title="Dar Visto Bueno"
                          >
                            {loading === p.id ? "Procesando…" : "Visto Bueno"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              clearMessages();
                              setSuspendModal(p);
                              setMotivoSuspender("");
                            }}
                            disabled={loading === p.id}
                            className="rounded-lg px-2.5 py-1 text-xs font-semibold text-orange-400 transition hover:bg-orange-400/15 disabled:opacity-40"
                            title="Suspender revisión"
                          >
                            Suspender
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            clearMessages();
                            setEliminarModal(p);
                            setMotivoEliminar("");
                          }}
                          disabled={loading === p.id}
                          className="rounded-lg px-2.5 py-1 text-xs font-semibold text-red-400 transition hover:bg-red-400/15 disabled:opacity-40"
                          title="Eliminar proyecto"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Suspender / Pendiente de revisión */}
      {suspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111827] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Suspender Proyecto</h3>
            <p className="mt-1 text-sm text-white/50">
              Estás por colocar el proyecto <strong className="text-white">&quot;{suspendModal.titulo}&quot;</strong> en estado &quot;pendiente de revisión&quot;.
            </p>

            <label className="mt-4 block text-sm font-medium text-white/70">
              Motivo de la suspensión <span className="text-red-400">*</span>
            </label>
            <textarea
              value={motivoSuspender}
              onChange={(e) => setMotivoSuspender(e.target.value)}
              rows={3}
              placeholder="Describí el motivo de la suspensión…"
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSuspendModal(null)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white/60 transition hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSuspender}
                disabled={!motivoSuspender.trim() || loading === suspendModal.id}
                className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-bold text-white shadow transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading === suspendModal.id ? "Procesando…" : "Confirmar suspensión"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Eliminar */}
      {eliminarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111827] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white text-red-400">Eliminar Proyecto</h3>
            <p className="mt-1 text-sm text-white/50">
              Estás por eliminar de manera permanente el proyecto <strong className="text-white">&quot;{eliminarModal.titulo}&quot;</strong>. Esta acción no se puede deshacer.
            </p>

            <label className="mt-4 block text-sm font-medium text-white/70">
              Motivo de la eliminación <span className="text-red-400">*</span>
            </label>
            <textarea
              value={motivoEliminar}
              onChange={(e) => setMotivoEliminar(e.target.value)}
              rows={3}
              placeholder="Describí el motivo de la eliminación…"
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            />

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEliminarModal(null)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white/60 transition hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleEliminar}
                disabled={!motivoEliminar.trim() || loading === eliminarModal.id}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white shadow transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading === eliminarModal.id ? "Eliminando…" : "Confirmar eliminación"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Detalle de Proyecto */}
      {detalleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#111827] p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize mb-2 ${
                    estadoProyectoColor[detalleModal.estado] ?? "bg-white/10 text-white/70"
                  }`}
                >
                  {detalleModal.estado.replace(/_/g, " ")}
                </span>
                <h3 className="text-xl font-bold text-white leading-tight">
                  {detalleModal.titulo}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetalleModal(null)}
                className="text-white/40 hover:text-white transition-colors text-2xl font-bold px-2"
              >
                &times;
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Descripción</h4>
                <p className="mt-1 text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
                  {detalleModal.descripcion || "Sin descripción."}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-white/5 pt-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Empresario</h4>
                  <p className="mt-1 text-sm text-white font-medium">
                    {detalleModal.perfiles_empresario?.usuarios?.nombre ?? "—"}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Área de Negocio</h4>
                  <p className="mt-1 text-sm text-white font-medium">
                    {detalleModal.area_negocio || "—"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-white/5 pt-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Fecha de Creación</h4>
                  <p className="mt-1 text-sm text-white font-medium">
                    {detalleModal.publicado
                      ? new Date(detalleModal.publicado).toLocaleDateString("es-CR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : "—"}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Hora de Creación</h4>
                  <p className="mt-1 text-sm text-white font-medium">
                    {detalleModal.publicado
                      ? new Date(detalleModal.publicado).toLocaleTimeString("es-CR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 border-t border-white/5 pt-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Plazo</h4>
                  <p className="mt-1 text-sm text-white font-medium">
                    {detalleModal.plazo_dias ? `${detalleModal.plazo_dias} días` : "—"}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Usa IA</h4>
                  <p className="mt-1 text-sm text-white font-medium">
                    {detalleModal.usa_ia ? "Sí" : "No"}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Ofertas Recibidas</h4>
                  <p className="mt-1 text-sm text-white font-medium">
                    {detalleModal._count.ofertas}
                  </p>
                </div>
              </div>

              {detalleModal.cierre && (
                <div className="border-t border-white/5 pt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Fecha de Cierre</h4>
                  <p className="mt-1 text-sm text-white font-medium">
                    {new Date(detalleModal.cierre).toLocaleDateString("es-CR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}

              {detalleModal.motivo_estado && (
                <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-orange-400">Detalle / Motivo de revisión</h4>
                  <p className="mt-1 text-sm text-orange-300/90 italic">
                    {detalleModal.motivo_estado}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => setDetalleModal(null)}
                className="rounded-xl bg-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
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