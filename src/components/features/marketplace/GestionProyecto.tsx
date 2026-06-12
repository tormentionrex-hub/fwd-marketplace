'use client';

import { useState } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import {
  IconSend,
  IconTrophy,
  IconLayers,
  IconFlag,
  IconCheck,
  IconCheckCircle,
  IconAlert,
  IconClock,
  IconEye,
  IconDownload,
  IconLink,
  IconFile,
  IconStar,
  IconMessage,
  IconChevR,
  IconX,
} from '@/components/ui/fwd-icons';

// ── Tipos planos que pasa la página (P14) ──────────────────────────────────────
type OfertaVM = {
  id: string;
  estudianteNombre: string;
  propuesta: string;
  prototipoUrl: string | null;
  documentacionUrl: string | null;
  estado: string;
  fechaEnvio: string;
  enviadoTexto: string | null;
};
type EntregableVM = {
  id: string;
  tipo: string;
  version: number;
  archivoUrl: string;
  estado: string;
  comentarioEmpresario: string | null;
  fecha: string;
  fechaTexto: string | null;
};
type Props = {
  proyecto: { id: string; titulo: string; estado: string };
  ofertasIniciales: OfertaVM[];
  entregablesIniciales: EntregableVM[];
  calificacionInicial: number;
};
type ChatMsg = { id: string; mio: boolean; texto: string; hora: string };

// ── Helpers ─────────────────────────────────────────────────────────────────
const AV_COLS = ['#008FD4', '#662D91', '#20BEC6', '#F7901E', '#EC008C', '#0469A0'];
function avColor(name: string): string {
  let s = 0;
  for (const c of name) s += c.charCodeAt(0);
  return AV_COLS[s % AV_COLS.length] ?? '#008FD4';
}
function iniciales(name: string): string {
  return (
    name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?'
  );
}

const FASES = [
  { id: 0, label: 'Recepción de ofertas' },
  { id: 1, label: 'Adjudicación' },
  { id: 2, label: 'Seguimiento' },
  { id: 3, label: 'Evaluación y cierre' },
];

const BADGE: Record<string, { cls: string; label: string }> = {
  publicado: { cls: 'publicado', label: 'Publicado' },
  en_desarrollo: { cls: 'en_desarrollo', label: 'En desarrollo' },
  cerrado: { cls: 'cerrado', label: 'Cerrado' },
  borrador: { cls: 'borrador', label: 'Borrador' },
};

const inputBox: React.CSSProperties = {
  width: '100%',
  border: '1px solid var(--line)',
  borderRadius: 'var(--r-sm)',
  padding: '11px 13px',
  fontSize: 14,
  color: 'var(--ink-900)',
  background: 'var(--surface)',
  outline: 'none',
  fontFamily: 'var(--font-body)',
};

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12.5,
        fontWeight: 500,
        padding: '5px 11px',
        borderRadius: 'var(--r-pill)',
        background: 'var(--bg-2)',
        color: 'var(--ink-600)',
      }}
    >
      {children}
    </span>
  );
}

function Avatar({ name, size = 42 }: { name: string; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        display: 'grid',
        placeItems: 'center',
        color: '#fff',
        background: avColor(name),
        fontFamily: 'var(--font-head)',
        fontWeight: 700,
        fontSize: size * 0.38,
      }}
    >
      {iniciales(name)}
    </div>
  );
}

function Estrellas({
  value,
  onChange,
  size = 19,
  readOnly = false,
}: {
  value: number;
  onChange?: (n: number) => void;
  size?: number;
  readOnly?: boolean;
}) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const on = n <= value;
        return (
          <button
            key={n}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(n)}
            aria-label={`${n} ${n === 1 ? 'estrella' : 'estrellas'}`}
            style={{ lineHeight: 0, cursor: readOnly ? 'default' : 'pointer' }}
          >
            <IconStar
              size={size}
              color={on ? 'var(--amarillo)' : 'var(--ink-300)'}
              fill={on ? 'var(--amarillo)' : 'none'}
            />
          </button>
        );
      })}
    </div>
  );
}

