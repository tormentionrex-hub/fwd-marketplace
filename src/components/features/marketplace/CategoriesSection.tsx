"use client";

import { motion } from "framer-motion";
import type { ReactElement, SVGProps } from "react";
import {
  IconArrowRight,
  IconBriefcase,
  IconBulb,
  IconCpu,
  IconGraduation,
  IconRocket,
  IconTrendingUp,
} from "@/components/ui/icons";

type CategoriaConfig = {
  nombre: string;
  color: string;
  Icon: (props: SVGProps<SVGSVGElement>) => ReactElement;
};

export const CATEGORIAS_CONFIG: CategoriaConfig[] = [
  { nombre: "Tecnología",     color: "#008fd4", Icon: IconCpu },
  { nombre: "Educación",      color: "#662d91", Icon: IconGraduation },
  { nombre: "Servicios",      color: "#20bec6", Icon: IconBriefcase },
  { nombre: "Marketing",      color: "#008fd4", Icon: IconTrendingUp },
  { nombre: "Emprendimiento", color: "#f7901e", Icon: IconRocket },
  { nombre: "Innovación",     color: "#ec008c", Icon: IconBulb },
];

const grid = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } };
const item = {
  hidden:   { opacity: 0, y: 28, scale: 0.96 },
  visible:  { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.5, ease: [0.21, 0.5, 0.27, 1] as const } },
};

interface Props {
  counts: Record<string, number>;
  selected: string;
  onSelect: (nombre: string) => void;
}

export default function CategoriesSection({ counts, selected, onSelect }: Props) {
  return (
    <motion.div
      variants={grid}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-6"
    >
      {CATEGORIAS_CONFIG.map(({ nombre, color, Icon }) => {
        const total = counts[nombre] ?? 0;
        const activa = selected === nombre;

        return (
          <motion.button
            key={nombre}
            variants={item}
            whileHover={{ y: -7, scale: 1.03 }}
            type="button"
            onClick={() => {
              onSelect(activa ? "Todas las categorías" : nombre);
              document.getElementById("marketplace-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="group relative flex flex-col items-start gap-3 overflow-hidden rounded-2xl p-5 text-left transition-all duration-300"
            style={{
              background: activa ? `linear-gradient(135deg, ${color}18, ${color}30)` : "var(--surface)",
              border: activa ? `2px solid ${color}` : "1px solid var(--border)",
              boxShadow: activa
                ? `0 8px 32px ${color}40, 0 2px 8px rgba(0,0,0,0.06)`
                : "0 2px 12px rgba(0,0,0,0.06)",
            }}
            onMouseEnter={(e) => {
              if (!activa) {
                e.currentTarget.style.border = `1px solid ${color}55`;
                e.currentTarget.style.boxShadow = `0 10px 36px ${color}35, 0 2px 8px rgba(0,0,0,0.06)`;
              }
            }}
            onMouseLeave={(e) => {
              if (!activa) {
                e.currentTarget.style.border = "1px solid var(--border)";
                e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)";
              }
            }}
          >
            {/* Shine sweep */}
            <span className="pointer-events-none absolute inset-0 translate-x-[-100%] skew-x-[-20deg] bg-white/50 transition-transform duration-700 group-hover:translate-x-[100%]" />

            {/* Decoración esquina */}
            <div
              className="pointer-events-none absolute right-0 top-0 h-20 w-20 rounded-bl-full transition-opacity duration-300"
              style={{ background: color, opacity: activa ? 0.2 : 0.1 }}
            />

            {/* Icono */}
            <span
              className="relative z-10 grid h-12 w-12 place-items-center rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-md"
              style={{
                background: `linear-gradient(135deg, ${color}25, ${color}45)`,
                color,
              }}
            >
              <Icon width={24} height={24} />
            </span>

            {/* Texto */}
            <div className="relative z-10 flex-1">
              <h3
                className="font-heading font-black text-text transition-colors duration-200 group-hover:text-[var(--cat-color)]"
                style={{ "--cat-color": color, color: activa ? color : undefined } as React.CSSProperties}
              >
                {nombre}
              </h3>
              <p className="text-sm text-text-muted">
                {total} proyecto{total !== 1 ? "s" : ""}
              </p>
            </div>

            {/* CTA */}
            <span
              className="relative z-10 inline-flex translate-y-2 items-center gap-1 text-xs font-bold opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
              style={{ color }}
            >
              {activa ? "Quitar filtro" : "Ver proyectos"}
              <IconArrowRight width={14} height={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
