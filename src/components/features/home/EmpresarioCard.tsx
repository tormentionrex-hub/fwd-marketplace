"use client";

import { useRef, useCallback } from "react";
import { Link } from "@/i18n/navigation";
import gsap from "gsap";

type Props = {
  pasos: string[];
  titulo: string;
  ctaLabel: string;
  ctaHref: string;
};

// Cuatro animaciones distintas para cada paso — temática "lanzamiento corporativo"
const stepAnims = [
  // Paso 1 — Empuje: la insignia sale disparada hacia la derecha y vuelve con elástico
  (badge: HTMLElement, texto: HTMLElement) => {
    gsap.killTweensOf([badge, texto]);
    gsap.timeline()
      .to(badge, { x: 16, duration: 0.1, ease: "power3.out" })
      .to(badge, { x: 0, duration: 0.55, ease: "elastic.out(1.2, 0.4)" });
    gsap.to(texto, { x: 5, opacity: 0.6, duration: 0.1, yoyo: true, repeat: 1 });
  },

  // Paso 2 — Rebote aplastado: sube, se aplana al caer, rebota
  (badge: HTMLElement, texto: HTMLElement) => {
    gsap.killTweensOf([badge, texto]);
    gsap.timeline()
      .to(badge, { y: -14, scaleX: 1.15, scaleY: 0.7, duration: 0.14, ease: "power2.out" })
      .to(badge, { y: 3, scaleX: 0.85, scaleY: 1.25, duration: 0.1, ease: "power2.in" })
      .to(badge, { y: 0, scaleX: 1, scaleY: 1, duration: 0.35, ease: "elastic.out(1, 0.5)" });
    gsap.to(texto, { y: -4, duration: 0.15, yoyo: true, repeat: 1, ease: "power1.inOut" });
  },

  // Paso 3 — Giro 360°: la insignia da una vuelta completa con glow azul
  (badge: HTMLElement, texto: HTMLElement) => {
    gsap.killTweensOf([badge, texto]);
    gsap.to(badge, {
      rotation: 360,
      duration: 0.5,
      ease: "power1.inOut",
      onComplete: () => gsap.set(badge, { rotation: 0 }),
    });
    gsap.timeline()
      .to(texto, { color: "#008FD5", textShadow: "0 0 10px #008FD590", duration: 0.2 })
      .to(texto, { color: "", textShadow: "none", duration: 0.3, delay: 0.1 });
  },

  // Paso 4 — Temblor: vibración rápida de la insignia
  (badge: HTMLElement, texto: HTMLElement) => {
    gsap.killTweensOf([badge, texto]);
    gsap.timeline()
      .to(badge, { x: 5, duration: 0.05 })
      .to(badge, { x: -5, duration: 0.05 })
      .to(badge, { x: 4, duration: 0.05 })
      .to(badge, { x: -4, duration: 0.05 })
      .to(badge, { x: 2, duration: 0.04 })
      .to(badge, { x: -2, duration: 0.04 })
      .to(badge, { x: 0, duration: 0.04 });
    gsap.to(texto, { scale: 1.03, duration: 0.15, yoyo: true, repeat: 1 });
  },
];

export function EmpresarioCard({ pasos, titulo, ctaLabel, ctaHref }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const badgeRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const textoRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  const onCardEnter = useCallback(() => {
    gsap.to(cardRef.current, {
      scale: 1.025,
      y: -10,
      boxShadow: "0 24px 60px rgba(0,143,213,0.35), 0 8px 20px rgba(0,143,213,0.2)",
      borderColor: "#008FD560",
      duration: 0.4,
      ease: "power2.out",
    });
  }, []);

  const onCardLeave = useCallback(() => {
    gsap.to(cardRef.current, {
      scale: 1,
      y: 0,
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      borderColor: "",
      duration: 0.45,
      ease: "power2.out",
    });
  }, []);

  const onStepEnter = useCallback((i: number) => {
    const badge = badgeRefs.current[i];
    const texto = textoRefs.current[i];
    if (!badge || !texto) return;
    stepAnims[i]?.(badge, texto);
  }, []);

  return (
    <div
      ref={cardRef}
      className="bg-surface rounded-2xl p-8 shadow-sm border border-border flex flex-col cursor-default"
      style={{ willChange: "transform, box-shadow" }}
      onMouseEnter={onCardEnter}
      onMouseLeave={onCardLeave}
    >
      {/* Encabezado */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-[#008FD5] flex items-center justify-center shadow-sm flex-shrink-0">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            <line x1="12" y1="12" x2="12" y2="16" />
            <line x1="10" y1="14" x2="14" y2="14" />
          </svg>
        </div>
        <span className="font-heading font-black text-2xl text-[#008FD5]">{titulo}</span>
      </div>

      {/* Pasos */}
      <ol className="flex flex-col gap-5 flex-1">
        {pasos.map((texto, i) => (
          <li
            key={i}
            className="flex items-center gap-4 cursor-default"
            onMouseEnter={() => onStepEnter(i)}
          >
            <span
              ref={(el) => { badgeRefs.current[i] = el; }}
              className="inline-flex flex-shrink-0 w-8 h-8 rounded-full border-2 border-[#008FD5] text-[#008FD5] text-sm font-bold items-center justify-center"
              style={{ willChange: "transform" }}
            >
              {i + 1}
            </span>
            <p
              ref={(el) => { textoRefs.current[i] = el; }}
              className="text-text-muted text-base font-normal leading-snug"
              style={{ willChange: "transform, color" }}
            >
              {texto}
            </p>
          </li>
        ))}
      </ol>

      {/* CTA */}
      <div className="mt-8">
        <Link
          href={ctaHref}
          className="btn-empresa group relative flex items-center justify-center gap-3 w-full text-white font-bold py-4 rounded-xl overflow-hidden uppercase tracking-widest text-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_8px_30px_#008FD566] active:scale-95"
          style={{ background: "linear-gradient(90deg,#008FD5,#20BEC6)" }}
        >
          <span className="relative z-10">{ctaLabel}</span>
          <span className="relative z-10 text-base transition-transform duration-300 group-hover:translate-x-1">→</span>
          <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-white/20 skew-x-[-20deg] transition-transform duration-700" />
        </Link>
      </div>
    </div>
  );
}
