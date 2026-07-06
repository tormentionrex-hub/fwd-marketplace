'use client';

import { useEffect, useState } from 'react';
import { calcularEstadoContacto, type EstadoContacto } from '@/lib/tiempoRespuesta';
import ChatModal from './ChatModal';

interface Props {
  nombre: string;
  color: string;
  /** ID del proyecto (para crear/recuperar la conversación). */
  idProyecto: string;
  /** Locale activo (para enlaces como iniciar sesión). */
  locale: string;
  /** País del dueño del proyecto (aún no persistido en la cuenta). */
  pais?: string | undefined;
}

export default function ChatBurbuja({ nombre, color, idProyecto, locale, pais }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [estado, setEstado] = useState<EstadoContacto | null>(null);

  // Calcular disponibilidad en el cliente (evita desajuste de hidratación).
  useEffect(() => {
    setEstado(calcularEstadoContacto(nombre, pais));
    const t = setInterval(() => setEstado(calcularEstadoContacto(nombre, pais)), 60_000);
    return () => clearInterval(t);
  }, [nombre, pais]);

  const activo = estado?.activo ?? false;
  const dotColor = activo ? '#22c55e' : '#9ca3af';
  const subtitulo = estado
    ? `${estado.lejania} · Tiempo de respuesta promedio: ${estado.respuestaPromedio}`
    : 'Consultando disponibilidad...';

  return (
    <>
      {/* No mostrar la burbuja mientras el chat está abierto */}
      {!abierto && (
        <div
          role="button"
          tabIndex={0}
          aria-label={`Abrir chat con ${nombre}`}
          onClick={() => setAbierto(true)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setAbierto(true); } }}
          style={{
            position: 'fixed',
            bottom: 28,
            left: 28,
            zIndex: 9000,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 999,
            padding: '8px 22px 8px 8px',
            boxShadow: '0 6px 32px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.08)',
            cursor: 'pointer',
            transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s',
            userSelect: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.04)';
            e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 6px 32px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.08)';
          }}
        >
          {/* Avatar con inicial */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${color}, ${color}bb)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: 19,
                color: '#fff',
              }}
            >
              {nombre.charAt(0).toUpperCase()}
            </div>

            {/* Punto de estado — verde = activo, gris = desconectado */}
            <div
              title={activo ? 'Activo ahora' : 'Desconectado'}
              style={{
                position: 'absolute',
                bottom: 1,
                right: 1,
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: dotColor,
                border: '2.5px solid var(--surface)',
              }}
            />
          </div>

          {/* Texto */}
          <div style={{ minWidth: 0 }}>
            <p style={{
              fontWeight: 800,
              fontSize: 13,
              color: 'var(--text)',
              lineHeight: 1.25,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 220,
            }}>
              Mensaje {nombre}
            </p>
            <p style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              marginTop: 2,
              whiteSpace: 'nowrap',
            }}>
              {subtitulo}
            </p>
          </div>
        </div>
      )}

      <ChatModal
        abierto={abierto}
        onCerrar={() => setAbierto(false)}
        nombre={nombre}
        color={color}
        idProyecto={idProyecto}
        locale={locale}
        pais={pais}
      />
    </>
  );
}
