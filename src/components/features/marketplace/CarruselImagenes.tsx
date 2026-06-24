'use client';

import { useState, useCallback } from 'react';
import { IconChevR } from '@/components/ui/fwd-icons';

function cdnCalidad(url: string, ancho = 1200): string {
  if (!url.includes('res.cloudinary.com')) return url;
  if (url.includes('/upload/q_') || url.includes('/upload/f_')) return url;
  return url.replace('/upload/', `/upload/q_auto,f_auto,c_limit,w_${ancho}/`);
}

interface Props {
  imagenes: string[];
  titulo: string;
}

export default function CarruselImagenes({ imagenes, titulo }: Props) {
  const [idx, setIdx] = useState(0);

  const prev = useCallback(() => setIdx((i) => (i === 0 ? imagenes.length - 1 : i - 1)), [imagenes.length]);
  const next = useCallback(() => setIdx((i) => (i === imagenes.length - 1 ? 0 : i + 1)), [imagenes.length]);

  if (imagenes.length === 0) return null;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
    >
      {/* Titulo de seccion */}
      <div className="flex items-center gap-3 px-7 pt-6 pb-4">
        <span
          className="w-1 h-6 rounded-full flex-shrink-0"
          style={{ background: 'linear-gradient(180deg, #20BEC6, #008FD4)' }}
        />
        <h2 className="font-heading font-black text-lg text-text">Imagenes del proyecto</h2>
        <span
          className="ml-auto text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
        >
          {idx + 1} / {imagenes.length}
        </span>
      </div>

      {/* Imagen principal */}
      <div className="relative" style={{ aspectRatio: '16/9', background: '#0e1628' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={idx}
          src={cdnCalidad(imagenes[idx] ?? '', 1200)}
          alt={`${titulo} — imagen ${idx + 1}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />

        {/* Overlay sutil en bordes */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 40%)' }}
        />

        {/* Botones de navegacion — solo si hay mas de 1 imagen */}
        {imagenes.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Imagen anterior"
              style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                width: 38, height: 38, borderRadius: '50%',
                background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
                backdropFilter: 'blur(4px)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.8)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.55)'; }}
            >
              <span style={{ display: 'flex', transform: 'rotate(180deg)' }}><IconChevR size={18} /></span>
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Siguiente imagen"
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                width: 38, height: 38, borderRadius: '50%',
                background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
                backdropFilter: 'blur(4px)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.8)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.55)'; }}
            >
              <IconChevR size={18} />
            </button>
          </>
        )}
      </div>

      {/* Miniaturas — solo si hay mas de 1 */}
      {imagenes.length > 1 && (
        <div style={{ display: 'flex', gap: 8, padding: '12px 20px 16px', overflowX: 'auto' }}>
          {imagenes.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setIdx(i)}
              aria-label={`Ver imagen ${i + 1}`}
              style={{
                flexShrink: 0,
                width: 72,
                height: 48,
                borderRadius: 8,
                overflow: 'hidden',
                border: i === idx ? '2px solid var(--azul, #008FD4)' : '2px solid transparent',
                cursor: 'pointer',
                padding: 0,
                transition: 'border-color 0.15s',
                opacity: i === idx ? 1 : 0.6,
              }}
              onMouseEnter={(e) => { if (i !== idx) e.currentTarget.style.opacity = '0.85'; }}
              onMouseLeave={(e) => { if (i !== idx) e.currentTarget.style.opacity = '0.6'; }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cdnCalidad(url, 160)}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
