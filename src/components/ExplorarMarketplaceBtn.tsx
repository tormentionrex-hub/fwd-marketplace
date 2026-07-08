"use client";

import { useRef, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import gsap from "gsap";

const COLORES = ["#FFCB05", "#ED008C", "#20BEC7", "#C084FC", "#60CFFF"];
const TEXTO = "Explorar marketplace".split("");

export default function ExplorarMarketplaceBtn() {
  const router = useRouter();
  const refs = useRef<(HTMLSpanElement | null)[]>([]);

  const targets = useCallback(
    () => refs.current.filter((el): el is HTMLSpanElement => el !== null),
    [],
  );

  const onEnter = useCallback(() => {
    const els = targets();
    gsap.killTweensOf(els);

    els.forEach((el, i) => {
      // El espacio no tiene color; lo saltamos
      if (el.textContent === " ") return;
      const color = COLORES[i % COLORES.length] ?? "#FFCB05";
      const baseDelay = i * 0.032;

      gsap.to(el, {
        color: "#ffffff",
        textShadow: `0 0 18px #fff, 0 0 36px ${color}, 0 0 70px ${color}`,
        scaleX: 1.12,
        scaleY: 1.18,
        duration: 0.07,
        delay: baseDelay,
        ease: "power3.out",
        overwrite: "auto",
      });
      gsap.to(el, {
        color,
        textShadow: `0 0 8px ${color}90`,
        scaleX: 1,
        scaleY: 1,
        duration: 0.22,
        delay: baseDelay + 0.07,
        ease: "power2.inOut",
        overwrite: "auto",
      });
    });
  }, [targets]);

  const onLeave = useCallback(() => {
    const els = targets();
    gsap.killTweensOf(els);
    gsap.to(els, {
      color: "#FFCB05",
      textShadow: "none",
      scaleX: 1,
      scaleY: 1,
      duration: 0.28,
      stagger: 0.018,
      ease: "power1.inOut",
      overwrite: "auto",
    });
  }, [targets]);

  return (
    <button
      type="button"
      onClick={() => router.push("/marketplace")}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="inline-flex items-center justify-center gap-2 border-2 border-[#FFCB05] font-bold px-8 py-4 rounded-xl transition-transform duration-300 text-base hover:scale-105 active:scale-95 cursor-pointer"
    >
      <span className="inline-flex">
        {TEXTO.map((letra, i) => (
          <span
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            className="inline-block"
            style={{
              color: "#FFCB05",
              willChange: "color, text-shadow, transform",
              // El espacio no se puede comprimir
              minWidth: letra === " " ? "0.3em" : undefined,
            }}
          >
            {letra === " " ? " " : letra}
          </span>
        ))}
      </span>
    </button>
  );
}
