'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { ProyectoRow } from '@/components/features/empresario/lista-proyectos';
import type { FilaProyectoEmpresario } from '@/server/services/proyecto.service';
import { IconTrash, IconEdit, IconSend } from '@/components/ui/fwd-icons';

interface Props {
  proyectos: FilaProyectoEmpresario[];
}

function AccionesBorrador({ proyecto }: { proyecto: FilaProyectoEmpresario }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [accion, setAccion] = useState<'publicar' | 'eliminar' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);

  const publicar = async () => {
    setError(null);
    setAccion('publicar');
    const res = await fetch(`/api/proyectos/${proyecto.id}/publicar`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? 'Error al publicar');
      setAccion(null);
      return;
    }
    startTransition(() => { router.refresh(); });
  };

  const eliminar = async () => {
    setError(null);
    setAccion('eliminar');
    const res = await fetch(`/api/proyectos/${proyecto.id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? 'Error al eliminar');
      setAccion(null);
      setConfirmandoEliminar(false);
      return;
    }
    startTransition(() => { router.refresh(); });
  };

  const btnBase: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '5px 12px',
    borderRadius: 8,
    fontSize: 12.5,
    fontWeight: 600,
    cursor: pending ? 'not-allowed' : 'pointer',
    border: 'none',
    opacity: pending ? 0.5 : 1,
    transition: 'all 0.15s',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      {error && (
        <span style={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>{error}</span>
      )}

      <Link
        href={`/empresario/proyectos/${proyecto.id}/editar`}
        style={{ ...btnBase, background: 'rgba(0,143,212,0.1)', color: 'var(--azul)' }}
      >
        <IconEdit size={13} />
        Editar
      </Link>

      <button
        type="button"
        onClick={publicar}
        disabled={pending}
        style={{ ...btnBase, background: 'rgba(34,197,94,0.1)', color: '#16a34a' }}
      >
        <IconSend size={13} />
        {accion === 'publicar' ? 'Publicando...' : 'Publicar'}
      </button>

      {confirmandoEliminar ? (
        <>
          <span style={{ fontSize: 12, color: 'var(--ink-600)' }}>Confirmar:</span>
          <button
            type="button"
            onClick={eliminar}
            disabled={pending}
            style={{ ...btnBase, background: 'rgba(220,38,38,0.12)', color: '#dc2626' }}
          >
            {accion === 'eliminar' ? 'Eliminando...' : 'Si, eliminar'}
          </button>
          <button
            type="button"
            onClick={() => setConfirmandoEliminar(false)}
            disabled={pending}
            style={{ ...btnBase, background: 'transparent', color: 'var(--ink-500)', border: '1px solid var(--line)' }}
          >
            Cancelar
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmandoEliminar(true)}
          disabled={pending}
          style={{ ...btnBase, background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}
        >
          <IconTrash size={13} />
          Eliminar
        </button>
      )}
    </div>
  );
}

export default function ProyectosLista({ proyectos }: Props) {
  if (proyectos.length === 0) {
    return (
      <div
        className="card card-pad"
        style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--ink-500)' }}
      >
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>
          No hay proyectos aun
        </div>
        <div style={{ fontSize: 13 }}>
          Crea tu primer proyecto para empezar a recibir ofertas de estudiantes.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {proyectos.map((p) => {
        const esBorrador = p.estado === 'borrador';

        return (
          <div
            key={p.id}
            style={{
              borderBottom: '1px solid var(--line)',
              padding: '4px 0',
            }}
          >
            <ProyectoRow p={p} />
            {esBorrador && (
              <div
                style={{
                  paddingLeft: 16,
                  paddingBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--ink-400)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginRight: 4,
                  }}
                >
                  Acciones:
                </span>
                <AccionesBorrador proyecto={p} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
