import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { IconArrowRight, IconClock } from "@/components/ui/icons";
import type { ProyectoDetalle } from "@/types/sefora";

interface ProjectCardProps {
  proyecto: ProyectoDetalle;
  locale: string;
}

export default function ProjectCard({ proyecto, locale }: ProjectCardProps) {
  return (
    <Link
      href={`/${locale}/proyectos/${proyecto.id}`}
      className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-fwd-azul/40 hover:shadow-xl hover:shadow-slate-300/30 dark:hover:shadow-black/40"
    >
      <div className="flex items-center justify-between">
        <Badge variant="brand">{proyecto.area}</Badge>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-text-muted">
          <IconClock width={14} height={14} />
          {proyecto.diasRestantes}d restantes
        </span>
      </div>

      <h3 className="mt-4 font-display text-lg font-bold text-text">{proyecto.titulo}</h3>
      <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-text-muted">
        {proyecto.descripcion}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {proyecto.tecnologias.slice(0, 4).map((tech) => (
          <span
            key={tech}
            className="rounded-md bg-surface-2 px-2 py-0.5 text-xs font-medium text-text-muted"
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-text">{proyecto.empresario.nombre}</p>
          <p className="truncate text-xs text-text-muted">{proyecto.empresario.sector}</p>
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-fwd-azul">
          Ver
          <IconArrowRight
            width={15}
            height={15}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </span>
      </div>
    </Link>
  );
}
