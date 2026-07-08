"use client";

import { Link, useRouter } from "@/i18n/navigation";
import Image from "next/image";
import { useEffect, useRef, useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import Swal from "sweetalert2";
import SettingsPanel from "@/components/SettingsPanel";
import gsap from "gsap";

// Copia client-side de rutaPorRol para no importar código server-only en el cliente.
function rutaDesdeRol(rol: string): string {
  if (rol === "admin") return "/admin";
  if (rol === "empresario") return "/empresario";
  if (rol === "estudiante") return "/dashboard/estudiante";
  return "/";
}

// Colores arcoiris que contrastan con el degradado del navbar (navy → púrpura → magenta).
const MKTP_COLORES = ["#FFCB05", "#ED008C", "#20BEC7", "#C084FC", "#60CFFF"];
const MKTP_LETRAS = "Marketplace".split("");

// Al hacer hover: cada letra lanza un flash blanco brillante que la "pinta" en su
// color arcoiris con un glow persistente. Al salir el cursor, reversa suave a blanco.
function MarketplaceAnimado() {
  const refs = useRef<(HTMLSpanElement | null)[]>([]);

  const targets = useCallback(
    () => refs.current.filter((el): el is HTMLSpanElement => el !== null),
    [],
  );

  const onEnter = useCallback(() => {
    const els = targets();
    gsap.killTweensOf(els);

    els.forEach((el, i) => {
      const color = MKTP_COLORES[i % MKTP_COLORES.length] ?? "#FFCB05";
      const baseDelay = i * 0.038;

      // Flash blanco brillante que barre la letra
      gsap.to(el, {
        color: "#ffffff",
        textShadow: `0 0 18px #fff, 0 0 36px ${color}, 0 0 70px ${color}`,
        scaleX: 1.12,
        scaleY: 1.18,
        duration: 0.07,
        delay: baseDelay,
        ease: "power3.out",
        overwrite: "auto",
      });
      // Settle: queda en su color arcoiris con glow suave
      gsap.to(el, {
        color,
        textShadow: `0 0 8px ${color}90`,
        scaleX: 1,
        scaleY: 1,
        duration: 0.22,
        delay: baseDelay + 0.07,
        ease: "power2.inOut",
        overwrite: "auto",
      });
    });
  }, [targets]);

  const onLeave = useCallback(() => {
    const els = targets();
    gsap.killTweensOf(els);
    gsap.to(els, {
      color: "rgba(255,255,255,0.8)",
      textShadow: "none",
      scaleX: 1,
      scaleY: 1,
      duration: 0.28,
      stagger: 0.02,
      ease: "power1.inOut",
      overwrite: "auto",
    });
  }, [targets]);

  return (
    <span className="inline-flex" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      {MKTP_LETRAS.map((letra, i) => (
        <span
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          className="inline-block"
          style={{ color: "rgba(255,255,255,0.8)", willChange: "color, text-shadow, transform" }}
        >
          {letra}
        </span>
      ))}
    </span>
  );
}

export default function Navbar({ dashboardHref: dashboardProp }: { dashboardHref?: string | null }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const t = useTranslations("Nav");

  const [logueado, setLogueado] = useState(false);
  const [perfil, setPerfil] = useState<{ nombre: string; image_url: string | null } | null>(null);
  const [redirectTo, setRedirectTo] = useState<string>(dashboardProp ?? "/");

  useEffect(() => {
    // Prop del servidor: fuente más confiable (viene de getUser()).
    if (dashboardProp) {
      setLogueado(true);
      setRedirectTo(dashboardProp);
      try {
        const raw = localStorage.getItem("fwd_perfil");
        if (raw) setPerfil(JSON.parse(raw));
      } catch { /* sin storage */ }
      return;
    }
    // Fallback: localStorage — soporta tanto fwd_dashboard (nuestro) como fwd_redirect (dev).
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
    } catch { /* modo privado / sin storage */ }
  }, [dashboardProp]);

  // Cuando el servidor confirma sesión pero localStorage no tiene perfil, lo pedimos al API.
  useEffect(() => {
    if (!logueado || perfil) return;
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { nombre?: string; image_url?: string | null } | null) => {
        if (!data?.nombre) return;
        const p = { nombre: data.nombre, image_url: data.image_url ?? null };
        setPerfil(p);
        try { localStorage.setItem("fwd_perfil", JSON.stringify(p)); } catch { /* sin storage */ }
      })
      .catch(() => {});
  }, [logueado, perfil]);

  // Sincronización cross-tab (storage) y same-tab (custom event) para foto/nombre.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== "fwd_perfil") return;
      if (!e.newValue) { setPerfil(null); return; }
      try { setPerfil(JSON.parse(e.newValue)); } catch { /* ignorar */ }
    }
    function onPerfilUpdate(e: Event) {
      const detail = (e as CustomEvent<{ nombre: string; image_url: string | null }>).detail;
      if (detail) setPerfil(detail);
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener("fwd:perfil:update", onPerfilUpdate);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("fwd:perfil:update", onPerfilUpdate);
    };
  }, []);

  async function cerrarSesion() {
    const { cerrarSesionCliente } = await import("@/lib/logout-client");
    await cerrarSesionCliente();
    localStorage.removeItem("fwd_redirect");
    router.push("/login");
    router.refresh();
  }

  // Confirma con SweetAlert antes de cerrar sesión (temático claro/oscuro).
  async function confirmarCerrarSesion() {
    const dark = document.documentElement.classList.contains("dark");
    const r = await Swal.fire({
      background: dark ? "#111827" : "#ffffff",
      color: dark ? "#f1f5f9" : "#0c1b33",
      icon: "question",
      title: "¿Cerrar sesión?",
      text: "Vas a salir de tu cuenta de FWD Marketplace.",
      showCancelButton: true,
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "No, volver",
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      reverseButtons: true,
      focusCancel: true,
    });
    if (r.isConfirmed) cerrarSesion();
  }

  // Confirma antes de ir al dashboard (misma funcionalidad que el enlace directo,
  // pero pidiendo confirmación). "No, volver a home" lleva al inicio.
  async function confirmarIrDashboard() {
    const dark = document.documentElement.classList.contains("dark");
    const r = await Swal.fire({
      background: dark ? "#111827" : "#ffffff",
      color: dark ? "#f1f5f9" : "#0c1b33",
      icon: "question",
      title: "¿Ir al dashboard?",
      text: "Esto te va a enviar a tu dashboard. ¿Estás seguro?",
      showCancelButton: true,
      confirmButtonText: "Sí, ir al dashboard",
      cancelButtonText: "No, volver a home",
      confirmButtonColor: "#20BEC7",
      cancelButtonColor: "#6B7280",
      reverseButtons: true,
    });
    if (r.isConfirmed) {
      router.push(redirectTo);
    } else if (r.dismiss === Swal.DismissReason.cancel) {
      router.push("/");
    }
  }

  const iniciales =
    perfil?.nombre
      ?.split(" ")
      .filter(Boolean)
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "U";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      {/* Pill */}
      <div
        className="group relative max-w-6xl mx-auto rounded-full px-7 py-4 flex items-center justify-between shadow-lg"
        style={{ background: "linear-gradient(90deg,#0e1628 0%,#2a1060 55%,#7b1fa2 85%,#ED008C 100%)" }}
      >
        {/* Shine sweep */}
        <span
          className="pointer-events-none absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-white/10 skew-x-[-20deg] transition-transform duration-700 z-0 rounded-full"
          style={{ clipPath: "inset(0 round 9999px)" }}
        />

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

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-10">
          <Link href="/" className="text-white/80 hover:text-[#20BEC7] text-base font-semibold transition-colors duration-200">
            {t("inicio")}
          </Link>
          <Link href="/marketplace" className="text-base font-bold">
            <MarketplaceAnimado />
          </Link>
          <Link
            href="/noticias"
            className="text-white/80 hover:text-[#20BEC7] text-base font-semibold transition-colors duration-200"
          >
            {t("noticias")}
          </Link>
          {!logueado && (
            <Link href="/login" className="text-white/80 hover:text-[#20BEC7] text-base font-semibold transition-colors duration-200">
              {t("iniciarSesion")}
            </Link>
          )}
        </nav>

        {/* CTA / Usuario logueado */}
        <div className="hidden md:flex items-center gap-2.5 flex-shrink-0">
          <SettingsPanel />
          {logueado ? (
            <>
              {/* Perfil: clic redirige al dashboard según el rol (datos de la BD) */}
              <Link
                href={redirectTo}
                title="Ir a mi dashboard"
                className="flex items-center gap-2 rounded-full bg-white/10 pl-2 pr-4 py-1.5 text-white transition hover:bg-white/20"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white overflow-hidden">
                  {perfil?.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={perfil.image_url} alt="" className="h-full w-full object-cover" />
                  ) : iniciales}
                </span>
                <span className="text-sm font-semibold">{perfil?.nombre ?? "Mi perfil"}</span>
              </Link>

              {/* Ir al dashboard — Fordy sin contenedor (se funde con el navbar) */}
              <button
                type="button"
                onClick={confirmarIrDashboard}
                title="Ir al dashboard"
                className="group/dash inline-flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-0.5 transition hover:scale-105 active:scale-95"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/imagenes/fordy/ir dashboard.png"
                  alt="Ir al dashboard"
                  className="h-14 w-14 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover/dash:scale-110"
                />
                <span className="text-[10px] font-semibold leading-none text-white/85 transition-colors group-hover/dash:text-white">
                  ¿Ir al dashboard?
                </span>
              </button>

              {/* Cerrar sesión (rojo) con confirmación SweetAlert */}
              <button
                type="button"
                onClick={confirmarCerrarSesion}
                className="inline-flex items-center gap-1.5 rounded-full bg-red-500 px-4 py-2 text-sm font-bold text-white shadow-md transition hover:scale-105 hover:bg-red-600 active:scale-95"
              >
                <svg
                  width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <path d="m16 17 5-5-5-5" />
                  <path d="M21 12H9" />
                </svg>
                {t("cerrarSesion")}
              </button>
            </>
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
          <Link href="/marketplace" className="text-base font-bold py-1" onClick={() => setMenuOpen(false)}>
            <MarketplaceAnimado />
          </Link>
          <Link href="/noticias" className="text-white/80 text-base font-semibold py-1 hover:text-[#20BEC7] transition-colors" onClick={() => setMenuOpen(false)}>
            {t("noticias")}
          </Link>
          {logueado ? (
            <>
              <div className="flex items-center gap-3 border-t border-white/10 pt-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white overflow-hidden">
                  {perfil?.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={perfil.image_url} alt="" className="h-full w-full object-cover" />
                  ) : iniciales}
                </span>
                <span className="text-white font-semibold">{perfil?.nombre}</span>
              </div>
              <button
                type="button"
                onClick={() => { setMenuOpen(false); confirmarIrDashboard(); }}
                className="inline-flex items-center gap-2 text-[#0e1628] text-base font-bold py-2 px-4 rounded-full bg-[#20BEC7] transition hover:brightness-105"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/imagenes/fordy/ir dashboard.png" alt="" className="h-7 w-7 object-contain" />
                Ir al dashboard
              </button>
              <button
                onClick={() => { setMenuOpen(false); confirmarCerrarSesion(); }}
                className="text-left text-red-400 text-base font-bold py-1 hover:text-red-300 transition-colors"
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
