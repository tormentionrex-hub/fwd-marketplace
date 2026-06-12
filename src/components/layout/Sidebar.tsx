'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { FwdLogo } from '@/components/ui/fwd-logo';
import {
  IconGrid,
  IconFolder,
  IconSpark,
  IconSettings,
  IconBriefcase,
  IconUsers,
} from '@/components/ui/fwd-icons';

// Menú lateral del empresario (diseño FWD). Se monta una sola vez desde
// (empresario)/layout.tsx, así lo comparten las páginas 12 y 14.
// Las clases (.sidebar, .nav-item, .sb-*) están en el design system scoped del layout.
export default function Sidebar({
  nombre,
  fotoUrl,
}: {
  nombre: string;
  fotoUrl?: string | null;
}) {
  const pathname = usePathname(); // sin prefijo de locale (next-intl)

  const iniciales =
    nombre
      .trim()
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase() || 'E';

  const isActive = (href: string) => pathname === href;

  return (
    <aside className="sidebar">
      <Link href="/empresario" className="sb-brand">
        <FwdLogo />
      </Link>

      {/* Pill de rol */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          padding: '9px 12px',
          borderRadius: 10,
          background: 'var(--azul-tint)',
          marginBottom: 14,
        }}
      >
        <span
          style={{
            width: 26,
            height: 26,
            borderRadius: 8,
            background: 'var(--azul)',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            color: '#fff',
          }}
        >
          <IconBriefcase size={14} />
        </span>
        <div style={{ lineHeight: 1.15 }}>
          <div className="font-display" style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink-900)' }}>
            Empresario
          </div>
          <div style={{ fontSize: 10.5, color: 'var(--ink-500)' }}>Cuenta activa</div>
        </div>
      </div>

      <div className="sb-section">Gestión</div>
      <Link href="/empresario" className={`nav-item ${isActive('/empresario') ? 'on' : ''}`}>
        <IconGrid size={19} />
        Dashboard
      </Link>
      <Link
        href="/empresario/proyectos"
        className={`nav-item ${isActive('/empresario/proyectos') ? 'on' : ''}`}
      >
        <IconFolder size={19} />
        Mis proyectos
      </Link>
      <Link
        href="/empresario/nuevo-proyecto"
        className={`nav-item ${isActive('/empresario/nuevo-proyecto') ? 'on' : ''}`}
      >
        <IconSpark size={19} />
        Crear con IA
      </Link>
      <Link
        href="/empresario/perfil"
        className={`nav-item ${isActive('/empresario/perfil') ? 'on' : ''}`}
      >
        <IconUsers size={19} />
        Mi perfil
      </Link>

      <div className="sb-section">Cuenta</div>
      <Link
        href="/empresario/configuracion"
        className={`nav-item ${isActive('/empresario/configuracion') ? 'on' : ''}`}
      >
        <IconSettings size={19} />
        Configuración
      </Link>

      <div className="sb-foot">
        <div className="sb-user">
          {fotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fotoUrl}
              alt={nombre}
              style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            />
          ) : (
            <div className="avatar" style={{ width: 38, height: 38, fontSize: 14, background: 'var(--azul)' }}>
              {iniciales}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="nm">{nombre}</div>
            <div className="rl">Empresario</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
