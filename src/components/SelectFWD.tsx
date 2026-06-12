"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
}

export default function SelectFWD({ value, onChange, options }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 min-w-[180px] w-full"
        style={{
          background: open ? "rgba(32,190,198,0.2)" : "rgba(255,255,255,0.1)",
          border: open ? "1px solid #20BEC6" : "1px solid rgba(255,255,255,0.2)",
          backdropFilter: "blur(8px)",
        }}
      >
        <span className={value === options[0] ? "text-white/50" : "text-white"}>
          {value}
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
          className="absolute top-full left-0 mt-2 w-full min-w-[200px] rounded-2xl overflow-hidden z-50 shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #0e1628 0%, #1a0a40 100%)",
            border: "1px solid rgba(32,190,198,0.3)",
            backdropFilter: "blur(16px)",
          }}
        >
          {/* Barra de color superior */}
          <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, #20BEC6, #ED008C)" }} />

          <div className="py-2">
            {options.map((opt, i) => {
              const isSelected = opt === value;
              const isFirst = i === 0;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { onChange(opt); setOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm transition-all duration-150 flex items-center gap-2"
                  style={{
                    color: isSelected ? "#20BEC6" : isFirst ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.8)",
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
                  {isSelected && (
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="#20BEC6" strokeWidth="2.5" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                  {!isSelected && <span className="w-3.5" />}
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
