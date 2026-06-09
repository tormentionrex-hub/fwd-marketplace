"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const FWD_COLORS = ["#20BEC7", "#FFCB05", "#008FD5", "#662E91", "#F7901E"];

interface WordProps {
  word: string;
  baseColor: string;
  index: number;
}

function AnimatedWord({ word, baseColor, index }: WordProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const letters = el.querySelectorAll<HTMLSpanElement>(".hero-char");

    const onEnter = () => {
      gsap.to(el, { scale: 1.06, duration: 0.2, ease: "power2.out" });
      gsap.to(letters, {
        y: -8,
        color: baseColor === "#ffffff"
          ? (FWD_COLORS[index % FWD_COLORS.length] ?? "#20BEC7")
          : baseColor,
        stagger: 0.03,
        duration: 0.2,
        ease: "power2.out",
      });
    };

    const onLeave = () => {
      gsap.to(el, { scale: 1, duration: 0.35, ease: "elastic.out(1,0.5)" });
      gsap.to(letters, {
        y: 0,
        color: baseColor,
        stagger: 0.02,
        duration: 0.35,
        ease: "elastic.out(1,0.5)",
      });
    };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [baseColor, index]);

  return (
    <span
      ref={ref}
      className="inline-block cursor-pointer"
      style={{ transformOrigin: "center bottom" }}
    >
      {word.split("").map((char, i) => (
        <span
          key={i}
          className="hero-char inline-block"
          style={{ color: baseColor, whiteSpace: "pre" }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}

interface HeroTitleProps {
  title1: string;
  titleHighlight: string;
  title2: string;
}

export default function AnimatedHeroTitle({ title1, titleHighlight, title2 }: HeroTitleProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);

  /* Construir segmentos dinámicamente desde props */
  const segments: [string, string][] = [
    ...title1.split(" ").flatMap((w, i, arr) => {
      const pair: [string, string][] = [[w, "#ffffff"]];
      if (i < arr.length - 1) pair.push([" ", "#ffffff"]);
      return pair;
    }),
    [" ", "#ffffff"],
    ...titleHighlight.split(" ").flatMap((w, i, arr) => {
      const pair: [string, string][] = [[w, "#ED008C"]];
      if (i < arr.length - 1) pair.push([" ", "#ED008C"]);
      return pair;
    }),
    [" ", "#ffffff"],
    ...title2.split(" ").flatMap((w, i, arr) => {
      const pair: [string, string][] = [[w, "#ffffff"]];
      if (i < arr.length - 1) pair.push([" ", "#ffffff"]);
      return pair;
    }),
  ];

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const words = el.querySelectorAll<HTMLSpanElement>(".hero-word");

    gsap.from(words, {
      opacity: 0,
      y: 50,
      rotateX: -60,
      stagger: 0.07,
      duration: 0.7,
      ease: "back.out(1.4)",
      delay: 0.2,
    });
  }, []);

  return (
    <h1
      ref={containerRef}
      data-hero="title"
      className="font-heading font-black text-4xl md:text-5xl lg:text-6xl leading-tight mb-6"
      style={{ perspective: "600px" }}
    >
      {segments.map(([word, color], i) =>
        word === " " ? (
          <span key={i}> </span>
        ) : (
          <span key={i} className="hero-word inline-block">
            <AnimatedWord word={word} baseColor={color} index={i} />
          </span>
        )
      )}
    </h1>
  );
}
