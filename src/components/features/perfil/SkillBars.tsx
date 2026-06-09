"use client";

import { motion } from "framer-motion";
import type { SkillCategoria, SkillGrupo } from "@/types/perfil";

const CATEGORY_COLORS: Record<SkillCategoria, string> = {
  Frontend: "#008fd4",
  Backend: "#662d91",
  "Bases de Datos": "#20bec6",
  Cloud: "#f7901e",
  IA: "#ec008c",
  Herramientas: "#64748b",
};

function nivelLabel(nivel: number) {
  if (nivel >= 85) return "Avanzado";
  if (nivel >= 65) return "Intermedio";
  return "Básico";
}

export default function SkillBars({ grupos }: { grupos: SkillGrupo[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {grupos.map((grupo) => {
        const color = CATEGORY_COLORS[grupo.categoria];
        return (
          <div
            key={grupo.categoria}
            className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
          >
            <div className="mb-4 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
              <h3 className="font-display font-bold text-text">{grupo.categoria}</h3>
            </div>
            <ul className="flex flex-col gap-4">
              {grupo.skills.map((skill) => (
                <li key={skill.nombre}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-text">{skill.nombre}</span>
                    <span className="text-text-muted">
                      {nivelLabel(skill.nivel)} · {skill.nivel}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.nivel}%` }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.9, ease: [0.21, 0.5, 0.27, 1] }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
