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

// Cuatro animaciones distintas para cada paso — temática "energía académica"
const stepAnims = [
  // Paso 1 — Volteo horizontal: la insignia gira en X (flip) y el texto entra deslizándose
  (badge: HTMLElement, texto: HTMLElement) => {
    gsap.killTweensOf([badge, texto]);
    gsap.timeline()
      .to(badge, { scaleX: 0, duration: 0.14, ease: "power2.in" })
      .set(badge, { color: "#ED008C", borderColor: "#ED008C" })
      .to(badge, { scaleX: 1, duration: 0.22, ease: "back.out(2.5)" })
      .to(badge, { color: "#662E91", borderColor: "#662E91", duration: 0.4 }, "+=0.1");
    gsap.fromTo(texto, { x: -10, opacity: 0.4 }, { x: 0, opacity: 1, duration: 0.35, ease: "power2.out" });
  },

  // Paso 2 — Goma elástica: se estira horizontal luego vertical como jelly
  (badge: HTMLElement, texto: HTMLElement) => {
    gsap.killTweensOf([badge, texto]);
    gsap.timeline()
      .to(badge, { scaleX: 1.6, scaleY: 0.55, duration: 0.12, ease: "power2.out" })
      .to(badge, { scaleX: 0.7, scaleY: 1.4, duration: 0.1, ease: "power2.in" })
      .to(badge, { scaleX: 1.15, scaleY: 0.9, duration: 0.1 })
      .to(badge, { scaleX: 1, scaleY: 1, duration: 0.4, ease: "elastic.out(1, 0.45)" });
    gsap.fromTo(texto, { x: 8, opacity: 0.5 }, { x: 0, opacity: 1, duration: 0.3, ease: "power3.out" });
  },

  // Paso 3 — Anillo de pulso: la insignia expande un halo morado y luego contrae
  (badge: HTMLElement, texto: HTMLElement) => {
    gsap.killTweensOf([badge, texto]);
    gsap.timeline()
      .to(badge, {
        scale: 1.35,
        boxShadow: "0 0 0 10px #662E9145, 0 0 0 20px #662E9118",
        duration: 0.22,
        ease: "power2.out",
      })
      .to(badge, {
        scale: 1,
        boxShadow: "0 0 0 0px #662E9100",
        duration: 0.35,
        ease: "power2.inOut",
      });
    gsap.timeline()
      .to(texto, { color: "#662E91", duration: 0.18 })
      .to(texto, { color: "#ED008C", duration: 0.18 })
      .to(texto, { color: "", duration: 0.25 });
  },

  // Paso 4 — Baile Tada: la insignia oscila izquierda-derecha acelerando y frenando
  (badge: HTMLElement, texto: HTMLElement) => {
    gsap.killTweensOf([badge, texto]);
    gsap.timeline()
      .to(badge, { rotate: -18, scale: 0.88, duration: 0.1, ease: "power2.out" })
      .to(badge, { rotate: 18, scale: 1.12, duration: 0.1 })
      .to(badge, { rotate: -12, duration: 0.09 })
      .to(badge, { rotate: 12, duration: 0.09 })
      .to(badge, { rotate: -6, duration: 0.08 })
      .to(badge, { rotate: 6, duration: 0.08 })
      .to(badge, { rotate: 0, scale: 1, duration: 0.2, ease: "back.out(2)" });
    gsap.timeline()
      .to(texto, { y: -6, duration: 0.18, ease: "power2.out" })
      .to(texto, { y: 0, duration: 0.35, ease: "elastic.out(1, 0.5)" });
  },
];

export function EstudianteCard({ pasos, titulo, ctaLabel, ctaHref }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const badgeRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const textoRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  const onCardEnter = useCallback(() => {
    gsap.to(cardRef.current, {
      scale: 1.025,
      y: -10,
      rotate: 0.6,
      boxShadow: "0 24px 60px rgba(102,46,145,0.35), 0 8px 20px rgba(237,0,140,0.15)",
      borderColor: "#662E9160",
      duration: 0.4,
      ease: "power2.out",
    });
  }, []);

  const onCardLeave = useCallback(() => {
    gsap.to(cardRef.current, {
      scale: 1,
      y: 0,
      rotate: 0,
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
        <div className="w-12 h-12 rounded-xl bg-[#662E91] flex items-center justify-center shadow-sm flex-shrink-0">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
        </div>
        <span className="font-heading font-black text-2xl text-[#662E91]">{titulo}</span>
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
              className="inline-flex flex-shrink-0 w-8 h-8 rounded-full border-2 border-[#662E91] text-[#662E91] text-sm font-bold items-center justify-center"
              style={{ willChange: "transform, box-shadow, color" }}
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
          className="group relative flex items-center justify-center gap-3 w-full text-white font-bold py-4 rounded-xl overflow-hidden uppercase tracking-widest text-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_8px_30px_#662E9166] active:scale-95"
          style={{ background: "linear-gradient(90deg,#662E91,#ED008C)" }}
        >
          <span className="relative z-10">{ctaLabel}</span>
          <span className="relative z-10 text-base transition-transform duration-300 group-hover:translate-x-1">→</span>
          <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-white/20 skew-x-[-20deg] transition-transform duration-700" />
        </Link>
      </div>
    </div>
  );
}
