"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/* Paleta FWD — un color por palabra, ciclando */
const WORD_COLORS = ["#008FD5", "#20BEC6", "#ED008C", "#662D91", "#FFCB05", "#F7901E"];

interface Props {
  text: string;
  className?: string;
}

export default function AnimatedMarketplaceTitle({ text, className = "" }: Props) {
  const containerRef = useRef<HTMLHeadingElement>(null);

  const words = text.split(" ");

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = containerRef.current;
    if (!el) return;

    const chars = el.querySelectorAll<HTMLSpanElement>(".mkt-char");

    const ctx = gsap.context(() => {
      gsap.from(".mkt-char", {
        opacity: 0,
        y: 60,
        rotateX: -90,
        stagger: 0.035,
        duration: 0.55,
        ease: "back.out(1.6)",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    }, el);

    /* Hover letra a letra */
    chars.forEach((char) => {
      const originalColor = (char as HTMLElement).style.color;
      char.addEventListener("mouseenter", () => {
        gsap.to(char, { y: -10, duration: 0.2, ease: "power2.out" });
      });
      char.addEventListener("mouseleave", () => {
        gsap.to(char, {
          y: 0,
          color: originalColor,
          duration: 0.4,
          ease: "elastic.out(1, 0.5)",
        });
      });
    });

    return () => {
      gsap.killTweensOf(chars);
      ctx.revert();
    };
  }, []);

  return (
    <h1
      ref={containerRef}
      className={`font-heading font-black text-4xl sm:text-5xl leading-tight select-none ${className}`}
      style={{ perspective: "500px" }}
    >
      {words.map((word, wi) => {
        const color = WORD_COLORS[wi % WORD_COLORS.length] ?? "#008FD5";
        return (
          <span key={wi} className="inline-block mr-[0.25em] overflow-hidden">
            {word.split("").map((char, ci) => (
              <span
                key={ci}
                className="mkt-char inline-block transition-colors duration-150"
                style={{ color, whiteSpace: "pre" }}
              >
                {char}
              </span>
            ))}
          </span>
        );
      })}
    </h1>
  );
}
