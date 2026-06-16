"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { ComponentType, SVGProps } from "react";
import {
  IconBriefcase,
  IconChevronRight,
  IconFile,
  IconHome,
  IconLogout,
  IconMail,
  IconStar,
  IconUser,
  IconUserPlus,
} from "@/components/ui/icons";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/utils/cn";

const STORAGE_KEY = "fwd_sidebar_collapsed";

interface SidebarEstudianteProps {
  locale: string;
  nombre: string;
  fotoUrl: string;
  reputacion: number;
  nivel: string;
}

interface EnlaceSidebar {
  href: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  exact?: boolean;
}

export default function SidebarEstudiante({
  locale,
  nombre,
  fotoUrl,
  reputacion,
  nivel,
}: SidebarEstudianteProps) {
  const pathname = usePathname();
  const router = useRouter();
  const base = `/${locale}/dashboard/estudiante`;

  // Inicializamos con `false` para SSR consistency; luego el useEffect sincroniza con localStorage
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      setCollapsed(saved === "true");
    }
  }, []);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  }

  async function cerrarSesion() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    localStorage.removeItem("fwd_perfil");
    router.push(`/${locale}/login`);
    router.refresh();
  }

  const enlaces: EnlaceSidebar[] = [
    { href: base, label: "Inicio", Icon: IconHome, exact: true },
    { href: `${base}/perfil`, label: "Mi perfil", Icon: IconUser },
    { href: `/${locale}/mis-ofertas`, label: "Mis ofertas", Icon: IconFile },
    { href: `${base}/solicitudes`, label: "Solicitudes", Icon: IconUserPlus },
    { href: `/${locale}/mensajes`, label: "Mensajes", Icon: IconMail },
    { href: `${base}/proyecto-activo`, label: "Proyecto activo", Icon: IconBriefcase },
  ];

  // Don't render collapsed state until mounted (avoids hydration mismatch)
  const isCollapsed = mounted && collapsed;

  return (
    <aside
      className={cn(
        "lg:sticky lg:top-0 lg:h-screen lg:shrink-0 transition-all duration-300 ease-in-out",
        isCollapsed ? "lg:w-[72px]" : "lg:w-64"
      )}
    >
      <div className="relative h-full overflow-hidden rounded-b-3xl lg:rounded-none lg:rounded-r-3xl bg-gradient-to-b from-fwd-morado via-fwd-azul to-fwd-azul p-3 shadow-xl shadow-fwd-morado/25 lg:p-4 flex flex-col">
        <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-fwd-turquesa/30 blur-2xl" />

        {/* Header: logo + toggle button */}
        <div className="relative z-10 mb-2 hidden items-center justify-between lg:flex">
          <Link
            href={`/${locale}`}
            className={cn(
              "flex items-center gap-2 px-2 py-2 transition-all duration-300 overflow-hidden",
              isCollapsed ? "w-0 px-0 opacity-0 pointer-events-none" : "opacity-100"
            )}
          >
            <Image
              src="/imagenes/fwd-marketplace.png"
              alt="FWD Marketplace"
              width={1412}
              height={1114}
              priority
              className="h-11 w-auto object-contain shrink-0"
            />
            <span className="font-display text-lg font-extrabold tracking-tight text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.55)] whitespace-nowrap">
              Marketplace
            </span>
          </Link>

          {/* Toggle button */}
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={isCollapsed ? "Expandir menú" : "Colapsar menú"}
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white transition-all duration-200 hover:bg-white/25 hover:scale-105",
              isCollapsed && "mx-auto"
            )}
          >
            <IconChevronRight
              width={16}
              height={16}
              className={cn(
                "transition-transform duration-300",
                isCollapsed ? "rotate-0" : "rotate-180"
              )}
            />
          </button>
        </div>

        <nav className="relative z-10 flex gap-1 overflow-x-auto lg:flex-col lg:overflow-y-auto lg:flex-1 hide-scrollbar">
          {enlaces.map(({ href, label, Icon, exact }) => {
            const activo = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={activo ? "page" : undefined}
                title={isCollapsed ? label : undefined}
                className={cn(
                  "group relative inline-flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:translate-x-1",
                  activo
                    ? "bg-white/95 text-fwd-azul shadow-lg shadow-fwd-azul/30"
                    : "text-white/80 hover:bg-white/15 hover:text-white",
                  isCollapsed && "lg:justify-center lg:px-2"
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute -left-0.5 top-1/2 hidden h-6 w-1 -translate-y-1/2 rounded-full bg-fwd-amarillo shadow-[0_0_12px] shadow-fwd-amarillo/80 transition-opacity duration-200 lg:block",
                    activo ? "opacity-100" : "opacity-0",
                    isCollapsed && "lg:hidden"
                  )}
                />
                <span
                  className={cn(
                    "grid h-7 w-7 shrink-0 place-items-center rounded-lg transition-all duration-200 group-hover:scale-110 group-hover:-rotate-6",
                    activo
                      ? "bg-gradient-to-br from-fwd-azul to-fwd-turquesa text-white"
                      : "bg-white/10 text-white group-hover:bg-white/20",
                  )}
                >
                  <Icon width={16} height={16} />
                </span>
                <span
                  className={cn(
                    "whitespace-nowrap transition-all duration-300 overflow-hidden",
                    isCollapsed ? "lg:w-0 lg:opacity-0" : "lg:opacity-100"
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom section: profile, reputation, logout */}
        <div className="relative z-10 mt-3 hidden flex-col gap-3 border-t border-white/20 pt-3 lg:flex">
          {/* Avatar + info */}
          <div
            className={cn(
              "flex items-center gap-3 rounded-2xl bg-white/10 p-2.5 backdrop-blur-sm transition-all duration-300",
              isCollapsed && "justify-center"
            )}
            title={isCollapsed ? `${nombre} · ${nivel}` : undefined}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fotoUrl}
              alt={nombre}
              className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-white/40"
            />
            <div
              className={cn(
                "min-w-0 transition-all duration-300 overflow-hidden",
                isCollapsed ? "w-0 opacity-0" : "opacity-100"
              )}
            >
              <p className="truncate text-sm font-semibold text-white">{nombre}</p>
              <p className="truncate text-xs text-white/70">{nivel}</p>
            </div>
          </div>

          {/* Reputation */}
          <div
            className={cn(
              "flex items-center rounded-2xl bg-white/10 px-3 py-2 backdrop-blur-sm transition-all duration-300",
              isCollapsed ? "justify-center" : "justify-between"
            )}
            title={isCollapsed ? `Reputación: ${reputacion.toFixed(1)}` : undefined}
          >
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/80">
              <IconStar width={14} height={14} className="text-fwd-amarillo shrink-0" />
              <span
                className={cn(
                  "transition-all duration-300 overflow-hidden whitespace-nowrap",
                  isCollapsed ? "w-0 opacity-0" : "opacity-100"
                )}
              >
                Reputación
              </span>
            </span>
            <span
              className={cn(
                "text-sm font-bold text-white transition-all duration-300",
                isCollapsed && "hidden"
              )}
            >
              {reputacion.toFixed(1)}
            </span>
          </div>

          {/* Logout + theme toggle */}
          <div className={cn(
            "flex items-center gap-2 pt-1 transition-all duration-300",
            isCollapsed ? "justify-center" : "justify-between"
          )}>
            <button
              type="button"
              onClick={cerrarSesion}
              title={isCollapsed ? "Cerrar sesión" : undefined}
              className="inline-flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-white/85 transition-colors hover:bg-white/15 hover:text-white"
            >
              <IconLogout width={18} height={18} className="shrink-0" />
              <span
                className={cn(
                  "transition-all duration-300 overflow-hidden whitespace-nowrap",
                  isCollapsed ? "w-0 opacity-0" : "opacity-100"
                )}
              >
                Cerrar sesión
              </span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </aside>
  );
}
