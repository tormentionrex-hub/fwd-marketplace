"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import SettingsPanel from "@/components/SettingsPanel";
import ThemeToggle from "@/components/layout/ThemeToggle";

function rutaDesdeRol(rol: string): string {
  if (rol === "admin") return "/admin";
  if (rol === "empresario") return "/empresario";
  if (rol === "estudiante") return "/dashboard/estudiante";
  return "/";
}

interface Props {
  locale: string;
  area?: string;
  areaColor?: string;
}

export default function MarketplaceDetailNav({ locale, area, areaColor }: Props) {
  const [logueado, setLogueado] = useState(false);
  const [perfil, setPerfil] = useState<{ nombre: string; image_url: string | null } | null>(null);
  const [redirectTo, setRedirectTo] = useState<string>("/");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("fwd_perfil");
      if (!raw) return;
      setLogueado(true);
      setPerfil(JSON.parse(raw));
      const ruta =
        localStorage.getItem("fwd_dashboard") ??
        localStorage.getItem("fwd_redirect");
      if (ruta) {
        setRedirectTo(ruta);
      } else {
        const parsed = JSON.parse(raw) as { roles?: { nombre?: string }; rol?: string };
        const rol = parsed?.roles?.nombre ?? parsed?.rol ?? "";
        if (rol) setRedirectTo(rutaDesdeRol(rol));
      }
    } catch { /* sin storage */ }
  }, []);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== "fwd_perfil") return;
      if (!e.newValue) { setPerfil(null); return; }
      try { setPerfil(JSON.parse(e.newValue)); } catch { /* ignorar */ }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const iniciales =
    perfil?.nombre
      ?.split(" ")
      .filter(Boolean)
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "U";

  const linkActivo = areaColor ?? "#008FD4";

  return (
    <div
      className="sticky top-0 z-40"
      style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="mx-auto max-w-5xl px-6 sm:px-8 h-[60px] flex items-center justify-between gap-6">

        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-3 flex-shrink-0">
          <div className="w-11 h-11 flex-shrink-0 fwd-spin">
            <Image
              src="/imagenes/logo-removebg-preview.png"
              alt="FWD"
              width={44}
              height={44}
              className="w-full h-full object-contain"
            />
          </div>
          <Image
            src="/imagenes/fwd-marketplace.png"
            alt="FWD Marketplace"
            width={1412}
            height={1114}
            className="h-11 w-auto object-contain hidden sm:block"
          />
        </Link>

        {/* Nav links — desktop */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          <Link
            href={`/${locale}`}
            className="px-4 py-2 rounded-full text-sm font-semibold transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            Inicio
          </Link>
          <Link
            href={`/${locale}/marketplace`}
            className="px-4 py-2 rounded-full text-sm font-bold transition-colors"
            style={{ color: linkActivo, background: `${linkActivo}14` }}
          >
            Marketplace
            {area && (
              <span className="ml-1.5 text-xs font-medium opacity-70">/ {area}</span>
            )}
          </Link>
          <Link
            href={`/${locale}/noticias`}
            className="px-4 py-2 rounded-full text-sm font-semibold transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            Noticias
          </Link>
          {!logueado && (
            <Link
              href={`/${locale}/login`}
              className="px-4 py-2 rounded-full text-sm font-semibold transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              Iniciar sesión
            </Link>
          )}
        </nav>

        {/* Derecha: theme toggle + settings + usuario */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <ThemeToggle />
          <SettingsPanel />
          {logueado ? (
            <Link
              href={redirectTo}
              title="Ir a mi dashboard"
              className="flex items-center justify-center w-9 h-9 rounded-full overflow-hidden text-xs font-bold transition-all hover:ring-2 hover:ring-offset-1 flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${linkActivo}, ${linkActivo}99)`,
                color: "#fff",
              }}
            >
              {perfil?.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={perfil.image_url} alt="" className="w-full h-full object-cover" />
              ) : iniciales}
            </Link>
          ) : (
            <Link
              href={`/${locale}/register`}
              className="hidden sm:inline-flex items-center text-sm font-black px-5 py-2 rounded-full transition-all hover:scale-105 active:scale-95"
              style={{
                background: "#FFCB05",
                color: "#0e1628",
              }}
            >
              Registrarse
            </Link>
          )}

          {/* Hamburger móvil */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            <span
              className="block w-5 h-0.5 rounded-full transition-all duration-200"
              style={{
                background: linkActivo,
                transform: menuOpen ? "rotate(45deg) translate(0, 6px)" : undefined,
              }}
            />
            <span
              className="block w-5 h-0.5 rounded-full transition-all duration-200"
              style={{
                background: linkActivo,
                opacity: menuOpen ? 0 : 1,
              }}
            />
            <span
              className="block w-5 h-0.5 rounded-full transition-all duration-200"
              style={{
                background: linkActivo,
                transform: menuOpen ? "rotate(-45deg) translate(0, -6px)" : undefined,
              }}
            />
          </button>
        </div>
      </div>

      {/* Dropdown móvil */}
      {menuOpen && (
        <div
          className="md:hidden px-6 pb-4 flex flex-col gap-1"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <Link
            href={`/${locale}`}
            className="px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            style={{ color: "var(--text-muted)" }}
            onClick={() => setMenuOpen(false)}
          >
            Inicio
          </Link>
          <Link
            href={`/${locale}/marketplace`}
            className="px-3 py-2.5 rounded-lg text-sm font-bold"
            style={{ color: linkActivo, background: `${linkActivo}14` }}
            onClick={() => setMenuOpen(false)}
          >
            Marketplace
          </Link>
          <Link
            href={`/${locale}/noticias`}
            className="px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            style={{ color: "var(--text-muted)" }}
            onClick={() => setMenuOpen(false)}
          >
            Noticias
          </Link>
          {logueado ? (
            <Link
              href={redirectTo}
              className="mt-1 flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold"
              style={{ color: "var(--text)" }}
              onClick={() => setMenuOpen(false)}
            >
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white overflow-hidden flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${linkActivo}, ${linkActivo}99)` }}
              >
                {perfil?.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={perfil.image_url} alt="" className="h-full w-full object-cover" />
                ) : iniciales}
              </span>
              {perfil?.nombre ?? "Mi perfil"}
            </Link>
          ) : (
            <>
              <Link
                href={`/${locale}/login`}
                className="px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                style={{ color: "var(--text-muted)" }}
                onClick={() => setMenuOpen(false)}
              >
                Iniciar sesión
              </Link>
              <Link
                href={`/${locale}/register`}
                className="mt-1 px-4 py-2.5 rounded-full text-sm font-black text-center transition-all"
                style={{ background: "#FFCB05", color: "#0e1628" }}
                onClick={() => setMenuOpen(false)}
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
