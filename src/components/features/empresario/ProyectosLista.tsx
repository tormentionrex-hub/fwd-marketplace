'use client';

import { useState, useTransition } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { ProyectoRow } from '@/components/features/empresario/lista-proyectos';
import type { FilaProyectoEmpresario } from '@/server/services/proyecto.service';
import { IconTrash, IconEdit, IconSend, IconEye, IconX } from '@/components/ui/fwd-icons';
import Swal from 'sweetalert2';

interface Props {
  proyectos: FilaProyectoEmpresario[];
}

const btnBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  padding: '5px 12px',
  borderRadius: 8,
  fontSize: 12.5,
  fontWeight: 600,
  cursor: 'pointer',
  border: 'none',
  transition: 'all 0.15s',
  textDecoration: 'none',
};

// ─── Acciones para proyectos en BORRADOR ────────────────────────────────────

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

  const estiloBtn: React.CSSProperties = {
    ...btnBase,
    cursor: pending ? 'not-allowed' : 'pointer',
    opacity: pending ? 0.5 : 1,
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      {error && (
        <span style={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>{error}</span>
      )}

      <Link
        href={`/empresario/proyectos/${proyecto.id}/editar`}
        style={{ ...estiloBtn, background: 'rgba(0,143,212,0.1)', color: 'var(--azul)' }}
      >
        <IconEdit size={13} />
        Editar
      </Link>

      <button
        type="button"
        onClick={publicar}
        disabled={pending}
        style={{ ...estiloBtn, background: 'rgba(34,197,94,0.1)', color: '#16a34a' }}
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
            style={{ ...estiloBtn, background: 'rgba(220,38,38,0.12)', color: '#dc2626' }}
          >
            {accion === 'eliminar' ? 'Eliminando...' : 'Si, eliminar'}
          </button>
          <button
            type="button"
            onClick={() => setConfirmandoEliminar(false)}
            disabled={pending}
            style={{ ...estiloBtn, background: 'transparent', color: 'var(--ink-500)', border: '1px solid var(--line)' }}
          >
            Cancelar
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmandoEliminar(true)}
          disabled={pending}
          style={{ ...estiloBtn, background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}
        >
          <IconTrash size={13} />
          Eliminar
        </button>
      )}
    </div>
  );
}

// ─── Acciones para proyectos PUBLICADOS ─────────────────────────────────────

function AccionesPublicado({ proyecto }: { proyecto: FilaProyectoEmpresario }) {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? 'es';
  const [deshabilitando, setDeshabilitando] = useState(false);

  const verDetalles = () => {
    window.open(`/${locale}/marketplace/${proyecto.id}`, '_blank', 'noopener,noreferrer');
  };

  const deshabilitar = async () => {
    const resultado = await Swal.fire({
      title: 'Deshabilitar proyecto',
      html: `
        <p style="margin:0;color:#374151;font-size:14px;line-height:1.6">
          Al deshabilitar <strong>${proyecto.titulo}</strong>, el proyecto
          <strong>dejará de mostrarse en el marketplace</strong> y pasará al
          estado <strong>Borrador</strong>.<br><br>
          Desde Borrador podrás editarlo y volver a publicarlo cuando quieras.
        </p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Deshabilitar proyecto',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
      focusCancel: true,
    });

    if (!resultado.isConfirmed) return;

    setDeshabilitando(true);
    try {
      const res = await fetch(`/api/proyectos/${proyecto.id}/deshabilitar`, {
        method: 'PATCH',
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        await Swal.fire({
          title: 'Error',
          text: data.error ?? 'No se pudo deshabilitar el proyecto.',
          icon: 'error',
          confirmButtonColor: '#008fd4',
        });
        return;
      }
      await Swal.fire({
        title: 'Proyecto deshabilitado',
        text: 'El proyecto fue movido a Borradores. Ya podés editarlo o volver a publicarlo.',
        icon: 'success',
        confirmButtonColor: '#008fd4',
        timer: 2500,
        timerProgressBar: true,
      });
      router.refresh();
    } catch {
      await Swal.fire({
        title: 'Error de red',
        text: 'No se pudo conectar. Intentá de nuevo.',
        icon: 'error',
        confirmButtonColor: '#008fd4',
      });
    } finally {
      setDeshabilitando(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <button
        type="button"
        onClick={verDetalles}
        style={{ ...btnBase, background: 'rgba(0,143,212,0.1)', color: 'var(--azul)' }}
      >
        <IconEye size={13} />
        Ver detalles
      </button>

      <button
        type="button"
        onClick={deshabilitar}
        disabled={deshabilitando}
        style={{
          ...btnBase,
          background: 'rgba(220,38,38,0.08)',
          color: '#dc2626',
          opacity: deshabilitando ? 0.5 : 1,
          cursor: deshabilitando ? 'not-allowed' : 'pointer',
        }}
      >
        <IconX size={13} />
        {deshabilitando ? 'Deshabilitando...' : 'Deshabilitar'}
      </button>
    </div>
  );
}

// ─── Lista principal ─────────────────────────────────────────────────────────

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
        const esPublicado = p.estado === 'publicado';

        return (
          <div
            key={p.id}
            style={{ borderBottom: '1px solid var(--line)', padding: '4px 0' }}
          >
            <ProyectoRow p={p} />

            {(esBorrador || esPublicado) && (
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
                {esBorrador && <AccionesBorrador proyecto={p} />}
                {esPublicado && <AccionesPublicado proyecto={p} />}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
