"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { Pencil, Trash2 } from "lucide-react";
import {
  confirmarAccion,
  pedirMotivo,
  toastExito,
  alertaError,
} from "@/lib/sweetalert-admin";

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

const estadoProyectoColor: Record<string, string> = {
  publicado: "bg-fwd-blue/15 text-fwd-blue border border-fwd-blue/20",
  abierto: "bg-fwd-blue/15 text-fwd-blue border border-fwd-blue/20",
  en_desarrollo: "bg-fwd-purple/20 text-fwd-purple border border-fwd-purple/20",
  cerrado: "bg-white/10 text-white/60 border border-white/10",
  borrador: "bg-fwd-yellow/15 text-fwd-yellow border border-fwd-yellow/20",
  cancelado: "bg-red-500/15 text-red-300 border border-red-500/20",
  pendiente_revision: "bg-orange-500/15 text-orange-400 border border-orange-500/20",
};

const TABS = [
  { key: "todos", label: "Todos" },
  { key: "publicado", label: "Publicados" },
  { key: "pendiente_revision", label: "Pendientes de Revisión" },
  { key: "en_desarrollo", label: "En Desarrollo" },
  { key: "cerrado", label: "Cerrados" },
] as const;

export function GestionProyectosPanel({
  proyectos,
}: {
  proyectos: ProyectoAdmin[];
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("todos");
  const [loading, setLoading] = useState<string | null>(null);

  // Modal de detalle
  const [detalleModal, setDetalleModal] = useState<ProyectoAdmin | null>(null);

  // Edición dentro del modal de detalle
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [formProyecto, setFormProyecto] = useState({
    titulo: "",
    descripcion: "",
    area_negocio: "",
    plazo_dias: "",
  });

  // Salir del modo edición al abrir/cerrar/cambiar el detalle.
  useEffect(() => {
    setEditando(false);
    setEditError(null);
  }, [detalleModal?.id]);

  function iniciarEdicionProyecto(p: ProyectoAdmin) {
    setEditError(null);
    setFormProyecto({
      titulo: p.titulo ?? "",
      descripcion: p.descripcion ?? "",
      area_negocio: p.area_negocio ?? "",
      plazo_dias: p.plazo_dias != null ? String(p.plazo_dias) : "",
    });
    setEditando(true);
  }

  async function guardarEdicionProyecto() {
    if (!detalleModal) return;
    setEditError(null);
    setGuardando(true);
    try {
      const res = await fetch(`/api/admin/proyectos/${detalleModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "editar",
          titulo: formProyecto.titulo.trim(),
          descripcion: formProyecto.descripcion.trim(),
          area_negocio: formProyecto.area_negocio.trim() || null,
          plazo_dias:
            formProyecto.plazo_dias.trim() === ""
              ? null
              : Number(formProyecto.plazo_dias),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg = data?.error ?? "No se pudo guardar el proyecto.";
        setEditError(msg);
        alertaError(msg);
        return;
      }
      setDetalleModal({
        ...detalleModal,
        titulo: formProyecto.titulo.trim(),
        descripcion: formProyecto.descripcion.trim(),
        area_negocio: formProyecto.area_negocio.trim() || null,
        plazo_dias:
          formProyecto.plazo_dias.trim() === ""
            ? null
            : Number(formProyecto.plazo_dias),
      });
      setEditando(false);
      toastExito("Proyecto actualizado.");
      router.refresh();
    } catch {
      const msg = "Error de red. Intentá de nuevo.";
      setEditError(msg);
      alertaError(msg);
    } finally {
      setGuardando(false);
    }
  }

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

  // ── Suspender (Pendiente de revisión) — SweetAlert con motivo ───
  async function suspenderProyecto(p: ProyectoAdmin) {
    const motivo = await pedirMotivo({
      titulo: `Suspender "${p.titulo}"`,
      texto: "El proyecto pasará a 'pendiente de revisión'.",
      label: "Motivo de la suspensión",
      placeholder: "Describí el motivo de la suspensión…",
      confirmText: "Suspender",
    });
    if (motivo === null) return;
    setLoading(p.id);
    try {
      const res = await fetch(`/api/admin/proyectos/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "suspender", motivo }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alertaError(data?.error ?? "No se pudo suspender el proyecto.");
        return;
      }
      toastExito(`Proyecto "${p.titulo}" puesto en revisión.`);
      router.refresh();
    } catch {
      alertaError("Error de red. Intentá de nuevo.");
    } finally {
      setLoading(null);
    }
  }

  // ── Dar Visto Bueno (Reactivar) — SweetAlert de confirmación ────
  async function darVistoBueno(p: ProyectoAdmin) {
    const ok = await confirmarAccion({
      titulo: `¿Dar visto bueno a "${p.titulo}"?`,
      texto: "El proyecto volverá a su estado anterior.",
      confirmText: "Dar visto bueno",
      icon: "question",
    });
    if (!ok) return;
    setLoading(p.id);
    try {
      const res = await fetch(`/api/admin/proyectos/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "visto_bueno" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alertaError(data?.error ?? "No se pudo reactivar el proyecto.");
        return;
      }
      toastExito(`Proyecto "${p.titulo}" reactivado.`);
      router.refresh();
    } catch {
      alertaError("Error de red. Intentá de nuevo.");
    } finally {
      setLoading(null);
    }
  }

  // ── Eliminar Proyecto — SweetAlert con motivo. Devuelve true si se eliminó. ──
  async function eliminarProyecto(p: ProyectoAdmin): Promise<boolean> {
    const motivo = await pedirMotivo({
      titulo: `Eliminar "${p.titulo}"`,
      texto: "Esta acción no se puede deshacer.",
      label: "Motivo de la eliminación",
      placeholder: "Describí el motivo de la eliminación…",
      confirmText: "Eliminar proyecto",
      peligro: true,
    });
    if (motivo === null) return false;
    setLoading(p.id);
    try {
      const res = await fetch(`/api/admin/proyectos/${p.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motivo }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alertaError(data?.error ?? "No se pudo eliminar el proyecto.");
        return false;
      }
      toastExito(`Proyecto "${p.titulo}" eliminado.`);
      router.refresh();
      return true;
    } catch {
      alertaError("Error de red. Intentá de nuevo.");
      return false;
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
                            onClick={() => darVistoBueno(p)}
                            disabled={loading === p.id}
                            className="rounded-lg px-2.5 py-1 text-xs font-semibold text-emerald-500 transition hover:bg-emerald-500/15 disabled:opacity-40"
                            title="Dar Visto Bueno"
                          >
                            {loading === p.id ? "Procesando…" : "Visto Bueno"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => suspenderProyecto(p)}
                            disabled={loading === p.id}
                            className="rounded-lg px-2.5 py-1 text-xs font-semibold text-orange-400 transition hover:bg-orange-400/15 disabled:opacity-40"
                            title="Suspender revisión"
                          >
                            Suspender
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => eliminarProyecto(p)}
                          disabled={loading === p.id}
                          className="inline-flex items-center gap-1 rounded-lg bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-500 transition hover:bg-red-500/20 disabled:opacity-40"
                          title="Eliminar proyecto"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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
              <div className="flex items-center gap-1">
                {!editando && (
                  <button
                    type="button"
                    onClick={() => iniciarEdicionProyecto(detalleModal)}
                    title="Editar proyecto"
                    aria-label="Editar proyecto"
                    className="rounded-lg p-2 text-fwd-blue transition hover:bg-fwd-blue/15"
                  >
                    <Pencil className="h-[18px] w-[18px]" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await eliminarProyecto(detalleModal);
                    if (ok) setDetalleModal(null);
                  }}
                  title="Eliminar proyecto"
                  aria-label="Eliminar proyecto"
                  className="rounded-lg bg-red-500/15 p-2 text-red-500 transition hover:bg-red-500/25"
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
              <div className="mt-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-fwd-blue">
                  Editando proyecto
                </p>
                {editError && (
                  <p
                    role="alert"
                    className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
                  >
                    {editError}
                  </p>
                )}
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-white/55">Título</span>
                  <input
                    value={formProyecto.titulo}
                    onChange={(e) => setFormProyecto((f) => ({ ...f, titulo: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-fwd-blue focus:ring-2 focus:ring-fwd-blue/20"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-white/55">Descripción</span>
                  <textarea
                    rows={4}
                    value={formProyecto.descripcion}
                    onChange={(e) => setFormProyecto((f) => ({ ...f, descripcion: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-fwd-blue focus:ring-2 focus:ring-fwd-blue/20"
                  />
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-white/55">Área de negocio</span>
                    <input
                      value={formProyecto.area_negocio}
                      onChange={(e) => setFormProyecto((f) => ({ ...f, area_negocio: e.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-fwd-blue focus:ring-2 focus:ring-fwd-blue/20"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-white/55">Plazo (días)</span>
                    <input
                      type="number"
                      min={1}
                      value={formProyecto.plazo_dias}
                      onChange={(e) => setFormProyecto((f) => ({ ...f, plazo_dias: e.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-fwd-blue focus:ring-2 focus:ring-fwd-blue/20"
                    />
                  </label>
                </div>
              </div>
            )}

            {!editando && (
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
            )}

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
                    onClick={guardarEdicionProyecto}
                    disabled={
                      guardando ||
                      !formProyecto.titulo.trim() ||
                      !formProyecto.descripcion.trim()
                    }
                    className="rounded-xl bg-fwd-blue px-5 py-2 text-sm font-bold text-white shadow transition hover:bg-fwd-blue/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {guardando ? "Guardando…" : "Guardar cambios"}
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