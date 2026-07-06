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

// Ícono de engranaje (no existe uno en @/components/ui/icons).
function IconSettings(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function IconCompass(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}
function IconSparkles(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3z" />
      <path d="M19 3v4M21 5h-4" />
    </svg>
  );
}
function IconBell(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

const STORAGE_KEY = "fwd_sidebar_collapsed";

interface SidebarEstudianteProps {
  locale: string;
  nombre: string;
  /** Foto de perfil del estudiante. null si aún no subió una (se muestra la inicial). */
  fotoUrl: string | null;
  reputacion: number;
  nivel: string;
}

interface EnlaceSidebar {
  href: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  exact?: boolean;
  /** Nº de elementos sin leer/pendientes; muestra un badge junto al enlace. */
  badge?: number;
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
  const inicial = (nombre.trim().charAt(0) || "U").toUpperCase();

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

  // Badge de notificaciones sin leer. Es un extra: si falla la red, se ignora
  // en silencio para no romper el sidebar. Se refresca cada 60s.
  const [noLeidas, setNoLeidas] = useState(0);

  useEffect(() => {
    let vivo = true;
    async function cargarNoLeidas() {
      try {
        const res = await fetch("/api/notificaciones", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const n = typeof data?.noLeidas === "number" ? data.noLeidas : 0;
        if (vivo) setNoLeidas(n);
      } catch {
        /* silencioso */
      }
    }
    cargarNoLeidas();
    const id = setInterval(cargarNoLeidas, 60_000);
    return () => {
      vivo = false;
      clearInterval(id);
    };
  }, []);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  }

  async function cerrarSesion() {
    const { cerrarSesionCliente } = await import("@/lib/logout-client");
    await cerrarSesionCliente();
    router.push(`/${locale}/login`);
    router.refresh();
  }

  const enlaces: EnlaceSidebar[] = [
    { href: base, label: "Inicio", Icon: IconHome, exact: true },
    { href: `/${locale}/marketplace`, label: "Explorar proyectos", Icon: IconCompass },
    { href: `${base}/para-ti`, label: "Para ti", Icon: IconSparkles },
    { href: `${base}/perfil`, label: "Mi perfil", Icon: IconUser },
    { href: `/${locale}/mis-ofertas`, label: "Mis ofertas", Icon: IconFile },
    { href: `${base}/solicitudes`, label: "Solicitudes", Icon: IconUserPlus },
    { href: `/${locale}/mensajes`, label: "Mensajes", Icon: IconMail },
    { href: `${base}/notificaciones`, label: "Notificaciones", Icon: IconBell, badge: noLeidas },
    { href: `${base}/proyecto-activo`, label: "Proyecto activo", Icon: IconBriefcase },
    { href: `${base}/configuracion`, label: "Configuración", Icon: IconSettings },
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
      <div className="relative h-full overflow-hidden rounded-b-3xl lg:rounded-none lg:rounded-r-3xl bg-white dark:bg-[#0f172a] border-r border-[#E4E9F1] dark:border-white/8 p-3 shadow-sm lg:p-4 flex flex-col">
        <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-transparent blur-2xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-transparent blur-2xl" />

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
            <span className="font-display text-lg font-extrabold tracking-tight text-[#662D91] dark:text-purple-400 whitespace-nowrap">
              Marketplace
            </span>
          </Link>

          {/* Toggle button */}
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={isCollapsed ? "Expandir menú" : "Colapsar menú"}
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#F4F6FB] dark:bg-white/10 text-[#4C5E7C] dark:text-white/70 border border-[#E4E9F1] dark:border-white/10 transition-all duration-200 hover:bg-[#EAEEF6] dark:hover:bg-white/20 hover:scale-105",
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

        <nav className="sidebar-scroll relative z-10 flex gap-1 overflow-x-auto overscroll-contain lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto lg:flex-1 lg:min-h-0">
          {enlaces.map(({ href, label, Icon, exact, badge }) => {
            const activo = exact ? pathname === href : pathname.startsWith(href);
            const tieneBadge = typeof badge === "number" && badge > 0;
            return (
              <Link
                key={href}
                href={href}
                aria-current={activo ? "page" : undefined}
                title={isCollapsed ? label : undefined}
                className={cn(
                  "group relative inline-flex shrink-0 items-center gap-2.5 rounded-none px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:translate-x-1",
                  activo
                    ? "bg-[#F0E7F7] dark:bg-purple-900/30 text-[#662D91] dark:text-purple-300 font-semibold"
                    : "text-[#4C5E7C] dark:text-white/70 hover:bg-[#F4F6FB] dark:hover:bg-white/10 hover:text-[#1B2C49] dark:hover:text-white",
                  isCollapsed && "lg:justify-center lg:px-2"
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-0 top-1/2 hidden h-6 w-1 -translate-y-1/2 rounded-full bg-[#662D91] transition-opacity duration-200 lg:block",
                    activo ? "opacity-100" : "opacity-0",
                    isCollapsed && "lg:hidden"
                  )}
                />
                <span
                  className={cn(
                    "relative grid h-7 w-7 shrink-0 place-items-center rounded-none transition-all duration-200 group-hover:scale-110 group-hover:-rotate-6",
                    activo
                      ? "bg-[#662D91] text-white"
                      : "bg-[#F4F6FB] dark:bg-white/10 text-[#4C5E7C] dark:text-white/70 group-hover:bg-[#EAEEF6] dark:group-hover:bg-white/20",
                  )}
                >
                  <Icon width={16} height={16} />
                  {/* Punto rojo cuando el menú está colapsado (no cabe el conteo) */}
                  {tieneBadge && (
                    <span
                      aria-hidden
                      className={cn(
                        "absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[#EC008C] ring-2 ring-white dark:ring-[#0f172a]",
                        isCollapsed ? "lg:block" : "lg:hidden"
                      )}
                    />
                  )}
                </span>
                <span
                  className={cn(
                    "whitespace-nowrap transition-all duration-300 overflow-hidden",
                    isCollapsed ? "lg:w-0 lg:opacity-0" : "lg:opacity-100"
                  )}
                >
                  {label}
                </span>
                {/* Conteo cuando el menú está expandido */}
                {tieneBadge && (
                  <span
                    className={cn(
                      "ml-auto grid h-5 min-w-[20px] shrink-0 place-items-center rounded-full bg-[#EC008C] px-1.5 text-[11px] font-bold leading-none text-white",
                      isCollapsed && "lg:hidden"
                    )}
                  >
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Fordys decorativos (stickers) en el espacio vacío del sidebar.
              Solo desktop y menú expandido; semi-transparentes para no distraer. */}
          {!isCollapsed && (
            <div className="mt-auto hidden shrink-0 items-end justify-center gap-2 pb-1 pt-8 lg:flex">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/imagenes/fordy/fordy-corazon.png"
                alt=""
                aria-hidden
                className="h-11 w-auto -rotate-6 opacity-45 dark:opacity-40"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/imagenes/fordy/fordy-pulgar.png"
                alt=""
                aria-hidden
                className="h-14 w-auto rotate-6 opacity-45 dark:opacity-40"
              />
            </div>
          )}

        </nav>

        {/* Bottom section: profile, reputation, logout */}
        <div className="relative z-10 mt-3 hidden flex-col gap-3 border-t border-[#E4E9F1] dark:border-white/10 pt-3 lg:flex">
          {/* Avatar + info */}
          <div
            className={cn(
              "flex items-center gap-3 rounded-2xl bg-[#F4F6FB] dark:bg-white/5 p-2.5 transition-all duration-300",
              isCollapsed && "justify-center"
            )}
            title={isCollapsed ? `${nombre} · ${nivel}` : undefined}
          >
            {fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fotoUrl}
                alt={nombre}
                className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-[#C2CCDB] dark:ring-white/20"
              />
            ) : (
              <span
                role="img"
                aria-label={nombre}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-base font-black text-white ring-2 ring-[#C2CCDB] dark:ring-white/20"
                style={{ background: "linear-gradient(135deg, #662D91, #EC008C)" }}
              >
                {inicial}
              </span>
            )}
            <div
              className={cn(
                "min-w-0 transition-all duration-300 overflow-hidden",
                isCollapsed ? "w-0 opacity-0" : "opacity-100"
              )}
            >
              <p className="truncate text-sm font-semibold text-[#0C1B33] dark:text-white">{nombre}</p>
              <p className="truncate text-xs text-[#6B7B96] dark:text-white/60">{nivel}</p>
            </div>
          </div>

          {/* Reputation */}
          <div
            className={cn(
              "flex items-center rounded-2xl bg-[#F4F6FB] dark:bg-white/5 px-3 py-2 transition-all duration-300",
              isCollapsed ? "justify-center" : "justify-between"
            )}
            title={isCollapsed ? `Reputación: ${reputacion.toFixed(1)}` : undefined}
          >
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4C5E7C] dark:text-white/60">
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
                "text-sm font-bold text-[#0C1B33] dark:text-white transition-all duration-300",
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
              className="inline-flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-[#4C5E7C] dark:text-white/60 transition-colors hover:bg-[#F4F6FB] dark:hover:bg-white/10 hover:text-[#0C1B33] dark:hover:text-white"
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
