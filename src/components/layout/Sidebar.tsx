'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { useState, useEffect } from 'react';

import {
  IconBriefcase,
  IconUsers,
  IconSettings,
  IconGrid,
  IconFolder,
  IconSpark,
  IconPlus,
} from '@/components/ui/fwd-icons';
import { LogoutButton } from '@/components/layout/logout-button';

// LocalStorage key for the collapsed state of the Empresario sidebar
const STORAGE_KEY = 'fwd_empresario_sidebar_collapsed';

export default function Sidebar({
  nombre,
  fotoUrl,
}: {
  nombre: string;
  fotoUrl?: string | null;
  locale?: string;
}) {
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Load persisted collapsed state on mount (siempre expandido: sin botón colapsar)
  useEffect(() => {
    setCollapsed(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Cierra el menú móvil al cambiar de ruta
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Clase en el shell para mostrar/ocultar sidebar en móvil
  useEffect(() => {
    const app = document.querySelector('.fwd-app');
    if (!app) return;
    app.classList.toggle('sb-mobile-open', mobileOpen);
    return () => app.classList.remove('sb-mobile-open');
  }, [mobileOpen]);

  // Sync CSS variable and persist changes when collapsed toggles
  useEffect(() => {
    function syncSidebarWidth() {
      const mobile = window.matchMedia('(max-width: 768px)').matches;
      document.documentElement.style.setProperty(
        '--sidebar-w',
        mobile ? '0px' : collapsed ? '72px' : '264px',
      );
    }

    syncSidebarWidth();
    window.addEventListener('resize', syncSidebarWidth);
    localStorage.setItem(STORAGE_KEY, String(collapsed));

    return () => window.removeEventListener('resize', syncSidebarWidth);
  }, [collapsed, mobileOpen]);

  const isActive = (href: string) => pathname === href;

  // Compute initials for avatar fallback
  const iniciales = nombre
    .trim()
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase() || 'E';

  return (
    <>
      <button
        type="button"
        className="sb-mobile-toggle"
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menú"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>
      <div
        className="sb-mobile-backdrop"
        onClick={() => setMobileOpen(false)}
        aria-hidden={!mobileOpen}
      />

    <aside
      className="sidebar"
      style={{ width: collapsed ? 72 : 264, transition: 'width 0.3s ease', overflow: 'hidden' }}
    >
      {/* Brand */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '4px 8px 18px',
          gap: 8,
        }}
      >
        <Link
          href="/empresario"
          className="sb-brand"
          style={{
            padding: 0,
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <img 
            src="/imagenes/logo-FWD-removebg-preview.png" 
            alt="FWD Logo" 
            style={{ height: '56px', width: 'auto', objectFit: 'contain' }}
          />
        </Link>
      </div>

      {/* Role pill */}
      <div
        title={collapsed ? 'Empresario · Cuenta activa' : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: collapsed ? 0 : 9,
          padding: '9px 12px',
          borderRadius: 10,
          background: 'var(--azul-tint)',
          marginBottom: 14,
          overflow: 'hidden',
          justifyContent: collapsed ? 'center' : 'flex-start',
          transition: 'padding 0.3s ease',
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
        <div
          style={{
            lineHeight: 1.15,
            overflow: 'hidden',
            width: collapsed ? 0 : 'auto',
            opacity: collapsed ? 0 : 1,
            transition: 'width 0.3s ease, opacity 0.2s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <div className="font-display" style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink-900)' }}>
            Empresario
          </div>
          <div style={{ fontSize: 10.5, color: 'var(--ink-500)' }}>Cuenta activa</div>
        </div>
      </div>

      {/* Management section */}
      {!collapsed && <div className="sb-section">Gestión</div>}

      <Link
        href="/empresario"
        title={collapsed ? 'Dashboard' : undefined}
        className={`nav-item ${isActive('/empresario') ? 'on' : ''}`}
        style={{ justifyContent: collapsed ? 'center' : 'flex-start', gap: collapsed ? 0 : 11, overflow: 'hidden', transition: 'gap 0.2s' }}
      >
        <IconGrid size={19} />
        <span
          style={{
            overflow: 'hidden',
            width: collapsed ? 0 : 'auto',
            opacity: collapsed ? 0 : 1,
            whiteSpace: 'nowrap',
            transition: 'width 0.3s ease, opacity 0.2s ease',
          }}
        >
          Dashboard
        </span>
      </Link>

      <Link
        href="/empresario/proyectos"
        title={collapsed ? 'Mis proyectos' : undefined}
        className={`nav-item ${isActive('/empresario/proyectos') ? 'on' : ''}`}
        style={{ justifyContent: collapsed ? 'center' : 'flex-start', gap: collapsed ? 0 : 11, overflow: 'hidden', transition: 'gap 0.2s' }}
      >
        <IconFolder size={19} />
        <span
          style={{
            overflow: 'hidden',
            width: collapsed ? 0 : 'auto',
            opacity: collapsed ? 0 : 1,
            whiteSpace: 'nowrap',
            transition: 'width 0.3s ease, opacity 0.2s ease',
          }}
        >
          Mis proyectos
        </span>
      </Link>

      <Link
        href="/empresario/crear-proyecto"
        title={collapsed ? 'Crear proyecto' : undefined}
        className={`nav-item ${isActive('/empresario/crear-proyecto') ? 'on' : ''}`}
        style={{ justifyContent: collapsed ? 'center' : 'flex-start', gap: collapsed ? 0 : 11, overflow: 'hidden', transition: 'gap 0.2s' }}
      >
        <IconPlus size={19} />
        <span
          style={{
            overflow: 'hidden',
            width: collapsed ? 0 : 'auto',
            opacity: collapsed ? 0 : 1,
            whiteSpace: 'nowrap',
            transition: 'width 0.3s ease, opacity 0.2s ease',
          }}
        >
          Crear proyecto
        </span>
      </Link>

      <Link
        href="/empresario/nuevo-proyecto"
        title={collapsed ? 'Crear con IA' : undefined}
        className={`nav-item ${isActive('/empresario/nuevo-proyecto') ? 'on' : ''}`}
        style={{ justifyContent: collapsed ? 'center' : 'flex-start', gap: collapsed ? 0 : 11, overflow: 'hidden', transition: 'gap 0.2s' }}
      >
        <IconSpark size={19} />
        <span
          style={{
            overflow: 'hidden',
            width: collapsed ? 0 : 'auto',
            opacity: collapsed ? 0 : 1,
            whiteSpace: 'nowrap',
            transition: 'width 0.3s ease, opacity 0.2s ease',
          }}
        >
          Crear con IA
        </span>
      </Link>

      <Link
        href="/empresario/perfil"
        title={collapsed ? 'Mi perfil' : undefined}
        className={`nav-item ${isActive('/empresario/perfil') ? 'on' : ''}`}
        style={{ justifyContent: collapsed ? 'center' : 'flex-start', gap: collapsed ? 0 : 11, overflow: 'hidden', transition: 'gap 0.2s' }}
      >
        <IconUsers size={19} />
        <span
          style={{
            overflow: 'hidden',
            width: collapsed ? 0 : 'auto',
            opacity: collapsed ? 0 : 1,
            whiteSpace: 'nowrap',
            transition: 'width 0.3s ease, opacity 0.2s ease',
          }}
        >
          Mi perfil
        </span>
      </Link>

      <Link
        href="/empresario/mensajes"
        title={collapsed ? 'Mensajes' : undefined}
        className={`nav-item ${isActive('/empresario/mensajes') ? 'on' : ''}`}
        style={{ justifyContent: collapsed ? 'center' : 'flex-start', gap: collapsed ? 0 : 11, overflow: 'hidden', transition: 'gap 0.2s' }}
      >
        <svg
          width={19}
          height={19}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
        <span
          style={{
            overflow: 'hidden',
            width: collapsed ? 0 : 'auto',
            opacity: collapsed ? 0 : 1,
            whiteSpace: 'nowrap',
            transition: 'width 0.3s ease, opacity 0.2s ease',
          }}
        >
          Mensajes
        </span>
      </Link>

      {/* Account section */}
      {!collapsed && <div className="sb-section">Cuenta</div>}

      <Link
        href="/empresario/configuracion"
        title={collapsed ? 'Configuración' : undefined}
        className={`nav-item ${isActive('/empresario/configuracion') ? 'on' : ''}`}
        style={{ justifyContent: collapsed ? 'center' : 'flex-start', gap: collapsed ? 0 : 11, overflow: 'hidden', transition: 'gap 0.2s' }}
      >
        <IconSettings size={19} />
        <span
          style={{
            overflow: 'hidden',
            width: collapsed ? 0 : 'auto',
            opacity: collapsed ? 0 : 1,
            whiteSpace: 'nowrap',
            transition: 'width 0.3s ease, opacity 0.2s ease',
          }}
        >
          Configuración
        </span>
      </Link>

      {/* Cerrar sesión */}
      <LogoutButton
        className={`nav-item w-full text-left mt-1`}
        style={{
          color: '#ef4444',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: collapsed ? 0 : 11,
          overflow: 'hidden',
          transition: 'gap 0.2s',
        } as React.CSSProperties}
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span style={{ overflow: 'hidden', width: collapsed ? 0 : 'auto', opacity: collapsed ? 0 : 1, whiteSpace: 'nowrap', transition: 'width 0.3s ease, opacity 0.2s ease' }}>
          Cerrar sesión
        </span>
      </LogoutButton>

      {/* Footer with user info */}
      <div className="sb-foot">
        <div className="sb-user" title={collapsed ? nombre : undefined} style={{ justifyContent: collapsed ? 'center' : 'flex-start', gap: collapsed ? 0 : 11, overflow: 'hidden', transition: 'gap 0.2s' }}>
          {fotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fotoUrl}
              alt={nombre}
              style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            />
          ) : (
            <div className="avatar" style={{ width: 38, height: 38, fontSize: 14, background: 'var(--azul)', flexShrink: 0 }}>
              {iniciales}
            </div>
          )}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
              width: collapsed ? 0 : 'auto',
              opacity: collapsed ? 0 : 1,
              transition: 'width 0.3s ease, opacity 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <div className="nm">{nombre}</div>
            <div className="rl">Empresario</div>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}
