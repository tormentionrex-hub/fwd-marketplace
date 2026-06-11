import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { FwdLogo, FwdIsotipo } from "@/components/ui/fwd-logo";

/** Patrón decorativo de flechas multicolor (sistema gráfico, pág. 11). */
function ArrowPattern() {
  const colors = [
    "#20BEC6",
    "#008FD4",
    "#FFCB05",
    "#F7901E",
    "#EC008C",
    "#662D91",
  ];
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.14]"
    >
      <div className="grid grid-cols-6 gap-6 p-8 rotate-[-8deg] scale-125">
        {Array.from({ length: 42 }).map((_, i) => (
          <svg key={i} viewBox="0 0 100 100" className="h-10 w-10">
            <polygon
              points="20,12 88,50 20,88"
              fill={colors[i % colors.length]}
            />
          </svg>
        ))}
      </div>
    </div>
  );
}

type AuthShellProps = {
  /** Texto destacado del panel de marca */
  highlight: string;
  /** Logo a mostrar en el panel y en el header móvil. Default: FwdLogo con card blanco. */
  logo?: ReactNode;
  children: ReactNode;
};

/**
 * Estructura de autenticación: panel de marca (navy) + panel de formulario (claro).
 * Responsive: el panel de marca se oculta en móvil y deja un encabezado compacto.
 */
export function AuthShell({ highlight, logo, children }: AuthShellProps) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Panel de marca */}
      <aside className="relative hidden overflow-hidden bg-fwd-navy lg:flex lg:w-[46%] lg:flex-col lg:p-12 xl:p-16">
        {/* Degradado de marca (portada navy → morado → magenta) */}
        <div className="absolute inset-0 bg-gradient-to-br from-fwd-navy via-fwd-purple/40 to-fwd-magenta/40" />
        <ArrowPattern />

        <div className="relative z-10">
          {logo ? (
            <Link href="/" aria-label="Ir al inicio" className="inline-flex transition hover:opacity-90">
              {logo}
            </Link>
          ) : (
            <Link
              href="/"
              aria-label="Ir al inicio"
              className="inline-flex rounded-2xl bg-white px-5 py-3 shadow-lg transition hover:shadow-xl"
            >
              <FwdLogo />
            </Link>
          )}
        </div>

        <div className="relative z-10 mt-10 max-w-md">
          <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-fwd-teal">
            FWD · Costa Rica
          </p>
          <h2 className="mt-4 font-display text-4xl font-black leading-tight text-white xl:text-5xl">
            Avancemos hacia{" "}
            <span className="text-fwd-yellow">{highlight}</span> juntos.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/70">
            Una comunidad que avanza en una misma dirección. Únete al
            marketplace que impulsa el progreso de Costa Rica.
          </p>
        </div>

        <div className="relative z-10 mt-auto flex items-center gap-3 text-sm text-white/50">
          <FwdIsotipo className="h-5 w-auto" />
          <span>© {new Date().getFullYear()} FWD · Costa Rica</span>
        </div>
      </aside>

      {/* Panel de formulario */}
      <main className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-10 sm:px-10">
        {/* Logo compacto solo visible en móvil/tablet */}
        <div className="mb-8 lg:hidden">
          <Link href="/" aria-label="Ir al inicio" className="inline-flex">
            {logo ?? <FwdLogo />}
          </Link>
        </div>
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
