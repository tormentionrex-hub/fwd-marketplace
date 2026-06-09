import { cn } from "@/lib/utils/cn";
import type { EstadoProyecto } from "@/types/sefora";

const META: Record<
  EstadoProyecto,
  { label: string; dot: string; pill: string; pulse: boolean; desc: string }
> = {
  abierto: {
    label: "Abierto",
    dot: "bg-emerald-500",
    pill: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    pulse: true,
    desc: "Disponible para recibir ofertas",
  },
  cerrado: {
    label: "Cerrado",
    dot: "bg-slate-400",
    pill: "bg-surface-2 text-text-muted",
    pulse: false,
    desc: "Ya no recibe ofertas",
  },
  cancelado: {
    label: "Cancelado",
    dot: "bg-red-500",
    pill: "bg-red-500/10 text-red-600 dark:text-red-400",
    pulse: false,
    desc: "Proyecto cancelado por el empresario",
  },
};

interface EstadoProyectoBadgeProps {
  estado: EstadoProyecto;
  showDescription?: boolean;
  className?: string;
}

/** Indicador visible del estado general del proyecto (verde / gris / rojo). */
export default function EstadoProyectoBadge({
  estado,
  showDescription = false,
  className,
}: EstadoProyectoBadgeProps) {
  const m = META[estado];
  return (
    <span
      role="status"
      aria-label={`Estado del proyecto: ${m.label}. ${m.desc}`}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold",
        m.pill,
        className,
      )}
    >
      <span className="relative flex h-2.5 w-2.5">
        {m.pulse && (
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
              m.dot,
            )}
          />
        )}
        <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", m.dot)} />
      </span>
      {m.label}
      {showDescription && <span className="font-normal opacity-80">· {m.desc}</span>}
    </span>
  );
}
