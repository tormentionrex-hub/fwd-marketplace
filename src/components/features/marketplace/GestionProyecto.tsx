'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import StarRating from '@/components/ui/StarRating';

// ── Tipos planos que pasa la página (P14) ──────────────────────────────────────
type OfertaVM = {
  id: string;
  estudianteNombre: string;
  propuesta: string;
  prototipoUrl: string | null;
  documentacionUrl: string | null;
  estado: string;
  fechaEnvio: string;
};
type EntregableVM = {
  id: string;
  tipo: string;
  version: number;
  archivoUrl: string;
  estado: string;
  comentarioEmpresario: string | null;
  fecha: string;
};
type Props = {
  proyecto: { id: string; titulo: string; estado: string };
  ofertasIniciales: OfertaVM[];
  entregablesIniciales: EntregableVM[];
  calificacionInicial: number;
};

// ── Helpers de presentación ────────────────────────────────────────────────────
function badgeOferta(estado: string): { bg: string; color: string; label: string } {
  if (estado === 'adjudicada') return { bg: '#E7F7EE', color: '#0E7A50', label: 'Adjudicada' };
  if (estado === 'no_seleccionada') return { bg: 'var(--bg-2)', color: 'var(--ink-500)', label: 'No seleccionada' };
  return { bg: 'var(--azul-tint)', color: 'var(--azul-700)', label: 'Enviada' };
}
function badgeEntregable(estado: string): { bg: string; color: string; label: string } {
  if (estado === 'aprobado') return { bg: '#E7F7EE', color: '#0E7A50', label: 'Aprobado' };
  if (estado === 'cambios_solicitados') return { bg: '#FDEFDD', color: '#B96400', label: 'Con cambios' };
  return { bg: 'var(--azul-tint)', color: 'var(--azul-700)', label: 'Enviado' };
}
function Pill({ bg, color, label }: { bg: string; color: string; label: string }) {
  return (
    <span className="badge" style={{ background: bg, color }}>
      <span className="bdot" style={{ background: color }} />
      {label}
    </span>
  );
}

