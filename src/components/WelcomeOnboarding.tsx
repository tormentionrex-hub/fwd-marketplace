"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type Phase = "video" | "alert" | "done";

const STORAGE_KEY = "fwd_onboarding_count";
const MAX_SHOWS   = 3;

/* ── Iconos SVG inline ─────────────────────────────── */
const IconAccessibility = () => (
  <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7" aria-hidden="true">
    <circle cx="12" cy="4" r="2" />
    <path d="M19 9H5a1 1 0 0 0 0 2h4.5l-1.2 7.4a1 1 0 0 0 1.97.32L11.5 13h1l1.23 5.76a1
      1 0 0 0 1.97-.32L14.5 11H19a1 1 0 0 0 0-2Z" />
  </svg>
);

const IconSoundOn = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

const IconSoundOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
);

const IconWave = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M2 12c1.5-3 3-4.5 4.5-4.5S9 9 10.5 9 13.5 6 15 6s3 3 4.5 3S22 9 22 12" />
    <path d="M2 17c1.5-3 3-4.5 4.5-4.5S9 14 10.5 14 13.5 11 15 11s3 3 4.5 3S22 14 22 17" />
  </svg>
);

const IconRepeat = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/* ── Componente principal ──────────────────────────── */
export default function WelcomeOnboarding() {
  const [phase, setPhase]           = useState<Phase>("done");
  const [muted, setMuted]           = useState(true);
  const [videoOpacity, setVideoOpacity] = useState(1);
  const [alertIn, setAlertIn]       = useState(false);
  const videoRef  = useRef<HTMLVideoElement>(null);
  const ttsRef    = useRef<((e: MouseEvent) => void) | null>(null);

  /* ── Init: comprobar contador ─────────────────── */
  useEffect(() => {
    const count = parseInt(localStorage.getItem(STORAGE_KEY) ?? "0", 10);
    if (count < MAX_SHOWS) {
      localStorage.setItem(STORAGE_KEY, String(count + 1));
      setPhase("video");
      setVideoOpacity(1);
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

  /* ── Video terminó → fade-out → alert ────────── */
  const handleVideoEnded = useCallback(() => {
    setVideoOpacity(0);
    setTimeout(() => {
      setPhase("alert");
      requestAnimationFrame(() => setTimeout(() => setAlertIn(true), 30));
    }, 550);
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

  /* ── Repetir video ───────────────────────────── */
  const handleRepeat = useCallback(() => {
    setAlertIn(false);
    setTimeout(() => {
      setPhase("video");
      setVideoOpacity(1);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    }, 350);
  }, []);

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
      {/* ══ FASE 1: VIDEO ══════════════════════════ */}
      {phase === "video" && (
        <div
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
          style={{ transition: "opacity 0.55s ease", opacity: videoOpacity }}
        >
          <video
            ref={videoRef}
            src="/videos/welcome.mp4"
            autoPlay
            muted={muted}
            playsInline
            loop={false}
            onEnded={handleVideoEnded}
            className="w-full h-full object-cover"
          />

          {/* Gradiente inferior */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

          {/* Botón sonido */}
          <button
            onClick={() => {
              const next = !muted;
              setMuted(next);
              if (videoRef.current) videoRef.current.muted = next;
            }}
            className="absolute bottom-8 right-8 w-12 h-12 rounded-full backdrop-blur-md bg-white/15 border border-white/25 flex items-center justify-center text-white hover:bg-white/30 hover:scale-110 transition-all duration-200 shadow-lg"
            aria-label={muted ? "Activar sonido" : "Silenciar"}
          >
            {muted ? <IconSoundOff /> : <IconSoundOn />}
          </button>

          {/* Botón omitir */}
          <button
            onClick={handleVideoEnded}
            className="absolute top-6 right-6 text-white/50 hover:text-white text-sm font-medium transition-colors tracking-wide"
          >
            Omitir →
          </button>

          {/* Badge contador */}
          <div className="absolute top-6 left-6 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/60 text-xs">
            Bienvenida · FWD Costa Rica
          </div>
        </div>
      )}

      {/* ══ FASE 2: ALERTA ACCESIBILIDAD ═══════════ */}
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
            className="relative w-full max-w-md bg-white/96 rounded-3xl shadow-2xl overflow-hidden"
            style={{
              transform: alertIn ? "scale(1) translateY(0)" : "scale(0.88) translateY(20px)",
              transition: "transform 0.45s cubic-bezier(0.34,1.56,0.64,1)",
              boxShadow: "0 25px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1)",
            }}
          >
            {/* Barra superior decorativa */}
            <div className="h-1 w-full" style={{ background: "linear-gradient(90deg,#20BEC6,#008FD4,#662D91)" }} />

            <div className="p-7">

              {/* ── Encabezado ── */}
              <div className="flex items-center gap-4 mb-5">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
                  style={{ background: "linear-gradient(135deg,#20BEC6,#008FD4)" }}
                >
                  <IconAccessibility />
                </div>
                <div>
                  <h2
                    className="text-lg font-bold text-[#1a1a2e] leading-tight"
                    onMouseEnter={(e) => speakText((e.target as HTMLElement).innerText)}
                  >
                    Lector de voz disponible
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">Accesibilidad · FWD Costa Rica</p>
                </div>
              </div>

              {/* ── Descripción ── */}
              <p
                className="text-gray-600 text-sm leading-relaxed mb-4"
                onMouseEnter={(e) => speakText((e.target as HTMLElement).innerText)}
              >
                ¿Necesita que el sitio le lea el contenido en voz alta al pasar el cursor?
                Active esta función para facilitar la navegación.
              </p>

              {/* ── Banner sugerencia ── */}
              <div
                className="flex items-start gap-2 rounded-xl px-4 py-3 mb-6"
                style={{ background: "rgba(32,190,198,0.08)", border: "1px solid rgba(32,190,198,0.25)" }}
                onMouseEnter={(e) => speakText((e.target as HTMLElement).innerText)}
              >
                <span className="text-base flex-shrink-0">💡</span>
                <p className="text-xs text-[#0a7f88] leading-relaxed">
                  Pase el cursor sobre cualquier texto de esta ventana para escucharlo
                </p>
              </div>

              {/* ── Botones ── */}
              <div className="flex flex-col gap-3">

                {/* Primario */}
                <button
                  onClick={activateVoice}
                  className="group relative overflow-hidden w-full flex items-center justify-center gap-2 text-white font-bold py-4 rounded-xl text-sm tracking-wide transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(32,190,198,0.45)] active:scale-[0.98]"
                  style={{ background: "linear-gradient(90deg,#20BEC6,#008FD4)" }}
                  onMouseEnter={(e) => speakText((e.target as HTMLElement).innerText)}
                >
                  <IconCheck />
                  <span className="relative z-10">Activar lector de voz</span>
                  <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-white/20 skew-x-[-20deg] transition-transform duration-700" />
                </button>

                {/* Fila secundaria */}
                <div className="flex gap-3">
                  <button
                    onClick={handleRepeat}
                    className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-600 font-semibold py-3 rounded-xl text-sm hover:border-[#20BEC6] hover:text-[#20BEC6] transition-all duration-200"
                    onMouseEnter={(e) => speakText((e.target as HTMLElement).innerText)}
                  >
                    <IconRepeat />
                    Repetir
                  </button>
                  <button
                    onClick={closeModal}
                    className="flex-1 text-gray-400 font-medium py-3 rounded-xl border border-gray-100 hover:border-gray-300 hover:text-gray-600 transition-all duration-200 text-sm"
                    onMouseEnter={(e) => speakText((e.target as HTMLElement).innerText)}
                  >
                    Continuar sin lector
                  </button>
                </div>

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
