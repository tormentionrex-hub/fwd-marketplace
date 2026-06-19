"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { IconArrowRight, IconBriefcase, IconClock, IconCpu } from "@/components/ui/icons";
import type { ProyectoMarketplace } from "@/types/marketplace";

const COLORES_FWD = ["#008FD4", "#662D91", "#EC008C", "#20BEC6", "#F7901E"];

function colorProyecto(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % COLORES_FWD.length;
  return COLORES_FWD[h]!;
}

function diasRestantesTexto(publicado: string | null, plazoDias: number | null): string | null {
  if (!publicado || plazoDias == null) return null;
  const limite = new Date(publicado).getTime() + plazoDias * 86_400_000;
  const dias = Math.ceil((limite - Date.now()) / 86_400_000);
  if (dias <= 0) return "Vencido";
  if (dias === 1) return "1 día restante";
  return `${dias} días restantes`;
}

interface ProyectoCardProps {
  proyecto: ProyectoMarketplace;
  locale: string;
}

export default function ProyectoCard({ proyecto, locale }: ProyectoCardProps) {
  const color = colorProyecto(proyecto.id);
  const plazo = diasRestantesTexto(proyecto.publicado, proyecto.plazoDias);
  const empresa = proyecto.empresario.nombreEmpresa ?? proyecto.empresario.nombre;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, ease: [0.21, 0.5, 0.27, 1] }}
      whileHover={{ y: -6 }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-surface transition-all duration-300"
      style={{
        border: "1px solid rgba(0,0,0,0.07)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.border = `1px solid ${color}55`;
        e.currentTarget.style.boxShadow = `0 12px 40px ${color}30, 0 2px 8px rgba(0,0,0,0.08)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.border = "1px solid rgba(0,0,0,0.07)";
        e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.07)";
      }}
    >
      {/* Cover */}
      <div
        className="relative flex h-36 items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}bb 100%)` }}
      >
        <span className="pointer-events-none absolute inset-0 z-10 translate-x-[-100%] skew-x-[-20deg] bg-white/20 transition-transform duration-700 group-hover:translate-x-[100%]" />
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/20 to-transparent" />
        <svg viewBox="0 0 66 76" className="h-16 w-16 transition-transform duration-500 group-hover:scale-110"
          fill="#ffffff" opacity={0.2} aria-hidden="true">
          <path d="M0 0 L66 38 L0 76 Z" />
        </svg>
        <svg viewBox="0 0 66 76" className="absolute -right-2 top-4 h-12 w-12"
          fill="#ffffff" opacity={0.12} aria-hidden="true">
          <path d="M0 0 L66 38 L0 76 Z" />
        </svg>

        {proyecto.areaNegocio && (
          <span className="absolute left-4 top-4 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-bold text-slate-700 shadow-sm">
            {proyecto.areaNegocio}
          </span>
        )}
        <span className="absolute right-4 top-4 rounded-full bg-emerald-500/90 backdrop-blur-sm px-2.5 py-1 text-xs font-bold text-white shadow-sm">
          Abierto
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-heading font-black text-lg leading-snug text-text line-clamp-2">
          {proyecto.titulo}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-text-muted">
          {proyecto.descripcion}
        </p>

        {proyecto.tecnologias.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {proyecto.tecnologias.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium"
                style={{ borderColor: `${color}30`, background: `${color}10`, color }}
              >
                <IconCpu width={11} height={11} className="opacity-70" />
                {tech}
              </span>
            ))}
            {proyecto.tecnologias.length > 4 && (
              <span className="inline-flex items-center rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-text-muted">
                +{proyecto.tecnologias.length - 4}
              </span>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 text-xs text-text-muted">
          <span
            className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-full text-[11px] font-black text-white shadow-sm"
            style={{ background: color }}
          >
            {empresa.charAt(0).toUpperCase()}
          </span>
          <span className="font-semibold text-text truncate">{empresa}</span>
          {proyecto.empresario.sector && (
            <span className="ml-auto shrink-0 text-[11px] text-text-muted/70 truncate max-w-[100px]">
              {proyecto.empresario.sector}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          {plazo ? (
            <span className="inline-flex items-center gap-1 text-xs text-text-muted">
              <IconClock width={13} height={13} />
              {plazo}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-text-muted">
              <IconBriefcase width={13} height={13} />
              Sin fecha límite
            </span>
          )}

          <Link
            href={`/${locale}/marketplace/${proyecto.id}`}
            className="group/btn relative overflow-hidden inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-white transition-all duration-300 hover:scale-105 hover:brightness-110 active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${color}, ${color}cc)`,
              boxShadow: `0 4px 14px ${color}45`,
            }}
          >
            <span className="relative z-10">Ver proyecto</span>
            <IconArrowRight
              width={14} height={14}
              className="relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1"
            />
            <span className="absolute inset-0 translate-x-[-100%] skew-x-[-20deg] bg-white/25 transition-transform duration-500 group-hover/btn:translate-x-[100%]" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
