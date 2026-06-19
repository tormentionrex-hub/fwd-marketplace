"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const t = useTranslations("Nav");

  // Sesión iniciada: el login guarda el perfil público en localStorage.
  // Si existe, ocultamos "Iniciar sesión" y "Registrarse".
  const [logueado, setLogueado] = useState(false);
  useEffect(() => {
    try {
      setLogueado(!!localStorage.getItem("fwd_perfil"));
    } catch {
      /* modo privado / sin storage: dejar botones visibles */
    }
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      {/* Pill */}
      <div className="group relative max-w-6xl mx-auto rounded-full px-7 py-4 flex items-center justify-between shadow-lg" style={{ background: "linear-gradient(90deg,#0e1628 0%,#2a1060 55%,#7b1fa2 85%,#ED008C 100%)" }}>
        {/* Shine sweep — clipPath para no necesitar overflow-hidden */}
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
          {!logueado && (
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
          {!logueado && (
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
