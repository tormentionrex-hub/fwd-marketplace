"use client";

import { useEffect, useRef } from "react";

export default function CursorGlow() {
  const dotRef   = useRef<HTMLDivElement>(null);
  const ringRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot  = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = 0, mouseY = 0;
    let ringX  = 0, ringY  = 0;
    let raf: number;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    };

    // Event delegation: antes re-escaneabamos TODO el DOM (querySelectorAll) y
    // reenganchabamos listeners en cada mutacion via MutationObserver, lo que
    // causaba jank al renderizar/cambiar de ruta. Ahora escuchamos UNA vez en
    // document y miramos con closest() si el cursor entro/salio de un interactivo.
    const interactivo = (t: EventTarget | null) =>
      t instanceof Element && t.closest("a, button, [role='button']");

    const onOver = (e: MouseEvent) => {
      if (interactivo(e.target)) {
        dot.classList.add("cursor-hover");
        ring.classList.add("cursor-hover");
      }
    };
    const onOut = (e: MouseEvent) => {
      if (interactivo(e.target)) {
        dot.classList.remove("cursor-hover");
        ring.classList.remove("cursor-hover");
      }
    };

    const animate = () => {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(animate);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    animate();

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* Dot — follows instantly */}
      <div
        ref={dotRef}
        className="cursor-dot"
        aria-hidden="true"
      />
      {/* Ring — follows with lag */}
      <div
        ref={ringRef}
        className="cursor-ring"
        aria-hidden="true"
      />
    </>
  );
}
