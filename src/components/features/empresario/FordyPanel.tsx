'use client';

import { useState } from 'react';

export default function FordyPanel() {
  const [activo, setActivo] = useState(false);

  return (
    <div
      style={{
        width: 300,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        borderRadius: 16,
        border: activo
          ? '2px solid var(--azul)'
          : '2px solid var(--line)',
        overflow: 'hidden',
        background: 'var(--surface)',
        transition: 'border-color 0.25s',
        alignSelf: 'flex-start',
        position: 'sticky',
        top: 24,
      }}
    >
      {/* Zona reservada para imagen de Fordy */}
      <div
        style={{
          height: 180,
          background: activo
            ? 'linear-gradient(135deg, #0a2a4e 0%, #008FD4 60%, #20BEC6 100%)'
            : 'linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          position: 'relative',
          transition: 'background 0.4s',
        }}
      >
        {/* Placeholder imagen — reemplazar con <Image> cuando esté lista */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            border: '2.5px dashed rgba(255,255,255,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.06)',
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="4" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </div>
        <span
          style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          Imagen de Fordy
        </span>

        {/* Badge de estado */}
        {activo && (
          <div
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'rgba(32,190,198,0.9)',
              color: '#fff',
              fontSize: 10.5,
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 20,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            Activo
          </div>
        )}
      </div>

      {/* Contenido del panel */}
      <div style={{ padding: '20px 20px 22px' }}>
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: 'var(--ink-900)',
              marginBottom: 4,
            }}
          >
            Fordy
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-500)', lineHeight: 1.5 }}>
            {activo
              ? 'Fordy esta listo para sugerirte mejoras en tu proyecto mientras lo completás.'
              : 'Activa las sugerencias de Fordy para recibir ayuda inteligente mientras creás tu proyecto.'}
          </div>
        </div>

        {/* Zona de sugerencias (solo visible cuando activo) */}
        {activo && (
          <div
            style={{
              background: 'rgba(0,143,212,0.06)',
              border: '1.5px solid rgba(0,143,212,0.18)',
              borderRadius: 10,
              padding: '12px 14px',
              marginBottom: 14,
              fontSize: 12.5,
              color: 'var(--ink-600)',
              lineHeight: 1.6,
              minHeight: 64,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--azul)',
                flexShrink: 0,
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
            <span style={{ color: 'var(--ink-500)', fontStyle: 'italic' }}>
              Las sugerencias apareceran aqui...
            </span>
          </div>
        )}

        {/* Toggle */}
        <button
          type="button"
          onClick={() => setActivo((v) => !v)}
          style={{
            width: '100%',
            padding: '11px 16px',
            borderRadius: 10,
            border: activo
              ? '1.5px solid rgba(220,38,38,0.3)'
              : '1.5px solid var(--azul)',
            background: activo
              ? 'rgba(220,38,38,0.06)'
              : 'var(--azul)',
            color: activo ? '#dc2626' : '#fff',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          {/* Icono encendido/apagado inline */}
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {activo ? (
              <>
                <path d="M18.36 6.64A9 9 0 0 1 12 21 9 9 0 0 1 3 12c0-3.49 1.99-6.52 4.93-8.07" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </>
            ) : (
              <>
                <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </>
            )}
          </svg>
          {activo ? 'Desactivar sugerencias de Fordy' : 'Activar sugerencias de Fordy'}
        </button>

        {activo && (
          <p
            style={{
              marginTop: 10,
              fontSize: 11,
              color: 'var(--ink-400)',
              textAlign: 'center',
              lineHeight: 1.4,
            }}
          >
            Podés desactivarlo en cualquier momento sin perder tu avance.
          </p>
        )}
      </div>
    </div>
  );
}
