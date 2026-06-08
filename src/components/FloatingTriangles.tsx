"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/* ── Variantes de triángulo FWD ──────────────────── */
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
  yMove: number;   /* px que se mueve en scroll (neg = sube) */
  xMove: number;
  floatDelay: number;
  floatDuration: number;
}

const TRIANGLES: TriangleDef[] = [
  /* ── Hero ── */
  { id: 1,  top: "12%", left: "4%",   size: 72,  color: "#20BEC6", opacity: 0.55, rotate: 0,    variant: "double",  yMove: -120, xMove: 10,  floatDelay: 0,    floatDuration: 4   },
  { id: 2,  top: "8%",  left: "88%",  size: 44,  color: "#662D91", opacity: 0.5,  rotate: 180,  variant: "filled",  yMove: 100,  xMove: -8,  floatDelay: 0.6,  floatDuration: 5   },
  { id: 3,  top: "60%", left: "80%",  size: 88,  color: "#FFCB05", opacity: 0.22, rotate: 45,   variant: "outline", yMove: -80,  xMove: 15,  floatDelay: 1.1,  floatDuration: 6   },
  { id: 4,  top: "70%", left: "6%",   size: 52,  color: "#ED008C", opacity: 0.45, rotate: -20,  variant: "filled",  yMove: 90,   xMove: -10, floatDelay: 0.3,  floatDuration: 4.5 },
  { id: 5,  top: "40%", left: "93%",  size: 60,  color: "#008FD4", opacity: 0.38, rotate: 15,   variant: "double",  yMove: -60,  xMove: 5,   floatDelay: 0.8,  floatDuration: 5.5 },
  /* ── Cómo funciona ── */
  { id: 6,  top: "108%",left: "1%",   size: 80,  color: "#F7901E", opacity: 0.28, rotate: 0,    variant: "double",  yMove: -100, xMove: 12,  floatDelay: 0.4,  floatDuration: 5   },
  { id: 7,  top: "115%",left: "92%",  size: 48,  color: "#20BEC6", opacity: 0.35, rotate: 90,   variant: "outline", yMove: 80,   xMove: -6,  floatDelay: 0.9,  floatDuration: 4.2 },
  { id: 8,  top: "120%",left: "48%",  size: 36,  color: "#662D91", opacity: 0.3,  rotate: -45,  variant: "filled",  yMove: -70,  xMove: 8,   floatDelay: 1.5,  floatDuration: 6   },
  /* ── Proyectos ── */
  { id: 9,  top: "175%",left: "3%",   size: 64,  color: "#FFCB05", opacity: 0.25, rotate: 0,    variant: "double",  yMove: -90,  xMove: -5,  floatDelay: 0.2,  floatDuration: 5.8 },
  { id: 10, top: "185%",left: "88%",  size: 54,  color: "#ED008C", opacity: 0.32, rotate: 200,  variant: "filled",  yMove: 70,   xMove: 10,  floatDelay: 0.7,  floatDuration: 4.8 },
  /* ── Características ── */
  { id: 11, top: "240%",left: "90%",  size: 68,  color: "#008FD4", opacity: 0.28, rotate: -15,  variant: "double",  yMove: -80,  xMove: -8,  floatDelay: 0.5,  floatDuration: 5.2 },
  { id: 12, top: "245%",left: "2%",   size: 42,  color: "#20BEC6", opacity: 0.35, rotate: 25,   variant: "outline", yMove: 60,   xMove: 6,   floatDelay: 1.2,  floatDuration: 4.6 },
];

/* ── SVG de cada variante ────────────────────────── */
function TriangleSVG({ size, color, opacity, variant }: {
  size: number; color: string; opacity: number; variant: TriangleVariant;
}) {
  const w = size;
  const h = size * 0.87;
  const half = size * 0.46;
  const offset = size * 0.42;

  if (variant === "filled") {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" style={{ opacity }}>
        <polygon points={`0,0 ${w},${h / 2} 0,${h}`} fill={color} />
      </svg>
    );
  }

  if (variant === "outline") {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" style={{ opacity }}>
        <polygon
          points={`3,3 ${w - 3},${h / 2} 3,${h - 3}`}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
        />
      </svg>
    );
  }

  /* double — dos triángulos superpuestos estilo FWD ▶▶ */
  return (
    <svg width={w * 1.4} height={h} viewBox={`0 0 ${w * 1.4} ${h}`} fill="none" style={{ opacity }}>
      {/* triángulo trasero (más opaco) */}
      <polygon points={`0,0 ${half},${h / 2} 0,${h}`} fill={color} fillOpacity={0.9} />
      {/* triángulo delantero desplazado */}
      <polygon points={`${offset},0 ${offset + half},${h / 2} ${offset},${h}`} fill={color} />
    </svg>
  );
}

/* ── Componente principal ────────────────────────── */
export default function FloatingTriangles() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const container = containerRef.current;
    if (!container) return;

    const items = container.querySelectorAll<HTMLElement>(".fwd-tri");

    items.forEach((el) => {
      const yMove = parseFloat(el.dataset.y ?? "0");
      const xMove = parseFloat(el.dataset.x ?? "0");
      const delay = parseFloat(el.dataset.delay ?? "0");
      const dur   = parseFloat(el.dataset.dur ?? "5");

      /* Parallax de scroll */
      gsap.to(el, {
        y: yMove,
        x: xMove,
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.5,
        },
      });

      /* Flotación idle */
      gsap.to(el, {
        y: `+=${18}`,
        rotation: `+=${Math.random() > 0.5 ? 12 : -12}`,
        duration: dur,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay,
      });
    });

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden z-0"
      style={{ isolation: "isolate" }}
    >
      {TRIANGLES.map((t) => (
        <div
          key={t.id}
          className="fwd-tri absolute"
          data-y={t.yMove}
          data-x={t.xMove}
          data-delay={t.floatDelay}
          data-dur={t.floatDuration}
          style={{ top: t.top, left: t.left, transform: `rotate(${t.rotate}deg)` }}
        >
          <TriangleSVG
            size={t.size}
            color={t.color}
            opacity={t.opacity}
            variant={t.variant}
          />
        </div>
      ))}
    </div>
  );
}
