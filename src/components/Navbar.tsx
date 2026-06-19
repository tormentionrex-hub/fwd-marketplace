"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

// Mapeador de rol a ruta — copia del servidor para no importar código server-only en el cliente.
function rutaDesdeRol(rol: string): string {
  if (rol === "admin") return "/admin";
  if (rol === "empresario") return "/empresario";
  if (rol === "estudiante") return "/dashboard/estudiante";
  return "/";
}

export default function Navbar({ dashboardHref: dashboardProp }: { dashboardHref?: string | null }) {
  const t = useTranslations("Nav");

  const [logueado, setLogueado] = useState(false);
  const [dashboardHref, setDashboardHref] = useState<string>(dashboardProp ?? "/");

  useEffect(() => {
    // Si el servidor ya nos pasó la ruta, la usamos directamente y marcamos sesión activa.
    if (dashboardProp) {
      setLogueado(true);
      setDashboardHref(dashboardProp);
      return;
    }
    // Fallback: derivar de localStorage cuando no hay prop (páginas que no llaman getUser).
    try {
      const perfilRaw = localStorage.getItem("fwd_perfil");
      if (!perfilRaw) return;
      const perfil = JSON.parse(perfilRaw) as { roles?: { nombre?: string }; rol?: string };
      const rol = perfil?.roles?.nombre ?? perfil?.rol ?? "";
      if (!rol) return;
      setLogueado(true);
      const fromStorage = localStorage.getItem("fwd_dashboard");
      setDashboardHref(fromStorage ?? rutaDesdeRol(rol));
    } catch {
      /* modo privado / sin storage */
    }
  }, [dashboardProp]);

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      {/* Pill */}
      <div className="group relative max-w-6xl mx-auto rounded-full px-7 py-4 flex items-center justify-between shadow-lg" style={{ background: "linear-gradient(90deg,#0e1628 0%,#2a1060 55%,#7b1fa2 85%,#ED008C 100%)" }}>
        {/* Shine sweep */}
        <span className="pointer-events-none absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-white/10 skew-x-[-20deg] transition-transform duration-700 z-0 rounded-full" style={{ clipPath: "inset(0 round 9999px)" }} />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0">
          <div className="w-14 h-14 flex-shrink-0 fwd-spin">
            <Image
              src="/imagenes/logo-removebg-preview.png"
              alt="FWD Costa Rica"
              width={56}
              height={56}
              className="w-full h-full object-contain"
            />
          </div>
          <Image
            src="/imagenes/fwd-marketplace.png"
            alt="FWD Marketplace"
            width={1412}
            height={1114}
            priority
            className="h-16 w-auto object-contain"
          />
        </Link>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-10">
          <Link
            href="/"
            className="text-white/80 hover:text-[#20BEC7] text-base font-semibold transition-colors duration-200"
          >
            {t("inicio")}
          </Link>
          <Link
            href="/proyectos"
            className="text-white/80 hover:text-[#20BEC7] text-base font-semibold transition-colors duration-200"
          >
            {t("proyectos")}
          </Link>
          {!logueado && (
            <Link
              href="/login"
              className="text-white/80 hover:text-[#20BEC7] text-base font-semibold transition-colors duration-200"
            >
              {t("iniciarSesion")}
            </Link>
          )}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          {logueado ? (
            <Link
              href={dashboardHref}
              className="bg-[#FFCB05] hover:bg-[#FFCB05]/90 text-[#0e1628] text-base font-black px-8 py-3 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
            >
              Mi dashboard
            </Link>
          ) : (
            <Link
              href="/register"
              className="bg-[#FFCB05] hover:bg-[#FFCB05]/90 text-[#0e1628] text-base font-black px-8 py-3 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
            >
              {t("registrarse")}
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-11 h-11 gap-1.5 flex-shrink-0"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          <span className={`block w-6 h-0.5 bg-[#FFCB05] transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-6 h-0.5 bg-[#FFCB05] transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-0.5 bg-[#FFCB05] transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden mt-2 max-w-6xl mx-auto rounded-2xl px-6 py-5 flex flex-col gap-4 bg-[#0e1628] shadow-xl">
          <Link href="/" className="text-white/80 text-base font-semibold py-1 hover:text-[#20BEC7] transition-colors" onClick={() => setMenuOpen(false)}>
            {t("inicio")}
          </Link>
          <Link href="/proyectos" className="text-white/80 text-base font-semibold py-1 hover:text-[#20BEC7] transition-colors" onClick={() => setMenuOpen(false)}>
            {t("proyectos")}
          </Link>
          {logueado ? (
            <Link
              href={dashboardHref}
              className="bg-[#FFCB05] text-[#0e1628] text-base font-black px-5 py-3 rounded-full text-center hover:bg-[#FFCB05]/90 transition-all"
              onClick={() => setMenuOpen(false)}
            >
              Mi dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-white/80 text-base font-semibold py-1 hover:text-[#20BEC7] transition-colors" onClick={() => setMenuOpen(false)}>
                {t("iniciarSesion")}
              </Link>
              <Link
                href="/register"
                className="bg-[#FFCB05] text-[#0e1628] text-base font-black px-5 py-3 rounded-full text-center hover:bg-[#FFCB05]/90 transition-all"
                onClick={() => setMenuOpen(false)}
              >
                {t("registrarse")}
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
