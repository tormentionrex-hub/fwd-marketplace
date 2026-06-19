"use client";

import { Link, useRouter } from "@/i18n/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const t = useTranslations("Nav");

  const [logueado, setLogueado] = useState(false);
  const [perfil, setPerfil] = useState<{ nombre: string; image_url: string | null } | null>(null);
  const [redirectTo, setRedirectTo] = useState("/");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("fwd_perfil");
      if (raw) {
        setLogueado(true);
        setPerfil(JSON.parse(raw));
      }
      const redir = localStorage.getItem("fwd_redirect");
      if (redir) setRedirectTo(redir);
    } catch {
      /* modo privado / sin storage: dejar botones visibles */
    }
  }, []);

  async function cerrarSesion() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch { /* ignorar */ }
    localStorage.removeItem("fwd_perfil");
    localStorage.removeItem("fwd_redirect");
    router.push("/login");
    router.refresh();
  }

  const iniciales = perfil?.nombre
    ?.split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "?";

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
          <Link
            href="/noticias"
            className="text-white/80 hover:text-[#20BEC7] text-base font-semibold transition-colors duration-200"
          >
            {t("noticias")}
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

        {/* CTA / User */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          {logueado ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-full bg-white/10 pl-2 pr-4 py-1.5 text-white transition hover:bg-white/20"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white overflow-hidden">
                  {perfil?.image_url ? (
                    <img src={perfil.image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    iniciales
                  )}
                </span>
                <span className="text-sm font-semibold">{perfil?.nombre}</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 z-20 w-52 rounded-xl bg-white shadow-xl py-2">
                    <Link
                      href={redirectTo}
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      {t("miPanel")}
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={cerrarSesion}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      {t("cerrarSesion")}
                    </button>
                  </div>
                </>
              )}
            </div>
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
          <Link href="/noticias" className="text-white/80 text-base font-semibold py-1 hover:text-[#20BEC7] transition-colors" onClick={() => setMenuOpen(false)}>
            {t("noticias")}
          </Link>
          {logueado ? (
            <>
              <div className="flex items-center gap-3 py-2 border-t border-white/10 pt-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white overflow-hidden">
                  {perfil?.image_url ? (
                    <img src={perfil.image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    iniciales
                  )}
                </span>
                <span className="text-white font-semibold">{perfil?.nombre}</span>
              </div>
              <Link
                href={redirectTo}
                className="text-white/80 text-base font-semibold py-1 hover:text-[#20BEC7] transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {t("miPanel")}
              </Link>
              <button
                onClick={() => { setMenuOpen(false); cerrarSesion(); }}
                className="text-left text-red-300 text-base font-semibold py-1 hover:text-red-200 transition-colors"
              >
                {t("cerrarSesion")}
              </button>
            </>
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
