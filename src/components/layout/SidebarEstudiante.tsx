"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
import {
  IconBell,
  IconBriefcase,
  IconFile,
  IconHome,
  IconLogout,
  IconUser,
} from "@/components/ui/icons";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/utils/cn";


interface SidebarEstudianteProps {
  locale: string;
}

interface EnlaceSidebar {
  href: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  exact?: boolean;
}

export default function SidebarEstudiante({ locale }: SidebarEstudianteProps) {
  const pathname = usePathname();
  const router = useRouter();
  const base = `/${locale}/dashboard/estudiante`;

  async function cerrarSesion() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    localStorage.removeItem("fwd_perfil");
    router.push(`/${locale}/login`);
    router.refresh();
  }

  const enlaces: EnlaceSidebar[] = [
    { href: base, label: "Inicio", Icon: IconHome, exact: true },
    { href: `${base}/perfil`, label: "Mi perfil", Icon: IconUser },
    { href: `${base}/ofertas`, label: "Mis ofertas", Icon: IconFile },
    { href: `${base}/proyecto-activo`, label: "Proyecto activo", Icon: IconBriefcase },
    { href: `${base}/notificaciones`, label: "Notificaciones", Icon: IconBell },
  ];

  return (
    <aside className="lg:sticky lg:top-6 lg:h-fit lg:w-64 lg:shrink-0">
      <div className="glass flex flex-col gap-2 rounded-2xl p-3 shadow-sm">
        <Link
          href={`/${locale}`}
          className="hidden px-2 py-2 font-display text-lg font-extrabold tracking-tight text-text lg:block"
        >
          FWD<span className="text-fwd-azul"> Marketplace</span>
        </Link>

        <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {enlaces.map(({ href, label, Icon, exact }) => {
            const activo = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={activo ? "page" : undefined}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  activo
                    ? "bg-fwd-azul/10 text-fwd-azul"
                    : "text-text-muted hover:bg-surface-2 hover:text-text",
                )}
              >
                <Icon width={18} height={18} />
                <span className="whitespace-nowrap">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center justify-between gap-2 border-t border-border pt-2 lg:flex">
          <button
            type="button"
            onClick={cerrarSesion}
            className="inline-flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10"
          >
            <IconLogout width={18} height={18} />
            <span>Cerrar sesión</span>
          </button>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
