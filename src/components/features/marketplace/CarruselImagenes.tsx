'use client';

import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';

function cdnCalidad(url: string, ancho = 1200): string {
  if (!url.includes('res.cloudinary.com')) return url;
  if (url.includes('/upload/q_') || url.includes('/upload/f_')) return url;
  return url.replace('/upload/', `/upload/q_auto,f_auto,c_limit,w_${ancho}/`);
}

interface Props {
  imagenes: string[];
  titulo: string;
}

// ── Iconos SVG inline ────────────────────────────────────────────────────────
const IcoChevLeft = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);
const IcoChevRight = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 18l6-6-6-6" />
  </svg>
);
const IcoExpand = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
  </svg>
);
const IcoClose = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

export default function CarruselImagenes({ imagenes, titulo }: Props) {
  const [idx, setIdx]               = useState(0);
  const [hover, setHover]           = useState(false);
  const [modal, setModal]           = useState(false);
  const [modalIdx, setModalIdx]     = useState(0);
  const multiImg = imagenes.length > 1;

  // Navegación carrusel principal
  const prev = useCallback(() => {
    if (multiImg) setIdx((i) => (i === 0 ? imagenes.length - 1 : i - 1));
  }, [imagenes.length, multiImg]);

  const next = useCallback(() => {
    if (multiImg) setIdx((i) => (i === imagenes.length - 1 ? 0 : i + 1));
  }, [imagenes.length, multiImg]);

  // Navegación modal
  const mPrev = useCallback(() =>
    setModalIdx((i) => (i === 0 ? imagenes.length - 1 : i - 1)),
  [imagenes.length]);

  const mNext = useCallback(() =>
    setModalIdx((i) => (i === imagenes.length - 1 ? 0 : i + 1)),
  [imagenes.length]);

  function abrirModal() {
    setModalIdx(idx);
    setModal(true);
  }

  // REGLA #7 — bloquear scroll del body al abrir modal
  useEffect(() => {
    if (!modal) return;
    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    const ph = html.style.overflow;
    const pb = body.style.overflow;
    const pp = body.style.position;
    const pt = body.style.top;
    const pl = body.style.left;
    const pr = body.style.right;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    return () => {
      html.style.overflow = ph;
      body.style.overflow = pb;
      body.style.position = pp;
      body.style.top = pt;
      body.style.left = pl;
      body.style.right = pr;
      window.scrollTo(scrollX, scrollY);
    };
  }, [modal]);

  // Teclado: ← → navegan, Escape cierra
  useEffect(() => {
    if (!modal) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft')  mPrev();
      else if (e.key === 'ArrowRight') mNext();
      else if (e.key === 'Escape')     setModal(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modal, mPrev, mNext]);

  if (imagenes.length === 0) return null;

  const flechaCarrusel: React.CSSProperties = {
    width: 42, height: 42, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
    border: '1.5px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--text-muted)',
    boxShadow: '0 1px 5px rgba(0,0,0,0.10)',
    cursor: multiImg ? 'pointer' : 'default',
    opacity: multiImg ? 1 : 0.28,
    transition: 'background 0.15s, color 0.15s, box-shadow 0.15s',
  };

  return (
    <>
      {/* ── Carrusel ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
      >
        {/* Fila: [←] imagen [→] */}
        <div style={{ display: 'flex', alignItems: 'center' }}>

          {/* Flecha izquierda */}
          <div style={{ flexShrink: 0, width: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button
              type="button" onClick={prev} aria-label="Imagen anterior"
              style={flechaCarrusel}
              onMouseEnter={(e) => {
                if (!multiImg) return;
                e.currentTarget.style.background = 'var(--surface-2, #f1f5f9)';
                e.currentTarget.style.color = 'var(--text)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.14)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--surface)';
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.boxShadow = '0 1px 5px rgba(0,0,0,0.10)';
              }}
            >
              <IcoChevLeft />
            </button>
          </div>

          {/* Imagen principal — clicable, con zoom y badge */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Ver imagen en pantalla completa"
            onClick={abrirModal}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') abrirModal(); }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
              flex: 1, minWidth: 0,
              aspectRatio: '16/9',
              background: '#0c0f1a',
              overflow: 'hidden',
              position: 'relative',
              cursor: 'zoom-in',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={idx}
              src={cdnCalidad(imagenes[idx] ?? '', 1200)}
              alt={`${titulo} — imagen ${idx + 1}`}
              draggable={false}
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover', display: 'block',
                pointerEvents: 'none', userSelect: 'none',
                transition: 'transform 0.38s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                transform: hover ? 'scale(1.05)' : 'scale(1)',
              }}
            />

            {/* Overlay oscuro suave al hover */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute', inset: 0,
                background: hover ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0)',
                transition: 'background 0.35s ease',
                pointerEvents: 'none',
              }}
            />

            {/* Badge "Pantalla completa" — aparece al hover */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute', top: 12, right: 14,
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.93)',
                color: '#111',
                fontSize: 12, fontWeight: 700,
                padding: '6px 11px',
                borderRadius: 8,
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.16)',
                opacity: hover ? 1 : 0,
                transform: hover ? 'translateY(0)' : 'translateY(-6px)',
                transition: 'opacity 0.22s ease, transform 0.22s ease',
                pointerEvents: 'none',
                zIndex: 3,
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
              }}
            >
              <IcoExpand />
              Pantalla completa
            </div>
          </div>

          {/* Flecha derecha */}
          <div style={{ flexShrink: 0, width: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button
              type="button" onClick={next} aria-label="Siguiente imagen"
              style={flechaCarrusel}
              onMouseEnter={(e) => {
                if (!multiImg) return;
                e.currentTarget.style.background = 'var(--surface-2, #f1f5f9)';
                e.currentTarget.style.color = 'var(--text)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.14)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--surface)';
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.boxShadow = '0 1px 5px rgba(0,0,0,0.10)';
              }}
            >
              <IcoChevRight />
            </button>
          </div>
        </div>

        {/* Tira de miniaturas */}
        <div
          style={{
            display: 'flex', gap: 6,
            padding: '10px 14px 13px',
            background: 'var(--surface)',
            overflowX: 'auto',
            scrollbarWidth: 'none' as const,
          }}
        >
          {imagenes.map((url, i) => {
            const activa = i === idx;
            return (
              <button
                key={`thumb-${i}`}
                type="button"
                onClick={() => setIdx(i)}
                aria-label={`Ver imagen ${i + 1}`}
                aria-pressed={activa}
                style={{
                  flexShrink: 0, width: 92, height: 60,
                  borderRadius: 7, overflow: 'hidden',
                  border: activa ? '2.5px solid #008FD4' : '2.5px solid transparent',
                  cursor: 'pointer', padding: 0,
                  position: 'relative',
                  transition: 'border-color 0.18s',
                  background: '#111',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cdnCalidad(url, 220)}
                  alt="" aria-hidden="true" draggable={false}
                  style={{
                    width: '100%', height: '100%',
                    objectFit: 'cover', display: 'block',
                    pointerEvents: 'none', userSelect: 'none',
                  }}
                />
                {!activa && (
                  <div
                    aria-hidden="true"
                    style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(0,0,0,0.58)',
                      transition: 'opacity 0.2s ease',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Modal pantalla completa — renderizado en document.body via Portal ── */}
      {modal && createPortal(
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9900,
            background: '#000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}
          onWheel={(e) => e.stopPropagation()}
        >
          {/* Imagen ocupa toda la pantalla */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={modalIdx}
            src={cdnCalidad(imagenes[modalIdx] ?? '', 1800)}
            alt={`${titulo} — imagen ${modalIdx + 1}`}
            draggable={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          />

          {/* Botón cerrar — esquina superior derecha */}
          <button
            type="button"
            onClick={() => setModal(false)}
            aria-label="Cerrar pantalla completa"
            style={{
              position: 'absolute', top: 16, right: 16, zIndex: 9901,
              width: 46, height: 46, borderRadius: '50%',
              background: 'rgba(255,255,255,0.13)',
              border: '1.5px solid rgba(255,255,255,0.25)',
              color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.28)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.13)'; }}
          >
            <IcoClose />
          </button>

          {/* Flecha izquierda */}
          {multiImg && (
            <button
              type="button" onClick={mPrev} aria-label="Imagen anterior"
              style={{
                position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                zIndex: 9901, width: 52, height: 52, borderRadius: '50%',
                background: 'rgba(255,255,255,0.12)',
                border: '1.5px solid rgba(255,255,255,0.22)',
                color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s, transform 0.15s',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.26)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}

          {/* Flecha derecha */}
          {multiImg && (
            <button
              type="button" onClick={mNext} aria-label="Siguiente imagen"
              style={{
                position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                zIndex: 9901, width: 52, height: 52, borderRadius: '50%',
                background: 'rgba(255,255,255,0.12)',
                border: '1.5px solid rgba(255,255,255,0.22)',
                color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s, transform 0.15s',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.26)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
