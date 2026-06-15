"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
import {
  IconBriefcase,
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

  return (
    <aside className="lg:sticky lg:top-6 lg:h-fit lg:w-64 lg:shrink-0">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-fwd-morado via-fwd-azul to-fwd-azul p-3 shadow-xl shadow-fwd-morado/25 lg:p-4">
        <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-fwd-turquesa/30 blur-2xl" />

        <Link
          href={`/${locale}`}
          className="relative z-10 mb-2 hidden items-center gap-2 px-2 py-2 lg:flex"
        >
          <Image
            src="/imagenes/fwd-marketplace.png"
            alt="FWD Marketplace"
            width={1412}
            height={1114}
            priority
            className="h-11 w-auto object-contain"
          />
          <span className="font-display text-lg font-extrabold tracking-tight text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.55)]">
            Marketplace
          </span>
        </Link>

        <nav className="relative z-10 flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {enlaces.map(({ href, label, Icon, exact }) => {
            const activo = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={activo ? "page" : undefined}
                className={cn(
                  "group relative inline-flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:translate-x-1",
                  activo
                    ? "bg-white/95 text-fwd-azul shadow-lg shadow-fwd-azul/30"
                    : "text-white/80 hover:bg-white/15 hover:text-white",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute -left-0.5 top-1/2 hidden h-6 w-1 -translate-y-1/2 rounded-full bg-fwd-amarillo shadow-[0_0_12px] shadow-fwd-amarillo/80 transition-opacity duration-200 lg:block",
                    activo ? "opacity-100" : "opacity-0",
                  )}
                />
                <span
                  className={cn(
                    "grid h-7 w-7 place-items-center rounded-lg transition-all duration-200 group-hover:scale-110 group-hover:-rotate-6",
                    activo
                      ? "bg-gradient-to-br from-fwd-azul to-fwd-turquesa text-white"
                      : "bg-white/10 text-white group-hover:bg-white/20",
                  )}
                >
                  <Icon width={16} height={16} />
                </span>
                <span className="whitespace-nowrap">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="relative z-10 mt-3 hidden flex-col gap-3 border-t border-white/20 pt-3 lg:flex">
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-2.5 backdrop-blur-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fotoUrl}
              alt={nombre}
              className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-white/40"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{nombre}</p>
              <p className="truncate text-xs text-white/70">{nivel}</p>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-white/10 px-3 py-2 backdrop-blur-sm">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/80">
              <IconStar width={14} height={14} className="text-fwd-amarillo" />
              Reputación
            </span>
            <span className="text-sm font-bold text-white">{reputacion.toFixed(1)}</span>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={cerrarSesion}
              className="inline-flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-white/85 transition-colors hover:bg-white/15 hover:text-white"
            >
              <IconLogout width={18} height={18} />
              <span>Cerrar sesión</span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </aside>
  );
}
