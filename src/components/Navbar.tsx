"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useState } from "react";
import SettingsPanel from "@/components/SettingsPanel";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      {/* Pill */}
      <div className="group relative overflow-hidden max-w-6xl mx-auto rounded-full px-7 py-4 flex items-center justify-between shadow-lg" style={{ background: "linear-gradient(90deg,#0e1628 0%,#2a1060 55%,#7b1fa2 85%,#ED008C 100%)" }}>
        {/* Shine sweep */}
        <span className="pointer-events-none absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-white/10 skew-x-[-20deg] transition-transform duration-700 z-0" />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0">
          <div className="w-10 h-10 flex-shrink-0 fwd-spin">
            <Image
              src="/imagenes/logo-removebg-preview.png"
              alt="FWD Costa Rica"
              width={40}
              height={40}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="hidden sm:block bg-white rounded-lg px-2 py-1">
            <Image
              src="/imagenes/logo-FWD-removebg-preview.png"
              alt="FWD Costa Rica"
              width={100}
              height={36}
              className="h-7 w-auto object-contain"
            />
          </div>
        </Link>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-10">
          <Link
            href="/"
            className="text-white/80 hover:text-[#20BEC7] text-base font-semibold transition-colors duration-200"
          >
            Inicio
          </Link>
          <Link
            href="/marketplace"
            className="text-white/80 hover:text-[#20BEC7] text-base font-semibold transition-colors duration-200"
          >
            Proyectos
          </Link>
          <Link
            href="/login"
            className="text-white/80 hover:text-[#20BEC7] text-base font-semibold transition-colors duration-200"
          >
            Iniciar sesión
          </Link>
        </nav>

        {/* CTA + Settings */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          <SettingsPanel />
          <Link
            href="/register"
            className="bg-[#FFCB05] hover:bg-[#FFCB05]/90 text-[#0e1628] text-base font-black px-8 py-3 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
          >
            Registrarse
          </Link>
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
            Inicio
          </Link>
          <Link href="/marketplace" className="text-white/80 text-base font-semibold py-1 hover:text-[#20BEC7] transition-colors" onClick={() => setMenuOpen(false)}>
            Proyectos
          </Link>
          <Link href="/login" className="text-white/80 text-base font-semibold py-1 hover:text-[#20BEC7] transition-colors" onClick={() => setMenuOpen(false)}>
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="bg-[#FFCB05] text-[#0e1628] text-base font-black px-5 py-3 rounded-full text-center hover:bg-[#FFCB05]/90 transition-all"
            onClick={() => setMenuOpen(false)}
          >
            Registrarse
          </Link>
        </div>
      )}
    </header>
  );
}
