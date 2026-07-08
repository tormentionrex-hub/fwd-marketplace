"use client";

import { useEffect, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  FolderKanban,
  Tag,
  Newspaper,
  ShieldCheck,
  LineChart,
  Settings,
  UserCog,
  UserPlus,
  MailPlus,
  Home,
  LogOut,
  Sun,
  Moon,
  ChevronDown,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { LogoutButton } from "@/components/layout/logout-button";

// ── Estructura del menú (secciones + submenú colapsable) ─────────────────────
type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  // Subitems opcionales (menú colapsable, p. ej. Usuarios por rol).
  subitems?: { href: string; label: string; rol: string }[];
};

type NavSection = { titulo: string; items: NavItem[] };

const SECCIONES: NavSection[] = [
  {
    titulo: "Resumen",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/estadisticas", label: "Estadísticas", icon: BarChart3 },
    ],
  },
  {
    titulo: "Usuarios y Roles",
    items: [
      {
        href: "/admin/usuarios",
        label: "Usuarios",
        icon: Users,
        subitems: [
          { href: "/admin/usuarios?rol=estudiante", label: "Estudiantes", rol: "estudiante" },
          { href: "/admin/usuarios?rol=empresario", label: "Empresarios", rol: "empresario" },
          { href: "/admin/usuarios?rol=admin", label: "Admins", rol: "admin" },
        ],
      },
    ],
  },
  {
    titulo: "Actividad",
    items: [
      { href: "/admin/proyectos", label: "Proyectos", icon: FolderKanban },
      { href: "/admin/ofertas", label: "Ofertas", icon: Tag },
      { href: "/admin/noticias", label: "Noticias", icon: Newspaper },
    ],
  },
  {
    titulo: "Herramientas",
    items: [
      { href: "/admin/validaciones", label: "Validaciones", icon: ShieldCheck },
      { href: "/admin/reportes", label: "Reportes de Actividad", icon: LineChart },
      { href: "/admin/configuracion", label: "Configuración", icon: Settings },
      { href: "/admin/gestion-cuentas", label: "Gestión Cuentas", icon: UserCog },
    ],
  },
  {
    titulo: "Administración",
    items: [
      { href: "/admin/invitaciones/admins", label: "Invitar admins", icon: UserPlus },
      { href: "/admin/invitaciones/usuarios", label: "Invitaciones de usuarios", icon: MailPlus },
    ],
  },
];

/* Botón de toggle de tema — usa los colores del sidebar (nav vars). */
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
      {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rolActivo = searchParams.get("rol");
  const [open, setOpen] = useState(false);
  const [usuariosOpen, setUsuariosOpen] = useState(pathname === "/admin/usuarios");

  // Abrir el submenú de Usuarios al navegar a esa sección.
  useEffect(() => {
    if (pathname === "/admin/usuarios") setUsuariosOpen(true);
  }, [pathname]);

  const cerrarMovil = () => setOpen(false);

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
        <Menu className="h-[18px] w-[18px]" />
      </button>

      {/* Backdrop mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={cerrarMovil}
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
        <div className="flex items-center justify-between px-2 pb-5">
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
            onClick={cerrarMovil}
            className="lg:hidden transition"
            style={{ color: "var(--adm-nav-txt)" }}
            aria-label="Cerrar menú"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex flex-1 flex-col gap-4 overflow-y-auto pr-1">
          {SECCIONES.map((seccion) => (
            <div key={seccion.titulo} className="flex flex-col gap-1">
              <p
                className="px-3 pb-1 text-[0.65rem] font-bold uppercase tracking-[0.12em]"
                style={{ color: "var(--adm-ink-faint)" }}
              >
                {seccion.titulo}
              </p>

              {seccion.items.map((item) => {
                const Icono = item.icon;
                const activo = pathname === item.href;

                // Item con submenú colapsable (Usuarios).
                if (item.subitems) {
                  return (
                    <div key={item.label} className="flex flex-col">
                      <div
                        className="group relative flex items-center rounded-xl text-sm font-semibold transition"
                        style={{
                          background: activo ? "var(--adm-nav-active)" : "transparent",
                          color: activo ? "var(--adm-nav-txt-act)" : "var(--adm-nav-txt)",
                        }}
                      >
                        {activo && (
                          <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-fwd-magenta" />
                        )}
                        <Link
                          href={item.href}
                          onClick={cerrarMovil}
                          className="flex flex-1 items-center gap-3 px-3 py-2.5"
                        >
                          <Icono className="h-[18px] w-[18px]" />
                          {item.label}
                        </Link>
                        <button
                          type="button"
                          onClick={() => setUsuariosOpen((v) => !v)}
                          aria-label={usuariosOpen ? "Contraer" : "Expandir"}
                          aria-expanded={usuariosOpen}
                          className="px-2.5 py-2.5 transition"
                          style={{ color: "inherit" }}
                        >
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              usuariosOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      </div>

                      {usuariosOpen && (
                        <div
                          className="ml-5 mt-1 flex flex-col gap-0.5 border-l pl-3"
                          style={{ borderColor: "var(--adm-sidebar-bd)" }}
                        >
                          {item.subitems.map((sub) => {
                            const subActivo =
                              pathname === "/admin/usuarios" && rolActivo === sub.rol;
                            return (
                              <Link
                                key={sub.rol}
                                href={sub.href}
                                onClick={cerrarMovil}
                                className="rounded-lg px-3 py-2 text-sm transition"
                                style={{
                                  background: subActivo ? "var(--adm-nav-active)" : "transparent",
                                  color: subActivo
                                    ? "var(--adm-nav-txt-act)"
                                    : "var(--adm-nav-txt)",
                                  fontWeight: subActivo ? 600 : 500,
                                }}
                              >
                                {sub.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                // Item simple.
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={cerrarMovil}
                    className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition"
                    style={{
                      background: activo ? "var(--adm-nav-active)" : "transparent",
                      color: activo ? "var(--adm-nav-txt-act)" : "var(--adm-nav-txt)",
                    }}
                    onMouseEnter={(e) => {
                      if (!activo)
                        (e.currentTarget as HTMLElement).style.background = "var(--adm-nav-hover)";
                    }}
                    onMouseLeave={(e) => {
                      if (!activo) (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    {activo && (
                      <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-fwd-magenta" />
                    )}
                    <Icono className="h-[18px] w-[18px]" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Acciones al fondo: Inicio | Tema | Salir */}
        <div className="mt-4 flex gap-2">
          <Link
            href="/"
            onClick={cerrarMovil}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border px-2.5 py-2.5 text-xs font-semibold transition hover:border-fwd-turquoise/50 hover:bg-fwd-turquoise/10 hover:text-fwd-turquoise"
            style={{
              borderColor: "var(--adm-sidebar-bd)",
              background: "var(--adm-card-sub)",
              color: "var(--adm-nav-txt)",
            }}
          >
            <Home className="h-4 w-4" />
            Inicio
          </Link>
          <SidebarThemeToggle />
          <LogoutButton
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-2.5 py-2.5 text-xs font-semibold text-red-500 transition hover:border-red-500/40 hover:bg-red-500/20 disabled:opacity-60"
            label="Salir"
          >
            <LogOut className="h-4 w-4" />
            Salir
          </LogoutButton>
        </div>
      </aside>
    </>
  );
}
