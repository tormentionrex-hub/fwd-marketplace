"use client";

import { useState, useRef, useEffect } from "react";

// Mapeo de nombre de tecnología (lowercase) → categoría y color del badge
const TECH_META: Record<string, { label: string; color: string; bg: string }> = {
  // ── IA / ML ──
  "tensorflow":   { label: "IA",  color: "#fff",    bg: "#F7901E" },
  "pytorch":      { label: "IA",  color: "#fff",    bg: "#F7901E" },
  "openai":       { label: "IA",  color: "#fff",    bg: "#F7901E" },
  "langchain":    { label: "IA",  color: "#fff",    bg: "#F7901E" },
  "gemini":       { label: "IA",  color: "#fff",    bg: "#F7901E" },
  "scikit":       { label: "IA",  color: "#fff",    bg: "#F7901E" },
  "huggingface":  { label: "IA",  color: "#fff",    bg: "#F7901E" },
  "ia":           { label: "IA",  color: "#fff",    bg: "#F7901E" },
  "ml":           { label: "IA",  color: "#fff",    bg: "#F7901E" },
  // ── JavaScript / TS ──
  "javascript":   { label: "JS",  color: "#000",    bg: "#FFCB05" },
  "typescript":   { label: "TS",  color: "#fff",    bg: "#3178C6" },
  "react":        { label: "JS",  color: "#000",    bg: "#61DAFB" },
  "next.js":      { label: "JS",  color: "#fff",    bg: "#000000" },
  "nextjs":       { label: "JS",  color: "#fff",    bg: "#000000" },
  "vue":          { label: "JS",  color: "#fff",    bg: "#42B883" },
  "angular":      { label: "JS",  color: "#fff",    bg: "#DD0031" },
  "node":         { label: "JS",  color: "#fff",    bg: "#339933" },
  "nodejs":       { label: "JS",  color: "#fff",    bg: "#339933" },
  "express":      { label: "JS",  color: "#fff",    bg: "#339933" },
  "svelte":       { label: "JS",  color: "#fff",    bg: "#FF3E00" },
  // ── CSS / Estilos ──
  "css":          { label: "CSS", color: "#fff",    bg: "#1572B6" },
  "tailwind":     { label: "CSS", color: "#fff",    bg: "#06B6D4" },
  "tailwindcss":  { label: "CSS", color: "#fff",    bg: "#06B6D4" },
  "bootstrap":    { label: "CSS", color: "#fff",    bg: "#7952B3" },
  "framermotion": { label: "CSS", color: "#fff",    bg: "#ED008C" },
  "sass":         { label: "CSS", color: "#fff",    bg: "#CC6699" },
  "scss":         { label: "CSS", color: "#fff",    bg: "#CC6699" },
  // ── Python ──
  "python":       { label: "PY",  color: "#fff",    bg: "#3776AB" },
  "django":       { label: "PY",  color: "#fff",    bg: "#092E20" },
  "flask":        { label: "PY",  color: "#fff",    bg: "#3776AB" },
  "fastapi":      { label: "PY",  color: "#fff",    bg: "#009688" },
  // ── Ruby ──
  "ruby":         { label: "RB",  color: "#fff",    bg: "#CC342D" },
  "rails":        { label: "RB",  color: "#fff",    bg: "#CC342D" },
  // ── PHP ──
  "php":          { label: "PHP", color: "#fff",    bg: "#8892BE" },
  "laravel":      { label: "PHP", color: "#fff",    bg: "#FF2D20" },
  // ── Java ──
  "java":         { label: "JV",  color: "#fff",    bg: "#ED8B00" },
  "spring":       { label: "JV",  color: "#fff",    bg: "#6DB33F" },
  // ── Kotlin / Swift ──
  "kotlin":       { label: "KT",  color: "#fff",    bg: "#7F52FF" },
  "swift":        { label: "SW",  color: "#fff",    bg: "#FA7343" },
  // ── BD / DB ──
  "postgresql":   { label: "DB",  color: "#fff",    bg: "#336791" },
  "mysql":        { label: "DB",  color: "#fff",    bg: "#4479A1" },
  "mongodb":      { label: "DB",  color: "#fff",    bg: "#47A248" },
  "prisma":       { label: "DB",  color: "#fff",    bg: "#2D3748" },
  "supabase":     { label: "DB",  color: "#fff",    bg: "#3ECF8E" },
  "firebase":     { label: "DB",  color: "#000",    bg: "#FFCA28" },
  "redis":        { label: "DB",  color: "#fff",    bg: "#DC382D" },
  // ── Móvil ──
  "flutter":      { label: "MOV", color: "#fff",    bg: "#02569B" },
  "reactnative":  { label: "MOV", color: "#fff",    bg: "#61DAFB" },
  // ── DevOps / Cloud ──
  "docker":       { label: "OPS", color: "#fff",    bg: "#2496ED" },
  "aws":          { label: "OPS", color: "#000",    bg: "#FF9900" },
  "gcp":          { label: "OPS", color: "#fff",    bg: "#4285F4" },
  "vercel":       { label: "OPS", color: "#fff",    bg: "#000000" },
};

