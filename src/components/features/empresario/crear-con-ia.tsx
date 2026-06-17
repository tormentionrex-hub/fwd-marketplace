'use client';

import { useEffect, useRef, useState } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import {
  IconSpark,
  IconSend,
  IconFile,
  IconCheck,
  IconFlag,
  IconChevD,
  IconCode,
  IconPlus,
  IconAlert,
  IconEdit,
  IconX,
  IconComunidad,
} from '@/components/ui/fwd-icons';

// CREAR CON IA (Página 13) — VISUAL / DEMO. Reproduce el asistente del diseño FWD
// (chat guiado -> propuesta estructurada) pero NO crea proyectos reales: es una
// maqueta navegable. La creación real la conecta el equipo de IA.

type Msg = { rol: 'ia' | 'user'; texto: string };

const SALUDO =
  '¡Hola! Soy tu asistente para publicar un proyecto. Contame en tus palabras qué necesitás construir y te ayudo a estructurarlo. ¿Qué problema querés resolver?';

const GUION: { ia: string; sug?: string[]; genera?: boolean }[] = [
  {
    ia: 'Perfecto. ¿Quiénes van a usar la herramienta y qué deberían poder hacer? (por ejemplo: un administrador, un cliente, un supervisor…)',
    sug: ['Un administrador y un supervisor de flota', 'Solo mi equipo interno'],
  },
  {
    ia: '¡Muy claro! ¿A qué área de negocio pertenece esta solución? Esto ayuda a que el estudiante indicado la encuentre.',
    sug: ['Logística', 'Operaciones', 'Servicio al cliente'],
  },
  {
    ia: 'Genial. Una última cosa: ¿cuántos días querés dejar abierta la recepción de ofertas? Puede ser entre 5 y 15 días.',
    sug: ['10 días', '7 días', '15 días'],
  },
  {
    ia: 'Listo. Con eso ya tengo lo necesario para estructurar tu proyecto. Generé la propuesta a la derecha — revisala, editá lo que quieras y publicala cuando estés lista.',
    genera: true,
  },
];

const SUG_INICIAL = ['Una app para rastrear mi flota de reparto en tiempo real', 'Quiero un dashboard de ventas'];

const PROPUESTA = {
  titulo: 'App de seguimiento de flota en tiempo real',
  resumen:
    'Aplicación web para monitorear vehículos de reparto en tiempo real, con mapa en vivo, alertas de desvío de ruta y reportes de entrega.',
  area: 'Logística',
  plazo: '10 días',
  requerimientos: [
    'Mapa en vivo con posición de cada vehículo',
    'Alertas de desvío de ruta en tiempo real',
    'Panel de reportes: entregas completadas, tiempos, incidencias',
    'Roles: administrador de flota y supervisor',
    'Exportar reportes a PDF/CSV',
  ],
  tecnologias: ['React', 'Mapbox', 'WebSockets', 'Node'],
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

function Burbuja({ m, inicial }: { m: Msg; inicial: string }) {
  const ia = m.rol === 'ia';
  return (
    <div style={{ display: 'flex', gap: 11, flexDirection: ia ? 'row' : 'row-reverse', marginBottom: 18 }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: 'grid', placeItems: 'center', background: ia ? 'var(--morado)' : 'var(--azul)' }}>
        {ia ? (
          <IconSpark size={17} color="var(--amarillo)" />
        ) : (
          <span style={{ color: '#fff', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 13 }}>{inicial}</span>
        )}
      </div>
      <div
        style={{
          maxWidth: '78%',
          padding: '12px 15px',
          borderRadius: 14,
          lineHeight: 1.55,
          fontSize: 14,
          background: ia ? 'var(--surface)' : 'var(--azul)',
          color: ia ? 'var(--ink-800)' : '#fff',
          border: ia ? '1px solid var(--line)' : 'none',
          borderTopLeftRadius: ia ? 4 : 14,
          borderTopRightRadius: ia ? 14 : 4,
        }}
      >
        {m.texto}
      </div>
    </div>
  );
}

