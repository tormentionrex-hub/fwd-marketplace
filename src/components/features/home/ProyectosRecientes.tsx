"use client";

import { useRef, useCallback } from "react";
import { Link } from "@/i18n/navigation";
import gsap from "gsap";
import type { ProyectoMarketplace } from "@/types/marketplace";

const CARD_COLORES = ["#008FD5", "#ED008C", "#662E91"];

type Props = {
  proyectos: ProyectoMarketplace[];
};

function ProyectoCard({ proyecto, index }: { proyecto: ProyectoMarketplace; index: number }) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const color = CARD_COLORES[index % CARD_COLORES.length] ?? "#008FD5";

  const onEnter = useCallback(() => {
    gsap.to(cardRef.current, {
      scale: 1.05,
      y: -10,
      boxShadow: `0 24px 60px ${color}50, 0 8px 20px ${color}30`,
      duration: 0.35,
      ease: "power2.out",
    });
  }, [color]);

  const onLeave = useCallback(() => {
    gsap.to(cardRef.current, {
      scale: 1,
      y: 0,
      boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
      duration: 0.4,
      ease: "power2.out",
    });
  }, []);

  const nombreEmpresa = proyecto.empresario.nombreEmpresa ?? proyecto.empresario.nombre;
  const diasRestantes = proyecto.plazoDias;

  return (
    <Link
      ref={cardRef}
      href={`/marketplace/${proyecto.id}`}
      className="block rounded-3xl overflow-hidden shadow-lg"
      style={{ backgroundColor: color, willChange: "transform, box-shadow" }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <article className="p-7 flex flex-col h-full">
        {proyecto.areaNegocio && (
          <span className="text-xs font-bold text-white/70 uppercase tracking-widest mb-3">
            {proyecto.areaNegocio}
          </span>
        )}

        <h3 className="font-heading font-black text-white text-xl leading-snug mb-5 flex-1 line-clamp-3">
          {proyecto.titulo}
        </h3>

        {proyecto.tecnologias.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {proyecto.tecnologias.slice(0, 4).map((tech) => (
              <span key={tech} className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                {tech}
              </span>
            ))}
            {proyecto.tecnologias.length > 4 && (
              <span className="bg-white/10 text-white/70 text-xs font-semibold px-3 py-1 rounded-full">
                +{proyecto.tecnologias.length - 4}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-white/20">
          <span className="text-white/80 text-sm truncate max-w-[60%]">
            por <span className="font-bold text-white">{nombreEmpresa}</span>
          </span>
          {diasRestantes != null && (
            <span className="bg-[#FFCB05] text-[#0e1628] text-xs font-black px-3 py-1 rounded-full flex-shrink-0">
              {diasRestantes} días
            </span>
          )}
        </div>
      </article>
    </Link>
  );
}

export function ProyectosRecientes({ proyectos }: Props) {
  if (proyectos.length === 0) {
    return (
      <p className="text-white/40 text-center py-12 text-base">
        No hay proyectos publicados en este momento.
      </p>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {proyectos.slice(0, 3).map((p, i) => (
        <ProyectoCard key={p.id} proyecto={p} index={i} />
      ))}
    </div>
  );
}
