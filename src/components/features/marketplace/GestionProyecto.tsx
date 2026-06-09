'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import EstadoBadge from '@/components/ui/EstadoBadge';
import OfertaCard from '@/components/features/applications/OfertaCard';
import StarRating from '@/components/ui/StarRating';

// Tipos locales: el server pasa props planos (no @/types).
type OfertaVista = {
  id: string;
  propuesta: string;
  prototipoUrl: string | null;
  documentacionUrl: string | null;
  estado: string;
};

type EntregableVista = {
  id: string;
  tipo: string;
  version: number;
  archivoUrl: string;
  estado: string;
  comentarioEmpresario: string | null;
  creado: string;
};

type Props = {
  proyecto: { id: string; titulo: string; estado: string };
  ofertasIniciales: OfertaVista[];
  entregablesIniciales: EntregableVista[];
  evaluacionInicial: number | null;
};

export default function GestionProyecto({
  proyecto,
  ofertasIniciales,
  entregablesIniciales,
  evaluacionInicial,
}: Props) {
  const router = useRouter();

  // Calificación EFÍMERA de cada oferta (solo UI; no se persiste).
  const [calificaciones, setCalificaciones] = useState<Record<string, number>>({});
  // Calificación final del estudiante (se persiste al cerrar, tabla evaluaciones).
  const [puntuacionFinal, setPuntuacionFinal] = useState<number>(evaluacionInicial ?? 0);

  const [comentandoId, setComentandoId] = useState<string | null>(null);
  const [comentarioTexto, setComentarioTexto] = useState('');
  const [errorComentario, setErrorComentario] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const hayAdjudicada = ofertasIniciales.some((o) => o.estado === 'adjudicada');
  const finalAprobado = entregablesIniciales.some(
    (e) => e.tipo === 'final' && e.estado === 'aprobado',
  );
  const cerrado = proyecto.estado === 'cerrado';

  // --- FASE 1: calificar oferta (SOLO estado local efímero, no se persiste) ---
  function calificarOferta(ofertaId: string, valor: number) {
    setCalificaciones((prev) => ({ ...prev, [ofertaId]: valor }));
  }

  // --- FASE 2: adjudicar ---
  async function adjudicar(ofertaId: string) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/ofertas/${ofertaId}/adjudicar`, { method: 'POST' });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? 'No se pudo adjudicar la oferta.');
        return;
      }
      setAviso('Proyecto adjudicado. Ahora está en desarrollo.');
      router.refresh();
    } catch {
      setError('Error de red. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  // --- FASE 3: aprobar / solicitar cambios ---
  async function aprobarEntregable(id: string) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/entregables/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'aprobar' }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? 'No se pudo aprobar el entregable.');
        return;
      }
      setAviso('Entregable aprobado.');
      router.refresh();
    } catch {
      setError('Error de red. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  function abrirComentario(id: string) {
    setComentandoId(id);
    setComentarioTexto('');
    setErrorComentario(null);
  }

  async function confirmarCambios(id: string) {
    if (!comentarioTexto.trim()) {
      setErrorComentario('El comentario es obligatorio para solicitar cambios.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/entregables/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'cambios', comentario: comentarioTexto.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? 'No se pudieron solicitar cambios.');
        return;
      }
      setComentandoId(null);
      setComentarioTexto('');
      setAviso('Se solicitaron cambios al estudiante.');
      router.refresh();
    } catch {
      setError('Error de red. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  // --- FASE 4: cierre ---
  async function cerrarProyecto() {
    if (!finalAprobado) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/proyectos/${proyecto.id}/cerrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ puntuacion: puntuacionFinal }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? 'No se pudo cerrar el proyecto.');
        return;
      }
      setAviso('Proyecto cerrado. ¡Gracias!');
      router.refresh();
    } catch {
      setError('Error de red. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{proyecto.titulo}</h1>
          <p className="text-slate-500">Gestión del proyecto</p>
        </div>
        <EstadoBadge estado={proyecto.estado} tipo="proyecto" />
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
      )}
      {aviso && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-800 flex items-center justify-between">
          <span>{aviso}</span>
          <button onClick={() => setAviso(null)} className="text-green-700 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* ===== FASE 1 + 2: ofertas, calificación efímera y adjudicación ===== */}
      <section>
        <h2 className="font-bold text-lg mb-4">Fase 1 · Ofertas recibidas</h2>
        {ofertasIniciales.length === 0 ? (
          <p className="text-slate-500 text-sm">Este proyecto todavía no tiene ofertas.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ofertasIniciales.map((o) => {
              const calif = calificaciones[o.id] ?? 0;
              // exactOptionalPropertyTypes: no emitir la clave si no hay calificación.
              const ofertaProp = calif ? { ...o, calificacion: calif } : o;
              return (
                <div key={o.id} className="space-y-3">
                  <OfertaCard oferta={ofertaProp} />
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">Calificar:</span>
                      <StarRating
                        value={calif}
                        onChange={(v) => calificarOferta(o.id, v)}
                        className="text-xl"
                      />
                    </div>

                    {/* FASE 2: adjudicar — solo una por proyecto */}
                    {o.estado === 'adjudicada' ? (
                      <p className="text-sm font-bold text-green-700">✓ Oferta adjudicada</p>
                    ) : o.estado === 'no_seleccionada' ? (
                      <p className="text-sm text-slate-400">Oferta no seleccionada</p>
                    ) : (
                      <button
                        onClick={() => adjudicar(o.id)}
                        disabled={loading || hayAdjudicada || proyecto.estado !== 'publicado'}
                        className="px-4 py-2 rounded-lg bg-[#008FD4] text-white text-sm font-semibold hover:brightness-110 transition-all disabled:bg-slate-300 disabled:cursor-not-allowed"
                      >
                        Adjudicar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ===== FASE 3: entregables ===== */}
      <section>
        <h2 className="font-bold text-lg mb-4">Fase 3 · Entregables</h2>
        {entregablesIniciales.length === 0 ? (
          <p className="text-slate-500 text-sm">
            Todavía no hay entregables. Aparecerán cuando el estudiante los suba.
          </p>
        ) : (
          <div className="space-y-4">
            {entregablesIniciales.map((e) => (
              <div key={e.id} className="rounded-xl border border-slate-300 bg-white p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">
                      {e.tipo === 'final' ? 'Entregable final' : 'Hito'}{' '}
                      <span className="text-xs text-slate-400">v{e.version}</span>
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
                            disabled={loading}
                            className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:brightness-110 disabled:opacity-60"
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
                          disabled={loading}
                          className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:brightness-110 disabled:opacity-60"
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
          <StarRating value={puntuacionFinal} onChange={setPuntuacionFinal} readOnly={cerrado} />
        </div>

        {cerrado ? (
          <p className="font-bold text-green-700">✓ Proyecto cerrado</p>
        ) : (
          <>
            <button
              onClick={cerrarProyecto}
              disabled={loading || !finalAprobado}
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
