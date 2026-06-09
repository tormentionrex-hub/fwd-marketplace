import StarRating from "@/components/ui/StarRating";
import { cn } from "@/lib/utils/cn";

interface ReputationDisplayProps {
  value: number;
  evaluaciones: number;
  satisfaccion: number;
  tone?: "default" | "light";
  className?: string;
}

export default function ReputationDisplay({
  value,
  evaluaciones,
  satisfaccion,
  tone = "default",
  className,
}: ReputationDisplayProps) {
  return (
    <div
      className={cn("group relative inline-flex items-center gap-2", className)}
      tabIndex={0}
      aria-label={`Reputación ${value.toFixed(1)} de 5, basada en ${evaluaciones} evaluaciones, ${satisfaccion}% de satisfacción`}
    >
      <StarRating value={value} showValue={false} size={18} />
      <span className={cn("text-sm font-bold", tone === "light" ? "text-white" : "text-text")}>
        {value.toFixed(1)}/5
      </span>

      {/* Tooltip */}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-max -translate-x-1/2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 group-focus:opacity-100 dark:bg-slate-700"
      >
        {evaluaciones} evaluaciones · {satisfaccion}% de satisfacción
      </span>
    </div>
  );
}
