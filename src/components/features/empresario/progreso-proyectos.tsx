'use client';

import { IconUser, IconCalendar } from '@/components/ui/fwd-icons';
import type { FilaProyectoEmpresario } from '@/server/services/proyecto.service';

const COLORES = ['var(--magenta)', '#6B46C1', 'var(--turquesa)', 'var(--naranja)'];

export function ProgresoProyectos({ proyectos }: { proyectos: FilaProyectoEmpresario[] }) {
  const activos = proyectos.filter(p => p.estado === 'publicado' || p.estado === 'en_desarrollo');

  const items = activos.slice(0, 4).map((p, index) => {
    let progreso = 0;
    if (p.publicado && p.fechaLimite) {
      const start = new Date(p.publicado).getTime();
      const end = new Date(p.fechaLimite).getTime();
      const now = Date.now();
      if (end > start) {
        progreso = Math.round(((now - start) / (end - start)) * 100);
        if (progreso < 0) progreso = 0;
        if (progreso > 100) progreso = 100;
      }
    } else if (p.estado === 'en_desarrollo') {
      progreso = 50; // Just a fallback
    }

    let fechaTxt = 'Sin definir';
    if (p.fechaLimite) {
      fechaTxt = new Date(p.fechaLimite).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }

    return {
      id: p.id,
      titulo: p.titulo,
      progreso,
      responsable: p.adjudicadoA || 'Sin asignar',
      color: COLORES[index % COLORES.length],
      fecha: fechaTxt,
    };
  });

  if (items.length === 0) {
    return (
      <div className="card" style={{ padding: '24px 32px', marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 className="font-display" style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink-900)' }}>
            Progreso de proyectos
          </h2>
          <div style={{ fontSize: 13, color: 'var(--ink-500)' }}>
            0 activos
          </div>
        </div>
        <div style={{ fontSize: 14, color: 'var(--ink-500)', textAlign: 'center', padding: '20px 0' }}>
          No tienes proyectos en desarrollo actualmente.
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: '24px 32px', marginTop: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 className="font-display" style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink-900)' }}>
          Progreso de proyectos
        </h2>
        <div style={{ fontSize: 13, color: 'var(--ink-500)' }}>
          {activos.length} activos
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {items.map((p) => (
          <div key={p.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-900)' }}>
                {p.titulo}
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: p.color }}>
                {p.progreso}%
              </div>
            </div>

            {/* Progress Bar Track */}
            <div style={{ width: '100%', height: 8, background: 'var(--bg-2)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
              {/* Progress Fill */}
              <div 
                style={{ 
                  height: '100%', 
                  width: `${p.progreso}%`, 
                  background: p.color, 
                  borderRadius: 4,
                  transition: 'width 1s ease-in-out'
                }} 
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5, color: 'var(--ink-500)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <IconUser size={14} />
                {p.responsable}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <IconCalendar size={14} />
                Vence {p.fecha}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
