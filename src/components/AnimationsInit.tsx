"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function AnimationsInit() {
  // Este componente vive en el layout y NO se re-monta al navegar. Re-corremos el
  // efecto en cada cambio de ruta para enganchar las animaciones a los nodos nuevos
  // de la página destino; sin esto solo funcionaban tras una carga completa (F5).
  const pathname = usePathname();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // matchMedia crea un context interno: mm.revert() en el cleanup mata tweens y
    // ScrollTriggers Y restaura los estilos inline. Eso hace el efecto seguro ante
    // el doble montaje de React StrictMode (antes los CTA del hero quedaban
    // congelados en opacity 0) y ante la navegación SPA. Además respeta
    // prefers-reduced-motion: sin animaciones, el contenido queda visible.
    const mm = gsap.matchMedia();

    mm.add(
      {
        reduce: "(prefers-reduced-motion: reduce)",
        motion: "(prefers-reduced-motion: no-preference)",
      },
      (context) => {
        const { reduce } = context.conditions as { reduce: boolean };
        if (reduce) return; // accesibilidad: todo visible en su estado natural

        /* ── 1. Hero entrance (staggered on load) — solo si la página tiene hero.
           fromTo con destino explícito: from() captura el "final" leyendo el DOM al
           renderizar y, con dobles ejecuciones (StrictMode/HMR) o el transition-all
           CSS de los CTA, capturaba el estado oculto y los botones quedaban en
           opacity 0. clearProps al terminar devuelve el control del transform a las
           clases (hover:scale-105 de los botones). */
        if (document.querySelector("[data-hero='badge']")) {
          const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

          heroTl
            .fromTo("[data-hero='badge']",
              { opacity: 0, x: -30 },
              { opacity: 1, x: 0, duration: 0.7, delay: 0.3, clearProps: "transform,opacity" })
            .fromTo("[data-hero='title']",
              { opacity: 0, y: 60 },
              { opacity: 1, y: 0, duration: 0.9, clearProps: "transform,opacity" }, "-=0.3")
            .fromTo("[data-hero='desc']",
              { opacity: 0, y: 30 },
              { opacity: 1, y: 0, duration: 0.7, clearProps: "transform,opacity" }, "-=0.5")
            .fromTo("[data-hero='cta'] > *",
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, stagger: 0.15, duration: 0.6, clearProps: "transform,opacity" }, "-=0.4");
        }

        /* ── 2. Scroll-triggered section headings */
        gsap.utils.toArray<HTMLElement>("[data-reveal='heading']").forEach((el) => {
          gsap.from(el, {
            opacity: 0,
            y: 50,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          });
        });

        /* ── 3. Fade-up generic elements */
        gsap.utils.toArray<HTMLElement>("[data-reveal='fade-up']").forEach((el) => {
          gsap.from(el, {
            opacity: 0,
            y: 40,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          });
        });

        /* ── 4. Staggered card grids */
        gsap.utils.toArray<HTMLElement>("[data-reveal='stagger']").forEach((container) => {
          const children = container.children;
          gsap.from(children, {
            opacity: 0,
            y: 50,
            stagger: 0.12,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: container,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          });
        });

        /* ── 5. Fade from left */
        gsap.utils.toArray<HTMLElement>("[data-reveal='fade-left']").forEach((el) => {
          gsap.from(el, {
            opacity: 0,
            x: -60,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          });
        });

        /* ── 6. Fade from right */
        gsap.utils.toArray<HTMLElement>("[data-reveal='fade-right']").forEach((el) => {
          gsap.from(el, {
            opacity: 0,
            x: 60,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          });
        });

        /* ── 7. Scale-in cards */
        gsap.utils.toArray<HTMLElement>("[data-reveal='scale']").forEach((el) => {
          gsap.from(el, {
            opacity: 0,
            scale: 0.88,
            duration: 0.7,
            ease: "back.out(1.6)",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          });
        });
      }
    );

    return () => mm.revert();
  }, [pathname]);

  return null;
}
