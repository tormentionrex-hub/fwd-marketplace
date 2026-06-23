"use client";

import { useEffect, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTheme } from "next-themes";
import { LogoutButton } from "@/components/layout/logout-button";

/* ── Íconos SVG inline (sin emojis, REGLA #6) ───────────────── */
type IcoProps = { d: string; extra?: string | undefined; className?: string };
function Ico({ d, extra, className }: IcoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-[18px] w-[18px]"}
      aria-hidden="true"
    >
      <path d={d} />
      {extra ? <path d={extra} /> : null}
    </svg>
  );
}

const ICON = {
  dashboard:    { d: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" },
  usuarios:     { d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", extra: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
  proyectos:    { d: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" },
  ofertas:      { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", extra: "M14 2v6h6M16 13H8M16 17H8M10 9H8" },
  validaciones: { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14", extra: "M22 4 12 14.01l-3-3" },
  configuracion: {
    d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",
    extra: "M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z",
  },
  gestionCuentas: { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
  inicio:  { d: "M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" },
  menu:    { d: "M3 6h18M3 12h18M3 18h18" },
  close:   { d: "M18 6 6 18M6 6l12 12" },
  logout:  { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", extra: "M16 17l5-5-5-5M21 12H9" },
  sun:     { d: "M12 3v1M12 20v1M4.22 4.22l.7.7M18.36 18.36l.7.7M3 12h1M20 12h1M4.22 19.78l.7-.7M18.36 5.64l.7-.7M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" },
  moon:    { d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" },
  catalogos: { d: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" },
  reportes: { d: "M12 20V10M18 20V4M6 20v-4" },
  equipo: { d: "M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", extra: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8" },
} as const;

/* Botón de toggle de tema — siempre usa los colores del sidebar (nav vars). */
function SidebarThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <span
        className="flex h-10 w-10 flex-shrink-0 rounded-xl border"
        style={{ borderColor: "var(--adm-sidebar-bd)", background: "var(--adm-card-sub)" }}
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border transition"
      style={{
        background: "var(--adm-card-sub)",
        borderColor: "var(--adm-sidebar-bd)",
        color: "var(--adm-nav-txt)",
      }}
    >
      <Ico d={isDark ? ICON.sun.d : ICON.moon.d} />
    </button>
  );
}

export function AdminSidebar({ tipoStaff }: { tipoStaff?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navItems: { href: string; label: string; icon: { readonly d: string; readonly extra?: string } }[] = [
    { href: "/admin",              label: "Dashboard",      icon: ICON.dashboard },
    { href: "/admin/usuarios",     label: "Usuarios",       icon: ICON.usuarios },
    { href: "/admin/validaciones", label: "Validaciones",   icon: ICON.validaciones },
    { href: "/admin/catalogos",    label: "Catálogos",      icon: ICON.catalogos },
    { href: "/admin/reportes",      label: "Reportes",        icon: ICON.reportes },
  ];

  if (tipoStaff !== "moderador") {
    navItems.push({ href: "/admin/invitaciones", label: "Equipo", icon: ICON.equipo });
  }

  return (
    <>
      {/* Botón hamburguesa — solo mobile */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-xl border shadow-lg lg:hidden transition"
        style={{
          background: "var(--adm-sidebar)",
          borderColor: "var(--adm-sidebar-bd)",
          color: "var(--adm-nav-txt-act)",
        }}
        aria-label="Abrir menú"
      >
        <Ico d={ICON.menu.d} />
      </button>

      {/* Backdrop mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-[240px] flex-col border-r px-4 py-5 transition-all duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "var(--adm-sidebar)",
          borderColor: "var(--adm-sidebar-bd)",
        }}
      >
        {/* Marca */}
        <div className="flex items-center justify-between px-2 pb-6">
          <div className="flex flex-col leading-none">
            <span
              className="font-display text-2xl font-black tracking-tighter"
              style={{ color: "var(--adm-nav-txt-act)" }}
            >
              FWD
            </span>
            <span className="font-display text-[0.55rem] font-bold tracking-[0.3em] text-fwd-turquoise">
              COSTA RICA
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="lg:hidden transition"
            style={{ color: "var(--adm-nav-txt)" }}
            aria-label="Cerrar menú"
          >
            <Ico d={ICON.close.d} />
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => {
            const activo = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition"
                style={{
                  background: activo ? "var(--adm-nav-active)" : "transparent",
                  color: activo ? "var(--adm-nav-txt-act)" : "var(--adm-nav-txt)",
                }}
                onMouseEnter={(e) => {
                  if (!activo) (e.currentTarget as HTMLElement).style.background = "var(--adm-nav-hover)";
                }}
                onMouseLeave={(e) => {
                  if (!activo) (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                {activo && (
                  <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-fwd-magenta" />
                )}
                <span style={{ color: activo ? "var(--color-fwd-magenta, #EC008C)" : "inherit" }}>
                  <Ico d={item.icon.d} {...("extra" in item.icon ? { extra: item.icon.extra } : {})} />
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Acciones al fondo: Inicio | Tema | Salir */}
        <div className="mt-4 flex gap-2">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border px-2.5 py-2.5 text-xs font-semibold transition hover:border-fwd-turquoise/50 hover:bg-fwd-turquoise/10 hover:text-fwd-turquoise"
            style={{
              borderColor: "var(--adm-sidebar-bd)",
              background: "var(--adm-card-sub)",
              color: "var(--adm-nav-txt)",
            }}
          >
            <Ico d={ICON.inicio.d} />
            Inicio
          </Link>
          <SidebarThemeToggle />
          <LogoutButton
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-2.5 py-2.5 text-xs font-semibold text-red-500 transition hover:border-red-500/40 hover:bg-red-500/20 disabled:opacity-60"
            label="Salir"
          >
            <Ico d={ICON.logout.d} extra={ICON.logout.extra} />
            Salir
          </LogoutButton>
        </div>
      </aside>
    </>
  );
}