async function enviar(url: string, opts: RequestInit): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(url, opts);
    const data = await res.json().catch(() => null);
    if (!res.ok) return { ok: false, error: data?.error ?? 'Ocurrió un error.' };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Error de red. Intentá de nuevo.' };
  }
}

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export default function GestionProyecto({
  proyecto,
  ofertasIniciales,
  entregablesIniciales,
  calificacionInicial,
}: Props) {
  const router = useRouter();

  const [estadoProyecto, setEstadoProyecto] = useState(proyecto.estado);
  const [ofertas, setOfertas] = useState<OfertaVM[]>(ofertasIniciales);
  const [entregables, setEntregables] = useState<EntregableVM[]>(entregablesIniciales);
  const [calificacion, setCalificacion] = useState<number>(calificacionInicial);

  // Calificación por oferta (Fase 1): solo UI, no se persiste (no hay columna).
  const [calOfertas, setCalOfertas] = useState<Record<string, number>>({});

  const [aviso, setAviso] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState<string | null>(null);

  // Solicitar cambios
  const [comentandoId, setComentandoId] = useState<string | null>(null);
  const [comentarioTexto, setComentarioTexto] = useState('');

  const hayAdjudicada = ofertas.some((o) => o.estado === 'adjudicada');
  const finalAprobado = entregables.some((e) => e.tipo === 'final' && e.estado === 'aprobado');
  const cerrado = estadoProyecto === 'cerrado';

  function ok(msg: string) {
    setAviso(msg);
    setError(null);
    router.refresh();
  }

  // ── FASE 2: adjudicar ──
  async function adjudicar(ofertaId: string) {
    setCargando(ofertaId);
    const r = await enviar(`/api/ofertas/${ofertaId}/adjudicar`, { method: 'POST' });
    setCargando(null);
    if (!r.ok) return setError(r.error ?? 'No se pudo adjudicar.');
    setOfertas((prev) =>
      prev.map((o) =>
        o.id === ofertaId ? { ...o, estado: 'adjudicada' } : { ...o, estado: 'no_seleccionada' },
      ),
    );
    setEstadoProyecto('en_desarrollo');
    ok('Proyecto adjudicado. Ahora está en desarrollo.');
  }

  // ── FASE 3: aprobar ──
  async function aprobar(id: string) {
    setCargando(id);
    const r = await enviar(`/api/entregables/${id}`, {
      method: 'PATCH',
      headers: JSON_HEADERS,
      body: JSON.stringify({ accion: 'aprobar' }),
    });
    setCargando(null);
    if (!r.ok) return setError(r.error ?? 'No se pudo aprobar.');
    setEntregables((prev) => prev.map((e) => (e.id === id ? { ...e, estado: 'aprobado' } : e)));
    ok('Entregable aprobado.');
  }

  // ── FASE 3: solicitar cambios ──
  async function confirmarCambios(id: string) {
    if (!comentarioTexto.trim()) return setError('El comentario es obligatorio para solicitar cambios.');
    setCargando(id);
    const r = await enviar(`/api/entregables/${id}`, {
      method: 'PATCH',
      headers: JSON_HEADERS,
      body: JSON.stringify({ accion: 'cambios', comentario: comentarioTexto.trim() }),
    });
    setCargando(null);
    if (!r.ok) return setError(r.error ?? 'No se pudo solicitar cambios.');
    setEntregables((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, estado: 'cambios_solicitados', comentarioEmpresario: comentarioTexto.trim() }
          : e,
      ),
    );
    setComentandoId(null);
    setComentarioTexto('');
    ok('Se solicitaron cambios al estudiante.');
  }

  // ── FASE 4: cerrar ──
  async function cerrar() {
    if (!finalAprobado || calificacion < 1) return;
    setCargando('cerrar');
    const r = await enviar(`/api/proyectos/${proyecto.id}/cerrar`, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ puntuacion: calificacion }),
    });
    setCargando(null);
    if (!r.ok) return setError(r.error ?? 'No se pudo cerrar el proyecto.');
    setEstadoProyecto('cerrado');
    ok('Proyecto cerrado. ¡Gracias!');
  }

  const estadoProyectoLabel =
    estadoProyecto === 'en_desarrollo'
      ? 'En desarrollo'
      : estadoProyecto === 'cerrado'
        ? 'Cerrado'
        : estadoProyecto === 'publicado'
          ? 'Publicado'
          : estadoProyecto;

  return (
    <>
      <div className="topbar">
        <div>
          <div className="tb-title">{proyecto.titulo}</div>
          <div className="tb-sub">Gestión del proyecto · {estadoProyectoLabel}</div>
        </div>
      </div>

      <div className="page fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {aviso && (
          <div className="card card-pad" style={{ background: '#E7F7EE', borderColor: '#A7E3C2', color: '#0E7A50', display: 'flex', justifyContent: 'space-between' }}>
            <span>{aviso}</span>
            <button onClick={() => setAviso(null)} style={{ color: '#0E7A50', fontWeight: 700 }}>✕</button>
          </div>
        )}
        {error && (
          <div className="card card-pad" style={{ background: '#FCE3F1', borderColor: '#F5B6D6', color: '#B40A6B', display: 'flex', justifyContent: 'space-between' }}>
            <span>{error}</span>
            <button onClick={() => setError(null)} style={{ color: '#B40A6B', fontWeight: 700 }}>✕</button>
          </div>
        )}

        {/* ── FASE 1 + 2: Ofertas ── */}
        <section>
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 14 }}>Fase 1 · Ofertas recibidas</h3>
          {ofertas.length === 0 ? (
            <p className="muted" style={{ fontSize: 13.5 }}>Este proyecto todavía no tiene ofertas.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {ofertas.map((o) => {
                const b = badgeOferta(o.estado);
                return (
                  <div key={o.id} className="card card-pad">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                      <span className="font-display" style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink-900)' }}>
                        {o.estudianteNombre}
                      </span>
                      <Pill {...b} />
                    </div>
                    <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--ink-700)', marginBottom: 12 }}>{o.propuesta}</p>

                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
                      {o.prototipoUrl && (
                        <a href={o.prototipoUrl} target="_blank" rel="noopener noreferrer" className="chip" style={{ cursor: 'pointer' }}>
                          Ver prototipo
                        </a>
                      )}
                      {o.documentacionUrl && (
                        <a href={o.documentacionUrl} target="_blank" rel="noopener noreferrer" className="chip" style={{ cursor: 'pointer' }}>
                          Ver documentación
                        </a>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', paddingTop: 12, borderTop: '1px solid var(--line-2)' }}>
                      <span className="muted" style={{ fontSize: 12.5 }}>Calificar:</span>
                      <StarRating
                        value={calOfertas[o.id] ?? 0}
                        onChange={(v) => setCalOfertas((prev) => ({ ...prev, [o.id]: v }))}
                        className="text-xl"
                      />
                      <div style={{ flex: 1 }} />
                      {o.estado === 'adjudicada' ? (
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#0E7A50' }}>✓ Adjudicada</span>
                      ) : o.estado === 'no_seleccionada' ? (
                        <span className="muted" style={{ fontSize: 13 }}>No seleccionada</span>
                      ) : (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => adjudicar(o.id)}
                          disabled={hayAdjudicada || estadoProyecto !== 'publicado' || cargando === o.id}
                          style={hayAdjudicada || estadoProyecto !== 'publicado' ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                        >
                          {cargando === o.id ? 'Adjudicando…' : 'Adjudicar'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── FASE 3: Entregables ── */}
        <section>
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 14 }}>Fase 3 · Entregables</h3>
          {entregables.length === 0 ? (
            <p className="muted" style={{ fontSize: 13.5 }}>
              Todavía no hay entregables. Aparecerán cuando el estudiante los suba.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {entregables.map((e) => {
                const b = badgeEntregable(e.estado);
                const titulo = `${e.tipo === 'final' ? 'Entregable final' : 'Hito'} · v${e.version}`;
                return (
                  <div key={e.id} className="card card-pad">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                      <div>
                        <span className="font-display" style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--ink-900)' }}>{titulo}</span>
                        <div>
                          <a href={e.archivoUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: 'var(--azul-700)', fontWeight: 600 }}>
                            Descargar
                          </a>
                        </div>
                      </div>
                      <Pill {...b} />
                    </div>

                    {e.estado === 'cambios_solicitados' && e.comentarioEmpresario && (
                      <div style={{ marginTop: 12, padding: '11px 13px', borderRadius: 'var(--r-sm)', background: '#FDEFDD', border: '1px solid #F3C98C', color: '#B96400', fontSize: 13 }}>
                        <span style={{ fontWeight: 700 }}>Tu comentario:</span> {e.comentarioEmpresario}
                      </div>
                    )}

                    {e.estado !== 'aprobado' && !cerrado && (
                      <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line-2)' }}>
                        {comentandoId === e.id ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <textarea
                              value={comentarioTexto}
                              onChange={(ev) => setComentarioTexto(ev.target.value)}
                              rows={3}
                              placeholder="Explicá qué cambios necesitás…"
                              style={{ width: '100%', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)', padding: '11px 13px', fontSize: 14, fontFamily: 'inherit' }}
                            />
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button className="btn btn-sm" style={{ background: 'var(--naranja)', color: '#fff' }} onClick={() => confirmarCambios(e.id)} disabled={cargando === e.id}>
                                {cargando === e.id ? 'Enviando…' : 'Enviar comentario'}
                              </button>
                              <button className="btn btn-ghost btn-sm" onClick={() => { setComentandoId(null); setComentarioTexto(''); }}>
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-sm" style={{ background: '#0E7A50', color: '#fff' }} onClick={() => aprobar(e.id)} disabled={cargando === e.id}>
                              Aprobar
                            </button>
                            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--naranja)' }} onClick={() => { setComentandoId(e.id); setComentarioTexto(''); setError(null); }}>
                              Solicitar cambios
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── FASE 4: Cierre ── */}
        <section className="card card-pad">
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 14 }}>Fase 4 · Cierre</h3>

          <p style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 8 }}>Calificación del estudiante</p>
          <StarRating value={calificacion} onChange={setCalificacion} readOnly={cerrado} />

          <div style={{ marginTop: 18 }}>
            {cerrado ? (
              <p style={{ fontWeight: 700, color: '#0E7A50' }}>✓ Proyecto cerrado</p>
            ) : (
              <>
                <button
                  className="btn btn-primary"
                  onClick={cerrar}
                  disabled={!finalAprobado || calificacion < 1 || cargando === 'cerrar'}
                  style={!finalAprobado || calificacion < 1 ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                >
                  {cargando === 'cerrar' ? 'Cerrando…' : 'Cerrar proyecto'}
                </button>
                {!finalAprobado && (
                  <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>
                    Para cerrar, primero tenés que aprobar el entregable final.
                  </p>
                )}
                {finalAprobado && calificacion < 1 && (
                  <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>
                    Calificá al estudiante (1 a 5 estrellas) para poder cerrar.
                  </p>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
