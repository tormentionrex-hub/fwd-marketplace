'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { calcularEstadoContacto, type EstadoContacto } from '@/lib/tiempoRespuesta';
import { detectarLenguajeOfensivo } from '@/lib/moderacionMensajes';
import { GRUPOS_EMOJI, emojiDeCodepoints } from '@/lib/emojisChat';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  nombre: string;
  /** Foto de perfil de la empresa (usuarios.image_url) o null → inicial. */
  fotoUrl?: string | null | undefined;
  color: string;
  /** ID del proyecto (para crear/recuperar la conversación). */
  idProyecto: string;
  /** Locale activo (para el enlace de iniciar sesión). */
  locale: string;
  /** País del dueño del proyecto (aún no persistido en la cuenta). */
  pais?: string | undefined;
}

interface MensajeServidor {
  id: string;
  mio: boolean;
  contenido: string | null;
  documentUrl: string | null;
  leido: boolean;
  creado: string;
}

type Acceso = 'cargando' | 'ok' | 'login' | 'solo_estudiantes' | 'es_dueno' | 'error';

const LIMITE = 2500;

// ── Iconos SVG inline (REGLA #6: nada de emojis en la UI del producto) ────────
const IcoMoon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);
const IcoSun = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);
const IcoClose = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);
const IcoSmile = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
);
const IcoClip = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);
const IcoSend = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
  </svg>
);
const IcoAlerta = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export default function ChatModal({ abierto, onCerrar, nombre, fotoUrl, color, idProyecto, locale, pais }: Props) {
  const [texto, setTexto] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [grupoEmoji, setGrupoEmoji] = useState(0);
  const [estado, setEstado] = useState<EstadoContacto | null>(null);

  const [acceso, setAcceso] = useState<Acceso>('cargando');
  const [chatId, setChatId] = useState<string | null>(null);
  const [mensajes, setMensajes] = useState<MensajeServidor[]>([]);
  const [enviando, setEnviando] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  // Proyecto cuyo chat ya resolvimos: evita re-resetear (y vaciar) la conversación
  // al reabrir la MISMA burbuja. Solo re-consultamos si cambia el proyecto.
  const proyectoResueltoRef = useRef<string | null>(null);

  const ofensivo = detectarLenguajeOfensivo(texto).ofensivo;

  // Estado de contacto (zona horaria) al abrir; refresca cada minuto.
  useEffect(() => {
    if (!abierto) return;
    setEstado(calcularEstadoContacto(nombre, pais));
    const t = setInterval(() => setEstado(calcularEstadoContacto(nombre, pais)), 60_000);
    return () => clearInterval(t);
  }, [abierto, nombre, pais]);

  // Escape cierra el modal.
  useEffect(() => {
    if (!abierto) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { setEmojiOpen(false); onCerrar(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [abierto, onCerrar]);

  // Al abrir: crear/recuperar la conversación con el empresario.
  // Solo reseteamos y re-consultamos en la 1ª apertura (o si cambia el proyecto).
  // Al reabrir la MISMA burbuja conservamos chatId y mensajes para que la
  // conversación aparezca de una; el polling de abajo los mantiene al día.
  useEffect(() => {
    if (!abierto) return;
    if (proyectoResueltoRef.current === idProyecto) return;

    let cancelado = false;
    setAcceso('cargando');
    setChatId(null);
    setMensajes([]);
    (async () => {
      try {
        const res = await fetch('/api/chats/iniciar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idProyecto, crear: false }),
        });
        if (cancelado) return;
        if (res.status === 401) { setAcceso('login'); return; }
        if (res.status === 403) { setAcceso('solo_estudiantes'); return; }
        if (res.status === 409) { setAcceso('es_dueno'); return; }
        if (!res.ok) { setAcceso('error'); return; }
        const data = await res.json();
        if (cancelado) return;
        setChatId(data.chatId);
        setAcceso('ok');
        proyectoResueltoRef.current = idProyecto; // marca este proyecto como resuelto
      } catch {
        if (!cancelado) setAcceso('error');
      }
    })();
    return () => { cancelado = true; };
  }, [abierto, idProyecto]);

  // Cargar mensajes + polling cada 4s (pausado cuando la pestaña está oculta).
  useEffect(() => {
    if (!abierto || !chatId) return;
    let cancelado = false;
    async function cargar() {
      try {
        const res = await fetch(`/api/chats/${chatId}/mensajes`);
        if (!res.ok || cancelado) return;
        const data = await res.json();
        if (!cancelado && Array.isArray(data.mensajes)) setMensajes(data.mensajes);
      } catch { /* reintenta en el próximo tick */ }
    }
    cargar();
    const t = setInterval(() => { if (!document.hidden) cargar(); }, 4000);
    return () => { cancelado = true; clearInterval(t); };
  }, [abierto, chatId]);

  // Auto-scroll al final al cargar/agregar mensajes.
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [mensajes, acceso]);

  if (!abierto) return null;

  // El chat aparece de inmediato al abrir: mostramos el composer y las sugerencias
  // sin esperar. La verificación de acceso corre en segundo plano y solo estos
  // estados reemplazan la conversación (no logueado, rol inválido, dueño, error).
  const bloqueado =
    acceso === 'login' ||
    acceso === 'solo_estudiantes' ||
    acceso === 'es_dueno' ||
    acceso === 'error';
  const conversacionVisible = !bloqueado; // cubre 'cargando' y 'ok'

  const puedeEnviar =
    conversacionVisible && texto.trim().length > 0 && !ofensivo && !enviando;

  function insertarEmoji(cps: number[]) {
    const emoji = emojiDeCodepoints(cps);
    setTexto((t) => (t + emoji).slice(0, LIMITE));
    textareaRef.current?.focus();
  }

  // Clic en una sugerencia = enviar esa sugerencia directamente (no rellena el
  // textarea, así nunca se envía "de más" al escribir tu propio mensaje).
  function usarSugerencia(s: string) {
    void enviarContenido(s);
  }

  // Envía un contenido cualquiera (tu texto o una sugerencia). Devuelve si se envió.
  async function enviarContenido(raw: string): Promise<boolean> {
    const contenido = raw.trim();
    if (!contenido || detectarLenguajeOfensivo(contenido).ofensivo || enviando || bloqueado) {
      return false;
    }
    setEnviando(true);
    try {
      // La conversación se crea recién al enviar el primer mensaje (sin chats fantasma).
      let id = chatId;
      if (!id) {
        const resInit = await fetch('/api/chats/iniciar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idProyecto, crear: true }),
        });
        if (!resInit.ok) return false;
        const dataInit = await resInit.json();
        id = (dataInit.chatId as string | null) ?? null;
        if (id) setChatId(id);
      }
      if (!id) return false;

      const res = await fetch(`/api/chats/${id}/mensajes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenido }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.mensaje) {
          const nuevo = data.mensaje as MensajeServidor;
          // Evita clave duplicada: un poll pudo traer ya este mensaje del servidor
          // antes de que resolviera el POST. Solo lo agregamos si aún no está.
          setMensajes((m) => (m.some((x) => x.id === nuevo.id) ? m : [...m, nuevo]));
        }
        return true;
      }
      return false;
    } catch { return false; /* el próximo poll reconciliará */ }
    finally { setEnviando(false); }
  }

  // Enviar lo escrito en el textarea.
  async function enviar() {
    const ok = await enviarContenido(texto);
    if (ok) { setTexto(''); setEmojiOpen(false); }
  }

  const inicial = nombre.charAt(0).toUpperCase();
  const activo = estado?.activo ?? false;
  const dotColor = activo ? '#22c55e' : '#9ca3af';

  const sugerencias = [
    `Hola ${nombre}, ¿podés ayudarme con...?`,
    `¿Podrías proporcionarnos más información sobre este proyecto?`,
    `¿Crees que puedes entregar un pedido para una fecha determinada?`,
  ];

  return createPortal(
    <div
      className="fwd-chat-panel"
      role="dialog"
      aria-label={`Chat con ${nombre}`}
      onWheel={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        left: 16,
        bottom: 16,
        zIndex: 9500,
        width: 'min(410px, calc(100vw - 32px))',
        height: 'min(650px, calc(100vh - 32px))',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 18,
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.28), 0 4px 14px rgba(0,0,0,0.14)',
      }}
    >
      {/* Encabezado oscuro con hora local del contacto */}
      <div
        style={{
          display: 'flex', alignItems: 'flex-start', gap: 9,
          background: '#0e1628', color: 'rgba(255,255,255,0.92)',
          padding: '11px 16px', fontSize: 12.5, lineHeight: 1.4,
        }}
      >
        <span style={{ marginTop: 1, flexShrink: 0, opacity: 0.85 }}>
          {estado?.esNoche ? <IcoMoon /> : <IcoSun />}
        </span>
        <span>{estado?.notaHeader ?? `Consultando disponibilidad de ${nombre}...`}</span>
      </div>

      {/* Sub-encabezado: avatar + nombre + estado + cerrar */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 14px', borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div
            style={{
              width: 44, height: 44, borderRadius: '50%', overflow: 'hidden',
              background: fotoUrl ? 'var(--surface-2, #e2e8f0)' : `linear-gradient(135deg, ${color}, ${color}bb)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 18, color: '#fff',
            }}
          >
            {fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fotoUrl} alt={nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              inicial
            )}
          </div>
          <span
            title={activo ? 'Activo ahora' : 'Desconectado'}
            style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 12, height: 12, borderRadius: '50%',
              background: dotColor, border: '2.5px solid var(--surface)',
            }}
          />
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)', lineHeight: 1.2 }}>
            Mensaje {nombre}
          </p>
          <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
            {estado ? `${estado.lejania} · Tiempo de respuesta promedio: ${estado.respuestaPromedio}` : 'Calculando disponibilidad...'}
          </p>
        </div>

        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar chat"
          style={{
            flexShrink: 0, width: 34, height: 34, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-2, #f1f5f9)'; e.currentTarget.style.color = 'var(--text)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <IcoClose />
        </button>
      </div>

      {/* Cuerpo scrollable */}
      <div
        ref={bodyRef}
        style={{
          flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain',
          padding: '16px 16px 8px',
        }}
      >
        {acceso === 'login' && (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600, marginBottom: 6 }}>
              Iniciá sesión para escribir
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
              Necesitás una cuenta de estudiante para contactar a la empresa.
            </p>
            <a
              href={`/${locale}/login`}
              style={{
                display: 'inline-block', padding: '10px 20px', borderRadius: 999,
                background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                color: '#fff', fontWeight: 800, fontSize: 13.5, textDecoration: 'none',
              }}
            >
              Iniciar sesión
            </a>
          </div>
        )}

        {acceso === 'solo_estudiantes' && (
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', textAlign: 'center', marginTop: 24, lineHeight: 1.55 }}>
            Solo los estudiantes pueden escribirle a la empresa desde el marketplace.
          </p>
        )}

        {acceso === 'es_dueno' && (
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', textAlign: 'center', marginTop: 24, lineHeight: 1.55 }}>
            Este es tu proyecto. No podés iniciar un chat con vos mismo.
          </p>
        )}

        {acceso === 'error' && (
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', textAlign: 'center', marginTop: 24, lineHeight: 1.55 }}>
            No pudimos abrir el chat. Cerrá el panel y volvé a intentarlo.
          </p>
        )}

        {conversacionVisible && mensajes.length === 0 && (
          <>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: 16 }}>
              Hazle una pregunta a {nombre} o comparte los detalles de tu proyecto
              (requisitos, cronograma, presupuesto, etc.).
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {sugerencias.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => usarSugerencia(s)}
                  style={{
                    textAlign: 'left', width: '100%',
                    padding: '11px 15px', borderRadius: 999,
                    border: '1px solid var(--border)', background: 'var(--surface)',
                    color: 'var(--text)', fontSize: 13, fontWeight: 500,
                    cursor: 'pointer', lineHeight: 1.35,
                    transition: 'background 0.15s, border-color 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-2, #f1f5f9)'; e.currentTarget.style.borderColor = `${color}55`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  {s}
                </button>
              ))}
            </div>
          </>
        )}

        {conversacionVisible && mensajes.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {mensajes.map((m) => (
              <div key={m.id} style={{ display: 'flex', justifyContent: m.mio ? 'flex-end' : 'flex-start' }}>
                <div
                  style={{
                    maxWidth: '82%',
                    background: m.mio ? `linear-gradient(135deg, ${color}, ${color}cc)` : 'var(--surface-2, #f1f5f9)',
                    color: m.mio ? '#fff' : 'var(--text)',
                    padding: '9px 13px',
                    borderRadius: m.mio ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    fontSize: 13.5, lineHeight: 1.45, wordBreak: 'break-word',
                  }}
                >
                  {m.contenido && <span style={{ whiteSpace: 'pre-wrap' }}>{m.contenido}</span>}
                  {m.documentUrl && (
                    <a
                      href={m.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6, marginTop: m.contenido ? 8 : 0,
                        color: m.mio ? '#fff' : color, fontSize: 12.5, fontWeight: 600, textDecoration: 'underline',
                      }}
                    >
                      <IcoClip />
                      Ver archivo adjunto
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Composer — visible apenas se abre el chat (la verificación va en segundo plano) */}
      {conversacionVisible && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '10px 12px 12px', position: 'relative' }}>

          {/* Aviso de lenguaje ofensivo */}
          {ofensivo && (
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                border: '1px solid rgba(239,68,68,0.3)', borderRadius: 9,
                padding: '7px 11px', fontSize: 12, fontWeight: 600, marginBottom: 9,
              }}
            >
              <IcoAlerta />
              Este mensaje contiene lenguaje ofensivo o agresivo. Edítalo para poder enviarlo.
            </div>
          )}

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={texto}
            onChange={(e) => setTexto(e.target.value.slice(0, LIMITE))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(); }
            }}
            maxLength={LIMITE}
            rows={2}
            placeholder="Escribe tu mensaje..."
            style={{
              width: '100%', resize: 'none', border: 'none', outline: 'none',
              background: 'transparent', color: 'var(--text)', fontSize: 14,
              lineHeight: 1.5, fontFamily: 'inherit', minHeight: 44, maxHeight: 130,
            }}
          />

          {/* Contador */}
          <div style={{ textAlign: 'right', fontSize: 11, color: texto.length >= LIMITE ? '#ef4444' : 'var(--text-muted)', marginTop: 2 }}>
            {texto.length}/{LIMITE}
          </div>

          {/* Barra de acciones */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {/* Emoji */}
              <button
                type="button"
                onClick={() => setEmojiOpen((v) => !v)}
                aria-label="Insertar emoji"
                style={{
                  width: 36, height: 36, borderRadius: 9, border: 'none',
                  background: emojiOpen ? 'var(--surface-2, #f1f5f9)' : 'transparent',
                  color: emojiOpen ? color : 'var(--text-muted)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => { if (!emojiOpen) e.currentTarget.style.background = 'var(--surface-2, #f1f5f9)'; }}
                onMouseLeave={(e) => { if (!emojiOpen) e.currentTarget.style.background = 'transparent'; }}
              >
                <IcoSmile />
              </button>

              {/* Adjuntar archivo — próximo incremento */}
              <button
                type="button"
                disabled
                aria-label="Adjuntar archivo (disponible próximamente)"
                title="Los archivos adjuntos llegan en el próximo paso"
                style={{
                  width: 36, height: 36, borderRadius: 9, border: 'none',
                  background: 'transparent', color: 'var(--text-muted)', cursor: 'not-allowed',
                  opacity: 0.45,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <IcoClip />
              </button>
            </div>

            {/* Enviar */}
            <button
              type="button"
              onClick={enviar}
              disabled={!puedeEnviar}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '9px 18px', borderRadius: 999, border: 'none',
                fontSize: 13.5, fontWeight: 800,
                cursor: puedeEnviar ? 'pointer' : 'not-allowed',
                color: puedeEnviar ? '#fff' : 'var(--text-muted)',
                background: puedeEnviar ? `linear-gradient(135deg, ${color}, ${color}cc)` : 'var(--surface-2, #eef1f5)',
                transition: 'filter 0.15s, transform 0.1s',
              }}
              onMouseEnter={(e) => { if (puedeEnviar) e.currentTarget.style.filter = 'brightness(1.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; }}
            >
              <IcoSend />
              {enviando ? 'Enviando...' : 'Enviar mensaje'}
            </button>
          </div>

          {/* Popover de emojis */}
          {emojiOpen && (
            <div
              style={{
                position: 'absolute', bottom: 56, left: 12,
                width: 300, background: 'var(--surface)',
                border: '1px solid var(--border)', borderRadius: 14,
                boxShadow: '0 12px 40px rgba(0,0,0,0.22)', overflow: 'hidden', zIndex: 5,
              }}
            >
              {/* Tabs de grupos */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
                {GRUPOS_EMOJI.map((g, i) => (
                  <button
                    key={g.nombre}
                    type="button"
                    onClick={() => setGrupoEmoji(i)}
                    style={{
                      flex: 1, padding: '8px 4px', border: 'none', cursor: 'pointer',
                      background: grupoEmoji === i ? 'var(--surface-2, #f1f5f9)' : 'transparent',
                      color: grupoEmoji === i ? color : 'var(--text-muted)',
                      fontSize: 11, fontWeight: 700,
                      borderBottom: grupoEmoji === i ? `2px solid ${color}` : '2px solid transparent',
                    }}
                  >
                    {g.nombre}
                  </button>
                ))}
              </div>
              {/* Grilla */}
              <div
                style={{
                  display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)',
                  gap: 2, padding: 8, maxHeight: 190, overflowY: 'auto',
                }}
              >
                {GRUPOS_EMOJI[grupoEmoji]?.puntos.map((cps, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => insertarEmoji(cps)}
                    style={{
                      fontSize: 22, lineHeight: 1, padding: 6, borderRadius: 8,
                      border: 'none', background: 'transparent', cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-2, #f1f5f9)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    {emojiDeCodepoints(cps)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>,
    document.body,
  );
}
