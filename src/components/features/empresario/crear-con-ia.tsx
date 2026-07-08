'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { IconAlert, IconEdit } from '@/components/ui/fwd-icons';

type Pregunta = {
  texto: string;
  tipo: 'checkbox' | 'radio';
  opciones: string[];
};

type Contexto = { pregunta: string; respuestas: string[] };

type Paso = 'brief' | 'preguntas' | 'generando';

export default function CrearConIA({ nombre: _nombre }: { nombre: string }) {
  const router = useRouter();

  const [paso, setPaso] = useState<Paso>('brief');
  const [brief, setBrief] = useState('');
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [preguntaIdx, setPreguntaIdx] = useState(0);
  const [contexto, setContexto] = useState<Contexto[]>([]);
  const [seleccionadas, setSeleccionadas] = useState<string[]>([]);
  const [otroActivo, setOtroActivo] = useState(false);
  const [otroTexto, setOtroTexto] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // Loading inline: mientras se piden las preguntas a la IA el brief sigue visible
  const [cargandoPreguntas, setCargandoPreguntas] = useState(false);

  // Paso 1: enviar brief, pedir preguntas a la IA sin salir de la pantalla de brief
  async function enviarBrief() {
    const texto = brief.trim();
    if (!texto || cargandoPreguntas) return;
    setErrorMsg(null);
    setCargandoPreguntas(true);

    try {
      const res = await fetch('/api/proyectos/preguntas-ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief: texto }),
      });
      const data = (await res.json()) as { preguntas?: Pregunta[]; error?: string };

      if (res.ok && data.preguntas && data.preguntas.length > 0) {
        setPreguntas(data.preguntas);
        setPreguntaIdx(0);
        setContexto([]);
        setSeleccionadas([]);
        setOtroActivo(false);
        setOtroTexto('');
        setPaso('preguntas');
      } else {
        setErrorMsg(
          data.error ?? 'No pudimos generar las preguntas. Intenta de nuevo o redacta un brief mas detallado.',
        );
      }
    } catch {
      setErrorMsg('Error de conexion. Verifica tu internet e intenta de nuevo.');
    } finally {
      setCargandoPreguntas(false);
    }
  }

  // Toggle opcion — siempre checkbox: el empresario puede seleccionar todas las que quiera
  function toggleOpcion(opcion: string) {
    setSeleccionadas((prev) =>
      prev.includes(opcion) ? prev.filter((o) => o !== opcion) : [...prev, opcion],
    );
  }

  function toggleOtro() {
    if (otroActivo) setOtroTexto('');
    setOtroActivo((prev) => !prev);
  }

  // Avanzar a la siguiente pregunta o generar el proyecto
  function siguiente() {
    const pregunta = preguntas[preguntaIdx];
    if (!pregunta) return;

    const respuestasActuales = [...seleccionadas];
    if (otroActivo && otroTexto.trim()) {
      respuestasActuales.push(otroTexto.trim());
    }

    const nuevoContexto: Contexto[] = [
      ...contexto,
      { pregunta: pregunta.texto, respuestas: respuestasActuales },
    ];
    setContexto(nuevoContexto);

    if (preguntaIdx < preguntas.length - 1) {
      setPreguntaIdx((i) => i + 1);
      setSeleccionadas([]);
      setOtroActivo(false);
      setOtroTexto('');
    } else {
      generarProyecto(nuevoContexto);
    }
  }

  // Saltar la pregunta actual sin registrar respuesta
  function saltar() {
    if (preguntaIdx < preguntas.length - 1) {
      setPreguntaIdx((i) => i + 1);
      setSeleccionadas([]);
      setOtroActivo(false);
      setOtroTexto('');
    } else {
      generarProyecto(contexto);
    }
  }

  // Llamar a la IA para generar el proyecto y redirigir al formulario
  async function generarProyecto(ctx: Contexto[]) {
    setErrorMsg(null);
    setPaso('generando');

    try {
      const body: Record<string, unknown> = { brief: brief.trim() };
      const ctxFiltrado = ctx.filter((c) => c.respuestas.length > 0);
      if (ctxFiltrado.length > 0) body.contexto = ctxFiltrado;

      const res = await fetch('/api/proyectos/generar-ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { ok?: boolean; id?: string; error?: string };

      if (!res.ok || !data.id) {
        setPaso('brief');
        setErrorMsg(data.error ?? 'No pudimos estructurar tu proyecto. Intenta de nuevo.');
        return;
      }

      router.push(`/empresario/proyectos/${data.id}/editar`);
    } catch {
      setPaso('brief');
      setErrorMsg('Error de conexion. Verifica tu internet e intenta de nuevo.');
    }
  }

  const preguntaActual = preguntas[preguntaIdx];
  const haySeleccion = seleccionadas.length > 0 || otroActivo;

  // Estilo base para opciones de respuesta
  function estiloOpcion(activa: boolean): React.CSSProperties {
    return {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '14px 16px',
      border: `1.5px solid ${activa ? 'var(--azul)' : 'var(--line)'}`,
      borderRadius: 10,
      background: activa ? 'var(--azul-tint)' : 'var(--bg)',
      cursor: 'pointer',
      fontSize: 14,
      color: 'var(--ink-800)',
      userSelect: 'none',
      transition: 'border-color 0.15s, background 0.15s',
    };
  }

  return (
    <>
      <style>{`
        .fwd-app .tb-actions { right: calc(400px + 24px); top: 20px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes chatdot {
          0%, 80%, 100% { opacity: 0.25; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-4px); }
        }
        @keyframes fordyPiensa {
          0%, 100% { transform: translateY(0) rotate(-2.5deg); }
          50%      { transform: translateY(-12px) rotate(2.5deg); }
        }
        @keyframes fordyGlow {
          0%, 100% { filter: drop-shadow(0 10px 18px rgba(102,45,145,0.20)); }
          50%      { filter: drop-shadow(0 16px 26px rgba(0,143,212,0.30)); }
        }

        .crear-ia-container {
          display: grid;
          grid-template-columns: 1fr 400px;
          height: 100vh;
          overflow: hidden;
        }

        .crear-ia-left {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0 64px;
          background: var(--surface);
          position: relative;
          overflow-y: auto;
        }

        .crear-ia-right {
          background: #0f0c29;
          position: relative;
          overflow: hidden;
        }

        @media (max-width: 900px) {
          .crear-ia-container {
            grid-template-columns: 1fr;
          }
          .crear-ia-left {
            padding: 40px 20px;
            justify-content: flex-start;
          }
          .crear-ia-right {
            display: none;
          }
          .crear-ia-title {
            font-size: 32px !important;
          }
        }
      `}</style>

      <div className="crear-ia-container">
        {/* ─── Columna izquierda ─── */}
        <div className="crear-ia-left">

          {/* ── STEP: brief ── */}
          {paso === 'brief' && (
            <div style={{ maxWidth: 520 }}>
              <h1
                className="crear-ia-title"
                style={{
                  fontFamily: 'var(--font-head)',
                  fontWeight: 900,
                  fontSize: 48,
                  color: 'var(--ink-900)',
                  lineHeight: 1.1,
                  marginBottom: 16,
                  letterSpacing: '-0.5px',
                }}
              >
                Contanos que<br />
                necesitas{' '}
                <span style={{ color: 'var(--morado)' }}>resuelto.</span>
              </h1>

              <p
                style={{
                  fontSize: 15,
                  color: 'var(--ink-500)',
                  lineHeight: 1.65,
                  marginBottom: 28,
                }}
              >
                Te guiaremos para que crees el brief perfecto. Cuanto mas detallado, mejor.
              </p>

              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    enviarBrief();
                  }
                }}
                placeholder="Introduce algunos puntos clave o una descripcion completa."
                rows={5}
                style={{
                  width: '100%',
                  border: '1.5px solid var(--line)',
                  borderRadius: 10,
                  padding: '14px 16px',
                  fontSize: 14,
                  color: 'var(--ink-900)',
                  background: 'var(--bg)',
                  outline: 'none',
                  fontFamily: 'var(--font-body)',
                  lineHeight: 1.6,
                  resize: 'vertical',
                  marginBottom: 6,
                }}
              />

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginBottom: 20,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: brief.length > 1800 ? '#dc2626' : 'var(--ink-400)',
                  }}
                >
                  {brief.length} / 2000
                </span>
              </div>

              {errorMsg && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 9,
                    background: 'rgba(220,38,38,0.07)',
                    border: '1.5px solid rgba(220,38,38,0.25)',
                    borderRadius: 10,
                    padding: '10px 14px',
                    fontSize: 13,
                    color: '#dc2626',
                    fontWeight: 500,
                    marginBottom: 16,
                    lineHeight: 1.5,
                  }}
                >
                  <span style={{ flexShrink: 0, marginTop: 1 }}>
                    <IconAlert size={15} color="#dc2626" />
                  </span>
                  {errorMsg}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <button
                  className="btn btn-primary"
                  style={{ padding: '0 32px', height: 48, fontSize: 15, fontWeight: 700 }}
                  disabled={!brief.trim() || cargandoPreguntas}
                  onClick={enviarBrief}
                >
                  {cargandoPreguntas ? 'Preparando preguntas...' : 'Proximo'}
                </button>
                {/* Reintento rapido si la generacion fallo pero ya hay contexto */}
                {contexto.length > 0 && !cargandoPreguntas && (
                  <button
                    className="btn btn-ghost"
                    style={{ padding: '0 20px', height: 48, fontSize: 14 }}
                    onClick={() => generarProyecto(contexto)}
                  >
                    Reintentar generacion
                  </button>
                )}
                {!cargandoPreguntas && contexto.length === 0 && (
                  <span style={{ fontSize: 13, color: 'var(--ink-400)' }}>
                    Ctrl + Enter
                  </span>
                )}
              </div>

              {/* Loading inline: tres puntos mientras la IA genera las preguntas */}
              {cargandoPreguntas && (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 18 }}>
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: 'var(--morado)',
                        display: 'inline-block',
                        animation: `chatdot 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                  <span style={{ fontSize: 13, color: 'var(--ink-400)', marginLeft: 8 }}>
                    Fordy esta leyendo tu idea...
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ── STEP: preguntas ── */}
          {paso === 'preguntas' && preguntaActual && (
            <div style={{ maxWidth: 540 }}>

              {/* Brief en resumen + editar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  marginBottom: 32,
                  padding: '12px 14px',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  borderRadius: 10,
                }}
              >
                <p
                  style={{
                    flex: 1,
                    fontSize: 13,
                    color: 'var(--ink-600)',
                    fontStyle: 'italic',
                    lineHeight: 1.5,
                    margin: 0,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {brief}
                </p>
                <button
                  onClick={() => {
                    setPaso('brief');
                    setContexto([]);
                    setPreguntaIdx(0);
                  }}
                  title="Editar idea"
                  style={{
                    flexShrink: 0,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--ink-400)',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <IconEdit size={15} />
                </button>
              </div>

              {/* Pregunta + progreso */}
              <div style={{ marginBottom: 22 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: 10,
                  }}
                >
                  <h2
                    style={{
                      fontFamily: 'var(--font-head)',
                      fontWeight: 700,
                      fontSize: 20,
                      color: 'var(--ink-900)',
                      lineHeight: 1.3,
                      margin: 0,
                      flex: 1,
                      paddingRight: 16,
                    }}
                  >
                    {preguntaActual.texto}
                  </h2>
                  <span
                    style={{
                      fontSize: 13,
                      color: 'var(--ink-400)',
                      fontWeight: 500,
                      flexShrink: 0,
                    }}
                  >
                    {preguntaIdx + 1} de {preguntas.length}
                  </span>
                </div>
              </div>

              {/* Opciones — siempre checkbox, el empresario elige las que quiera */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {preguntaActual.opciones.map((opcion) => {
                  const activa = seleccionadas.includes(opcion);
                  return (
                    <div
                      key={opcion}
                      style={estiloOpcion(activa)}
                      onClick={() => toggleOpcion(opcion)}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 5,
                          border: `2px solid ${activa ? 'var(--azul)' : 'var(--ink-300)'}`,
                          background: activa ? 'var(--azul)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          transition: 'all 0.15s',
                        }}
                      >
                        {activa && (
                          <div
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: 2,
                              background: '#fff',
                            }}
                          />
                        )}
                      </div>
                      {opcion}
                    </div>
                  );
                })}

                {/* Otro (especifique) */}
                <div>
                  <div
                    style={estiloOpcion(otroActivo)}
                    onClick={toggleOtro}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 5,
                        border: `2px solid ${otroActivo ? 'var(--azul)' : 'var(--ink-300)'}`,
                        background: otroActivo ? 'var(--azul)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.15s',
                      }}
                    >
                      {otroActivo && (
                        <div
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: 2,
                            background: '#fff',
                          }}
                        />
                      )}
                    </div>
                    Otro (especifique)
                  </div>

                  {otroActivo && (
                    <input
                      type="text"
                      value={otroTexto}
                      onChange={(e) => setOtroTexto(e.target.value)}
                      placeholder="Especifica aqui..."
                      autoFocus
                      style={{
                        width: '100%',
                        marginTop: 8,
                        border: '1.5px solid var(--azul)',
                        borderRadius: 8,
                        padding: '10px 14px',
                        fontSize: 14,
                        color: 'var(--ink-900)',
                        background: 'var(--bg)',
                        outline: 'none',
                        fontFamily: 'var(--font-body)',
                        boxSizing: 'border-box',
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Botones de accion */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                <button
                  className="btn btn-primary"
                  style={{ padding: '0 32px', height: 46, fontSize: 15, fontWeight: 700 }}
                  onClick={siguiente}
                >
                  {preguntaIdx < preguntas.length - 1 ? 'Proximo' : 'Generar proyecto'}
                </button>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '0 20px', height: 46 }}
                  onClick={saltar}
                >
                  Saltar
                </button>
              </div>

              <button
                onClick={() => generarProyecto(contexto)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontSize: 13,
                  color: 'var(--azul)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textUnderlineOffset: 3,
                }}
              >
                Utilice mi descripcion anterior
              </button>

              {/* No se usa de la lógica pero hay un chek de seleccion opcional */}
              {!haySeleccion && (
                <p style={{ fontSize: 12, color: 'var(--ink-400)', marginTop: 12 }}>
                  Selecciona una o mas opciones, o salta si no aplica.
                </p>
              )}
            </div>
          )}

          {/* ── Overlay de generacion ── */}
          {paso === 'generando' && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(244,246,251,0.92)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 20,
                zIndex: 10,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/imagenes/fordy/fordy-cv.png"
                alt="Fordy analizando tu proyecto"
                style={{
                  width: 180,
                  height: 180,
                  objectFit: 'contain',
                  animation:
                    'fordyPiensa 2.6s ease-in-out infinite, fordyGlow 2.6s ease-in-out infinite',
                }}
              />
              <div style={{ textAlign: 'center', maxWidth: 300 }}>
                <p
                  style={{
                    fontFamily: 'var(--font-head)',
                    fontWeight: 800,
                    fontSize: 22,
                    color: 'var(--ink-900)',
                    marginBottom: 10,
                  }}
                >
                  Haciendolo realidad...
                </p>
                <p style={{ fontSize: 14, color: 'var(--ink-500)', lineHeight: 1.6 }}>
                  Fordy esta estructurando tu proyecto con todo lo que nos contaste.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ─── Columna derecha: video de Fordy ─── */}
        <div className="crear-ia-right">
          <video
            src="/videos/lv_0_20260616153411.mp4"
            autoPlay
            loop
            muted
            playsInline
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center center',
              transform: 'scale(1.1)',
              transformOrigin: 'center center',
            }}
          />
        </div>
      </div>
    </>
  );
}
