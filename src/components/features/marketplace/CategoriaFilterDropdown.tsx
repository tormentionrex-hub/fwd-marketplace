"use client";

import { useState, useRef, useEffect } from "react";

type CategoriaItem = { label: string; color: string };

const CATEGORIAS: CategoriaItem[] = [
  { label: "Turismo",                 color: "#008FD5" },
  { label: "Skills",                  color: "#20BEC6" },
  { label: "Automatización",          color: "#F7901E" },
  { label: "Tecnología",              color: "#662D91" },
  { label: "Educación",               color: "#ED008C" },
  { label: "Servicios",               color: "#008FD5" },
  { label: "Marketing",               color: "#ED008C" },
  { label: "Emprendimiento",          color: "#FFCB05" },
  { label: "Innovación",              color: "#20BEC6" },
  { label: "Solución de problemas",   color: "#662D91" },
  { label: "JavaScript",              color: "#FFCB05" },
  { label: "Python",                  color: "#3776AB" },
  { label: "Ruby",                    color: "#CC342D" },
];

const TODAS = "Todas las categorías";

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export default function CategoriaFilterDropdown({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isDefault  = value === TODAS;
  const activeItem = CATEGORIAS.find((c) => c.label === value);

  return (
    <div ref={ref} className="relative">
      <style>{`
        .fwd-scroll::-webkit-scrollbar { width: 5px; }
        .fwd-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.04); border-radius: 99px; }
        .fwd-scroll::-webkit-scrollbar-thumb { background: linear-gradient(180deg,#20BEC6,#662D91,#ED008C); border-radius: 99px; }
        .fwd-scroll::-webkit-scrollbar-thumb:hover { background: linear-gradient(180deg,#ED008C,#662D91,#20BEC6); }
      `}</style>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white min-w-[200px] w-full"
        style={{
          background:     open
            ? "linear-gradient(135deg, rgba(32,190,198,0.25), rgba(0,143,213,0.2))"
            : isDefault ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, rgba(102,45,145,0.35), rgba(237,0,140,0.25))",
          border:         open ? "1px solid #20BEC6" : isDefault ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(237,0,140,0.5)",
          backdropFilter: "blur(8px)",
          boxShadow:      open ? "0 0 20px rgba(32,190,198,0.3)" : "none",
          transition:     "all 0.25s ease",
        }}
        onMouseEnter={(e) => {
          if (!open) {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.18)";
            (e.currentTarget as HTMLElement).style.border     = "1px solid rgba(32,190,198,0.5)";
            (e.currentTarget as HTMLElement).style.transform  = "translateY(-1px)";
          }
        }}
        onMouseLeave={(e) => {
          if (!open) {
            (e.currentTarget as HTMLElement).style.background = isDefault
              ? "rgba(255,255,255,0.1)"
              : "linear-gradient(135deg, rgba(102,45,145,0.35), rgba(237,0,140,0.25))";
            (e.currentTarget as HTMLElement).style.border    = isDefault
              ? "1px solid rgba(255,255,255,0.2)"
              : "1px solid rgba(237,0,140,0.5)";
            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          }
        }}
      >
        <span className="flex items-center gap-2">
          {/* Dot de color cuando hay categoría activa */}
          {activeItem && (
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: activeItem.color, boxShadow: `0 0 6px ${activeItem.color}99` }}
            />
          )}
          <span className={isDefault ? "text-white/50" : "text-white font-bold"}>
            {isDefault ? "Todas las categorías" : value}
          </span>
        </span>
        <svg
          className="w-4 h-4 text-white/60 flex-shrink-0 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute top-full left-0 mt-2 w-full min-w-[230px] rounded-2xl overflow-hidden z-50 shadow-2xl fwd-scroll"
          style={{
            background:    "linear-gradient(135deg, #0e1628 0%, #1a0a40 100%)",
            border:        "1px solid rgba(32,190,198,0.3)",
            backdropFilter:"blur(16px)",
            maxHeight:     "320px",
            overflowY:     "auto",
            scrollbarWidth: "thin",
            scrollbarColor: "#20BEC6 rgba(255,255,255,0.05)",
          }}
        >
          <div className="h-0.5 w-full sticky top-0" style={{ background: "linear-gradient(90deg, #20BEC6, #662D91, #ED008C)" }} />

          <div className="py-2">
            {/* Opción "Todas" */}
            <button
              type="button"
              onClick={() => { onChange(TODAS); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm transition-all duration-150 flex items-center gap-2.5"
              style={{
                color:      value === TODAS ? "#20BEC6" : "rgba(255,255,255,0.4)",
                background: value === TODAS ? "rgba(32,190,198,0.12)" : "transparent",
                fontWeight: value === TODAS ? 700 : 400,
              }}
              onMouseEnter={(e) => { if (value !== TODAS) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={(e) => { if (value !== TODAS) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              {value === TODAS ? (
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="#20BEC6" strokeWidth="2.5" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : <span className="w-3.5" />}
              <span className="w-2.5 h-2.5 rounded-full bg-white/20 flex-shrink-0" />
              Todas las categorías
            </button>

            {/* Separador */}
            <div className="mx-4 my-1 h-px bg-white/10" />

            {CATEGORIAS.map((cat) => {
              const isSelected = value === cat.label;
              return (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => { onChange(cat.label); setOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm transition-all duration-150 flex items-center gap-2.5"
                  style={{
                    color:      isSelected ? cat.color : "rgba(255,255,255,0.82)",
                    background: isSelected ? `${cat.color}18` : "transparent",
                    fontWeight: isSelected ? 700 : 400,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLElement).style.background = `${cat.color}12`;
                      (e.currentTarget as HTMLElement).style.color = "white";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.82)";
                    }
                  }}
                >
                  {isSelected ? (
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke={cat.color} strokeWidth="2.5" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : <span className="w-3.5" />}
                  {/* Dot de color */}
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: cat.color, boxShadow: isSelected ? `0 0 6px ${cat.color}88` : "none" }}
                  />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
