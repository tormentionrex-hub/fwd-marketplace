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
  { nombre: "Tecnología", color: "#008fd4", total: 48, Icon: IconCpu },
  { nombre: "Educación", color: "#662d91", total: 31, Icon: IconGraduation },
  { nombre: "Servicios", color: "#20bec6", total: 27, Icon: IconBriefcase },
  { nombre: "Emprendimiento", color: "#f7901e", total: 22, Icon: IconRocket },
  { nombre: "Innovación", color: "#ec008c", total: 18, Icon: IconBulb },
] as const;

const grid = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const card = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.21, 0.5, 0.27, 1] as const } },
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
          variants={card}
          whileHover={{ y: -6 }}
          type="button"
          className="group flex flex-col items-start gap-4 rounded-2xl border border-border bg-surface p-5 text-left shadow-sm transition-shadow hover:shadow-lg"
        >
          <span
            className="grid h-12 w-12 place-items-center rounded-xl"
            style={{ backgroundColor: `${color}1a`, color }}
          >
            <Icon width={24} height={24} />
          </span>
          <div>
            <h3 className="font-display font-bold text-text">{nombre}</h3>
            <p className="text-sm text-text-muted">{total} productos</p>
          </div>
          <span
            className="mt-auto inline-flex items-center gap-1 text-sm font-medium opacity-0 transition-opacity group-hover:opacity-100"
            style={{ color }}
          >
            Ver categoría
            <IconArrowRight width={15} height={15} />
          </span>
        </motion.button>
      ))}
    </motion.div>
  );
}
