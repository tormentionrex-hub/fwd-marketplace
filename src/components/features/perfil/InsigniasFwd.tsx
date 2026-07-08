import { Award } from "lucide-react";
import type { InsigniaPerfil } from "@/types/perfil";

interface InsigniasFwdProps {
  insignias: InsigniaPerfil[];
  total: number;
}

// Muestra las insignias de quizzes ganadas por el estudiante (fase más alta por
// tema). Usa iconos de lucide, nunca emojis (REGLA #6). Placeholder de imagen:
// cuando existan las imágenes de insignia definitivas, reemplazan al ícono Award.
export default function InsigniasFwd({ insignias, total }: InsigniasFwdProps) {
  if (insignias.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
        <p className="text-sm text-text-muted">
          Este estudiante aún no ha ganado insignias en los quizzes de FWD.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-4 text-sm text-text-muted">
        {total} {total === 1 ? "fase completada" : "fases completadas"} en los quizzes de FWD.
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {insignias.map((ins) => (
          <div
            key={ins.id}
            className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <span
              className="grid h-14 w-14 place-items-center rounded-2xl ring-1"
              style={{ backgroundColor: `${ins.color}1a`, color: ins.color, borderColor: `${ins.color}33` }}
            >
              <Award className="h-7 w-7" />
            </span>
            <div>
              <span className="block text-sm font-semibold text-text">{ins.temaNombre}</span>
              <span className="mt-0.5 block text-xs text-text-muted">
                Fase {ins.fase} · {ins.dificultad}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
