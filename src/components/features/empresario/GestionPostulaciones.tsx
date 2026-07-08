'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { IconUsers, IconExternalLink } from '@/components/ui/fwd-icons';
import {
  ESTADO_POSTULACION_META,
  ESTADOS_POSTULACION_EMPRESA,
  type PostulanteDTO,
  type EstadoPostulacionEmpresa,
} from '@/types/vacante';

interface Props {
  postulantes: PostulanteDTO[];
  locale: string;
}

const ACCIONES: { estado: EstadoPostulacionEmpresa; label: string }[] = [
  { estado: 'en_revision', label: 'En revisión' },
  { estado: 'aceptado', label: 'Aceptar' },
  { estado: 'rechazado', label: 'Rechazar' },
];

export default function GestionPostulaciones({ postulantes }: Props) {
  const router = useRouter();
  const [ocupada, setOcupada] = useState<string | null>(null);

  const cambiar = async (id: string, estado: EstadoPostulacionEmpresa) => {
    setOcupada(id);
    const res = await fetch(`/api/postulaciones/${id}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    });
    setOcupada(null);
    if (res.ok) router.refresh();
    else alert('No se pudo actualizar la postulación');
  };

  if (postulantes.length === 0) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--ink-400)' }}>
        <IconUsers size={40} />
        <p style={{ marginTop: 12, fontSize: 15, fontWeight: 600, color: 'var(--ink-600)' }}>Aún no hay postulantes</p>
        <p style={{ fontSize: 13, marginTop: 4 }}>Cuando alguien se postule a esta vacante, aparecerá aquí.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {postulantes.map((p) => {
        const meta = ESTADO_POSTULACION_META[p.estado];
        const busy = ocupada === p.id;
        const inicial = p.estudiante.nombre.charAt(0).toUpperCase();
        return (
          <div
            key={p.id}
            style={{
              border: '1.5px solid var(--line)', borderRadius: 12, padding: '18px 20px',
              display: 'flex', flexDirection: 'column', gap: 14, opacity: busy ? 0.6 : 1,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              { }
              {p.estudiante.imageUrl ? (
                <img src={p.estudiante.imageUrl} alt={p.estudiante.nombre}
                  style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <span style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--azul)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, flexShrink: 0 }}>
                  {inicial}
                </span>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink-900)' }}>{p.estudiante.nombre}</div>
                {p.estudiante.tituloProfesional && (
                  <div style={{ fontSize: 13, color: 'var(--ink-500)' }}>{p.estudiante.tituloProfesional}</div>
                )}
                <div style={{ fontSize: 12, color: 'var(--ink-400)', marginTop: 2 }}>
                  Postuló el {new Date(p.fecha).toLocaleDateString('es-CR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11.5, fontWeight: 700, background: `${meta.color}18`, color: meta.color, flexShrink: 0 }}>
                {meta.label}
              </span>
            </div>

            <p style={{ fontSize: 13.5, color: 'var(--ink-700)', lineHeight: 1.6, whiteSpace: 'pre-line', margin: 0 }}>
              {p.mensaje}
            </p>

            {p.cvUrl && (
              <a href={p.cvUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--azul)', textDecoration: 'none', width: 'fit-content' }}>
                <IconExternalLink size={14} /> Ver CV
              </a>
            )}

            {/* Acciones de estado */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', borderTop: '1px solid var(--line)', paddingTop: 12 }}>
              {ACCIONES.map(({ estado, label }) => {
                const activo = p.estado === estado;
                const c = ESTADO_POSTULACION_META[estado].color;
                return (
                  <button
                    key={estado}
                    onClick={() => cambiar(p.id, estado)}
                    disabled={busy || activo}
                    style={{
                      padding: '7px 16px', borderRadius: 8, fontSize: 12.5, fontWeight: 700,
                      border: `1.5px solid ${c}`, cursor: busy || activo ? 'default' : 'pointer',
                      background: activo ? c : `${c}12`, color: activo ? '#fff' : c,
                      opacity: busy ? 0.6 : 1,
                    }}
                  >
                    {activo ? `${label} ✓`.replace(' ✓', '') : label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
