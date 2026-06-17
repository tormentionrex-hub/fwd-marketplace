import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { FwdLogo, FwdIsotipo, FwdMarketplaceLogo } from "@/components/ui/fwd-logo";
import AuthAnimatedTitle from "@/components/features/auth/AuthAnimatedTitle";
import AuthHomeButton from "@/components/features/auth/AuthHomeButton";
import ParticleBackground from "@/components/ParticleBackground";

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
    <div className="relative flex min-h-screen flex-col lg:flex-row">
      {/* Botón de inicio (vuelve al home, respeta el locale) */}
      <AuthHomeButton />

      {/* Panel de marca */}
      <aside className="relative hidden overflow-hidden bg-fwd-navy lg:flex lg:w-[46%] lg:flex-col lg:p-12 xl:p-16">
        {/* Degradado de marca (portada navy → morado → magenta) */}
        <div className="absolute inset-0 bg-gradient-to-br from-fwd-navy via-fwd-purple/40 to-fwd-magenta/40" />
        <ParticleBackground />
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
              className="inline-flex rounded-2xl bg-white dark:bg-slate-900 px-5 py-3 shadow-lg transition hover:shadow-xl"
            >
              <FwdMarketplaceLogo />
            </Link>
          )}
        </div>

        <div className="relative z-10 mt-10 max-w-md">
          <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-fwd-teal">
            FWD · Costa Rica
          </p>
          <AuthAnimatedTitle highlight={highlight} />
        </div>

        <div className="relative z-10 mt-auto flex items-center gap-3 text-sm text-white/50">
          <FwdIsotipo className="h-5 w-auto" />
          <span>© {new Date().getFullYear()} FWD · Costa Rica</span>
        </div>
      </aside>

      {/* Panel de formulario */}
      <main className="relative flex flex-1 flex-col items-center justify-center bg-white dark:bg-[#060913] px-4 py-8 sm:px-10">
        {/* Grid tecnológico en modo oscuro */}
        <div className="absolute inset-0 hidden dark:block pointer-events-none bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_50%,transparent_100%)] z-0" />

        {/* Logo compacto solo visible en móvil/tablet */}
        <div className="relative z-10 mb-8 lg:hidden">
          <Link href="/" aria-label="Ir al inicio" className="inline-flex">
            {logo ?? <FwdMarketplaceLogo />}
          </Link>
        </div>
        <div className="relative z-10 w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
