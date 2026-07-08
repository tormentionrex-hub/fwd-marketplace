"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface QuizModalProps {
  abierto: boolean;
  onCerrar: () => void;
  titulo?: string;
  children: ReactNode;
  /** Oculta el botón de cierre (p.ej. mientras se procesa). */
  sinCerrar?: boolean;
}

// Modal con bloqueo de scroll del body (REGLA #7 del repo). El useEffect vive
// dentro del componente del modal y restaura el estado al desmontarse.
export default function QuizModal({ abierto, onCerrar, titulo, children, sinCerrar }: QuizModalProps) {
  useEffect(() => {
    if (!abierto) return;
    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyPosition = body.style.position;
    const prevBodyTop = body.style.top;
    const prevBodyLeft = body.style.left;
    const prevBodyRight = body.style.right;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.position = prevBodyPosition;
      body.style.top = prevBodyTop;
      body.style.left = prevBodyLeft;
      body.style.right = prevBodyRight;
      window.scrollTo(scrollX, scrollY);
    };
  }, [abierto]);

  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
    >
      <div
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
        onWheel={(e) => e.stopPropagation()}
        onClick={sinCerrar ? undefined : onCerrar}
      />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0f172a]">
        {(titulo || !sinCerrar) && (
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-white/5">
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">{titulo}</h3>
            {!sinCerrar && (
              <button
                type="button"
                onClick={onCerrar}
                aria-label="Cerrar"
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6">{children}</div>
      </div>
    </div>
  );
}
