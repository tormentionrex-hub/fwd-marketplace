"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
    const ctx = gsap.context(() => {
      gsap.from(".sw", {
        opacity: 0, y: 45, rotateX: -70, stagger: 0.09,
        duration: 0.65, ease: "back.out(1.4)",
        scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
      });
    }, el);
    words.forEach((w, i) => {
      const base = TITLE_WORDS[i]?.color ?? "#0e1628";
      w.addEventListener("mouseenter", () =>
        gsap.to(w, { y: -8, scale: 1.07, duration: 0.2, ease: "power2.out" })
      );
      w.addEventListener("mouseleave", () =>
        gsap.to(w, { y: 0, scale: 1, color: base, duration: 0.4, ease: "elastic.out(1,0.5)" })
      );
    });
    return () => { gsap.killTweensOf(words); ctx.revert(); };
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
  const [videoEnded, setVideoEnded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <section className="bg-surface-2 py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <AnimatedStudentsTitle />
          <p className="text-text-muted text-lg max-w-xl mx-auto">
            Conocé a los talentos que transforman ideas en soluciones reales.
          </p>

          {/* Video de testimonios */}
          <div className="mt-10 max-w-3xl mx-auto">
            <div
              className="relative rounded-2xl overflow-hidden shadow-2xl"
              style={{ boxShadow: "0 20px 60px rgba(0,143,213,0.2), 0 4px 20px rgba(102,45,145,0.15)" }}
            >
              <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #20BEC6, #008FD5, #662D91, #ED008C)" }} />

              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full block"
                  controls
                  preload="metadata"
                  style={{ background: "#0e1628" }}
                  onEnded={() => setVideoEnded(true)}
                >
                  <source src="/videos/fwd-testimonios.mp4" type="video/mp4" />
                </video>

                {videoEnded && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center"
                    style={{ background: "rgba(14,22,40,0.92)" }}
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src="/imagenes/publicidad.png"
                        alt="FWD Marketplace"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <button
                      onClick={() => {
                        setVideoEnded(false);
                        if (videoRef.current) {
                          videoRef.current.currentTime = 0;
                          videoRef.current.play();
                        }
                      }}
                      className="absolute bottom-4 right-4 group flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white transition-all duration-300 hover:scale-105 active:scale-95"
                      style={{
                        background: "linear-gradient(135deg, #008FD5, #662D91)",
                        boxShadow: "0 4px 20px rgba(0,143,213,0.5)",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 30px rgba(102,45,145,0.6)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,143,213,0.5)"; }}
                    >
                      <svg className="w-4 h-4 transition-transform duration-200 group-hover:-rotate-12" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                      </svg>
                      Volver a ver
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
