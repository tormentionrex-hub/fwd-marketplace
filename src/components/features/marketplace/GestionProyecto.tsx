'use client';

import { useState } from 'react';
import type { Proyecto, Oferta, Entregable } from '@/types';
import EstadoBadge from '@/components/ui/EstadoBadge';
import OfertaCard from '@/components/features/applications/OfertaCard';
import StarRating from '@/components/ui/StarRating';

export default function GestionProyecto({
  proyecto,
  ofertasIniciales,
  entregablesIniciales,
}: {
  proyecto: Proyecto;
  ofertasIniciales: Oferta[];
  entregablesIniciales: Entregable[];
}) {
  const [estadoProyecto, setEstadoProyecto] = useState<Proyecto['estado']>(proyecto.estado);
  const [ofertas, setOfertas] = useState<Oferta[]>(ofertasIniciales);
  const [entregables, setEntregables] = useState<Entregable[]>(entregablesIniciales);
  const [calificacionEstudiante, setCalificacionEstudiante] = useState<number>(
    proyecto.calificacionEstudiante ?? 0,
  );
  const [aviso, setAviso] = useState<string | null>(null);

  // "Solicitar cambios": id del entregable que se está comentando + texto.
  const [comentandoId, setComentandoId] = useState<string | null>(null);
  const [comentarioTexto, setComentarioTexto] = useState('');
  const [errorComentario, setErrorComentario] = useState<string | null>(null);

  const hayAdjudicada = ofertas.some((o) => o.estado === 'adjudicada');
  const finalAprobado = entregables.some((e) => e.tipo === 'final' && e.estado === 'aprobado');

  // --- FASE 1: calificar oferta ---
  function calificarOferta(ofertaId: string, valor: number) {
    // TODO Fase 5: guardar la calificación en Supabase
    setOfertas((prev) =>
      prev.map((o) => (o.id === ofertaId ? { ...o, calificacion: valor } : o)),
    );
  }

  // --- FASE 2: adjudicar (una sola por proyecto) ---
  function adjudicar(ofertaId: string) {
    // TODO Fase 5: persistir la adjudicación en Supabase
    setOfertas((prev) =>
      prev.map((o) =>
        o.id === ofertaId
          ? { ...o, estado: 'adjudicada' }
          : { ...o, estado: 'rechazada' },
      ),
    );
    setEstadoProyecto('en_desarrollo');
    setAviso('Proyecto adjudicado. Ahora está en desarrollo.');
  }

  // --- FASE 3: aprobar / solicitar cambios ---
  function aprobarEntregable(id: string) {
    // TODO Fase 5: persistir en Supabase
    setEntregables((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        // Quitamos el comentario previo al aprobar.
        const copia: Entregable = { ...e, estado: 'aprobado' };
        delete copia.comentarioEmpresario;
        return copia;
      }),
    );
    setAviso('Entregable aprobado.');
  }

  function abrirComentario(id: string) {
    setComentandoId(id);
    setComentarioTexto('');
    setErrorComentario(null);
  }

  function confirmarCambios(id: string) {
    if (!comentarioTexto.trim()) {
      setErrorComentario('El comentario es obligatorio para solicitar cambios.');
      return;
    }
    // TODO Fase 5: persistir en Supabase
    setEntregables((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, estado: 'cambios_solicitados', comentarioEmpresario: comentarioTexto.trim() }
          : e,
      ),
    );
    setComentandoId(null);
    setComentarioTexto('');
    setAviso('Se solicitaron cambios al estudiante.');
  }

  // --- FASE 4: cierre ---
  function cerrarProyecto() {
    if (!finalAprobado) return;
    // TODO Fase 5: persistir el cierre en Supabase
    setEstadoProyecto('cerrado');
    setAviso('Proyecto cerrado. ¡Gracias!');
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{proyecto.titulo}</h1>
          <p className="text-slate-500">Gestión del proyecto</p>
        </div>
        <EstadoBadge estado={estadoProyecto} tipo="proyecto" />
      </div>

      {aviso && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-800 flex items-center justify-between">
          <span>{aviso}</span>
          <button onClick={() => setAviso(null)} className="text-green-700 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* ===== FASE 1 + 2: ofertas, calificación y adjudicación ===== */}
      <section>
        <h2 className="font-bold text-lg mb-4">Fase 1 · Ofertas recibidas</h2>
        {ofertas.length === 0 ? (
          <p className="text-slate-500 text-sm">Este proyecto todavía no tiene ofertas.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ofertas.map((o) => (
              <div key={o.id} className="space-y-3">
                <OfertaCard oferta={o} />
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">Calificar:</span>
                    <StarRating
                      value={o.calificacion ?? 0}
                      onChange={(v) => calificarOferta(o.id, v)}
                      className="text-xl"
                    />
                  </div>

                  {/* FASE 2: adjudicar — solo una por proyecto */}
                  {o.estado === 'adjudicada' ? (
                    <p className="text-sm font-bold text-green-700">✓ Oferta adjudicada</p>
                  ) : o.estado === 'rechazada' ? (
                    <p className="text-sm text-slate-400">Oferta no seleccionada</p>
                  ) : (
                    <button
                      onClick={() => adjudicar(o.id)}
                      disabled={hayAdjudicada || estadoProyecto !== 'publicado'}
                      className="px-4 py-2 rounded-lg bg-[#008FD4] text-white text-sm font-semibold hover:brightness-110 transition-all disabled:bg-slate-300 disabled:cursor-not-allowed"
                    >
                      Adjudicar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===== FASE 3: entregables ===== */}
      <section>
        <h2 className="font-bold text-lg mb-4">Fase 3 · Entregables</h2>
        {entregables.length === 0 ? (
          <p className="text-slate-500 text-sm">
            Todavía no hay entregables. Aparecerán cuando el estudiante los suba.
          </p>
        ) : (
          <div className="space-y-4">
            {entregables.map((e) => (
              <div key={e.id} className="rounded-xl border border-slate-300 bg-white p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">
                      {e.titulo}{' '}
                      <span className="text-xs text-slate-400">v{e.version} · {e.tipo}</span>
                    </p>
                    {e.archivoUrl ? (
                      <a
                        href={e.archivoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#008FD4] font-semibold hover:underline"
                      >
                        Descargar
                      </a>
                    ) : e.archivoNombre ? (
                      <span className="text-sm text-slate-500">{e.archivoNombre}</span>
                    ) : null}
                  </div>
                  <EstadoBadge estado={e.estado} tipo="entregable" />
                </div>

                {e.estado === 'cambios_solicitados' && e.comentarioEmpresario && (
                  <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                    <span className="font-semibold">Tu comentario:</span> {e.comentarioEmpresario}
                  </div>
                )}

                {/* Acciones del empresario mientras no esté aprobado */}
                {e.estado !== 'aprobado' && (
                  <div className="mt-4">
                    {comentandoId === e.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={comentarioTexto}
                          onChange={(ev) => setComentarioTexto(ev.target.value)}
                          rows={3}
                          placeholder="Explicá qué cambios necesitás…"
                          className="w-full rounded-lg border border-slate-300 p-3 text-sm"
                        />
                        {errorComentario && (
                          <p className="text-red-600 text-sm">{errorComentario}</p>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => confirmarCambios(e.id)}
                            className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:brightness-110"
                          >
                            Enviar comentario
                          </button>
                          <button
                            onClick={() => setComentandoId(null)}
                            className="px-4 py-2 rounded-lg border border-slate-300 text-sm"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => aprobarEntregable(e.id)}
                          className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:brightness-110"
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => abrirComentario(e.id)}
                          className="px-4 py-2 rounded-lg border border-amber-300 text-amber-700 text-sm font-semibold hover:bg-amber-50"
                        >
                          Solicitar cambios
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===== FASE 4: cierre ===== */}
      <section className="rounded-xl border border-slate-300 bg-white p-6">
        <h2 className="font-bold text-lg mb-4">Fase 4 · Cierre</h2>

        <div className="mb-5">
          <p className="text-sm font-semibold mb-1">Calificación del estudiante</p>
          <StarRating
            value={calificacionEstudiante}
            onChange={setCalificacionEstudiante}
            readOnly={estadoProyecto === 'cerrado'}
          />
        </div>

        {estadoProyecto === 'cerrado' ? (
          <p className="font-bold text-green-700">✓ Proyecto cerrado</p>
        ) : (
          <>
            <button
              onClick={cerrarProyecto}
              disabled={!finalAprobado}
              className="px-6 py-3 rounded-xl bg-[#008FD4] text-white font-bold hover:brightness-110 transition-all disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              Cerrar proyecto
            </button>
            {!finalAprobado && (
              <p className="text-sm text-slate-500 mt-2">
                Para cerrar, primero tenés que aprobar el entregable final.
              </p>
            )}
          </>
        )}
      </section>
    </div>
  );
}
