"use client";

import { useState, useEffect, useRef } from "react";
import { Link } from "@/i18n/navigation";

type Lang = "es" | "en";

const languages: { code: Lang; label: string; country: string; flagCode: string }[] = [
  { code: "es", label: "Español", country: "Costa Rica",    flagCode: "cr" },
  { code: "en", label: "English", country: "United States", flagCode: "us" },
];

/* ── Iconos SVG ──────────────────────────────────── */
const IconGear = () => (
  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65
      1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9
      19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0
      4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65
      1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68
      a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65
      0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65
      1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const IconMoon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const IconA11y = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="4" r="1.5" />
    <path d="M6 8h12M9 21l1.5-6M15 21l-1.5-6M9 13l-2 4M15 13l2 4" />
    <path d="M12 8v5" />
  </svg>
);

const IconDocument = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const IconChevron = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const IconBack = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const IconCheck = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3"
    strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/* ── Toggle switch ───────────────────────────────── */
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={on}
      className="relative flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-300"
      style={{ background: on ? "linear-gradient(90deg,#20BEC6,#008FD5)" : "rgba(255,255,255,0.12)" }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300"
        style={{ transform: on ? "translateX(24px)" : "translateX(0)" }}
      />
    </button>
  );
}

/* ── Etiqueta de sección ─────────────────────────── */
function SectionLabel({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <div className="flex items-center gap-2 px-1 mb-2.5">
      <span className="w-0.5 h-3 rounded-full flex-shrink-0" style={{ background: accent }} />
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#20BEC6]">{children}</p>
    </div>
  );
}

/* ── Divisor degradado ───────────────────────────── */
function GradientDivider() {
  return (
    <div className="mx-4 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)" }} />
  );
}

