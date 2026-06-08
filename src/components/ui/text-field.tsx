import type { InputHTMLAttributes, ReactNode } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  /** Icono opcional a la izquierda del campo */
  icon?: ReactNode;
};

/**
 * Campo de formulario base — Outfit, foco con azul de marca.
 */
export function TextField({ id, label, icon, className, ...props }: TextFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-sm font-medium text-fwd-ink/80"
      >
        {label}
      </label>
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fwd-ink/40">
            {icon}
          </span>
        ) : null}
        <input
          id={id}
          className={`w-full rounded-xl border border-fwd-ink/12 bg-fwd-mist/40 px-4 py-3 text-[0.95rem] text-fwd-ink outline-none transition placeholder:text-fwd-ink/35 focus:border-fwd-blue focus:bg-white focus:ring-4 focus:ring-fwd-blue/15 ${
            icon ? "pl-11" : ""
          } ${className ?? ""}`}
          {...props}
        />
      </div>
    </div>
  );
}
