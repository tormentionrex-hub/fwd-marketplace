"use client";

import { useMemo, useState } from "react";
import {
  normalizarEstadoOferta,
  ESTADO_OFERTA_META,
  EstadoOfertaDetalle,
} from "@/lib/oferta-estado";

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
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]["key"] | EstadoOfertaDetalle>("todos");
  const [detalleModal, setDetalleModal] = useState<OfertaAdmin | null>(null);

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