function Stepper({
  fase,
  setFase,
  faseActual,
}: {
  fase: number;
  setFase: (n: number) => void;
  faseActual: number;
}) {
  return (
    <div
      style={{
        display: 'flex',
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: 14,
        padding: 6,
        gap: 4,
        marginBottom: 24,
      }}
    >
      {FASES.map((f) => {
        const done = f.id < faseActual;
        const active = f.id === fase;
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => setFase(f.id)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 9,
              padding: '11px 8px',
              borderRadius: 10,
              transition: 'all .15s',
              background: active ? 'var(--azul-tint)' : 'transparent',
              color: active ? 'var(--azul-700)' : done ? 'var(--ink-700)' : 'var(--ink-400)',
            }}
          >
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: 50,
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                background: active ? 'var(--azul)' : done ? 'var(--turquesa)' : 'var(--bg-2)',
                color: active || done ? '#fff' : 'var(--ink-400)',
                fontFamily: 'var(--font-head)',
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              {done ? <IconCheck size={14} /> : f.id + 1}
            </span>
            <span style={{ fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: 13 }}>
              {f.label}
            </span>
          </button>
        );
      })}
    </div>
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

// ── Componente principal ────────────────────────────────────────────────────
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
  const [resena, setResena] = useState('');

  // Calificación por oferta (Fase 0): solo UI, no se persiste (no hay columna).
  const [calOfertas, setCalOfertas] = useState<Record<string, number>>({});

  const [aviso, setAviso] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState<string | null>(null);

  const [comentandoId, setComentandoId] = useState<string | null>(null);
  const [comentarioTexto, setComentarioTexto] = useState('');

  const hayAdjudicada = ofertas.some((o) => o.estado === 'adjudicada');
  const adjudicado = ofertas.find((o) => o.estado === 'adjudicada')?.estudianteNombre ?? null;
  const finalAprobado = entregables.some((e) => e.tipo === 'final' && e.estado === 'aprobado');
  const aprobados = entregables.filter((e) => e.estado === 'aprobado').length;
  const cerrado = estadoProyecto === 'cerrado';

  // Texto de la entrega más reciente, para "Última actividad" en el seguimiento.
  const ultimaActividad =
    entregables.reduce<EntregableVM | null>((max, e) => (!max || e.fecha > max.fecha ? e : max), null)
      ?.fechaTexto ?? null;

  const faseActual = cerrado ? 3 : hayAdjudicada || estadoProyecto === 'en_desarrollo' ? 2 : 0;
  const [fase, setFase] = useState(faseActual);

  // Chat (solo visual): mensajes locales con el estudiante adjudicado.
  const [chatAbierto, setChatAbierto] = useState(false);
  const [chatTexto, setChatTexto] = useState('');
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([
    { id: 'c1', mio: true, texto: '¡Hola! Bienvenido al proyecto. ¿Pudiste revisar los requerimientos?', hora: '09:14' },
    { id: 'c2', mio: false, texto: 'Hola, sí. Ya tengo el primer hito avanzado, lo subo hoy.', hora: '09:32' },
    { id: 'c3', mio: true, texto: 'Perfecto. Cualquier duda me escribís por acá.', hora: '09:35' },
  ]);
  function enviarChat() {
    if (!chatTexto.trim()) return;
    setChatMsgs((m) => [...m, { id: `m${m.length}`, mio: true, texto: chatTexto.trim(), hora: 'ahora' }]);
    setChatTexto('');
  }

  function ok(msg: string) {
    setAviso(msg);
    setError(null);
    router.refresh();
  }

  // ── Acciones funcionales (endpoints reales) ──
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
    setFase(2);
    ok('Proyecto adjudicado. Ahora está en desarrollo.');
  }

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

  async function confirmarCambios(id: string) {
    if (!comentarioTexto.trim())
      return setError('El comentario es obligatorio para solicitar cambios.');
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

  async function cerrar() {
    if (!finalAprobado || calificacion < 1) return;
    setCargando('cerrar');
    const r = await enviar(`/api/proyectos/${proyecto.id}/cerrar`, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ puntuacion: calificacion, comentario: resena.trim() || null }),
    });
    setCargando(null);
    if (!r.ok) return setError(r.error ?? 'No se pudo cerrar el proyecto.');
    setEstadoProyecto('cerrado');
    ok('Proyecto cerrado. Reseña publicada y reputación actualizada.');
  }

  const badge = BADGE[estadoProyecto] ?? { cls: 'publicado', label: estadoProyecto };

  return (
    <>
      <div className="topbar">
        <div>
          <div className="tb-title">Gestión del proyecto</div>
          <div className="tb-sub" style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
            {proyecto.titulo}
            <span className={`badge ${badge.cls}`}>
              <span className="bdot" />
              {badge.label}
            </span>
          </div>
        </div>
        <div className="tb-spacer" />
        <Link href="/empresario/proyectos" className="btn btn-ghost">
          <IconChevR size={15} style={{ transform: 'rotate(180deg)' }} />
          Volver
        </Link>
      </div>

      <div className="page page-wide fade-in">
        {aviso && (
          <div
            className="card card-pad"
            style={{ background: '#DEF5F6', borderColor: '#A7E3C2', color: '#0E7A80', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}
          >
            <span>{aviso}</span>
            <button onClick={() => setAviso(null)} aria-label="Cerrar" style={{ color: '#0E7A80', display: 'inline-flex' }}>
              <IconX size={16} />
            </button>
          </div>
        )}
        {error && (
          <div
            className="card card-pad"
            style={{ background: '#FCE3F1', borderColor: '#F5B6D6', color: '#B40A6B', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}
          >
            <span>{error}</span>
            <button onClick={() => setError(null)} aria-label="Cerrar" style={{ color: '#B40A6B', display: 'inline-flex' }}>
              <IconX size={16} />
            </button>
          </div>
        )}

        {/* Resumen del proyecto (datos reales) */}
        <div className="card card-pad" style={{ marginBottom: 22, display: 'flex', gap: 28, flexWrap: 'wrap' }}>
          {(
            [
              ['Ofertas', String(ofertas.length), IconSend],
              ['Entregables', String(entregables.length), IconLayers],
              ['Aprobados', String(aprobados), IconCheckCircle],
              ['Adjudicado a', adjudicado ?? '—', IconTrophy],
            ] as const
          ).map(([l, v, Ic]) => (
            <div key={l} style={{ display: 'flex', gap: 11, alignItems: 'center' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--bg)', display: 'grid', placeItems: 'center', color: 'var(--ink-500)' }}>
                <Ic size={18} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="muted" style={{ fontSize: 11.5 }}>{l}</div>
                <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 14.5, color: 'var(--ink-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>{v}</div>
              </div>
            </div>
          ))}
        </div>

        <Stepper fase={fase} setFase={setFase} faseActual={faseActual} />

        {/* ── Fase 0/1: Ofertas + adjudicación ── */}
        {(fase === 0 || fase === 1) && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '6px 0 16px' }}>
              <h3 style={{ fontSize: 17, fontWeight: 700 }}>
                {fase === 0 ? 'Ofertas recibidas — califica y compara' : 'Adjudicación — elige la mejor propuesta'}
              </h3>
              <span className="muted" style={{ fontSize: 13 }}>{ofertas.length} ofertas recibidas</span>
            </div>
            {ofertas.length === 0 ? (
              <div className="card card-pad muted" style={{ textAlign: 'center', padding: 40 }}>
                Este proyecto todavía no tiene ofertas.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {ofertas.map((o) => {
                  const adj = o.estado === 'adjudicada';
                  const descartada = o.estado === 'no_seleccionada';
                  const cal = calOfertas[o.id] ?? 0;
                  return (
                    <div
                      key={o.id}
                      className="card card-pad"
                      style={{ borderColor: adj ? 'var(--turquesa)' : 'var(--line)', borderWidth: adj ? 1.5 : 1 }}
                    >
                      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                        <Avatar name={o.estudianteNombre} size={46} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                            <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 15, color: 'var(--ink-900)' }}>{o.estudianteNombre}</span>
                            {adj && <span className="badge cerrado"><span className="bdot" />Adjudicada</span>}
                            {descartada && <span className="badge cancelado"><span className="bdot" />No seleccionada</span>}
                          </div>
                          {o.enviadoTexto && (
                            <div className="muted" style={{ fontSize: 12.5, marginTop: 3 }}>
                              Enviada {o.enviadoTexto}
                            </div>
                          )}
                        </div>
                      </div>
                      <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--ink-700)', margin: '14px 0' }}>{o.propuesta}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        {o.prototipoUrl && (
                          <a href={o.prototipoUrl} target="_blank" rel="noopener noreferrer">
                            <Chip>{o.prototipoUrl.startsWith('http') ? <IconLink size={13} /> : <IconFile size={13} />}Prototipo</Chip>
                          </a>
                        )}
                        {o.documentacionUrl && (
                          <a href={o.documentacionUrl} target="_blank" rel="noopener noreferrer">
                            <Chip><IconFile size={13} />Doc. técnica</Chip>
                          </a>
                        )}
                        <div style={{ flex: 1 }} />
                        {o.prototipoUrl && (
                          <a href={o.prototipoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                            <IconEye size={14} />Ver prototipo
                          </a>
                        )}
                        {!adj && !descartada && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => adjudicar(o.id)}
                            disabled={hayAdjudicada || estadoProyecto !== 'publicado' || cargando === o.id}
                            style={hayAdjudicada || estadoProyecto !== 'publicado' ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                          >
                            <IconTrophy size={14} />
                            {cargando === o.id ? 'Adjudicando…' : 'Adjudicar'}
                          </button>
                        )}
                      </div>
                      {/* Calificación de la oferta (RF-36, solo UI) */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 13, paddingTop: 13, borderTop: '1px solid var(--line-2)' }}>
                        <span className="muted" style={{ fontSize: 12.5, fontWeight: 500 }}>Tu calificación:</span>
                        <Estrellas
                          value={cal}
                          readOnly={adj || descartada}
                          onChange={(n) => setCalOfertas((prev) => ({ ...prev, [o.id]: n }))}
                        />
                        {cal > 0 && (
                          <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 12.5, color: 'var(--ink-600)' }}>{cal}/5</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Fase 2: Seguimiento de entregables ── */}
        {fase === 2 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '6px 0 16px' }}>
                <h3 style={{ fontSize: 17, fontWeight: 700 }}>Entregables e hitos</h3>
                <button className="btn btn-soft btn-sm" onClick={() => setChatAbierto(true)}>
                  <IconMessage size={14} />Abrir chat
                </button>
              </div>
              {entregables.length === 0 ? (
                <div className="card card-pad muted" style={{ textAlign: 'center', padding: 40 }}>
                  Todavía no hay entregables. Aparecerán cuando el estudiante los suba.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {entregables.map((e) => {
                    const meta =
                      e.estado === 'aprobado'
                        ? { Ic: IconCheckCircle, col: 'var(--turquesa)', lbl: 'Aprobado' }
                        : e.estado === 'cambios_solicitados'
                          ? { Ic: IconAlert, col: 'var(--naranja)', lbl: 'Con cambios' }
                          : { Ic: IconClock, col: 'var(--azul)', lbl: 'Enviado · pendiente de revisión' };
                    const titulo = `${e.tipo === 'final' ? 'Entregable final' : 'Hito'} · v${e.version}`;
                    return (
                      <div key={e.id} className="card card-pad">
                        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                          <div style={{ width: 40, height: 40, borderRadius: 11, background: `color-mix(in srgb, ${meta.col} 12%, transparent)`, display: 'grid', placeItems: 'center', flexShrink: 0, color: meta.col }}>
                            <meta.Ic size={20} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
                              <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 14.5, color: 'var(--ink-900)' }}>{titulo}</span>
                            </div>
                            <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
                              <span style={{ color: meta.col, fontWeight: 600, fontFamily: 'var(--font-head)' }}>{meta.lbl}</span>
                              {e.fechaTexto && <span className="muted">· {e.fechaTexto}</span>}
                            </div>
                            {e.estado === 'cambios_solicitados' && e.comentarioEmpresario && (
                              <p style={{ fontSize: 13, color: 'var(--ink-600)', marginTop: 9, lineHeight: 1.5, background: 'var(--bg)', padding: '9px 12px', borderRadius: 9 }}>
                                <strong>Tu comentario:</strong> {e.comentarioEmpresario}
                              </p>
                            )}
                          </div>
                          <a href={e.archivoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }}>
                            <IconDownload size={14} />
                          </a>
                        </div>

                        {e.estado !== 'aprobado' && !cerrado && (
                          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line-2)' }}>
                            {comentandoId === e.id ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <textarea
                                  value={comentarioTexto}
                                  onChange={(ev) => setComentarioTexto(ev.target.value)}
                                  rows={3}
                                  placeholder="Explicá qué cambios necesitás…"
                                  style={{ ...inputBox, resize: 'vertical', lineHeight: 1.5 }}
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
                                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--naranja)' }} onClick={() => { setComentandoId(e.id); setComentarioTexto(''); setError(null); }}>
                                  <IconAlert size={14} />Solicitar cambios
                                </button>
                                <button className="btn btn-sm" style={{ background: 'var(--turquesa)', color: '#fff' }} onClick={() => aprobar(e.id)} disabled={cargando === e.id}>
                                  <IconCheck size={15} />{cargando === e.id ? 'Aprobando…' : 'Aprobar entregable'}
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
            </div>

            {/* Sidebar seguimiento */}
            <div className="card card-pad">
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 16 }}>
                <Avatar name={adjudicado ?? 'Estudiante'} size={44} />
                <div>
                  <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 14.5 }}>{adjudicado ?? 'Sin adjudicar'}</div>
                  <div className="muted" style={{ fontSize: 12 }}>Estudiante adjudicado</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {(
                  [
                    ['Progreso', `${aprobados} de ${entregables.length} aprobados`],
                    ['Entregable final', finalAprobado ? 'Aprobado' : 'Pendiente'],
                    ['Última actividad', ultimaActividad ?? '—'],
                  ] as const
                ).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span className="muted">{k}</span>
                    <span style={{ fontWeight: 600, fontFamily: 'var(--font-head)', color: 'var(--ink-800)' }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ height: 8, background: 'var(--bg-2)', borderRadius: 9, marginTop: 16, overflow: 'hidden' }}>
                <div style={{ width: `${entregables.length ? Math.round((aprobados / entregables.length) * 100) : 0}%`, height: '100%', background: 'linear-gradient(90deg, var(--azul), var(--turquesa))', borderRadius: 9 }} />
              </div>
              <button className="btn btn-ghost btn-block" style={{ marginTop: 18 }} onClick={() => setChatAbierto(true)}>
                <IconMessage size={15} />Mensaje al estudiante
              </button>
            </div>
          </div>
        )}

        {/* ── Fase 3: Evaluación y cierre ── */}
        {fase === 3 && (
          <div style={{ maxWidth: 720 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, margin: '6px 0 16px' }}>Evaluación final y cierre</h3>
            <div className="card card-pad" style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', gap: 13, alignItems: 'center', padding: '4px 0 16px', borderBottom: '1px solid var(--line-2)', marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: finalAprobado ? '#DEF5F6' : 'var(--bg-2)', display: 'grid', placeItems: 'center', color: finalAprobado ? 'var(--turquesa)' : 'var(--ink-400)' }}>
                  {finalAprobado ? <IconCheckCircle size={21} /> : <IconClock size={21} />}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 14.5 }}>
                    {finalAprobado ? 'Entregable final aprobado' : 'Falta aprobar el entregable final'}
                  </div>
                  <div className="muted" style={{ fontSize: 12.5 }}>Requisito para poder cerrar el proyecto.</div>
                </div>
              </div>
              <label style={{ fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: 13.5, display: 'block', marginBottom: 10 }}>
                Califica el trabajo de {adjudicado ?? 'el estudiante'}
              </label>
              <div style={{ marginBottom: 18 }}>
                <Estrellas value={calificacion} onChange={setCalificacion} size={30} readOnly={cerrado} />
              </div>
              <label style={{ fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: 13, color: 'var(--ink-800)', display: 'block', marginBottom: 8 }}>Reseña pública</label>
              <textarea
                value={resena}
                onChange={(e) => setResena(e.target.value)}
                rows={3}
                disabled={cerrado}
                placeholder="Cuéntale a la comunidad cómo fue trabajar con este estudiante…"
                style={{ ...inputBox, resize: 'vertical', lineHeight: 1.5 }}
              />
            </div>

            <div className="card card-pad" style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--bg)' }}>
              <IconFlag size={22} color="var(--magenta)" />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 14 }}>Cerrar proyecto</div>
                <div className="muted" style={{ fontSize: 12.5 }}>Al cerrar, se publica tu reseña y se actualiza la reputación del estudiante.</div>
              </div>
              {cerrado ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#0E7A80', fontFamily: 'var(--font-head)' }}>
                  <IconCheckCircle size={17} />Cerrado
                </span>
              ) : (
                <button
                  className="btn btn-magenta"
                  onClick={cerrar}
                  disabled={!finalAprobado || calificacion < 1 || cargando === 'cerrar'}
                  style={!finalAprobado || calificacion < 1 ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                >
                  <IconFlag size={15} />
                  {cargando === 'cerrar' ? 'Cerrando…' : 'Cerrar y publicar reseña'}
                </button>
              )}
            </div>
            {!cerrado && !finalAprobado && (
              <p className="muted" style={{ fontSize: 13, marginTop: 10 }}>
                Para cerrar, primero tenés que aprobar el entregable final en la fase de seguimiento.
              </p>
            )}
            {!cerrado && finalAprobado && calificacion < 1 && (
              <p className="muted" style={{ fontSize: 13, marginTop: 10 }}>
                Calificá al estudiante (1 a 5 estrellas) para poder cerrar.
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Chat con el estudiante (solo visual) ── */}
      {chatAbierto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Chat del proyecto"
          onClick={() => setChatAbierto(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(12,27,51,.45)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <div
            className="card"
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 560, height: 'min(640px, 86vh)', display: 'flex', flexDirection: 'column', boxShadow: 'var(--sh-lg)', overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '14px 18px', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
              <Avatar name={adjudicado ?? 'Estudiante'} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 14 }}>{adjudicado ?? 'Estudiante'}</div>
                <div className="muted" style={{ fontSize: 11.5 }}>Mensajes del proyecto</div>
              </div>
              <button type="button" aria-label="Cerrar" onClick={() => setChatAbierto(false)} style={{ color: 'var(--ink-400)', display: 'inline-flex' }}>
                <IconX size={18} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 20, background: 'var(--bg)' }}>
              {chatMsgs.map((m) => (
                <div key={m.id} style={{ display: 'flex', gap: 10, flexDirection: m.mio ? 'row-reverse' : 'row', marginBottom: 16 }}>
                  <Avatar name={m.mio ? 'Tú' : (adjudicado ?? 'Estudiante')} size={32} />
                  <div style={{ maxWidth: '72%' }}>
                    <div
                      style={{
                        padding: '11px 14px',
                        borderRadius: 14,
                        fontSize: 14,
                        lineHeight: 1.5,
                        background: m.mio ? 'var(--azul)' : 'var(--surface)',
                        color: m.mio ? '#fff' : 'var(--ink-800)',
                        border: m.mio ? 'none' : '1px solid var(--line)',
                        borderTopLeftRadius: m.mio ? 14 : 4,
                        borderTopRightRadius: m.mio ? 4 : 14,
                      }}
                    >
                      {m.texto}
                    </div>
                    <div className="muted" style={{ fontSize: 11, marginTop: 4, textAlign: m.mio ? 'right' : 'left' }}>{m.hora}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: 14, borderTop: '1px solid var(--line)', display: 'flex', gap: 10, flexShrink: 0 }}>
              <input
                value={chatTexto}
                onChange={(e) => setChatTexto(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && enviarChat()}
                placeholder="Escribe un mensaje…"
                style={{ ...inputBox, flex: 1 }}
              />
              <button className="btn btn-primary" onClick={enviarChat} aria-label="Enviar">
                <IconSend size={17} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
