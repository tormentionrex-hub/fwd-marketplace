"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface Props {
  text: string;
  className?: string;
}

export default function AnimatedProjectsTitle({ text, className = "" }: Props) {
  const containerRef = useRef<HTMLHeadingElement>(null);

  const words = text.split(" ");

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = containerRef.current;
    if (!el) return;

    const chars = el.querySelectorAll<HTMLSpanElement>(".anim-char");

    /* Entrada: cada letra sube con stagger. El context con scope limpia SOLO lo de
       este título (antes el cleanup mataba los ScrollTriggers de toda la página). */
    const ctx = gsap.context(() => {
      gsap.from(".anim-char", {
        opacity: 0,
        y: 55,
        rotateX: -90,
        stagger: 0.04,
        duration: 0.6,
        ease: "back.out(1.5)",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    }, el);

    /* Hover por letra */
    chars.forEach((char) => {
      char.addEventListener("mouseenter", () => {
        gsap.to(char, {
          y: -10,
          color: getRandomColor(),
          duration: 0.2,
          ease: "power2.out",
        });
      });
      char.addEventListener("mouseleave", () => {
        gsap.to(char, { y: 0, color: "#ffffff", duration: 0.4, ease: "elastic.out(1,0.5)" });
      });
    });

    return () => { gsap.killTweensOf(chars); ctx.revert(); };
  }, []);

  return (
    <h2
      ref={containerRef}
      className={`font-heading font-black text-4xl md:text-5xl leading-tight select-none ${className}`}
      style={{ perspective: "500px" }}
    >
      {words.map((word, wi) => (
        <span key={wi} className="inline-block mr-[0.3em] overflow-hidden">
          {word.split("").map((char, ci) => (
            <span
              key={ci}
              className="anim-char inline-block text-white transition-colors duration-150"
              style={{ display: "inline-block", whiteSpace: "pre" }}
            >
              {char}
            </span>
          ))}
        </span>
      ))}

      {/* Shimmer overlay que barre el texto */}
      <style>{`
        @keyframes titleShimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
    </h2>
  );
}

const COLORS = ["#20BEC7", "#FFCB05", "#ED008C", "#008FD5", "#662E91", "#F7901E"];
function getRandomColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)] ?? "#20BEC7";
}
