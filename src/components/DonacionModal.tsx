"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";

interface Props {
  onClose: () => void;
}

const TITULO = "Tu aporte nos permite seguir impulsando oportunidades.";

export default function DonacionModal({ onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef    = useRef<HTMLDivElement>(null);
  const tituloRef  = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    gsap.fromTo(overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: "power2.out" }
    );
    gsap.fromTo(cardRef.current,
      { y: 55, opacity: 0, scale: 0.93 },
      { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.5)" }
    );

    // Animación letra a letra del título
    const el = tituloRef.current;
    if (!el) return;
    const texto = el.textContent ?? "";
    el.innerHTML = texto
      .split("")
      .map((ch) =>
        ch === " "
          ? `<span class="inline-block">&nbsp;</span>`
          : `<span class="don-char inline-block">${ch}</span>`
      )
      .join("");

    gsap.fromTo(
      el.querySelectorAll(".don-char"),
      { opacity: 0, y: 16, rotateX: -65, scale: 0.75 },
      {
        opacity: 1, y: 0, rotateX: 0, scale: 1,
        duration: 0.48, stagger: 0.016, ease: "back.out(1.7)",
        delay: 0.4,
      }
    );

    return () => { document.body.style.overflow = ""; };
  }, []);

  function cerrar() {
    gsap.to(cardRef.current,    { y: 35, opacity: 0, scale: 0.95, duration: 0.22, ease: "power2.in" });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.28, delay: 0.1, onComplete: onClose });
  }

  function onOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) cerrar();
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(8,12,28,0.85)", backdropFilter: "blur(8px)" }}
      onClick={onOverlayClick}
    >
      <div
        ref={cardRef}
        className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: "linear-gradient(145deg, #0e1628 0%, #1a0a3e 55%, #0e1628 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 25px 70px rgba(0,0,0,0.7), 0 0 0 1px rgba(32,190,198,0.18), 0 0 90px rgba(32,190,198,0.05)",
        }}
      >
        {/* Barra arcoiris superior */}
        <div className="h-[3px] w-full" style={{ background: "linear-gradient(90deg, #20BEC6, #008FD5, #662D91, #ED008C)" }} />

        {/* Resplandor radial decorativo */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{ background: "radial-gradient(ellipse at top right, rgba(32,190,198,0.12) 0%, transparent 60%)" }} />
        <div className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{ background: "radial-gradient(ellipse at bottom left, rgba(237,0,140,0.08) 0%, transparent 55%)" }} />

        {/* Botón cerrar */}
        <button
          onClick={cerrar}
          aria-label="Cerrar"
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all duration-200 hover:scale-110 active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="relative px-7 pt-7 pb-8">
          {/* Logo FWD */}
          <div className="flex justify-center mb-5">
            <Image
              src="/imagenes/fwd-marketplace.png"
              alt="FWD Marketplace"
              width={1412}
              height={1114}
              className="h-16 w-auto object-contain"
            />
          </div>

          {/* Título animado */}
          <h2
            ref={tituloRef}
            className="font-heading font-black text-[1.4rem] leading-snug text-white mb-3"
            style={{ perspective: "400px" }}
          >
            {TITULO}
          </h2>

          {/* Descripción */}
          <p className="text-sm text-white/50 mb-5 leading-relaxed">
            A continuación encontrarás los datos bancarios para realizar tu donación de manera segura.
          </p>

          {/* Separador */}
          <div className="h-px w-full mb-5"
            style={{ background: "linear-gradient(90deg, transparent, rgba(32,190,198,0.5), rgba(237,0,140,0.4), transparent)" }} />

          {/* Datos bancarios */}
          <div className="flex flex-col gap-3">
            {/* Nombre de cuenta */}
            <div
              className="rounded-xl px-4 py-3.5"
              style={{
                background: "linear-gradient(135deg, rgba(0,143,213,0.12), rgba(32,190,198,0.06))",
                border: "1px solid rgba(0,143,213,0.25)",
              }}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="w-1 h-3 rounded-full flex-shrink-0" style={{ background: "linear-gradient(180deg, #20BEC6, #008FD5)" }} />
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#20BEC6]">
                  Nombre de la Cuenta
                </p>
              </div>
              <p className="font-heading font-bold text-white text-base tracking-wide">
                FUNDACION CRC ENDURANCE
              </p>
            </div>

            {/* Banco BCT */}
            <div
              className="rounded-xl px-4 py-3.5"
              style={{
                background: "linear-gradient(135deg, rgba(102,45,145,0.14), rgba(237,0,140,0.07))",
                border: "1px solid rgba(102,45,145,0.28)",
              }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-1 h-3 rounded-full flex-shrink-0" style={{ background: "linear-gradient(180deg, #662D91, #ED008C)" }} />
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#ED008C]">
                  Banco BCT
                </p>
              </div>
              <p className="text-[11px] text-white/40 mb-1">Colones</p>
              <p className="font-heading font-bold text-white text-base tracking-widest font-mono">
                CR55010710102104795748
              </p>
            </div>
          </div>

          {/* Muchas gracias */}
          <p
            className="mt-5 text-center font-heading font-black text-lg"
            style={{
              background: "linear-gradient(90deg, #20BEC6, #008FD5, #ED008C)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            ¡Muchas gracias!
          </p>

          {/* Botón cerrar */}
          <button
            onClick={cerrar}
            className="group relative mt-5 w-full h-11 rounded-full font-heading font-black text-sm text-white overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #008FD5, #662D91)",
              boxShadow: "0 4px 20px rgba(102,45,145,0.4)",
            }}
          >
            <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-white/15 skew-x-[-20deg] transition-transform duration-700 pointer-events-none" />
            <span className="relative z-10">Cerrar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
