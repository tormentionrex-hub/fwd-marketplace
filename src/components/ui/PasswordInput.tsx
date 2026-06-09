"use client";

import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { IconEye, IconEyeOff } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";
import { fieldBase } from "./Input";

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string | undefined;
  hint?: string | undefined;
  error?: string | undefined;
  icon?: ReactNode | undefined;
  containerClassName?: string | undefined;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    { label, hint, error, icon, id, className, containerClassName, ...rest },
    ref,
  ) {
    const [visible, setVisible] = useState(false);
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
            type={visible ? "text" : "password"}
            className={cn(
              fieldBase,
              icon && "pl-11",
              "pr-11",
              error ? "border-red-400 focus:border-red-500 focus:ring-red-500/10" : "border-border",
              className,
            )}
            aria-invalid={error ? true : undefined}
            {...rest}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-fwd-azul"
          >
            {visible ? <IconEyeOff width={18} height={18} /> : <IconEye width={18} height={18} />}
          </button>
        </div>
        {error ? (
          <p className="text-xs font-medium text-red-500">{error}</p>
        ) : hint ? (
          <p className="text-xs text-text-muted">{hint}</p>
        ) : null}
      </div>
    );
  },
);

export default PasswordInput;
