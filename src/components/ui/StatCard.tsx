import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  /** Color de marca (hex) para el icono/acento. */
  color?: string;
  delta?: string;
  deltaPositive?: boolean;
  className?: string;
}

export default function StatCard({
  label,
  value,
  icon,
  color = "#008fd4",
  delta,
  deltaPositive = true,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-10"
        style={{ backgroundColor: color }}
      />
      <div className="flex items-center justify-between">
        <span
          className="grid h-11 w-11 place-items-center rounded-xl text-white"
          style={{ backgroundColor: color }}
        >
          {icon}
        </span>
        {delta && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-semibold",
              deltaPositive
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-red-500/10 text-red-500",
            )}
          >
            {delta}
          </span>
        )}
      </div>
      <p className="mt-4 font-display text-3xl font-bold text-text">{value}</p>
      <p className="mt-1 text-sm text-text-muted">{label}</p>
    </div>
  );
}
