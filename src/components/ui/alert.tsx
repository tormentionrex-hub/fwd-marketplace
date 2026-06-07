import type { ReactNode } from "react";

export type AlertVariant = "error" | "warning" | "success" | "info";

const ESTILOS: Record<AlertVariant, string> = {
  error: "border-red-200 bg-red-50 text-red-800",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  success: "border-green-200 bg-green-50 text-green-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
};

// Alerta reutilizable y personalizable. Sirve para banners inline o, envuelta en
// un contenedor posicionado, como toast flotante.
export function Alert({
  variant = "info",
  title,
  children,
  onClose,
  className = "",
}: {
  variant?: AlertVariant;
  title?: string;
  children?: ReactNode;
  onClose?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-sm ${ESTILOS[variant]} ${className}`}
    >
      <div className="flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? "mt-0.5 opacity-90" : ""}>{children}</div>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="shrink-0 rounded-md px-1 leading-none opacity-60 transition hover:opacity-100"
        >
          ✕
        </button>
      )}
    </div>
  );
}
