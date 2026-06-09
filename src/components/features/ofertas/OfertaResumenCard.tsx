import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface OfertaResumenCardProps {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  /** Gradiente de marca para el icono y el halo. */
  gradient: string;
  className?: string;
}

/** Tarjeta de resumen con glassmorphism, gradiente FWD y animación hover. */
export default function OfertaResumenCard({
  label,
  value,
  icon,
  gradient,
  className,
}: OfertaResumenCardProps) {
  return (
    <div
      className={cn(
        "group glass relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-xl transition-opacity duration-300 group-hover:opacity-40"
        style={{ background: gradient }}
      />
      <div className="relative flex items-center gap-3">
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white shadow-sm"
          style={{ background: gradient }}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <p className="font-display text-2xl font-bold leading-tight text-text">{value}</p>
          <p className="truncate text-xs text-text-muted">{label}</p>
        </div>
      </div>
    </div>
  );
}
