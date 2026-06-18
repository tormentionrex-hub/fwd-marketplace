"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import ParticleBackground from "@/components/ParticleBackground";
import Badge from "@/components/ui/Badge";
import {
  IconArrowLeft,
  IconCheck,
  IconHeart,
  IconStar,
} from "@/components/ui/icons";

interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: string;
  color: string;
  autor: string;
  calificacion: number;
  estado: string;
}

const BENEFICIOS = [
  "Acceso inmediato tras la compra",
  "Soporte de la comunidad FWD",
  "Actualizaciones incluidas",
];

interface Props {
  producto: Producto;
  locale: string;
}

export default function MarketplaceItemView({ producto, locale }: Props) {
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const infoRef   = useRef<HTMLDivElement>(null);
  const coverRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(coverRef.current,
      { x: -40, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, ease: "power3.out", delay: 0.1 }
    );

    const el = tituloRef.current;
    if (el) {
      const texto = el.textContent ?? "";
      el.innerHTML = texto
        .split("")
        .map((ch) =>
          ch === " "
            ? `<span class="inline-block">&nbsp;</span>`
            : `<span class="mkt-char inline-block">${ch}</span>`
        )
        .join("");

      gsap.fromTo(
        el.querySelectorAll(".mkt-char"),
        { opacity: 0, y: 22, rotateX: -80, scale: 0.7 },
        {
          opacity: 1, y: 0, rotateX: 0, scale: 1,
          duration: 0.55, stagger: 0.022, ease: "back.out(1.6)",
          delay: 0.35,
        }
      );

      const isDark = () => document.documentElement.classList.contains("dark");
      const fwdColors = ["#20BEC6", "#008FD5", "#662D91", "#ED008C", "#FFCB05", "#F7901E"];
      el.querySelectorAll<HTMLSpanElement>(".mkt-char").forEach((ch, i) => {
        const col = fwdColors[i % fwdColors.length]!;
        ch.addEventListener("mouseenter", () =>
          gsap.to(ch, { y: -6, scale: 1.15, color: col, duration: 0.18, ease: "power2.out" })
        );
        ch.addEventListener("mouseleave", () =>
          gsap.to(ch, { y: 0, scale: 1, color: isDark() ? "#ffffff" : "#0f172a", duration: 0.4, ease: "elastic.out(1,0.5)" })
        );
      });
    }

    if (infoRef.current) {
      const items = infoRef.current.querySelectorAll(".info-item");
      gsap.fromTo(items,
        { x: 30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.45, stagger: 0.08, ease: "power2.out", delay: 0.5 }
      );
    }
  }, []);

  return (
    /* Fondo: blanco en light, oscuro en dark */
    <div className="relative min-h-screen overflow-hidden bg-white dark:bg-[#0e1628] transition-colors duration-300">

      {/* Partículas — solo visibles en dark (opacity-0 en light) */}
      <div className="opacity-0 dark:opacity-100 transition-opacity duration-500 absolute inset-0 pointer-events-none">
        <ParticleBackground />
      </div>

      {/* Resplandores decorativos — solo en dark */}
      <div className="pointer-events-none absolute inset-0 opacity-0 dark:opacity-100 transition-opacity duration-500">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ background: "#20BEC6" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-8"
          style={{ background: "#ED008C" }} />
      </div>

      {/* Barra arcoíris */}
      <div className="relative z-10 h-[3px] w-full"
        style={{ background: "linear-gradient(90deg, #20BEC6, #008FD5, #662D91, #ED008C)" }} />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-10 sm:px-8">

        {/* Volver */}
        <Link
          href={`/${locale}/marketplace`}
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-white/50 transition-all duration-200 hover:text-[#20BEC6] dark:hover:text-[#20BEC6]"
        >
          <IconArrowLeft width={16} height={16} className="transition-transform duration-200 group-hover:-translate-x-1" />
          Volver al marketplace
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-2">

          {/* ── Cover ── */}
          <div
            ref={coverRef}
            className="relative flex h-72 items-center justify-center overflow-hidden rounded-3xl shadow-2xl lg:h-full lg:min-h-[420px]"
            style={{
              backgroundColor: producto.color,
              boxShadow: `0 30px 80px ${producto.color}44`,
            }}
          >
            <svg viewBox="0 0 66 76" className="h-44 w-44" fill="#ffffff" opacity={0.2} aria-hidden>
              <path d="M0 0 L66 38 L0 76 Z" />
            </svg>
            <svg viewBox="0 0 66 76" className="absolute -right-6 top-10 h-32 w-32" fill="#ffffff" opacity={0.1} aria-hidden>
              <path d="M0 0 L66 38 L0 76 Z" />
            </svg>
            <svg viewBox="0 0 66 76" className="absolute -left-4 bottom-8 h-20 w-20" fill="#ffffff" opacity={0.07} aria-hidden>
              <path d="M0 0 L66 38 L0 76 Z" />
            </svg>
            <span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-700 shadow-sm">
              {producto.categoria}
            </span>
          </div>

          {/* ── Info ── */}
          <div ref={infoRef} className="flex flex-col">

            {/* Badge + rating */}
            <div className="info-item flex items-center gap-3">
              <Badge variant="featured">{producto.estado}</Badge>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-white/60">
                <IconStar width={15} height={15} className="text-[#FFCB05]" />
                <span className="text-[#FFCB05] font-bold">{producto.calificacion.toFixed(1)}</span>
                <span>· 128 reseñas</span>
              </span>
            </div>

            {/* Título */}
            <h1
              ref={tituloRef}
              className="info-item mt-5 font-heading font-black text-3xl sm:text-4xl lg:text-5xl leading-tight text-slate-900 dark:text-white cursor-default"
              style={{ perspective: "500px" }}
            >
              {producto.nombre}
            </h1>

            {/* Separador */}
            <div className="info-item mt-4 h-px w-16"
              style={{ background: "linear-gradient(90deg, #20BEC6, #ED008C)" }} />

            {/* Descripción */}
            <p className="info-item mt-4 text-base leading-relaxed text-slate-500 dark:text-white/60">
              {producto.descripcion} Diseñado para integrarse fácilmente en tu flujo de trabajo y
              ayudarte a avanzar más rápido.
            </p>

            {/* Beneficios */}
            <ul className="info-item mt-6 flex flex-col gap-3">
              {BENEFICIOS.map((b) => (
                <li key={b} className="flex items-center gap-3 text-sm text-slate-700 dark:text-white/80">
                  <span className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-full text-white"
                    style={{ background: "linear-gradient(135deg, #20BEC6, #008FD5)" }}>
                    <IconCheck width={12} height={12} />
                  </span>
                  {b}
                </li>
              ))}
            </ul>

            {/* Autor */}
            <div
              className="info-item mt-6 flex items-center gap-3 rounded-2xl border p-4 bg-slate-50 border-slate-200 dark:bg-white/5 dark:border-white/10 transition-colors duration-300"
            >
              <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full font-heading font-black text-white text-lg"
                style={{ background: "linear-gradient(135deg, #662D91, #ED008C)" }}>
                {producto.autor.charAt(0)}
              </span>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{producto.autor}</p>
                <p className="text-xs text-slate-500 dark:text-white/40">Publicado por la comunidad FWD</p>
              </div>
            </div>

            {/* Precio + acciones */}
            <div className="info-item mt-auto flex flex-col gap-4 pt-8 sm:flex-row sm:items-center">
              <span
                className="font-heading font-black text-4xl"
                style={{
                  background: "linear-gradient(90deg, #20BEC6, #008FD5)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {producto.precio}
              </span>

              <div className="flex flex-1 gap-3">
                <AdquirirBtn />
                <FavoritoBtn />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdquirirBtn() {
  return (
    <button
      className="group relative flex-1 h-12 rounded-full overflow-hidden font-heading font-black text-sm text-white transition-all duration-300 hover:scale-[1.03] hover:brightness-110 active:scale-[0.97]"
      style={{
        background: "linear-gradient(135deg, #008FD5, #662D91)",
        boxShadow: "0 4px 20px rgba(0,143,213,0.4)",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 32px rgba(102,45,145,0.6)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,143,213,0.4)"; }}
    >
      <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-white/20 skew-x-[-20deg] transition-transform duration-700 pointer-events-none" />
      <span className="relative z-10">Adquirir ahora</span>
    </button>
  );
}

function FavoritoBtn() {
  return (
    <button
      aria-label="Agregar a favoritos"
      className="h-12 w-12 flex-shrink-0 rounded-full flex items-center justify-center border border-slate-200 bg-slate-100 dark:bg-white/7 dark:border-white/15 transition-all duration-300 hover:scale-110 active:scale-95"
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(237,0,140,0.12)";
        e.currentTarget.style.borderColor = "rgba(237,0,140,0.5)";
        e.currentTarget.style.boxShadow = "0 0 20px rgba(237,0,140,0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "";
        e.currentTarget.style.borderColor = "";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <IconHeart width={18} height={18} className="text-slate-500 dark:text-white/60" />
    </button>
  );
}
