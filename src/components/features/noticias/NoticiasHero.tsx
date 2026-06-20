"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { BarChart3, Globe2, TrendingUp } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";

const FWD_COLORS = ["#20BEC6", "#ED008C", "#662D91", "#008FD5", "#FFCB05", "#F7901E"];

function AnimatedLine({
  text,
  gradient,
  className = "",
}: {
  text: string;
  gradient: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const chars = ref.current?.querySelectorAll<HTMLSpanElement>(".nt-char");
    if (!chars) return;
    gsap.fromTo(
      chars,
      { opacity: 0, y: 40, rotateX: -70, scale: 0.85 },
      {
        opacity: 1, y: 0, rotateX: 0, scale: 1,
        stagger: 0.028, duration: 0.6, ease: "back.out(1.6)", delay: 0.1,
      },
    );
  }, []);

  return (
    <span
      ref={ref}
      className={`inline-block ${className}`}
      style={{ perspective: "600px" }}
    >
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
            gsap.to(el, {
              y: -10,
              scale: 1.2,
              duration: 0.15,
              ease: "power2.out",
              overwrite: true,
            });
            el.style.webkitTextFillColor = color;
            el.style.textShadow = `0 0 28px ${color}99, 0 0 8px ${color}55`;
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            gsap.to(el, {
              y: 0,
              scale: 1,
              duration: 0.5,
              ease: "elastic.out(1, 0.45)",
              overwrite: true,
            });
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
    <section className="relative overflow-hidden pt-36 pb-20">
      {/* Fondo blanco */}
      <div className="absolute inset-0 bg-white" />

      {/* Partículas */}
      <div className="absolute inset-0">
        <ParticleBackground />
      </div>

      {/* Difuminados de color FWD en las esquinas */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            "radial-gradient(ellipse 55% 45% at 0% 0%, rgba(32,190,198,0.18) 0%, transparent 65%)",
            "radial-gradient(ellipse 45% 50% at 100% 0%, rgba(102,45,145,0.14) 0%, transparent 60%)",
            "radial-gradient(ellipse 40% 35% at 50% 100%, rgba(237,0,140,0.10) 0%, transparent 60%)",
          ].join(", "),
        }}
      />

      {/* Línea decorativa superior */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: "linear-gradient(90deg, #20BEC6, #662D91, #ED008C, #008FD5)" }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-6 sm:px-8 text-center">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 rounded-full border px-5 py-2 mb-8"
          style={{ background: "rgba(32,190,198,0.08)", borderColor: "rgba(32,190,198,0.3)" }}
        >
          <BarChart3 className="h-4 w-4" style={{ color: "#20BEC6" }} />
          <span className="text-xs font-black uppercase tracking-[0.25em]" style={{ color: "#20BEC6" }}>
            Marketing Intelligence · FWD
          </span>
        </div>

        {/* Títulos animados */}
        <h1
          className="font-display font-black leading-[1.1] mb-6"
          style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)" }}
        >
          <AnimatedLine
            text="Noticias & Datos"
            gradient="linear-gradient(135deg, #0e1628 0%, #662D91 40%, #20BEC6 70%, #008FD5 100%)"
          />
          <br />
          <AnimatedLine
            text="de Marketing Digital"
            gradient="linear-gradient(135deg, #ED008C 0%, #662D91 50%, #008FD5 100%)"
          />
        </h1>

        {/* Subtítulo */}
        <p
          className="text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
          style={{ color: "rgba(14,22,40,0.6)" }}
        >
          Datos públicos verificados para tomar decisiones de pauta, contenido, talento y
          transformación digital en Costa Rica y Latinoamérica.
        </p>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto">
          {[
            { Icon: Globe2,     value: "4.76 M",   label: "Usuarios internet CR"       },
            { Icon: TrendingUp, value: "7.40 M",   label: "Usuarios móviles"           },
            { Icon: BarChart3,  value: "5 redes",  label: "Plataformas analizadas"     },
          ].map(({ Icon, value, label }) => (
            <div
              key={label}
              className="rounded-2xl p-4 text-center backdrop-blur-sm transition-transform duration-200 hover:scale-105"
              style={{
                background: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(32,190,198,0.2)",
                boxShadow: "0 4px 24px rgba(32,190,198,0.08)",
              }}
            >
              <Icon className="h-5 w-5 mx-auto mb-2" style={{ color: "#662D91" }} />
              <p className="font-black text-xl" style={{ color: "#0e1628" }}>{value}</p>
              <p className="text-xs mt-1" style={{ color: "rgba(14,22,40,0.55)" }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Transición hacia el dashboard oscuro */}
      <div
        className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(7,21,40,0.35))" }}
      />
    </section>
  );
}
