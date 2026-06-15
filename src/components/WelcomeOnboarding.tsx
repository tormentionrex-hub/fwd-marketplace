"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

type Phase = "alert" | "done";

const STORAGE_KEY = "fwd_onboarding_count";
const MAX_SHOWS   = 3;

/* ── Iconos SVG inline ─────────────────────────────── */


const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

/* ── Componente principal ──────────────────────────── */
export default function WelcomeOnboarding() {
  const [phase,   setPhase]   = useState<Phase>("done");
  const [alertIn, setAlertIn] = useState(false);
  const ttsRef = useRef<((e: MouseEvent) => void) | null>(null);

  /* ── Init: comprobar contador ─────────────────── */
  useEffect(() => {
    const isDev = process.env.NODE_ENV === "development";
    const count = parseInt(localStorage.getItem(STORAGE_KEY) ?? "0", 10);
    if (isDev || count < MAX_SHOWS) {
      if (!isDev) localStorage.setItem(STORAGE_KEY, String(count + 1));
      setPhase("alert");
      requestAnimationFrame(() => setTimeout(() => setAlertIn(true), 30));
    }
  }, []);

/* ── TTS preview sobre el modal ──────────────── */
  const speakText = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang  = "es-CR";
    utt.rate  = 0.88;
    utt.pitch = 1;
    window.speechSynthesis.speak(utt);
  }, []);

/* ── Activar lector global ───────────────────── */
  const activateVoice = useCallback(() => {
    const handler = (e: MouseEvent) => {
      const el   = e.target as HTMLElement;
      const text = el.innerText?.trim();
      if (!text || text.length < 2 || text.length > 300) return;
      if (["SCRIPT","STYLE","svg","path","polygon"].includes(el.tagName)) return;
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang  = "es-CR";
      utt.rate  = 0.88;
      window.speechSynthesis.speak(utt);
    };
    ttsRef.current = handler;
    document.addEventListener("mouseover", handler);
    closeModal();
  }, []); // eslint-disable-line

