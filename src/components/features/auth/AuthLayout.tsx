import Link from "next/link";
import type { ReactNode } from "react";
import { IconCheck } from "@/components/ui/icons";

interface AuthLayoutProps {
  locale: string;
  title: ReactNode;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

const HIGHLIGHTS = [
  "Conecta con +480 empresas y +2.500 talentos",
  "Publica proyectos y descubre oportunidades reales",
  "Crece con la comunidad tecnológica de Costa Rica",
];

export default function AuthLayout({
  locale,
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panel informativo */}
      <aside className="relative isolate hidden flex-col justify-between overflow-hidden bg-gradient-fwd p-12 text-white lg:flex">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-20"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <svg
          aria-hidden
          viewBox="0 0 66 76"
          className="absolute -right-10 top-1/3 h-72 w-72 opacity-10"
          fill="#ffffff"
        >
          <path d="M0 0 L66 38 L0 76 Z" />
        </svg>

        <Link href={`/${locale}`} className="font-display text-2xl font-extrabold tracking-tight">
          FWD<span className="text-white/70"> Marketplace</span>
        </Link>

        <div>
          <h2 className="max-w-md font-display text-4xl font-bold leading-tight">
            Avancemos hacia el futuro digital juntos
          </h2>
          <ul className="mt-8 flex flex-col gap-4">
            {HIGHLIGHTS.map((h) => (
              <li key={h} className="flex items-center gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/20">
                  <IconCheck width={16} height={16} />
                </span>
                <span className="text-white/90">{h}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-white/70">
          © {new Date().getFullYear()} FWD Costa Rica · Ecosistema digital
        </p>
      </aside>

      {/* Panel del formulario */}
      <main className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-md">
          <Link
            href={`/${locale}`}
            className="mb-8 inline-block font-display text-xl font-extrabold tracking-tight text-text lg:hidden"
          >
            FWD<span className="text-fwd-azul"> Marketplace</span>
          </Link>

          <h1 className="font-display text-3xl font-bold tracking-tight text-text">{title}</h1>
          {subtitle && <p className="mt-2 text-text-muted">{subtitle}</p>}

          <div className="mt-8">{children}</div>

          {footer && <div className="mt-6 text-center text-sm text-text-muted">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
