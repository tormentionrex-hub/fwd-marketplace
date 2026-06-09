"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { IconArrowRight, IconHeart, IconStar } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";
import type { EstadoProducto, ProductoMarketplace } from "@/types/marketplace";

interface ProductCardProps {
  producto: ProductoMarketplace;
  locale: string;
}

const estadoStyles: Record<EstadoProducto, string> = {
  Destacado: "bg-fwd-amarillo/15 text-fwd-naranja",
  Nuevo: "bg-fwd-turquesa/15 text-fwd-turquesa",
  Disponible: "bg-fwd-azul/10 text-fwd-azul",
  Agotado: "bg-surface-2 text-text-muted",
};

export default function ProductCard({ producto, locale }: ProductCardProps) {
  const [favorito, setFavorito] = useState(false);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, ease: [0.21, 0.5, 0.27, 1] }}
      whileHover={{ y: -8 }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-slate-300/40 dark:hover:shadow-black/40"
    >
      {/* Cover flat con motivo de flecha FWD */}
      <div
        className="relative flex h-40 items-center justify-center overflow-hidden"
        style={{ backgroundColor: producto.color }}
      >
        <svg
          viewBox="0 0 66 76"
          className="h-20 w-20 transition-transform duration-500 group-hover:scale-110"
          fill="#ffffff"
          opacity={0.22}
          aria-hidden="true"
        >
          <path d="M0 0 L66 38 L0 76 Z" />
        </svg>
        <svg
          viewBox="0 0 66 76"
          className="absolute -right-3 top-5 h-14 w-14"
          fill="#ffffff"
          opacity={0.12}
          aria-hidden="true"
        >
          <path d="M0 0 L66 38 L0 76 Z" />
        </svg>
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">
          {producto.categoria}
        </span>
        <button
          type="button"
          onClick={() => setFavorito((v) => !v)}
          aria-pressed={favorito}
          aria-label={favorito ? "Quitar de favoritos" : "Agregar a favoritos"}
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-slate-500 transition-colors hover:text-fwd-magenta"
        >
          <IconHeart
            width={18}
            height={18}
            fill={favorito ? "#EC008C" : "none"}
            stroke={favorito ? "#EC008C" : "currentColor"}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
              estadoStyles[producto.estado],
            )}
          >
            {producto.estado}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-text-muted">
            <IconStar width={15} height={15} className="text-fwd-amarillo" />
            {producto.calificacion.toFixed(1)}
          </span>
        </div>

        <h3 className="mt-3 font-display text-lg font-bold text-text">{producto.nombre}</h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-text-muted">
          {producto.descripcion}
        </p>

        <div className="mt-4 flex items-center gap-2 text-xs text-text-muted">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-surface-2 text-[10px] font-bold">
            {producto.autor.charAt(0)}
          </span>
          Por {producto.autor}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <span className="font-display text-lg font-bold text-fwd-azul">{producto.precio}</span>
          <Link
            href={`/${locale}/marketplace/${producto.id}`}
            className="group/btn inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-fwd-azul dark:bg-white/10 dark:hover:bg-fwd-azul"
          >
            Ver Detalles
            <IconArrowRight
              width={16}
              height={16}
              className="transition-transform duration-300 group-hover/btn:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