function getTechMeta(nombre: string) {
  const key = nombre.toLowerCase().replace(/\s+/g, "");
  return TECH_META[key] ?? { label: "TECH", color: "#fff", bg: "#662D91" };
}

interface Props {
  value: string;
  onChange: (val: string) => void;
  options: string[]; // El primer elemento es "Todas las tecnologías"
}

export default function TechFilterDropdown({ value, onChange, options }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const placeholder = options[0] ?? "Todas las tecnologías";
  const isDefault   = value === placeholder;

  // Badge del valor seleccionado
  const selectedMeta = isDefault ? null : getTechMeta(value);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white min-w-[200px] w-full"
        style={{
          background:    open ? "linear-gradient(135deg, rgba(32,190,198,0.25), rgba(0,143,213,0.2))" : "rgba(255,255,255,0.1)",
          border:        open ? "1px solid #20BEC6" : "1px solid rgba(255,255,255,0.2)",
          backdropFilter:"blur(8px)",
          boxShadow:     open ? "0 0 20px rgba(32,190,198,0.3), inset 0 1px 0 rgba(255,255,255,0.1)" : "none",
          transition:    "all 0.25s ease",
        }}
        onMouseEnter={(e) => {
          if (!open) {
            (e.currentTarget as HTMLElement).style.background  = "rgba(255,255,255,0.18)";
            (e.currentTarget as HTMLElement).style.border      = "1px solid rgba(32,190,198,0.5)";
            (e.currentTarget as HTMLElement).style.boxShadow   = "0 0 16px rgba(32,190,198,0.2)";
            (e.currentTarget as HTMLElement).style.transform   = "translateY(-1px)";
          }
        }}
        onMouseLeave={(e) => {
          if (!open) {
            (e.currentTarget as HTMLElement).style.background  = "rgba(255,255,255,0.1)";
            (e.currentTarget as HTMLElement).style.border      = "1px solid rgba(255,255,255,0.2)";
            (e.currentTarget as HTMLElement).style.boxShadow   = "none";
            (e.currentTarget as HTMLElement).style.transform   = "translateY(0)";
          }
        }}
      >
        <span className="flex items-center gap-2">
          {selectedMeta && (
            <span
              className="text-[10px] font-black px-1.5 py-0.5 rounded-md flex-shrink-0"
              style={{ background: selectedMeta.bg, color: selectedMeta.color, letterSpacing: "0.5px" }}
            >
              {selectedMeta.label}
            </span>
          )}
          <span className={isDefault ? "text-white/50" : "text-white"}>{value}</span>
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
          className="absolute top-full left-0 mt-2 w-full min-w-[220px] rounded-2xl overflow-hidden z-50 shadow-2xl"
          style={{
            background:    "linear-gradient(135deg, #0e1628 0%, #1a0a40 100%)",
            border:        "1px solid rgba(32,190,198,0.3)",
            backdropFilter:"blur(16px)",
            maxHeight:     "280px",
            overflowY:     "auto",
          }}
        >
          {/* Barra de color superior */}
          <div className="h-0.5 w-full sticky top-0" style={{ background: "linear-gradient(90deg, #20BEC6, #ED008C)" }} />

          <div className="py-2">
            {options.map((opt, i) => {
              const isSelected = opt === value;
              const isFirst    = i === 0;
              const meta       = isFirst ? null : getTechMeta(opt);

              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { onChange(opt); setOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm transition-all duration-150 flex items-center gap-2.5"
                  style={{
                    color:      isSelected ? "#20BEC6" : isFirst ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.85)",
                    background: isSelected ? "rgba(32,190,198,0.12)" : "transparent",
                    fontWeight: isSelected ? 700 : 400,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  {/* Check o espacio */}
                  {isSelected ? (
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="#20BEC6" strokeWidth="2.5" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span className="w-3.5 flex-shrink-0" />
                  )}

                  {/* Badge de tipo */}
                  {meta && (
                    <span
                      className="text-[9px] font-black px-1.5 py-0.5 rounded flex-shrink-0"
                      style={{ background: meta.bg, color: meta.color, letterSpacing: "0.4px", minWidth: 28, textAlign: "center" }}
                    >
                      {meta.label}
                    </span>
                  )}

                  {/* Nombre */}
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
