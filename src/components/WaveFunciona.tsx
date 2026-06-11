"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const COLORS = ["#20BEC6", "#FFCB05", "#ED008C", "#008FD4", "#662D91", "#F7901E"];
const getColor = () => COLORS[Math.floor(Math.random() * COLORS.length)] ?? "#20BEC6";

export default function WaveFunciona() {
  const ref = useRef<HTMLHeadingElement>(null);
  const text = "¿Cómo funciona?";
  const words = text.split(" ");

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = ref.current;
    if (!el) return;

    const chars = el.querySelectorAll<HTMLSpanElement>(".func-char");

    gsap.from(chars, {
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

    chars.forEach((char) => {
      char.addEventListener("mouseenter", () => {
        gsap.to(char, { y: -10, color: getColor(), duration: 0.2, ease: "power2.out" });
      });
      char.addEventListener("mouseleave", () => {
        gsap.to(char, { y: 0, color: "#1a0a40", duration: 0.4, ease: "elastic.out(1,0.5)" });
      });
    });

    return () => { ScrollTrigger.getAll().forEach((t) => t.kill()); };
  }, []);

  return (
    <h2
      ref={ref}
      className="font-heading font-black text-center leading-tight select-none"
      style={{ fontSize: "clamp(2.8rem, 6vw, 5rem)", perspective: "500px" }}
    >
      {words.map((word, wi) => (
        <span key={wi} className="inline-block mr-[0.3em] overflow-hidden">
          {word.split("").map((char, ci) => (
            <span
              key={ci}
              className="func-char inline-block"
              style={{ color: "#1a0a40", display: "inline-block", whiteSpace: "pre" }}
            >
              {char}
            </span>
          ))}
        </span>
      ))}
    </h2>
  );
}