function EditField({ label, value, multi }: { label: string; value: string; multi?: boolean }) {
  const [v, setV] = useState(value);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <label style={{ fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: 13, color: 'var(--ink-800)' }}>{label}</label>
      {multi ? (
        <textarea value={v} onChange={(e) => setV(e.target.value)} style={{ ...inputBox, minHeight: 72, resize: 'vertical', lineHeight: 1.5 }} />
      ) : (
        <input value={v} onChange={(e) => setV(e.target.value)} style={inputBox} />
      )}
    </div>
  );
}

export default function CrearConIA({ nombre }: { nombre: string }) {
  const router = useRouter();
  const inicial = (nombre.trim()[0] ?? 'E').toUpperCase();
  const [msgs, setMsgs] = useState<Msg[]>([{ rol: 'ia', texto: SALUDO }]);
  const [step, setStep] = useState(0);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState('');
  const [generado, setGenerado] = useState(false);
  const [publicado, setPublicado] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, typing]);

  function enviar(texto: string) {
    if (!texto.trim() || typing || step >= GUION.length) return;
    setMsgs((m) => [...m, { rol: 'user', texto }]);
    setInput('');
    const turno = GUION[step];
    if (!turno) return;
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { rol: 'ia', texto: turno.ia }]);
      if (turno.genera) setGenerado(true);
      setStep((s) => s + 1);
    }, 1100);
  }

  const sugActuales = step < GUION.length ? (step === 0 ? SUG_INICIAL : GUION[step]?.sug ?? null) : null;
  const completado = step >= GUION.length;

  function publicar() {
    setPublicado(true);
    window.setTimeout(() => router.push('/empresario/proyectos'), 1300);
  }

  return (
    <>
      <div className="topbar">
        <div>
          <div className="tb-title">Crear proyecto con IA</div>
          <div className="tb-sub">El asistente te ayuda a estructurar y publicar tu proyecto</div>
        </div>
        <div className="tb-spacer" />
        <Link href="/empresario" className="btn btn-ghost">
          <IconX size={16} />
          Cancelar
        </Link>
      </div>

      <div className="page page-wide fade-in" style={{ paddingTop: 22 }}>
        {/* Aviso: demo visual */}
        <div
          className="card"
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', marginBottom: 18, background: 'var(--azul-tint)', borderColor: 'var(--azul-tint2)', color: 'var(--azul-700)' }}
        >
          <IconAlert size={16} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>
            Demostración visual del asistente — todavía no crea proyectos reales.
          </span>
        </div>

        <div className="crear-con-ia-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 440px', gap: 24, alignItems: 'start', height: 'calc(100vh - 230px)', minHeight: 480 }}>
          {/* Columna chat */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--morado)', display: 'grid', placeItems: 'center' }}>
                <IconSpark size={15} color="var(--amarillo)" />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 14 }}>Asistente FWD</div>
                <div className="muted" style={{ fontSize: 11.5 }}>Te hace preguntas para estructurar el proyecto</div>
              </div>
            </div>

            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '22px 20px', background: 'var(--bg)' }}>
              {msgs.map((m, i) => (
                <Burbuja key={i} m={m} inicial={inicial} />
              ))}
              {typing && (
                <div style={{ display: 'flex', gap: 11, marginBottom: 18 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--morado)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <IconSpark size={17} color="var(--amarillo)" />
                  </div>
                  <div style={{ padding: '15px 16px', borderRadius: 14, borderTopLeftRadius: 4, background: 'var(--surface)', border: '1px solid var(--line)', display: 'flex', gap: 5 }}>
                    {[0, 1, 2].map((i) => (
                      <span key={i} style={{ width: 7, height: 7, borderRadius: 50, background: 'var(--ink-300)' }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: '14px 16px', borderTop: '1px solid var(--line)' }}>
              {sugActuales && !typing && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 11, flexWrap: 'wrap' }}>
                  {sugActuales.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => enviar(s)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 500, padding: '6px 11px', borderRadius: 'var(--r-pill)', background: 'var(--azul-tint)', color: 'var(--azul-700)', cursor: 'pointer' }}
                    >
                      <IconPlus size={13} />
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      enviar(input);
                    }
                  }}
                  placeholder={completado ? 'Conversación completada — revisá la propuesta' : 'Escribe tu respuesta…'}
                  disabled={completado}
                  style={{ ...inputBox, minHeight: 46, maxHeight: 110, resize: 'none', flex: 1 }}
                />
                <button className="btn btn-primary" style={{ height: 46, padding: '0 16px' }} disabled={!input.trim() || completado} onClick={() => enviar(input)}>
                  <IconSend size={17} />
                </button>
              </div>
              <div className="muted" style={{ fontSize: 11, marginTop: 8, textAlign: 'center', display: 'inline-flex', gap: 5, alignItems: 'center', width: '100%', justifyContent: 'center' }}>
                <IconAlert size={12} /> El agente nunca publica solo. Vos revisás y confirmás.
              </div>
            </div>
          </div>

          {/* Columna propuesta */}
          <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 9 }}>
              <IconFile size={17} color="var(--azul)" />
              <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 14 }}>Propuesta de proyecto</span>
              {generado && (
                <span className="badge publicado" style={{ marginLeft: 'auto' }}>
                  <span className="bdot" />
                  Borrador
                </span>
              )}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
              {!generado ? (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 16, padding: 20 }}>
                  <IconComunidad size={72} />
                  <div>
                    <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 15, color: 'var(--ink-700)' }}>Aún no hay propuesta</div>
                    <p className="muted" style={{ fontSize: 13, marginTop: 6, lineHeight: 1.5, maxWidth: 250 }}>
                      Respondé las preguntas del asistente y acá aparecerá tu proyecto estructurado, listo para revisar.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <EditField label="Título del proyecto" value={PROPUESTA.titulo} />
                  <EditField label="Resumen" value={PROPUESTA.resumen} multi />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      <label style={{ fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: 13, color: 'var(--ink-800)' }}>Área de negocio</label>
                      <div style={{ ...inputBox, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ display: 'inline-flex', gap: 7, alignItems: 'center', fontSize: 13.5 }}>
                          <span style={{ width: 9, height: 9, borderRadius: 50, background: 'var(--azul)' }} />
                          {PROPUESTA.area}
                        </span>
                        <IconChevD size={15} color="var(--ink-400)" />
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      <label style={{ fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: 13, color: 'var(--ink-800)' }}>Recepción de ofertas</label>
                      <div style={{ ...inputBox, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13.5 }}>{PROPUESTA.plazo}</span>
                        <span className="muted" style={{ fontSize: 11.5 }}>rango 5–15</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: 13, color: 'var(--ink-800)', display: 'block', marginBottom: 9 }}>Requerimientos</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {PROPUESTA.requerimientos.map((r, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', background: 'var(--bg)', borderRadius: 10, fontSize: 13, lineHeight: 1.45, color: 'var(--ink-700)' }}>
                          <span style={{ color: 'var(--turquesa)', flexShrink: 0, marginTop: 2, display: 'inline-flex' }}>
                            <IconCheck size={15} />
                          </span>
                          {r}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: 13, color: 'var(--ink-800)', display: 'block', marginBottom: 9 }}>
                      Tecnologías sugeridas <span className="muted" style={{ fontWeight: 400 }}>(por IA)</span>
                    </label>
                    <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                      {PROPUESTA.tecnologias.map((t) => (
                        <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 500, padding: '5px 11px', borderRadius: 'var(--r-pill)', background: 'var(--bg-2)', color: 'var(--ink-600)' }}>
                          <IconCode size={12} />
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {generado && (
              <div style={{ padding: 16, borderTop: '1px solid var(--line)', display: 'flex', gap: 10 }}>
                <button className="btn btn-ghost">
                  <IconEdit size={15} />
                  Editar
                </button>
                <button className="btn btn-primary btn-block" disabled={publicado} onClick={publicar}>
                  {publicado ? (
                    <>
                      <IconCheck size={16} />
                      Publicado
                    </>
                  ) : (
                    <>
                      <IconFlag size={15} />
                      Publicar proyecto
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
