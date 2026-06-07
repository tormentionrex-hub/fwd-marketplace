"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

type Lang = "es" | "en" | "pt";

const languages: { code: Lang; label: string; flag: string }[] = [
  { code: "es", label: "Español",   flag: "🇨🇷" },
  { code: "en", label: "English",   flag: "🇺🇸" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
];

export default function SettingsPanel() {
  const [open, setOpen]         = useState(false);
  const [lang, setLang]         = useState<Lang>("es");
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [showA11y, setShowA11y] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  /* Cierra al click afuera */
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

  /* Modo oscuro */
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  /* Tamaño de fuente */
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
  }, [fontSize]);

  const GearIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65
        1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9
        19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0
        4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65
        0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65
        0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06
        -.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2
        2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );

  return (
    <div className="relative" ref={ref}>

      {/* Botón engranaje */}
      <button
        onClick={() => { setOpen(!open); setShowA11y(false); }}
        aria-label="Ajustes"
        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200
          ${open ? "border-[#20BEC6] text-[#20BEC6] bg-[#20BEC6]/10" : "border-white/20 text-white hover:border-[#20BEC6] hover:text-[#20BEC6]"}`}
      >
        <GearIcon />
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute right-0 top-14 w-72 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-100"
          style={{ animation: "fadeDown .18s ease" }}>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <span className="flex items-center gap-2 font-bold text-gray-800 text-base">
              <span className="text-gray-400"><GearIcon /></span>
              {showA11y ? "Accesibilidad" : "Ajustes"}
            </span>
            <button onClick={() => { setOpen(false); setShowA11y(false); }}
              className="text-gray-400 hover:text-gray-700 transition-colors text-lg leading-none">
              ✕
            </button>
          </div>

          {/* ── Vista principal */}
          {!showA11y && (
            <>
              {/* Idioma */}
              <div className="px-4 py-4 border-b border-gray-100">
                <p className="font-bold text-gray-800 mb-3 px-1">Idioma</p>
                <div className="flex flex-col gap-1">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => setLang(l.code)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors w-full
                        ${lang === l.code ? "bg-[#20BEC6]/10 border border-[#20BEC6]" : "hover:bg-gray-50"}`}
                    >
                      <span className="text-xl">{l.flag}</span>
                      <span className={`font-semibold text-sm ${lang === l.code ? "text-[#0a1a4e]" : "text-gray-600"}`}>
                        {l.label}
                      </span>
                      {lang === l.code && (
                        <span className="ml-auto text-[#20BEC6] font-bold">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Apariencia e Inclusión */}
              <div className="px-4 py-4 border-b border-gray-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 px-1">
                  Apariencia e Inclusión
                </p>

                {/* Modo oscuro */}
                <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-[#20BEC6]/10 flex items-center justify-center text-lg flex-shrink-0">
                    🌙
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">Modo Oscuro</p>
                    <p className="text-xs text-gray-400">Cambia el tema visual</p>
                  </div>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    role="switch"
                    aria-checked={darkMode}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-300 flex-shrink-0 ${darkMode ? "bg-[#20BEC6]" : "bg-gray-200"}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${darkMode ? "translate-x-5" : "translate-x-0"}`}
                    />
                  </button>
                </div>

                {/* Accesibilidad */}
                <button
                  onClick={() => setShowA11y(true)}
                  className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-gray-50 transition-colors w-full mt-1"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#20BEC6]/10 flex items-center justify-center text-lg flex-shrink-0">
                    ♿
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">Accesibilidad</p>
                    <p className="text-xs text-gray-400">Ajustes de inclusión</p>
                  </div>
                  <span className="text-gray-400 text-lg">›</span>
                </button>
              </div>

              {/* Legal */}
              <div className="px-4 py-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 px-1">
                  Legal y Soporte
                </p>
                <Link
                  href="/terminos"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#20BEC6]/10 flex items-center justify-center text-lg flex-shrink-0">
                    📄
                  </div>
                  <span className="font-semibold text-gray-800 text-sm">Términos y Condiciones</span>
                </Link>
              </div>
            </>
          )}

          {/* ── Vista Accesibilidad */}
          {showA11y && (
            <div className="px-4 py-4 flex flex-col gap-3">
              <button onClick={() => setShowA11y(false)}
                className="flex items-center gap-1 text-sm text-[#20BEC6] font-semibold mb-1 hover:underline">
                ‹ Volver
              </button>

              {/* Tamaño de fuente */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="font-bold text-gray-800 text-sm mb-1">Tamaño de texto</p>
                <p className="text-xs text-gray-400 mb-3">Ajusta el tamaño de la letra</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setFontSize((f) => Math.max(80, f - 10))}
                    className="w-9 h-9 rounded-full bg-gray-200 hover:bg-[#20BEC6] hover:text-white font-bold text-lg transition-colors flex items-center justify-center"
                  >
                    A−
                  </button>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#20BEC6] rounded-full transition-all"
                      style={{ width: `${((fontSize - 80) / 60) * 100}%` }}
                    />
                  </div>
                  <button
                    onClick={() => setFontSize((f) => Math.min(140, f + 10))}
                    className="w-9 h-9 rounded-full bg-gray-200 hover:bg-[#20BEC6] hover:text-white font-bold text-lg transition-colors flex items-center justify-center"
                  >
                    A+
                  </button>
                </div>
                <p className="text-center text-xs text-gray-400 mt-2">{fontSize}%</p>
              </div>

              {/* Reducir movimiento */}
              <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-bold text-gray-800 text-sm">Reducir movimiento</p>
                  <p className="text-xs text-gray-400">Desactiva animaciones</p>
                </div>
                <button
                  onClick={() => {
                    document.documentElement.style.setProperty(
                      "--reduce-motion",
                      document.documentElement.style.getPropertyValue("--reduce-motion") === "1" ? "0" : "1"
                    );
                  }}
                  className="relative w-11 h-6 rounded-full bg-gray-200 transition-colors duration-300"
                >
                  <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300" />
                </button>
              </div>

              {/* Contraste alto */}
              <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-bold text-gray-800 text-sm">Alto contraste</p>
                  <p className="text-xs text-gray-400">Mejora la visibilidad</p>
                </div>
                <button
                  onClick={() => document.documentElement.classList.toggle("high-contrast")}
                  className="relative w-11 h-6 rounded-full bg-gray-200 transition-colors duration-300"
                >
                  <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300" />
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      <style>{`
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
