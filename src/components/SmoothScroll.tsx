"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    // El dashboard de empresario usa .main { overflow-y: auto } como contenedor de
    // scroll (window no puede scrollear porque .fwd-app { overflow: hidden }).
    // Lenis con smoothWheel:true llama event.preventDefault() en todos los eventos
    // wheel antes de que lleguen al contenedor, lo que congela el scroll.
    // En esas rutas se omite Lenis y el scroll nativo del contenedor funciona solo.
    if (pathname?.includes("/empresario")) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);

    // Guardar referencia para poder removerla en cleanup.
    // Con función anónima, gsap.ticker.remove crea una referencia distinta y
    // no remueve nada, acumulando callbacks en cada navegación.
    const rafCallback = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(rafCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(rafCallback);
    };
  }, [pathname]);

  return null;
}