/* ── Componente principal ────────────────────────── */
export default function SettingsPanel() {
  const [open, setOpen]         = useState(false);
  const [lang, setLang]         = useState<Lang>("es");
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [showA11y, setShowA11y] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setShowA11y(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
  }, [fontSize]);

  const close = () => { setOpen(false); setShowA11y(false); };

  return (
    <div className="relative" ref={ref}>

      {/* ── Botón engranaje ── */}
      <button
        onClick={() => { setOpen(!open); setShowA11y(false); }}
        aria-label="Ajustes"
        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200
          ${open
            ? "border-[#20BEC6] text-[#20BEC6] bg-[#20BEC6]/10"
            : "border-white/25 text-white hover:border-[#20BEC6] hover:text-[#20BEC6] hover:bg-white/10"}`}
      >
        <IconGear />
      </button>

      {/* ── Panel ── */}
      {open && (
        <div
          className="absolute right-0 top-14 w-80 rounded-2xl shadow-2xl z-50 overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #0e1628 0%, #1a0a3e 55%, #0e1628 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
            animation: "fadeDown .18s ease",
            boxShadow: "0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(32,190,198,0.15), 0 0 80px rgba(32,190,198,0.04)",
          }}
        >
          {/* Barra arcoiris */}
          <div className="h-0.5" style={{ background: "linear-gradient(90deg,#20BEC6,#008FD5,#662D91,#ED008C)" }} />

          {/* Brillo radial decorativo */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{ background: "radial-gradient(ellipse at top right, rgba(32,190,198,0.1) 0%, transparent 55%)" }} />

          {/* ── Header ── */}
          <div className="relative flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center gap-2.5">
              {showA11y && (
                <button onClick={() => setShowA11y(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all">
                  <IconBack />
                </button>
              )}
              <span className="text-[#20BEC6]"><IconGear /></span>
              <span className="font-heading font-black text-white text-lg tracking-tight">
                {showA11y ? "Accesibilidad" : "Ajustes"}
              </span>
            </div>
            <button onClick={close}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all text-sm font-bold leading-none">
              ✕
            </button>
          </div>

          {/* ══ VISTA PRINCIPAL ══ */}
          {!showA11y && (
            <>
              {/* Idioma */}
              <div className="px-4 pt-4 pb-3">
                <SectionLabel accent="linear-gradient(180deg, #20BEC6, #008FD5)">Idioma</SectionLabel>
                <div className="flex flex-col gap-1.5">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLang(l.code);
                        const currentPath = window.location.pathname;
                        const withoutLocale = currentPath.replace(/^\/(es|en)/, "") || "/";
                        window.location.href = `/${l.code}${withoutLocale}`;
                        close();
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left w-full transition-all duration-200"
                      style={{
                        background: lang === l.code
                          ? "linear-gradient(90deg, rgba(32,190,198,0.18), rgba(0,143,213,0.08))"
                          : "transparent",
                        border: lang === l.code
                          ? "1px solid rgba(32,190,198,0.4)"
                          : "1px solid transparent",
                      }}
                      onMouseEnter={(e) => { if (lang !== l.code) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
                      onMouseLeave={(e) => { if (lang !== l.code) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`https://flagcdn.com/w40/${l.flagCode}.png`} alt={l.country}
                        width={28} height={20} className="rounded-sm object-cover flex-shrink-0" style={{ width: 28, height: 20 }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm leading-tight text-white">{l.label}</p>
                        <p className="text-[11px] text-white/40">{l.country}</p>
                      </div>
                      {lang === l.code && (
                        <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-white"
                          style={{ background: "linear-gradient(135deg, #20BEC6, #008FD5)" }}>
                          <IconCheck />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <GradientDivider />

              {/* Apariencia */}
              <div className="px-4 pt-3 pb-3">
                <SectionLabel accent="linear-gradient(180deg, #662D91, #ED008C)">Apariencia e Inclusión</SectionLabel>

                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150"
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,#008FD5,#20BEC6)" }}>
                    <span className="text-white"><IconMoon /></span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm leading-tight">Modo Oscuro</p>
                    <p className="text-[11px] text-white/40">Cambia el tema visual</p>
                  </div>
                  <Toggle on={darkMode} onToggle={() => setDarkMode(!darkMode)} />
                </div>

                <button onClick={() => setShowA11y(true)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 w-full mt-1"
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,#662D91,#ED008C)" }}>
                    <span className="text-white"><IconA11y /></span>
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-semibold text-white text-sm leading-tight">Accesibilidad</p>
                    <p className="text-[11px] text-white/40">Ajustes de inclusión</p>
                  </div>
                  <span className="text-white/30"><IconChevron /></span>
                </button>
              </div>

              <GradientDivider />

              {/* Legal */}
              <div className="px-4 pt-3 pb-4">
                <SectionLabel accent="linear-gradient(180deg, #ED008C, #662D91)">Legal y Soporte</SectionLabel>
                <Link href="/terminos" onClick={close}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150"
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,#ED008C,#662D91)" }}>
                    <span className="text-white"><IconDocument /></span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm leading-tight">Términos y Condiciones</p>
                    <p className="text-[11px] text-white/40">Políticas de uso</p>
                  </div>
                  <span className="text-white/30"><IconChevron /></span>
                </Link>
              </div>

              {/* Pie FWD */}
              <div className="px-5 py-2.5 flex items-center justify-center"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <span className="text-[10px] font-black tracking-[0.25em] uppercase"
                  style={{
                    background: "linear-gradient(90deg,#20BEC6,#008FD5,#662D91,#ED008C)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}>
                  FWD Marketplace
                </span>
              </div>
            </>
          )}

          {/* ══ VISTA ACCESIBILIDAD ══ */}
          {showA11y && (
            <div className="px-4 py-4 flex flex-col gap-3">

              {/* Tamaño de fuente */}
              <div className="rounded-2xl p-4"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-heading font-black text-white text-sm">Tamaño de texto</p>
                    <p className="text-[11px] text-white/40">Ajusta el tamaño de la letra</p>
                  </div>
                  <span className="text-xs font-bold text-[#20BEC6] bg-[#20BEC6]/15 px-2 py-1 rounded-full border border-[#20BEC6]/30">
                    {fontSize}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setFontSize((f) => Math.max(80, f - 10))}
                    className="w-9 h-9 rounded-full font-bold text-sm flex items-center justify-center transition-all text-white/70 hover:text-[#20BEC6]"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
                    A−
                  </button>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${((fontSize - 80) / 60) * 100}%`, background: "linear-gradient(90deg,#20BEC6,#008FD5)" }} />
                  </div>
                  <button onClick={() => setFontSize((f) => Math.min(140, f + 10))}
                    className="w-9 h-9 rounded-full font-bold text-sm flex items-center justify-center transition-all text-white/70 hover:text-[#20BEC6]"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
                    A+
                  </button>
                </div>
              </div>

              <div className="rounded-2xl p-4 flex items-center gap-3"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex-1">
                  <p className="font-heading font-black text-white text-sm">Reducir movimiento</p>
                  <p className="text-[11px] text-white/40">Desactiva animaciones</p>
                </div>
                <Toggle on={false} onToggle={() => {
                  document.documentElement.style.setProperty("--reduce-motion",
                    document.documentElement.style.getPropertyValue("--reduce-motion") === "1" ? "0" : "1");
                }} />
              </div>

              <div className="rounded-2xl p-4 flex items-center gap-3"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex-1">
                  <p className="font-heading font-black text-white text-sm">Alto contraste</p>
                  <p className="text-[11px] text-white/40">Mejora la visibilidad</p>
                </div>
                <Toggle on={false} onToggle={() => document.documentElement.classList.toggle("high-contrast")} />
              </div>

            </div>
          )}

        </div>
      )}

      <style>{`
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-10px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
      `}</style>
    </div>
  );
}
