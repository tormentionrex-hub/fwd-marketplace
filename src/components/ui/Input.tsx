import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string | undefined;
  hint?: string | undefined;
  error?: string | undefined;
  icon?: ReactNode | undefined;
  containerClassName?: string | undefined;
}

export const fieldBase =
  "h-11 w-full rounded-xl border bg-surface px-3.5 text-text outline-none transition-colors placeholder:text-text-muted/60 focus:border-fwd-azul focus:ring-4 focus:ring-fwd-azul/10 disabled:opacity-60";

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, icon, id, className, containerClassName, ...rest },
  ref,
) {
  const inputId = id ?? rest.name;
  return (
    <div className={cn("flex flex-col gap-1.5", containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            fieldBase,
            icon && "pl-11",
            error ? "border-red-400 focus:border-red-500 focus:ring-red-500/10" : "border-border",
            className,
          )}
          aria-invalid={error ? true : undefined}
          {...rest}
        />
      </div>
      {error ? (
        <p className="text-xs font-medium text-red-500">{error}</p>
      ) : hint ? (
        <p className="text-xs text-text-muted">{hint}</p>
      ) : null}
    </div>
  );
});

export default Input;
