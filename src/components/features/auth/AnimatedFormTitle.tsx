"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const HOVER_COLORS = ["#008FD5", "#20BEC6", "#662D91", "#ED008C", "#FFCB05", "#F7901E"];

interface Props {
  text: string;
  accentFrom?: string;
  accentTo?: string;
}

export default function AnimatedFormTitle({
  text,
  accentFrom = "#20BEC6",
  accentTo   = "#662D91",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chars = el.querySelectorAll<HTMLSpanElement>(".ftitle-char");

    gsap.fromTo(
      chars,
      { opacity: 0, y: 30, rotateX: -80, scale: 0.85 },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        scale: 1,
        stagger: 0.04,
        duration: 0.55,
        ease: "back.out(1.7)",
        delay: 0.05,
        clearProps: "transform,opacity",
      },
    );
  }, []);

  return (
    <div ref={ref} className="flex items-center gap-3 mb-3">
      {/* Barra de acento animada */}
      <span
        className="h-8 w-1 rounded-full flex-shrink-0"
        style={{ background: `linear-gradient(180deg, ${accentFrom}, ${accentTo})` }}
      />

      {/* Título con letras individuales */}
      <h1
        className="font-display text-3xl font-black text-fwd-ink"
        style={{ perspective: "500px" }}
      >
        {text.split("").map((char, i) => (
          <span
            key={i}
            className="ftitle-char inline-block cursor-default"
            style={{ whiteSpace: "pre" }}
            onMouseEnter={(e) => {
              const color = HOVER_COLORS[i % HOVER_COLORS.length] ?? "#008FD5";
              gsap.to(e.currentTarget, {
                y: -8,
                scale: 1.2,
                color,
                textShadow: `0 0 16px ${color}88`,
                duration: 0.15,
                ease: "power2.out",
              });
            }}
            onMouseLeave={(e) => {
              gsap.to(e.currentTarget, {
                y: 0,
                scale: 1,
                color: "#1a1a2e",
                textShadow: "none",
                duration: 0.35,
                ease: "elastic.out(1,0.5)",
              });
            }}
          >
            {char}
          </span>
        ))}
      </h1>
    </div>
  );
}
