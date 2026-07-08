import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type CardVariant = "default" | "glass" | "gradient-border" | "interactive";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children: ReactNode;
}

const variantClasses: Record<CardVariant, string> = {
  default: "border border-border bg-surface shadow-sm",
  glass: "glass shadow-sm",
  "gradient-border": "gradient-border shadow-sm",
  interactive:
    "border border-border bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-300/30 dark:hover:shadow-black/40",
};

export default function Card({
  variant = "default",
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div className={cn("rounded-2xl", variantClasses[variant], className)} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col gap-1 p-6 pb-0", className)} {...rest}>
      {children}
    </div>
  );
}

export function CardBody({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6", className)} {...rest}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center gap-3 border-t border-border p-6 pt-4", className)} {...rest}>
      {children}
    </div>
  );
}
