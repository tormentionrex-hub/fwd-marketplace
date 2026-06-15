"use client";

import { motion } from "framer-motion";
import {
  IconArrowRight,
  IconBriefcase,
  IconBulb,
  IconCpu,
  IconGraduation,
  IconRocket,
} from "@/components/ui/icons";

const CATEGORIAS = [
  { nombre: "Tecnología",     color: "#008fd4", total: 48, Icon: IconCpu },
  { nombre: "Educación",      color: "#662d91", total: 31, Icon: IconGraduation },
  { nombre: "Servicios",      color: "#20bec6", total: 27, Icon: IconBriefcase },
  { nombre: "Emprendimiento", color: "#f7901e", total: 22, Icon: IconRocket },
  { nombre: "Innovación",     color: "#ec008c", total: 18, Icon: IconBulb },
] as const;

const grid = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } };
const item = {
  hidden:   { opacity: 0, y: 28, scale: 0.96 },
  visible:  { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.5, ease: [0.21, 0.5, 0.27, 1] as const } },
};

export default function CategoriesSection() {
  return (
    <motion.div
      variants={grid}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-5"
    >
      {CATEGORIAS.map(({ nombre, color, total, Icon }) => (
        <motion.button
          key={nombre}
          variants={item}
          whileHover={{ y: -7, scale: 1.03 }}
          type="button"
          className="group relative flex flex-col items-start gap-3 overflow-hidden rounded-2xl p-5 text-left transition-all duration-300"
          style={{
            background: "white",
            border: "1px solid rgba(0,0,0,0.07)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.border = `1px solid ${color}55`;
            e.currentTarget.style.boxShadow = `0 10px 36px ${color}35, 0 2px 8px rgba(0,0,0,0.06)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.border = "1px solid rgba(0,0,0,0.07)";
            e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)";
          }}
        >
          {/* Shine sweep */}
          <span className="pointer-events-none absolute inset-0 translate-x-[-100%] skew-x-[-20deg] bg-white/50 transition-transform duration-700 group-hover:translate-x-[100%]" />

          {/* Decoración esquina */}
          <div
            className="pointer-events-none absolute right-0 top-0 h-20 w-20 rounded-bl-full opacity-10 transition-opacity duration-300 group-hover:opacity-25"
            style={{ background: color }}
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
              style={{ "--cat-color": color } as React.CSSProperties}
            >
              {nombre}
            </h3>
            <p className="text-sm text-text-muted">{total} productos</p>
          </div>

          {/* CTA */}
          <span
            className="relative z-10 inline-flex translate-y-2 items-center gap-1 text-xs font-bold opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
            style={{ color }}
          >
            Ver categoría
            <IconArrowRight width={14} height={14} className="transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </motion.button>
      ))}
    </motion.div>
  );
}
