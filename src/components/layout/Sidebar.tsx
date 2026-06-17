'use client';

import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { useState, useEffect } from 'react';
import { FwdMarketplaceLogo } from '@/components/ui/fwd-logo';
import {
  IconBriefcase,
  IconUsers,
  IconSettings,
  IconGrid,
  IconFolder,
  IconSpark,
} from '@/components/ui/fwd-icons';

// LocalStorage key for the collapsed state of the Empresario sidebar
const STORAGE_KEY = 'fwd_empresario_sidebar_collapsed';

export default function Sidebar({
  nombre,
  fotoUrl,
  locale = 'es',
}: {
  nombre: string;
  fotoUrl?: string | null;
  locale?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [loggingOut, setLoggingOut] = useState<boolean>(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      if (typeof window !== 'undefined') {
        localStorage.removeItem('fwd_perfil');
      }
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error(err);
      setLoggingOut(false);
    }
  };

  // Auto-close sidebar on mobile when pathname changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Load persisted collapsed state on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'true') setCollapsed(true);
    }
  }, []);

  // Sync CSS variable and persist changes when collapsed toggles
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--sidebar-w', collapsed ? '72px' : '264px');
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(collapsed));
    }
  }, [collapsed]);

  const toggleSidebar = () => setCollapsed(prev => !prev);
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
      {/* Botón hamburguesa — solo mobile */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-ink-600 shadow-md lg:hidden"
        aria-label="Abrir menú"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width={20}
          height={20}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>

      {/* Backdrop mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}
        style={{ width: collapsed ? 72 : 264, transition: 'width 0.3s ease', overflow: 'hidden' }}
      >
        {/* Brand and toggle button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
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
              width: collapsed ? 0 : 'auto',
              opacity: collapsed ? 0 : 1,
              pointerEvents: collapsed ? 'none' : 'auto',
              transition: 'width 0.3s ease, opacity 0.2s ease',
              flexShrink: 0,
            }}
          >
            <FwdMarketplaceLogo />
          </Link>
          
          {/* Botón de cierre para móvil */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-ink-600 hover:text-ink-900"
            aria-label="Cerrar menú"
            style={{
              width: 32,
              height: 32,
              display: mobileOpen ? 'grid' : 'none',
              placeItems: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <svg
              width={20}
              height={20}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          <button
            type="button"
            onClick={toggleSidebar}
            className="sb-collapse-btn"
            aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
            title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: 'var(--bg)',
              border: '1px solid var(--line)',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              color: 'var(--ink-600)',
              flexShrink: 0,
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--azul-tint)';
              (e.currentTarget as HTMLElement).style.color = 'var(--azul)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--bg)';
              (e.currentTarget as HTMLElement).style.color = 'var(--ink-600)';
            }}
          >
            {/* Chevron that rotates */}
            <svg
              width={15}
              height={15}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.3s ease' }}
            >
              <path d="m9 6 6 6-6 6" />
            </svg>
          </button>
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
        href="/mensajes"
        title={collapsed ? 'Mensajes' : undefined}
        className={`nav-item ${isActive('/mensajes') ? 'on' : ''}`}
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

      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        title={collapsed ? 'Cerrar sesión' : undefined}
        className="nav-item text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-60"
        style={{
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: collapsed ? 0 : 11,
          overflow: 'hidden',
          transition: 'gap 0.2s',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          width: '100%',
          textAlign: 'left',
          marginTop: 4,
          padding: '10px 12px',
        }}
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
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
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
          {loggingOut ? 'Saliendo…' : 'Cerrar sesión'}
        </span>
      </button>

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
