'use client';

import { useState } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { IconBriefcase, IconUsers, IconEdit, IconTrash } from '@/components/ui/fwd-icons';
import { ESTADO_VACANTE_META, type VacanteEmpresarioDTO, type EstadoVacante } from '@/types/vacante';
import { labelModalidad, labelTipoEmpleo } from '@/lib/vacante-format';

interface Props {
  vacantes: VacanteEmpresarioDTO[];
}

export default function VacantesLista({ vacantes }: Props) {
  const router = useRouter();
  const [ocupada, setOcupada] = useState<string | null>(null);

  const publicar = async (id: string) => {
    setOcupada(id);
    const res = await fetch(`/api/vacantes/${id}/publicar`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    setOcupada(null);
    if (res.ok) router.refresh();
    else alert('No se pudo publicar la vacante');
  };

  const cambiarEstado = async (id: string, estado: EstadoVacante) => {
    setOcupada(id);
    const res = await fetch(`/api/vacantes/${id}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    });
    setOcupada(null);
    if (res.ok) router.refresh();
    else alert('No se pudo actualizar la vacante');
  };

  const eliminar = async (id: string) => {
    if (!window.confirm('¿Eliminar esta vacante? Se borrarán también sus postulaciones.')) return;
    setOcupada(id);
    const res = await fetch(`/api/vacantes/${id}`, { method: 'DELETE' });
    setOcupada(null);
    if (res.ok) router.refresh();
    else alert('No se pudo eliminar la vacante');
  };

  if (vacantes.length === 0) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--ink-400)' }}>
        <IconBriefcase size={40} />
        <p style={{ marginTop: 12, fontSize: 15, fontWeight: 600, color: 'var(--ink-600)' }}>Todavía no tenés vacantes</p>
        <p style={{ fontSize: 13, marginTop: 4 }}>Creá tu primera vacante para empezar a recibir postulaciones.</p>
        <Link href="/empresario/vacantes/crear" className="btn btn-primary" style={{ marginTop: 16 }}>
          Nueva vacante
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {vacantes.map((v, i) => {
        const meta = ESTADO_VACANTE_META[v.estado];
        const busy = ocupada === v.id;
        const sub = [labelModalidad(v.modalidad), labelTipoEmpleo(v.tipoEmpleo), v.area].filter(Boolean).join(' · ');
        return (
          <div
            key={v.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
              borderTop: i === 0 ? 'none' : '1px solid var(--line)', opacity: busy ? 0.6 : 1,
            }}
          >
            <span style={{ width: 40, height: 40, borderRadius: 10, background: `${meta.color}18`, color: meta.color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <IconBriefcase size={20} />
            </span>

            <div style={{ flex: '1 1 0', minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--ink-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {v.titulo}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-400)', marginTop: 2 }}>{sub || 'Sin detalles'}</div>
            </div>

            {/* Estado */}
            <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11.5, fontWeight: 700, background: `${meta.color}18`, color: meta.color, flexShrink: 0 }}>
              {meta.label}
            </span>

            {/* Postulantes */}
            <Link
              href={`/empresario/vacantes/${v.id}/postulaciones`}
              title="Ver postulantes"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--azul)', textDecoration: 'none', flexShrink: 0 }}
            >
              <IconUsers size={16} />
              {v.totalPostulaciones}
            </Link>

            {/* Acciones */}
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              {v.estado === 'borrador' && (
                <button onClick={() => publicar(v.id)} disabled={busy} className="btn btn-primary" style={{ padding: '7px 14px', fontSize: 12.5 }}>
                  Publicar
                </button>
              )}
              {v.estado === 'abierta' && (
                <button onClick={() => cambiarEstado(v.id, 'en_contratacion')} disabled={busy} style={pill('#f7901e')}>
                  En contratación
                </button>
              )}
              {(v.estado === 'abierta' || v.estado === 'en_contratacion') && (
                <button onClick={() => cambiarEstado(v.id, 'cerrada')} disabled={busy} style={pill('#64748b')}>
                  Cerrar
                </button>
              )}
              {(v.estado === 'cerrada' || v.estado === 'en_contratacion') && (
                <button onClick={() => cambiarEstado(v.id, 'finalizada')} disabled={busy} style={pill('#662d91')}>
                  Finalizar
                </button>
              )}
              <Link href={`/empresario/vacantes/${v.id}/editar`} title="Editar" style={iconBtn()}>
                <IconEdit size={15} />
              </Link>
              <button onClick={() => eliminar(v.id)} disabled={busy} title="Eliminar" style={iconBtn('#dc2626')}>
                <IconTrash size={15} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function pill(color: string): React.CSSProperties {
  return {
    padding: '7px 12px', borderRadius: 8, fontSize: 12.5, fontWeight: 600,
    border: `1.5px solid ${color}55`, background: `${color}12`, color, cursor: 'pointer',
  };
}

function iconBtn(color = 'var(--ink-600)'): React.CSSProperties {
  return {
    width: 32, height: 32, borderRadius: 8, border: '1.5px solid var(--line)',
    background: 'transparent', color, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none',
  };
}