/* ── Cerrar modal ─────────────────────────────── */
  const closeModal = useCallback(() => {
    setAlertIn(false);
    setTimeout(() => setPhase("done"), 350);
  }, []);

  /* ── Cleanup TTS al desmontar ────────────────── */
  useEffect(() => {
    return () => {
      if (ttsRef.current) document.removeEventListener("mouseover", ttsRef.current);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <>
      {/* ══ ALERTA ACCESIBILIDAD ═══════════ */}
      {phase === "alert" && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{
            backdropFilter: "blur(12px)",
            background: "rgba(10,20,50,0.55)",
            transition: "opacity 0.35s ease",
            opacity: alertIn ? 1 : 0,
          }}
        >
          <div
            className="relative w-full max-w-md rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0e1628 0%, #2a1060 60%, #1a0a40 100%)",
              boxShadow: "0 30px 70px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)",
              transform: alertIn ? "scale(1) translateY(0)" : "scale(0.88) translateY(20px)",
              transition: "transform 0.45s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            {/* Barra superior degradada */}
            <div className="h-1 w-full" style={{ background: "linear-gradient(90deg,#20BEC6,#662D91,#ED008C)" }} />

            {/* Brillo radial decorativo */}
            <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at top right, rgba(102,45,145,0.35) 0%, transparent 65%)" }} />

            <div className="relative p-7">

              {/* ── Encabezado ── */}
              <div className="flex items-center gap-4 mb-5">
                <div
                  className="group w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:scale-110 hover:shadow-[0_0_22px_rgba(32,190,198,0.65)] cursor-default"
                  style={{ background: "linear-gradient(135deg, #0e1628, #2a1060)", boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}
                >
                  <Image
                    src="/imagenes/FWD - Sintesis-01.png"
                    alt="FWD"
                    width={36}
                    height={36}
                    className="w-9 h-9 object-contain fwd-spin group-hover:scale-125 transition-transform duration-300"
                  />
                </div>
                <div>
                  <h2
                    className="text-lg font-bold leading-tight cursor-default transition-all duration-300 hover:scale-[1.03] hover:drop-shadow-[0_0_8px_rgba(237,0,140,0.7)] inline-block"
                    style={{ color: "white" }}
                    onMouseEnter={(e) => {
                      const el = e.target as HTMLElement;
                      el.style.backgroundImage = "linear-gradient(90deg,#ED008C,#662D91,#20BEC6)";
                      el.style.backgroundClip = "text";
                      el.style.color = "transparent";
                      speakText(el.innerText);
                    }}
                    onMouseLeave={(e) => {
                      const el = e.target as HTMLElement;
                      el.style.backgroundImage = "none";
                      el.style.backgroundClip = "unset";
                      el.style.color = "white";
                    }}
                  >
                    Lector de voz disponible
                  </h2>
                  <p className="text-xs text-white/40 mt-0.5 transition-all duration-300 hover:text-[#20BEC6] hover:tracking-wide cursor-default">Accesibilidad · FWD Costa Rica</p>
                </div>
              </div>

              {/* ── Descripción ── */}
              <p
                className="text-white/70 text-sm leading-relaxed mb-4 cursor-default transition-all duration-300 hover:text-white hover:translate-x-1 hover:drop-shadow-[0_0_6px_rgba(32,190,198,0.5)]"
                onMouseEnter={(e) => speakText((e.target as HTMLElement).innerText)}
              >
                ¿Necesita que el sitio le lea el contenido en voz alta al pasar el cursor?
                Active esta función para facilitar la navegación.
              </p>

              {/* ── Banner sugerencia ── */}
              <div
                className="flex items-start gap-2 rounded-xl px-4 py-3 mb-6"
                style={{ background: "rgba(32,190,198,0.12)", border: "1px solid rgba(32,190,198,0.3)" }}
                onMouseEnter={(e) => speakText((e.target as HTMLElement).innerText)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="#20BEC6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true">
                  <path d="M12 2a7 7 0 0 1 5 11.9l-.8.8A2 2 0 0 0 15 16v1a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-1a2 2 0 0 0-.7-1.3L7.4 14A7 7 0 0 1 12 2z" />
                  <path d="M9 21h6" />
                </svg>
                <p className="text-xs text-[#20BEC6] leading-relaxed">
                  Pase el cursor sobre cualquier texto de esta ventana para escucharlo
                </p>
              </div>

              {/* ── Botones ── */}
              <div className="flex flex-col gap-3">

                {/* Primario */}
                <button
                  onClick={activateVoice}
                  className="group relative overflow-hidden w-full flex items-center justify-center gap-2 text-white font-black py-4 rounded-xl text-sm tracking-wide transition-all duration-300 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(90deg, #ED008C, #662D91)",
                    boxShadow: "0 6px 25px rgba(237,0,140,0.45)",
                  }}
                  onMouseEnter={(e) => speakText((e.target as HTMLElement).innerText)}
                >
                  <IconCheck />
                  <span className="relative z-10">Activar lector de voz</span>
                  <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-white/25 skew-x-[-20deg] transition-transform duration-700" />
                </button>

                {/* Botón secundario */}
                <button
                  onClick={closeModal}
                  className="w-full bg-white/5 text-white/40 font-medium py-3 rounded-xl border border-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm"
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = "#FFCB05";
                    el.style.color = "#FFCB05";
                    el.style.background = "rgba(255,203,5,0.1)";
                    speakText((e.target as HTMLElement).innerText);
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = "";
                    el.style.color = "";
                    el.style.background = "";
                  }}
                >
                  Continuar sin lector
                </button>

              </div>
            </div>

            {/* Decoración futurista — círculo blur esquina */}
            <div
              className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle,rgba(32,190,198,0.12),transparent 70%)" }}
            />
            <div
              className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle,rgba(102,45,145,0.1),transparent 70%)" }}
            />
          </div>

          {/* Número de vistas restantes */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
            <p className="text-white/30 text-xs">
              Este mensaje aparece {MAX_SHOWS - (parseInt(localStorage.getItem(STORAGE_KEY) ?? "1", 10))} veces más
            </p>
          </div>
        </div>
      )}
    </>
  );
}
