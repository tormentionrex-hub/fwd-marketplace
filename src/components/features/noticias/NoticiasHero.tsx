"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Newspaper, Users, Rss } from "lucide-react";

const FWD_COLORS = ["#20BEC6", "#ED008C", "#662D91", "#008FD5", "#FFCB05", "#F7901E"];

function AnimatedLine({ text, gradient, className = "" }: { text: string; gradient: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const chars = ref.current?.querySelectorAll<HTMLSpanElement>(".nt-char");
    if (!chars) return;
    gsap.fromTo(
      chars,
      { opacity: 0, y: 40, rotateX: -70, scale: 0.85 },
      { opacity: 1, y: 0, rotateX: 0, scale: 1, stagger: 0.028, duration: 0.6, ease: "back.out(1.6)", delay: 0.1 },
    );
  }, []);

  return (
    <span ref={ref} className={`inline-block ${className}`} style={{ perspective: "600px" }}>
      {text.split("").map((char, i) => (
        <span
          key={i}
          className="nt-char inline-block cursor-default select-none"
          style={{
            background: gradient,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            whiteSpace: "pre",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            const color = FWD_COLORS[i % FWD_COLORS.length] ?? "#20BEC6";
            gsap.to(el, { y: -10, scale: 1.2, duration: 0.15, ease: "power2.out", overwrite: true });
            el.style.webkitTextFillColor = color;
            el.style.textShadow = `0 0 28px ${color}99, 0 0 8px ${color}55`;
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            gsap.to(el, { y: 0, scale: 1, duration: 0.5, ease: "elastic.out(1, 0.45)", overwrite: true });
            el.style.webkitTextFillColor = "transparent";
            el.style.textShadow = "none";
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}

export default function NoticiasHero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-10">
      {/* Difuminados de color FWD */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            "radial-gradient(ellipse 55% 45% at 0% 0%, rgba(32,190,198,0.16) 0%, transparent 65%)",
            "radial-gradient(ellipse 45% 50% at 100% 0%, rgba(102,45,145,0.13) 0%, transparent 60%)",
            "radial-gradient(ellipse 40% 35% at 50% 100%, rgba(237,0,140,0.09) 0%, transparent 60%)",
          ].join(", "),
        }}
      />
      {/* Línea decorativa superior */}
      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: "linear-gradient(90deg, #20BEC6, #662D91, #ED008C, #008FD5)" }} />

      {/* Fordy decorativos */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/imagenes/fordy/fordy-audifonos.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-2 top-24 hidden h-24 w-auto -rotate-12 opacity-90 md:block lg:left-10 lg:h-32"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/imagenes/fordy/fordy-telescopio.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute right-2 top-20 hidden h-28 w-auto rotate-12 opacity-90 md:block lg:right-10 lg:h-36"
      />

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        {/* Badge */}
        <div
          className="mb-6 inline-flex items-center gap-2 rounded-full border px-5 py-2"
          style={{ background: "rgba(32,190,198,0.08)", borderColor: "rgba(32,190,198,0.3)" }}
        >
          <Rss className="h-4 w-4" style={{ color: "#20BEC6" }} />
          <span className="text-xs font-black uppercase tracking-[0.25em]" style={{ color: "#20BEC6" }}>
            Foro de la comunidad · FWD
          </span>
        </div>

        {/* Título */}
        <h1 className="mb-4 font-display font-black leading-[1.1]" style={{ fontSize: "clamp(2.2rem, 5.5vw, 4rem)" }}>
          <AnimatedLine text="Noticias de Tecnología" gradient="linear-gradient(135deg, #0e1628 0%, #662D91 40%, #20BEC6 70%, #008FD5 100%)" />
        </h1>

        <p className="mx-auto mb-6 max-w-xl text-base leading-relaxed text-[#28374F]/90 dark:text-white/70 sm:text-lg">
          Compartí y descubrí lo último en IA, desarrollo, ciberseguridad y más. Publicá un enlace, una imagen o tu opinión, y sumate a la conversación.
        </p>

        {/* Mini stats de comunidad */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-semibold text-[#4C5E7C] dark:text-white/60">
          <span className="inline-flex items-center gap-1.5">
            <Newspaper className="h-4 w-4" style={{ color: "#662D91" }} /> Publicá noticias
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-4 w-4" style={{ color: "#EC008C" }} /> Estudiantes y empresas
          </span>
        </div>
      </div>
    </section>
  );
}
