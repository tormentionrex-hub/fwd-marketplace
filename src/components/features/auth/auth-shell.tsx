import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { FwdLogo, FwdIsotipo } from "@/components/ui/fwd-logo";
import AuthAnimatedTitle from "@/components/features/auth/AuthAnimatedTitle";
import AuthHomeButton from "@/components/features/auth/AuthHomeButton";
import { getUser } from "@/server/auth/get-user";
import Image from "next/image";

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
export async function AuthShell({ highlight, logo, children }: AuthShellProps) {
  const user = await getUser();

  return (
    <div className="relative flex min-h-screen flex-col lg:flex-row">
      {/* Botón de inicio (vuelve al home, respeta el locale) */}
      <AuthHomeButton userRole={user?.roles.nombre ?? null} />

      {/* Panel de marca — sticky: queda fijo mientras el lado derecho scrollea */}
      <aside className="relative hidden overflow-hidden bg-fwd-navy lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[46%] lg:flex-shrink-0 lg:flex-col lg:p-12 xl:p-16">
        {/* Degradado de marca (portada navy → morado → magenta) */}
        <div className="absolute inset-0 bg-gradient-to-br from-fwd-navy via-fwd-purple/40 to-fwd-magenta/40" />
        <ArrowPattern />

        <div className="relative z-10">
          {logo ? (
            <Link href="/" aria-label="Ir al inicio" className="inline-flex transition hover:opacity-90">
              {logo}
            </Link>
          ) : (
            <Link href="/" aria-label="Ir al inicio" className="inline-flex transition-opacity hover:opacity-85">
              <Image
                src="/imagenes/logo-FWD-removebg-preview.png"
                alt="FWD Costa Rica"
                width={180}
                height={60}
                className="h-16 w-auto object-contain drop-shadow-lg"
              />
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

      {/* Panel de formulario — scrollea con el documento normalmente */}
      <main className="relative flex flex-1 flex-col bg-white dark:bg-[#0b1120]">
        <style>{`
          @keyframes fordy-float {
            0%, 100% { transform: translateY(0) rotate(-2deg) scale(1); }
            50%       { transform: translateY(-16px) rotate(2deg) scale(1.04); }
          }
        `}</style>
        <div className="flex min-h-screen flex-col items-center justify-center px-6 py-10 sm:px-10">
          {/* Logo compacto solo visible en móvil/tablet */}
          <div className="mb-8 lg:hidden">
            <Link href="/" aria-label="Ir al inicio" className="inline-flex">
              {logo ?? <FwdLogo />}
            </Link>
          </div>
          <div className="w-full max-w-md">{children}</div>
        </div>

        {/* Fordy en esquina inferior derecha — fondo blanco se funde con el panel */}
        <div className="hidden lg:block absolute bottom-4 right-4 pointer-events-none select-none">
          <Image
            src="/imagenes/fordy-saluda.png"
            alt="Fordy saluda"
            width={160}
            height={160}
            className="w-36 h-auto object-contain"
            style={{
              animation: "fordy-float 3.5s ease-in-out infinite",
              mixBlendMode: "multiply",
            }}
          />
        </div>
      </main>
    </div>
  );
}
