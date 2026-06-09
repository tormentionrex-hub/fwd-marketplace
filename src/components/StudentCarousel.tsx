"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface Estudiante {
  nombre: string;
  rol: string;
  tecnologias: string[];
  frase: string;
  color: string;
  iniciales: string;
  foto?: string;
}

const estudiantes: Estudiante[] = [
  {
    nombre: "María González",
    rol: "Full Stack Developer",
    tecnologias: ["React", "Node.js", "PostgreSQL"],
    frase: "FWD me dio la oportunidad de trabajar en proyectos reales antes de graduarme. La experiencia fue invaluable.",
    color: "#008FD4",
    iniciales: "MG",
  },
  {
    nombre: "Carlos Jiménez",
    rol: "UX/UI Designer",
    tecnologias: ["Figma", "React", "TailwindCSS"],
    frase: "Aprendí más en 3 meses de proyectos reales que en un año de clases teóricas.",
    color: "#ED008C",
    iniciales: "CJ",
  },
  {
    nombre: "Ana Vargas",
    rol: "Data Analyst",
    tecnologias: ["Python", "SQL", "Power BI"],
    frase: "Conecté con empresas que valoran el talento joven de Costa Rica.",
    color: "#FFCB05",
    iniciales: "AV",
  },
  {
    nombre: "Diego Mora",
    rol: "Backend Developer",
    tecnologias: ["Python", "FastAPI", "Docker"],
    frase: "Publicar mi primer proyecto fue el punto de quiebre en mi carrera.",
    color: "#20BEC6",
    iniciales: "DM",
  },
  {
    nombre: "Sofía Castro",
    rol: "Mobile Developer",
    tecnologias: ["React Native", "Firebase", "TypeScript"],
    frase: "La plataforma me ayudó a construir un portafolio profesional real desde el primer día.",
    color: "#662D91",
    iniciales: "SC",
  },
  {
    nombre: "Andrés López",
    rol: "DevOps Engineer",
    tecnologias: ["Docker", "AWS", "CI/CD"],
    frase: "Nunca pensé que desde FWD llegaría a colaborar con startups de toda la región.",
    color: "#F7901E",
    iniciales: "AL",
  },
];

/* ── Palabras con colores de marca ─────────────────── */
const TITLE_WORDS: { word: string; color: string }[] = [
  { word: "Estudiantes", color: "#008FD5" },
  { word: "que",         color: "#0e1628" },
  { word: "ya",          color: "#0e1628" },
  { word: "están",       color: "#662E91" },
  { word: "haciendo",    color: "#ED008C" },
  { word: "historia",    color: "#20BEC6" },
];

function AnimatedStudentsTitle() {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = ref.current;
    if (!el) return;
    const words = el.querySelectorAll<HTMLSpanElement>(".sw");
    gsap.from(words, {
      opacity: 0, y: 45, rotateX: -70, stagger: 0.09,
      duration: 0.65, ease: "back.out(1.4)",
      scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
    });
    words.forEach((w, i) => {
      const base = TITLE_WORDS[i]?.color ?? "#0e1628";
      w.addEventListener("mouseenter", () =>
        gsap.to(w, { y: -8, scale: 1.07, duration: 0.2, ease: "power2.out" })
      );
      w.addEventListener("mouseleave", () =>
        gsap.to(w, { y: 0, scale: 1, color: base, duration: 0.4, ease: "elastic.out(1,0.5)" })
      );
    });
    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  return (
    <h2
      ref={ref}
      className="font-heading font-black text-4xl md:text-5xl lg:text-[3.5rem] mt-2 mb-4 leading-tight"
      style={{ perspective: "500px" }}
    >
      {TITLE_WORDS.map(({ word, color }, i) => (
        <span key={i} className="sw inline-block mr-[0.28em] cursor-default"
          style={{ color, transformOrigin: "center bottom" }}>
          {word}
        </span>
      ))}
    </h2>
  );
}

export default function StudentCarousel() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const total = estudiantes.length;

  const goTo = useCallback(
    (index: number) => {
      setAnimating(true);
      setTimeout(() => {
        setCurrent(((index % total) + total) % total);
        setAnimating(false);
      }, 200);
    },
    [total]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = () => goTo(current - 1);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const visible = [0, 1, 2].map(
    (offset) => estudiantes[(current + offset) % total]!
  );

  return (
    <section className="bg-gray-50 py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-fwd-turquoise text-xs font-semibold uppercase tracking-widest">
            Comunidad FWD
          </span>
          <AnimatedStudentsTitle />
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Conocé a los talentos que transforman ideas en soluciones reales.
          </p>
        </div>

        {/* Cards */}
        <div
          className="grid md:grid-cols-3 gap-6"
          style={{
            opacity: animating ? 0 : 1,
            transform: animating ? "translateY(6px)" : "translateY(0)",
            transition: "opacity 0.2s ease, transform 0.2s ease",
          }}
        >
          {visible.map((est, i) => (
            <div
              key={`${est.nombre}-${i}`}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Avatar + info */}
              <div className="flex items-center gap-4 mb-5">
                {est.foto ? (
                  <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 relative">
                    <Image
                      src={est.foto}
                      alt={est.nombre}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white font-heading font-black text-lg flex-shrink-0"
                    style={{ backgroundColor: est.color }}
                  >
                    {est.iniciales}
                  </div>
                )}
                <div>
                  <h3 className="font-heading font-bold text-fwd-navy text-base leading-tight">
                    {est.nombre}
                  </h3>
                  <p className="text-sm text-gray-500">{est.rol}</p>
                </div>
              </div>

              {/* Quote */}
              <blockquote
                className="text-gray-600 text-sm leading-relaxed mb-5 italic border-l-[3px] pl-4 flex-1"
                style={{ borderColor: est.color }}
              >
                &ldquo;{est.frase}&rdquo;
              </blockquote>

              {/* Tech chips */}
              <div className="flex flex-wrap gap-2">
                {est.tecnologias.map((t) => (
                  <span
                    key={t}
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{
                      backgroundColor: `${est.color}18`,
                      color: est.color,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-6 mt-10">
          <button
            onClick={prev}
            className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-fwd-purple hover:text-fwd-purple transition-colors font-bold"
            aria-label="Anterior"
          >
            ←
          </button>

          <div className="flex gap-2">
            {estudiantes.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Ir al estudiante ${i + 1}`}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === current ? "24px" : "8px",
                  height: "8px",
                  backgroundColor: i === current ? "#662D91" : "#D1D5DB",
                }}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-fwd-purple hover:text-fwd-purple transition-colors font-bold"
            aria-label="Siguiente"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}
