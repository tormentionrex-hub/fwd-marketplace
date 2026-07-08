"use client";

import Link from "next/link";
import { IconBriefcase } from "@/components/ui/icons";

// Selector central del hero del marketplace: alterna entre Proyectos y Vacantes.
// La pestaña activa no navega; la otra es un Link a su página.

interface Props {
  locale: string;
  activo: "proyectos" | "vacantes";
}

export default function MarketplaceTabs({ locale, activo }: Props) {
  const base =
    "inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all duration-200";

  return (
    <div className="mb-6 flex justify-center">
      <div
        className="inline-flex gap-1 rounded-2xl p-1.5 backdrop-blur-sm"
        style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)" }}
      >
        {/* Proyectos */}
        {activo === "proyectos" ? (
          <span
            className={base}
            style={{ background: "linear-gradient(135deg, #20BEC6, #008FD4)", color: "#fff", boxShadow: "0 4px 16px rgba(32,190,198,0.4)" }}
          >
            <svg viewBox="0 0 66 76" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M0 0 L66 38 L0 76 Z" />
            </svg>
            Proyectos
          </span>
        ) : (
          <Link href={`/${locale}/marketplace`} className={base} style={{ color: "rgba(255,255,255,0.7)" }}>
            <svg viewBox="0 0 66 76" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M0 0 L66 38 L0 76 Z" />
            </svg>
            Proyectos
          </Link>
        )}

        {/* Vacantes */}
        {activo === "vacantes" ? (
          <span
            className={base}
            style={{ background: "linear-gradient(135deg, #F7901E, #EC008C)", color: "#fff", boxShadow: "0 4px 16px rgba(237,0,140,0.4)" }}
          >
            <IconBriefcase width={16} height={16} />
            Vacantes
          </span>
        ) : (
          <Link href={`/${locale}/marketplace/vacantes`} className={base} style={{ color: "rgba(255,255,255,0.7)" }}>
            <IconBriefcase width={16} height={16} />
            Vacantes
          </Link>
        )}
      </div>
    </div>
  );
}
