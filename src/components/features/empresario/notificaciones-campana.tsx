'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import {
  IconBell,
  IconBriefcase,
  IconCheckCircle,
  IconMail,
  IconSend,
  IconTrophy,
  IconUpload,
} from '@/components/ui/fwd-icons';
import type { NotificacionDTO, NotificacionesPayload } from '@/types/notificacion';

const POLL_MS = 30_000;

// tipo de notificación -> icono + color de marca (tokens del .fwd-app).
// Alineado con el feed de actividad: oferta/magenta, entrega/naranja, cierre/turquesa.
function metaTipo(tipo: string): { Icon: ComponentType<{ size?: number }>; color: string } {
  const t = (tipo ?? '').toLowerCase();
  if (t.includes('entrega')) return { Icon: IconUpload, color: 'var(--naranja)' };
  if (t.includes('oferta')) return { Icon: IconSend, color: 'var(--magenta)' };
  if (t.includes('cierre') || t.includes('cerrad') || t.includes('evaluac')) return { Icon: IconCheckCircle, color: 'var(--turquesa)' };
  if (t.includes('logro') || t.includes('reputa') || t.includes('adjudic')) return { Icon: IconTrophy, color: 'var(--naranja)' };
  if (t.includes('mensaje') || t.includes('chat') || t.includes('empresar')) return { Icon: IconMail, color: 'var(--morado)' };
  if (t.includes('oportun') || t.includes('proyecto')) return { Icon: IconBriefcase, color: 'var(--azul)' };
  return { Icon: IconBell, color: 'var(--azul)' };
}

function tiempoRelativo(iso: string): string {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (min < 1) return 'ahora';
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return `hace ${d} d`;
}

// Campana del topbar (panel empresario): dropdown con las notificaciones reales
// del usuario. Usa GET /api/notificaciones (+ polling) y PATCH .../read.
export default function NotificacionesCampana() {
  const [items, setItems] = useState<NotificacionDTO[]>([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [estado, setEstado] = useState<'loading' | 'ready' | 'error'>('loading');
  const [abierto, setAbierto] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const res = await fetch('/api/notificaciones', { cache: 'no-store' });
      if (!res.ok) {
        setEstado('error');
        return;
      }
      const data: NotificacionesPayload = await res.json();
      setItems(data.notificaciones);
      setNoLeidas(data.noLeidas);
      setEstado('ready');
    } catch {
      setEstado('error');
    }
  }, []);

  useEffect(() => {
    cargar();
    const t = setInterval(cargar, POLL_MS);
    return () => clearInterval(t);
  }, [cargar]);

  // Cierra con Escape mientras el dropdown está abierto.
  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [abierto]);

  async function marcarLeidas() {
    setNoLeidas(0);
    setItems((prev) => prev.map((n) => ({ ...n, leida: true })));
    await fetch('/api/notificaciones/read', { method: 'PATCH' }).catch(() => {});
    cargar();
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        className="tb-icon"
        aria-label="Notificaciones"
        aria-haspopup="menu"
        aria-expanded={abierto}
        onClick={() => setAbierto((v) => !v)}
      >
        <IconBell size={18} />
        {noLeidas > 0 && (
          <span
            aria-hidden
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              minWidth: 16,
              height: 16,
              padding: '0 4px',
              borderRadius: 'var(--r-pill)',
              background: 'var(--magenta)',
              color: '#fff',
              border: '2px solid var(--bg)',
              fontFamily: 'var(--font-head)',
              fontWeight: 700,
              fontSize: 10,
              lineHeight: 1,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {abierto && (
        <>
          {/* Captura clics fuera para cerrar */}
          <div
            onClick={() => setAbierto(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 19 }}
          />
          <div
            role="menu"
            className="card"
            style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 10px)',
              width: 360,
              maxHeight: 460,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              zIndex: 20,
              boxShadow: '0 12px 32px rgba(12,27,51,.16)',
            }}
          >
            <div
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid var(--line)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span className="font-display" style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink-900)' }}>
                Notificaciones
              </span>
              {noLeidas > 0 && (
                <span
                  className="font-display"
                  style={{
                    minWidth: 19,
                    height: 19,
                    padding: '0 6px',
                    borderRadius: 'var(--r-pill)',
                    background: 'var(--azul)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 11,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {noLeidas}
                </span>
              )}
              <div style={{ flex: 1 }} />
              {noLeidas > 0 && (
                <button
                  type="button"
                  onClick={marcarLeidas}
                  className="font-display"
                  style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--azul-700)', background: 'none', border: 'none', padding: 0 }}
                >
                  Marcar leídas
                </button>
              )}
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {estado === 'loading' ? (
                <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{ height: 14, borderRadius: 7, background: 'var(--bg-2)' }}
                    />
                  ))}
                </div>
              ) : estado === 'error' ? (
                <p className="muted" style={{ padding: '22px 16px', fontSize: 13 }}>
                  No pudimos cargar tus notificaciones.
                </p>
              ) : items.length === 0 ? (
                <p className="muted" style={{ padding: '26px 16px', fontSize: 13, textAlign: 'center' }}>
                  No tenés notificaciones por ahora.
                </p>
              ) : (
                items.map((n, i) => {
                  const { Icon, color } = metaTipo(n.tipo);
                  return (
                    <div
                      key={n.id}
                      style={{
                        display: 'flex',
                        gap: 11,
                        padding: '11px 14px',
                        borderTop: i ? '1px solid var(--line-2)' : 'none',
                        background: n.leida ? 'transparent' : 'color-mix(in srgb, var(--azul) 5%, transparent)',
                      }}
                    >
                      <span
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 9,
                          flexShrink: 0,
                          display: 'grid',
                          placeItems: 'center',
                          background: `color-mix(in srgb, ${color} 13%, transparent)`,
                          color,
                        }}
                      >
                        <Icon size={16} />
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            lineHeight: 1.45,
                            color: n.leida ? 'var(--ink-600)' : 'var(--ink-800)',
                            fontWeight: n.leida ? 400 : 500,
                          }}
                        >
                          {n.mensaje}
                        </div>
                        <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>
                          {tiempoRelativo(n.creado)}
                        </div>
                      </div>
                      {!n.leida && (
                        <span
                          aria-hidden
                          style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--azul)', marginTop: 6, flexShrink: 0 }}
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
