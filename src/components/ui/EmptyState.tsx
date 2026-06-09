import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border bg-surface px-6 py-16 text-center",
        className,
      )}
    >
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-fwd-soft text-white">
        {icon}
      </span>
      <h2 className="font-display text-xl font-bold text-text">{title}</h2>
      {description && <p className="max-w-md text-text-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
