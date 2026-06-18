import type { ReactNode } from "react";

// Encabezado común de las páginas del panel admin (tema oscuro FWD).
export function AdminPageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-fwd-turquoise transition-all duration-300 hover:text-white hover:translate-x-1 cursor-default select-none">
          <span className="text-fwd-blue transition-colors duration-300 hover:text-fwd-turquoise">&#9654;&#9654;</span> FWD · Costa Rica
        </p>
        <h1 className="font-display text-3xl font-black tracking-tight text-white sm:text-4xl transition-all duration-300 hover:text-fwd-blue hover:translate-x-1 cursor-default select-none">
          {title}
        </h1>
        {subtitle ? <p className="mt-2 text-white/50 transition-all duration-300 hover:text-white/80 hover:translate-x-1 cursor-default select-none">{subtitle}</p> : null}
      </div>
      {action}
    </header>
  );
}

// Contenedor estándar de cada página del panel (padding + ancho + espacio para
// el botón hamburguesa en mobile).
export function AdminPageShell({ children }: { children: ReactNode }) {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8 pt-20 lg:px-10 lg:pt-10">
      {children}
    </section>
  );
}
