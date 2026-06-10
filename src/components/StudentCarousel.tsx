"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { gsap } from "gsap";
import { generarAvatar } from "@/lib/avatar";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface Estudiante {
  nombre: string;
  rol: string;
  tecnologias: string[];
  frase: string;
  color: string;
  iniciales: string;
  foto: string;
}

/* ── Graduados reales del programa FWD (fwdcostarica.com/talento).
   El "comentario" es su propia bio de perfil. ──────────────────── */
const estudiantes: Estudiante[] = [
  {
    nombre: "Adrián Campos Cisneros",
    rol: "Desarrollador Full Stack",
    tecnologias: ["Full Stack", "Front End", "Back End"],
    frase: "Soy una persona que aprende rápido, amable, empática y sincera, y que quiere poner a prueba los conocimientos aprendidos en FWD.",
    color: "#008FD4",
    iniciales: "AC",
    foto: "/students/adrian.jpg",
  },
  {
    nombre: "Fiorella Chaves González",
    rol: "Ingeniería en Software",
    tecnologias: ["Full Stack", "Bases de datos", "Agile"],
    frase: "Enfocada en el diseño y desarrollo de aplicaciones web y modelado de bases de datos, con trabajo colaborativo bajo metodologías ágiles.",
    color: "#EC008C",
    iniciales: "FC",
    foto: "/students/fiorella.jpg",
  },
  {
    nombre: "Christopher Rodríguez Ruiz",
    rol: "Full Stack Developer Jr.",
    tecnologias: ["React", "Django", "MySQL"],
    frase: "Formación intensiva en tecnologías modernas, construyendo aplicaciones web completas, APIs seguras y bases de datos relacionales.",
    color: "#662D91",
    iniciales: "CR",
    foto: "/students/christopher.jpg",
  },
  {
    nombre: "Luisa Torres Carrión",
    rol: "Front End & UI",
    tecnologias: ["Front End", "UI/UX", "Full Stack"],
    frase: "Apasionada por la programación y el diseño. Me gusta combinar tecnología y diseño para transformar ideas en proyectos bien estructurados.",
    color: "#20BEC6",
    iniciales: "LT",
    foto: "/students/luisa.jpg",
  },
  {
    nombre: "Joseph Hernández Solís",
    rol: "Full Stack Developer",
    tecnologias: ["JavaScript", "React", "Python"],
    frase: "Me gusta la resolución de problemas, el trabajo colaborativo y transformar ideas en soluciones digitales prácticas y eficientes.",
    color: "#008FD4",
    iniciales: "JH",
    foto: "/students/joseph.jpg",
  },
  {
    nombre: "Miranda Méndez Cruz",
    rol: "Ingeniera de Software",
    tecnologias: ["Backend", "Enterprise Apps", "Full Stack"],
    frase: "Orientada a resultados, con experiencia en el diseño y desarrollo completo de aplicaciones empresariales y sistemas complejos.",
    color: "#F7901E",
    iniciales: "MM",
    foto: "/students/miranda.jpg",
  },
  {
    nombre: "Sergio Aguirre Miranda",
    rol: "Front-End / Full Stack",
    tecnologias: ["Front End", "Full Stack", "JavaScript"],
    frase: "Enfocado en crear aplicaciones funcionales y eficientes. Responsable, proactivo y en constante aprendizaje.",
    color: "#20BEC6",
    iniciales: "SA",
    foto: "/students/sergio.jpg",
  },
  {
    nombre: "Hillary Calderón Ulloa",
    rol: "Desarrolladora Web",
    tecnologias: ["Full Stack", "Front End", "Back End"],
    frase: "Soy responsable y con mucho interés en aprender. Dispuesta a asumir nuevas responsabilidades con compromiso y respeto.",
    color: "#662D91",
    iniciales: "HC",
    foto: "/students/hillary.jpg",
  },
];

/* ── Palabras con colores de marca ─────────────────── */
const TITLE_WORDS: { word: string; color: string }[] = [
  { word: "Estudiantes", color: "#008FD5" },
  { word: "que",         color: "#20BEC6" },
  { word: "ya",          color: "#008FD5" },
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
                <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white shadow-sm bg-gray-100">
                  {/* Foto realista (IA · persona no real); si falla, cae al avatar generado por nombre. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={est.foto}
                    alt={est.nombre}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (img.dataset.fallback) return;
                      img.dataset.fallback = "1";
                      img.src = generarAvatar(est.nombre);
                    }}
                  />
                </div>
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
          {/* Botón anterior */}
          <button
            onClick={prev}
            aria-label="Anterior"
            className="group relative w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-lg"
            style={{ background: "linear-gradient(135deg, #1a0a40, #662D91)" }}
          >
            <svg className="w-4 h-4 text-white transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Dots */}
          <div className="flex items-center gap-2">
            {estudiantes.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Ir al estudiante ${i + 1}`}
                className="rounded-full transition-all duration-300"
                style={{
                  width:  i === current ? "28px" : "8px",
                  height: "8px",
                  background: i === current
                    ? "linear-gradient(90deg, #20BEC6, #662D91)"
                    : "#D1D5DB",
                  boxShadow: i === current ? "0 0 10px #20BEC688, 0 0 20px #662D9144" : "none",
                }}
              />
            ))}
          </div>

          {/* Botón siguiente */}
          <button
            onClick={next}
            aria-label="Siguiente"
            className="group relative w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-lg"
            style={{ background: "linear-gradient(135deg, #662D91, #ED008C)" }}
          >
            <svg className="w-4 h-4 text-white transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
