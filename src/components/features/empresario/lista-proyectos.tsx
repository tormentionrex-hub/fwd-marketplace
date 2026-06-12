import { Link } from '@/i18n/navigation';
import type { FilaProyectoEmpresario } from '@/server/services/proyecto.service';
import { IconSend, IconClock, IconChevR, IconCheck } from '@/components/ui/fwd-icons';

// Estado de proyecto -> clase de badge (design system FWD del layout) + texto.
export const ESTADO_BADGE: Record<string, { cls: string; label: string }> = {
  borrador: { cls: 'borrador', label: 'Borrador' },
  publicado: { cls: 'publicado', label: 'Publicado' },
  recepcion: { cls: 'recepcion', label: 'En recepción' },
  adjudicado: { cls: 'adjudicado', label: 'Adjudicado' },
  en_desarrollo: { cls: 'en_desarrollo', label: 'En desarrollo' },
  cerrado: { cls: 'cerrado', label: 'Cerrado' },
  cancelado: { cls: 'cancelado', label: 'Cancelado' },
};

export function textoPlazo(p: FilaProyectoEmpresario): string {
  if (p.estado === 'cerrado') return 'Finalizado';
  if (!p.fechaLimite) return 'Sin plazo';
  const dias = Math.ceil((new Date(p.fechaLimite).getTime() - Date.now()) / 86400000);
  if (dias < 0) return 'Plazo vencido';
  if (dias === 0) return 'Vence hoy';
  return `${dias} día${dias === 1 ? '' : 's'} restante${dias === 1 ? '' : 's'}`;
}

// Fila de proyecto reutilizable (dashboard + "Mis proyectos"). Enlaza a la gestión (P14).
export function ProyectoRow({ p }: { p: FilaProyectoEmpresario }) {
  const badge = ESTADO_BADGE[p.estado] ?? { cls: 'borrador', label: p.estado };
  return (
    <Link href={`/empresario/gestion-proyectos/${p.id}`} className="fwd-row">
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
          <span
            className="font-display"
            style={{
              fontWeight: 700,
              fontSize: 14.5,
              color: 'var(--ink-900)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {p.titulo}
          </span>
          <span className={`badge ${badge.cls}`}>
            <span className="bdot" />
            {badge.label}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 16, color: 'var(--ink-500)', fontSize: 12.5, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}>
            <IconSend size={13} />
            {p.candidatos} {p.candidatos === 1 ? 'oferta' : 'ofertas'}
          </span>
          <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}>
            <IconClock size={13} />
            {textoPlazo(p)}
          </span>
          {p.adjudicadoA && (
            <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}>
              <span style={{ color: 'var(--turquesa)', display: 'inline-flex' }}>
                <IconCheck size={13} />
              </span>
              {p.adjudicadoA}
            </span>
          )}
        </div>
      </div>
      <span style={{ color: 'var(--ink-300)', display: 'inline-flex' }}>
        <IconChevR size={18} />
      </span>
    </Link>
  );
}
