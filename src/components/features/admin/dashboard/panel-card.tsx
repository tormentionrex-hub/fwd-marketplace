import type { ReactNode } from "react";

// Contenedor visual estándar de las tarjetas del dashboard admin.
// Componente presentacional sin directiva → se puede usar tanto desde
// componentes de servidor como de cliente. Las clases del panel las adapta el
// override de globals.css al tema claro/oscuro.
export function PanelCard({
  title,
  action,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={`flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-sm ${
        className ?? ""
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-display text-base font-bold text-white">{title}</h3>
        {action}
      </div>
      <div className={bodyClassName ?? "flex-1"}>{children}</div>
    </section>
  );
}
