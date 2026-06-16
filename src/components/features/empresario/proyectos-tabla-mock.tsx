'use client';

import { Link } from '@/i18n/navigation';
import { IconFilter, IconSearch, IconExternalLink } from '@/components/ui/fwd-icons';

const MOCK_PROYECTOS = [
  {
    id: '1',
    titulo: 'App de logística interna',
    categoria: 'Tecnología',
    ofertas: 5,
    presupuesto: '$4,500',
    estado: 'Activo',
    fecha: '10 jun 2026',
    statusColor: 'var(--azul)',
    statusBg: 'rgba(0,130,200,0.1)',
  },
  {
    id: '2',
    titulo: 'Rediseño web corporativo',
    categoria: 'Diseño',
    ofertas: 8,
    presupuesto: '$2,200',
    estado: 'En desarrollo',
    fecha: '3 jun 2026',
    statusColor: 'var(--naranja)',
    statusBg: 'rgba(255,165,0,0.1)',
  },
  {
    id: '3',
    titulo: 'Campaña marketing Q3',
    categoria: 'Marketing',
    ofertas: 12,
    presupuesto: '$3,100',
    estado: 'Activo',
    fecha: '1 jun 2026',
    statusColor: 'var(--azul)',
    statusBg: 'rgba(0,130,200,0.1)',
  },
];

export function ProyectosTablaMock() {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '24px 30px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid var(--line)' }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink-900)', marginBottom: 4 }}>Proyectos recientes</h3>
          <div style={{ fontSize: 13, color: 'var(--ink-500)' }}>7 de 7 proyectos</div>
        </div>
        <Link href="/empresario/proyectos" style={{ background: 'rgba(0,130,200,0.1)', color: 'var(--azul)', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
          Ver todos
        </Link>
      </div>

      {/* Filters Bar */}
      <div style={{ padding: '20px 30px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid var(--line)', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg)', borderRadius: 24, padding: '8px 16px', gap: 8, width: 280, border: '1px solid var(--line)' }}>
          <IconSearch size={16} color="var(--ink-400)" />
          <input 
            type="text" 
            placeholder="Buscar proyecto o categoría..." 
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, width: '100%', color: 'var(--ink-900)' }} 
          />
        </div>

        <IconFilter size={18} color="var(--ink-500)" style={{ marginLeft: 8 }} />

        {/* Status Filters */}
        <div style={{ display: 'flex', gap: 8, marginLeft: 8 }}>
          <span style={{ background: 'var(--ink-900)', color: '#fff', padding: '6px 14px', borderRadius: 16, fontSize: 12.5, fontWeight: 600 }}>Todos</span>
          <span style={{ color: 'var(--ink-600)', padding: '6px 14px', fontSize: 12.5, fontWeight: 500 }}>Activo</span>
          <span style={{ color: 'var(--ink-600)', padding: '6px 14px', fontSize: 12.5, fontWeight: 500 }}>En desarrollo</span>
          <span style={{ color: 'var(--ink-600)', padding: '6px 14px', fontSize: 12.5, fontWeight: 500 }}>Revisión</span>
          <span style={{ color: 'var(--ink-600)', padding: '6px 14px', fontSize: 12.5, fontWeight: 500 }}>Cerrado</span>
        </div>

        {/* Category Filters */}
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          <span style={{ border: '1px solid var(--magenta)', background: 'rgba(236,0,140,0.05)', color: 'var(--magenta)', padding: '6px 14px', borderRadius: 16, fontSize: 12.5, fontWeight: 600 }}>Todos</span>
          <span style={{ color: 'var(--ink-600)', padding: '6px 14px', fontSize: 12.5, fontWeight: 500 }}>Tecnología</span>
          <span style={{ color: 'var(--ink-600)', padding: '6px 14px', fontSize: 12.5, fontWeight: 500 }}>Diseño</span>
          <span style={{ color: 'var(--ink-600)', padding: '6px 14px', fontSize: 12.5, fontWeight: 500 }}>Marketing</span>
          <span style={{ color: 'var(--ink-600)', padding: '6px 14px', fontSize: 12.5, fontWeight: 500 }}>Consultoría</span>
        </div>
      </div>

      {/* Table Headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 40px', gap: 16, padding: '16px 30px', borderBottom: '1px solid var(--line)', background: 'rgba(244,246,251,0.3)', fontSize: 12, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        <div>PROYECTO</div>
        <div>CATEGORÍA</div>
        <div>OFERTAS</div>
        <div>PRESUPUESTO</div>
        <div>ESTADO</div>
        <div>FECHA</div>
        <div></div>
      </div>

      {/* Table Rows */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {MOCK_PROYECTOS.map((p, idx) => (
          <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 40px', gap: 16, padding: '20px 30px', alignItems: 'center', borderBottom: idx < MOCK_PROYECTOS.length - 1 ? '1px solid var(--line)' : 'none', transition: 'background 0.2s', cursor: 'pointer' }} className="hover-bg-surface">
            <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink-900)' }}>{p.titulo}</div>
            
            <div>
              <span style={{ background: 'rgba(128,0,128,0.1)', color: 'purple', padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
                {p.categoria}
              </span>
            </div>

            <div style={{ fontSize: 13.5, color: 'var(--ink-500)' }}>
              <span style={{ color: 'var(--magenta)', fontWeight: 700 }}>{p.ofertas}</span> ofertas
            </div>

            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-900)' }}>
              {p.presupuesto}
            </div>

            <div>
              <span style={{ background: p.statusBg, color: p.statusColor, padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
                {p.estado}
              </span>
            </div>

            <div style={{ fontSize: 13, color: 'var(--ink-500)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              {p.fecha}
            </div>

            <div style={{ color: 'var(--ink-300)', display: 'flex', justifyContent: 'flex-end' }}>
              <IconExternalLink size={16} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
