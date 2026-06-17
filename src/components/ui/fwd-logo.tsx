import type { SVGProps } from "react";

/**
 * Color de las letras del wordmark, muestreado de la imagen oficial del logo
 * (FORWARD LOGO.jpg): «FWD» en azul y «COSTA RICA» en morado.
 */
const LETTER = {
  azul: "#0090D8",
  morado: "#603090",
} as const;

/**
 * Isotipo FWD — flechas superpuestas que generan el símbolo de avance (▶).
 * Recreación a partir del Libro de Marca (pág. 6) usando los 6 colores oficiales.
 * El isotipo SIEMPRE conserva sus colores: son el alma de la marca.
 */
export function FwdIsotipo({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 110 100"
      role="img"
      aria-label="Isotipo FWD"
      className={className}
      {...props}
    >
      <defs>
        <clipPath id="fwd-arrow">
          <path d="M6 6 H58 A1 1 0 0 1 58 6 L104 50 L58 94 H6 Z" />
        </clipPath>
      </defs>
      <g clipPath="url(#fwd-arrow)">
        {/* Cuerpo izquierdo */}
        <rect x="0" y="0" width="44" height="100" fill="#20BEC6" />
        <polygon points="0,0 56,0 30,50 56,100 0,100" fill="#008FD4" />
        {/* Triángulo interior */}
        <polygon points="22,26 22,74 56,50" fill="#FFCB05" />
        <polygon points="40,40 40,60 54,50" fill="#F7901E" />
        {/* Mitad derecha y punta */}
        <rect x="50" y="0" width="60" height="100" fill="#662D91" />
        <polygon points="56,8 56,92 104,50" fill="#EC008C" />
      </g>
    </svg>
  );
}

/**
 * Logo Circular FWD — Flor de flechas superpuestas formando un hexágono.
 * Utiliza simetría de 6 pliegues con rotaciones para recrear la identidad oficial del app launcher.
 */
export function FwdCircularLogo({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label="Logo Circular FWD"
      className={className}
      {...props}
    >
      <defs>
        <g id="fwd-circular-spoke">
          {/* Triángulo exterior cyan */}
          <polygon points="50,13 35,29 65,29" fill="#20BEC6" />
          {/* Triángulo intermedio amarillo */}
          <polygon points="50,25 40,36 60,36" fill="#FFCB05" />
          {/* Spoke interior magenta */}
          <polygon points="50,33 43,43 57,43" fill="#EC008C" />
        </g>
      </defs>
      <use href="#fwd-circular-spoke" />
      <use href="#fwd-circular-spoke" transform="rotate(60 50 50)" />
      <use href="#fwd-circular-spoke" transform="rotate(120 50 50)" />
      <use href="#fwd-circular-spoke" transform="rotate(180 50 50)" />
      <use href="#fwd-circular-spoke" transform="rotate(240 50 50)" />
      <use href="#fwd-circular-spoke" transform="rotate(300 50 50)" />
    </svg>
  );
}

type FwdLogoProps = {
  className?: string;
};

/**
 * Logotipo principal: wordmark «FWD» + isotipo de flechas + descriptor «COSTA RICA».
 * Colores oficiales del Libro de Marca: FWD en azul, COSTA RICA en morado.
 */
export function FwdLogo({ className }: FwdLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      <div className="flex flex-col leading-none">
        <span
          className="font-display text-3xl font-black tracking-tighter"
          style={{ color: LETTER.azul }}
        >
          FWD
        </span>
        <span
          className="font-display text-[0.6rem] font-bold tracking-[0.32em]"
          style={{ color: LETTER.morado }}
        >
          COSTA RICA
        </span>
      </div>
      <FwdCircularLogo className="h-9 w-auto" />
    </div>
  );
}

/**
 * Logotipo oficial de FWD Marketplace: wordmark FWD + Marketplace con degradado + isotipo.
 * Soporta forceLight para renderizar en encabezados/fondos oscuros.
 */
export function FwdMarketplaceLogo({
  className,
  forceLight = false,
}: {
  className?: string;
  forceLight?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <FwdCircularLogo className="h-8 w-auto shrink-0" />
      <div className="flex flex-col leading-none">
        <span
          className={`font-display text-2xl font-black tracking-tighter ${
            forceLight ? "text-white" : "text-[#008FD4] dark:text-white"
          }`}
        >
          FWD
        </span>
        <span
          className={`font-display text-[0.58rem] font-extrabold tracking-[0.15em] uppercase bg-clip-text text-transparent ${
            forceLight
              ? "bg-gradient-to-r from-[#20BEC6] to-[#FFCB05]"
              : "bg-gradient-to-r from-[#008FD4] via-[#662D91] to-[#EC008C] dark:from-[#20BEC6] dark:to-[#FFCB05]"
          }`}
        >
          Marketplace
        </span>
      </div>
    </div>
  );
}

