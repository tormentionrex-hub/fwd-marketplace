import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type BadgeVariant =
  | "neutral"
  | "info"
  | "success"
  | "danger"
  | "warning"
  | "brand"
  | "accent"
  | "outline"
  | "featured";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "bg-surface-2 text-text-muted",
  info: "bg-fwd-azul/10 text-fwd-azul",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  danger: "bg-red-500/10 text-red-600 dark:text-red-400",
  warning: "bg-fwd-naranja/10 text-fwd-naranja",
  brand: "bg-fwd-azul/10 text-fwd-azul",
  accent: "bg-fwd-turquesa/10 text-fwd-turquesa",
  outline: "border border-border text-text-muted",
  featured: "bg-gradient-fwd text-white shadow-sm",
};

export default function Badge({
  children,
  variant = "neutral",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
