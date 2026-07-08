"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

type TriangleVariant = "filled" | "outline" | "double";

interface TriangleDef {
  id: number;
  top: string;
  left: string;
  size: number;
  color: string;
  opacity: number;
  rotate: number;
  variant: TriangleVariant;
  floatY: number;
  floatRotate: number;
  floatDelay: number;
  floatDuration: number;
}

/* Los `top` son porcentaje de la ALTURA TOTAL de la página (el contenedor cubre
   todo el home), no de un viewport. Antes las secciones inferiores usaban valores
   de 105%-248% pensados como "pantallas": quedaban fuera de la página y 7 de los
   12 triángulos nunca se veían. Franjas aproximadas del home: hero 0-20%,
   cómo funciona 20-50%, proyectos 50-66%, características 66-78%, estudiantes 78-100%. */
const TRIANGLES: TriangleDef[] = [
  /* ── Hero ── */
  { id: 1,  top: "6%",   left: "3%",   size: 72,  color: "#20BEC6", opacity: 0.55, rotate: 0,    variant: "double",  floatY: 14, floatRotate: 8,   floatDelay: 0,    floatDuration: 4   },
  { id: 2,  top: "5%",   left: "88%",  size: 44,  color: "#662D91", opacity: 0.5,  rotate: 180,  variant: "filled",  floatY: 18, floatRotate: -10, floatDelay: 0.6,  floatDuration: 5   },
  { id: 3,  top: "55%",  left: "82%",  size: 88,  color: "#FFCB05", opacity: 0.2,  rotate: 45,   variant: "outline", floatY: 10, floatRotate: 6,   floatDelay: 1.1,  floatDuration: 6   },
  { id: 4,  top: "65%",  left: "5%",   size: 52,  color: "#ED008C", opacity: 0.45, rotate: -20,  variant: "filled",  floatY: 16, floatRotate: -8,  floatDelay: 0.3,  floatDuration: 4.5 },
  { id: 5,  top: "38%",  left: "94%",  size: 60,  color: "#008FD4", opacity: 0.38, rotate: 15,   variant: "double",  floatY: 12, floatRotate: 10,  floatDelay: 0.8,  floatDuration: 5.5 },
  /* ── Cómo funciona ── */
  { id: 6,  top: "24%",  left: "1%",   size: 76,  color: "#F7901E", opacity: 0.28, rotate: 0,    variant: "double",  floatY: 14, floatRotate: -6,  floatDelay: 0.4,  floatDuration: 5   },
  { id: 7,  top: "32%",  left: "93%",  size: 48,  color: "#20BEC6", opacity: 0.35, rotate: 90,   variant: "outline", floatY: 18, floatRotate: 8,   floatDelay: 0.9,  floatDuration: 4.2 },
  { id: 8,  top: "42%",  left: "46%",  size: 36,  color: "#662D91", opacity: 0.3,  rotate: -45,  variant: "filled",  floatY: 10, floatRotate: -12, floatDelay: 1.5,  floatDuration: 6   },
  /* ── Proyectos ── */
  { id: 9,  top: "52%",  left: "2%",   size: 64,  color: "#FFCB05", opacity: 0.25, rotate: 0,    variant: "double",  floatY: 16, floatRotate: 6,   floatDelay: 0.2,  floatDuration: 5.8 },
  { id: 10, top: "61%",  left: "89%",  size: 54,  color: "#ED008C", opacity: 0.32, rotate: 200,  variant: "filled",  floatY: 12, floatRotate: -8,  floatDelay: 0.7,  floatDuration: 4.8 },
  /* ── Características ── */
  { id: 11, top: "69%",  left: "91%",  size: 68,  color: "#008FD4", opacity: 0.28, rotate: -15,  variant: "double",  floatY: 14, floatRotate: 10,  floatDelay: 0.5,  floatDuration: 5.2 },
  { id: 12, top: "76%",  left: "1%",   size: 42,  color: "#20BEC6", opacity: 0.35, rotate: 25,   variant: "outline", floatY: 18, floatRotate: -6,  floatDelay: 1.2,  floatDuration: 4.6 },
];

function TriangleSVG({ size, color, opacity, variant }: {
  size: number; color: string; opacity: number; variant: TriangleVariant;
}) {
  const h = size * 0.87;
  const half = size * 0.46;
  const offset = size * 0.42;

  if (variant === "filled") {
    return (
      <svg width={size} height={h} viewBox={`0 0 ${size} ${h}`} fill="none" style={{ opacity }}>
        <polygon points={`0,0 ${size},${h / 2} 0,${h}`} fill={color} />
      </svg>
    );
  }

  if (variant === "outline") {
    return (
      <svg width={size} height={h} viewBox={`0 0 ${size} ${h}`} fill="none" style={{ opacity }}>
        <polygon
          points={`3,3 ${size - 3},${h / 2} 3,${h - 3}`}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
        />
      </svg>
    );
  }

  /* double ▶▶ */
  return (
    <svg width={size * 1.4} height={h} viewBox={`0 0 ${size * 1.4} ${h}`} fill="none" style={{ opacity }}>
      <polygon points={`0,0 ${half},${h / 2} 0,${h}`} fill={color} fillOpacity={0.85} />
      <polygon points={`${offset},0 ${offset + half},${h / 2} ${offset},${h}`} fill={color} />
    </svg>
  );
}

export default function FloatingTriangles() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = container.querySelectorAll<HTMLElement>(".fwd-tri");

    /* Con prefers-reduced-motion los triángulos quedan estáticos (visibles, sin
       flotar). mm.revert() limpia los tweens al desmontar. */
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      items.forEach((el) => {
        const floatY   = parseFloat(el.dataset.floaty   ?? "14");
        const floatRot = parseFloat(el.dataset.floatrot ?? "8");
        const delay    = parseFloat(el.dataset.delay    ?? "0");
        const dur      = parseFloat(el.dataset.dur      ?? "5");

        /* Solo flotación idle — sin seguir el scroll */
        gsap.to(el, {
          y: `+=${floatY}`,
          rotation: `+=${floatRot}`,
          duration: dur,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay,
        });
      });
    });

    return () => { mm.revert(); };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {TRIANGLES.map((t) => (
        <div
          key={t.id}
          className="fwd-tri absolute"
          data-floaty={t.floatY}
          data-floatrot={t.floatRotate}
          data-delay={t.floatDelay}
          data-dur={t.floatDuration}
          style={{ top: t.top, left: t.left, transform: `rotate(${t.rotate}deg)` }}
        >
          <TriangleSVG size={t.size} color={t.color} opacity={t.opacity} variant={t.variant} />
        </div>
      ))}
    </div>
  );
}
