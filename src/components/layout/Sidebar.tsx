'use client';

import Link from 'next/link'; // TODO: migrar a "@/i18n/navigation" cuando el Carril B esté mergeado
import { usePathname } from 'next/navigation';

// Menú lateral del empresario. Se monta una sola vez desde (empresario)/layout.tsx,
// así aparece en todas las páginas del empresario (12, 14 y las futuras 13/15).
export default function Sidebar({ locale }: { locale: string }) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Inicio', icon: 'home', href: `/${locale}/empresario` },
    { label: 'Perfil', icon: 'person', href: '#' },
    { label: 'Mis Proyectos', icon: 'work', href: '#' },
    { label: 'Notificaciones', icon: 'notifications', href: '#' },
  ];

  const isActive = (href: string) => href !== '#' && pathname === href;

  return (
    <aside className="h-screen w-[280px] fixed left-0 top-0 bg-[#00B2B2] flex flex-col py-2 border-r border-white/10 shadow-xl z-50">
      <div className="px-6 py-8">
        <div className="font-display text-2xl font-bold text-white mb-1">TechLink</div>
        <div className="text-white text-sm opacity-90 uppercase tracking-wider font-semibold">
          Talent Marketplace
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={
              isActive(item.href)
                ? 'flex items-center px-4 py-3 border-l-4 border-white bg-white/20 text-white font-bold transition-colors duration-200'
                : 'flex items-center px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200'
            }
          >
            <span className="material-symbols-outlined mr-3">{item.icon}</span>
            <span className="text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto px-4 py-6 space-y-1">
        <Link
          href={`/${locale}/empresario/nuevo-proyecto`}
          className="w-full block text-center bg-white text-[#00B2B2] font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-sky-50 transition-all active:scale-95 mb-6"
        >
          Publicar proyecto
        </Link>
        <Link
          href="#"
          className="flex items-center px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200"
        >
          <span className="material-symbols-outlined mr-3">settings</span>
          <span className="text-sm">Ajustes</span>
        </Link>
        <Link
          href="#"
          className="flex items-center px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200"
        >
          <span className="material-symbols-outlined mr-3">help</span>
          <span className="text-sm">Soporte</span>
        </Link>
      </div>
    </aside>
  );
}
