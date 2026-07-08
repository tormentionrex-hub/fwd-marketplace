"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { IconArrowRight, IconHeart, IconStar } from "@/components/ui/icons";
import type { EstadoProducto, ProductoMarketplace } from "@/types/marketplace";

interface ProductCardProps {
  producto: ProductoMarketplace;
  locale: string;
}

const estadoBadge: Record<EstadoProducto, { bg: string; color: string }> = {
  Destacado:  { bg: "rgba(255,203,5,0.18)",   color: "#F7901E" },
  Nuevo:      { bg: "rgba(32,190,198,0.18)",  color: "#20BEC6" },
  Disponible: { bg: "rgba(0,143,213,0.15)",   color: "#008FD5" },
  Agotado:    { bg: "rgba(100,116,139,0.15)", color: "#64748b" },
};

export default function ProductCard({ producto, locale }: ProductCardProps) {
  const [favorito, setFavorito] = useState(false);
  const badge = estadoBadge[producto.estado];

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
        e.currentTarget.style.border = `1px solid ${producto.color}55`;
        e.currentTarget.style.boxShadow = `0 12px 40px ${producto.color}30, 0 2px 8px rgba(0,0,0,0.08)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.border = "1px solid rgba(0,0,0,0.07)";
        e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.07)";
      }}
    >
      {/* ── Cover ── */}
      <div
        className="relative flex h-44 items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${producto.color} 0%, ${producto.color}bb 100%)` }}
      >
        {/* Shine sweep en hover */}
        <span className="pointer-events-none absolute inset-0 z-10 translate-x-[-100%] skew-x-[-20deg] bg-white/20 transition-transform duration-700 group-hover:translate-x-[100%]" />

        {/* Degradado inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/25 to-transparent" />

        {/* Flechas FWD decorativas */}
        <svg viewBox="0 0 66 76" className="h-20 w-20 transition-transform duration-500 group-hover:scale-110"
          fill="#ffffff" opacity={0.25} aria-hidden="true">
          <path d="M0 0 L66 38 L0 76 Z" />
        </svg>
        <svg viewBox="0 0 66 76" className="absolute -right-3 top-5 h-14 w-14"
          fill="#ffffff" opacity={0.13} aria-hidden="true">
          <path d="M0 0 L66 38 L0 76 Z" />
        </svg>

        {/* Badge categoría */}
        <span className="absolute left-4 top-4 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-bold text-slate-700 shadow-sm">
          {producto.categoria}
        </span>

        {/* Botón favorito */}
        <button
          type="button"
          onClick={() => setFavorito((v) => !v)}
          aria-pressed={favorito}
          aria-label={favorito ? "Quitar de favoritos" : "Agregar a favoritos"}
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-200 hover:scale-110"
        >
          <IconHeart
            width={18} height={18}
            fill={favorito ? "#EC008C" : "none"}
            stroke={favorito ? "#EC008C" : "#94a3b8"}
          />
        </button>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold"
            style={{ background: badge.bg, color: badge.color }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: badge.color }} />
            {producto.estado}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-text-muted">
            <IconStar width={15} height={15} className="text-fwd-amarillo fill-fwd-amarillo" />
            {producto.calificacion.toFixed(1)}
          </span>
        </div>

        <h3 className="mt-3 font-heading font-black text-lg leading-snug text-text">
          {producto.nombre}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-text-muted">
          {producto.descripcion}
        </p>

        <div className="mt-4 flex items-center gap-2 text-xs text-text-muted">
          <span
            className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-full text-[11px] font-black text-white shadow-sm"
            style={{ background: producto.color }}
          >
            {producto.autor.charAt(0).toUpperCase()}
          </span>
          Por <span className="font-semibold text-text">{producto.autor}</span>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <span className="font-heading font-black text-xl" style={{ color: producto.color }}>
            {producto.precio}
          </span>

          <Link
            href={`/${locale}/marketplace/${producto.id}`}
            className="group/btn relative overflow-hidden inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-white transition-all duration-300 hover:scale-105 hover:brightness-110 active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${producto.color}, ${producto.color}cc)`,
              boxShadow: `0 4px 14px ${producto.color}45`,
            }}
          >
            <span className="relative z-10">Ver Detalles</span>
            <IconArrowRight
              width={16} height={16}
              className="relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1"
            />
            <span className="absolute inset-0 translate-x-[-100%] skew-x-[-20deg] bg-white/25 transition-transform duration-500 group-hover/btn:translate-x-[100%]" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
