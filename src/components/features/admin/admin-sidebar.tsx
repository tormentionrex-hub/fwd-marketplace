"use client";

import { useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";

/* ── Íconos SVG inline (sin emojis, REGLA #6) ───────────────── */
type IcoProps = { d: string; extra?: string | undefined; className?: string | undefined };
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
  dashboard: { d: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" },
  usuarios: {
    d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2",
    extra: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  },
  proyectos: { d: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" },
  ofertas: { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", extra: "M14 2v6h6M16 13H8M16 17H8M10 9H8" },
  validaciones: { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14", extra: "M22 4 12 14.01l-3-3" },
  configuracion: {
    d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",
    extra: "M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z",
  },
  gestionCuentas: {
    d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  },
  inicio: { d: "M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" },
  menu: { d: "M3 6h18M3 12h18M3 18h18" },
  close: { d: "M18 6 6 18M6 6l12 12" },
} as const;

const NAV = [
  { href: "/admin", label: "Dashboard", icon: ICON.dashboard },
  { href: "/admin/usuarios", label: "Usuarios", icon: ICON.usuarios },
  { href: "/admin/proyectos", label: "Proyectos", icon: ICON.proyectos },
  { href: "/admin/ofertas", label: "Ofertas", icon: ICON.ofertas },
  { href: "/admin/validaciones", label: "Validaciones", icon: ICON.validaciones },
  { href: "/admin/gestion-cuentas", label: "Gestión cuentas", icon: ICON.gestionCuentas },
  { href: "/admin/configuracion", label: "Configuración", icon: ICON.configuracion },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Botón hamburguesa — solo mobile */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-[#0e1628] text-white shadow-lg lg:hidden"
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
        className={`fixed left-0 top-0 z-40 flex h-screen w-[240px] flex-col border-r border-white/10 bg-[#0e1628] px-4 py-5 transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Marca */}
        <div className="flex items-center justify-between px-2 pb-6">
          <div className="flex flex-col leading-none">
            <span className="font-display text-2xl font-black tracking-tighter text-white">
              FWD
            </span>
            <span className="font-display text-[0.55rem] font-bold tracking-[0.3em] text-fwd-turquoise">
              COSTA RICA
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-white/50 hover:text-white lg:hidden"
            aria-label="Cerrar menú"
          >
            <Ico d={ICON.close.d} />
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const activo = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  activo
                    ? "bg-fwd-magenta/15 text-white"
                    : "text-white/55 hover:bg-white/5 hover:text-white"
                }`}
              >
                {activo && (
                  <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-fwd-magenta" />
                )}
                <span className={activo ? "text-fwd-magenta" : ""}>
                  <Ico d={item.icon.d} extra={"extra" in item.icon ? item.icon.extra : undefined} />
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Salir del panel — visualmente distinto, al fondo */}
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="mt-4 flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm font-semibold text-white/80 transition hover:border-fwd-turquoise/50 hover:bg-fwd-turquoise/10 hover:text-white"
        >
          <Ico d={ICON.inicio.d} />
          Ir al inicio
        </Link>
      </aside>
    </>
  );
}
