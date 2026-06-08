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
  const [phase, setPhase]               = useState<Phase>("done");
  const [muted, setMuted]               = useState(true);
  const [videoOpacity, setVideoOpacity] = useState(1);
  const [alertIn, setAlertIn]           = useState(false);
  const [videoError, setVideoError]     = useState(false);
  const [progress, setProgress]         = useState(0);
  const videoRef  = useRef<HTMLVideoElement>(null);
  const ttsRef    = useRef<((e: MouseEvent) => void) | null>(null);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Init: comprobar contador ─────────────────── */
  useEffect(() => {
    const count = parseInt(localStorage.getItem(STORAGE_KEY) ?? "0", 10);
    if (count < MAX_SHOWS) {
      localStorage.setItem(STORAGE_KEY, String(count + 1));
      setPhase("video");
      setVideoOpacity(1);
    }
  }, []);

  /* ── Fallback: barra de progreso cuando no hay video ── */
  useEffect(() => {
    if (phase === "video" && videoError) {
      setProgress(0);
      let p = 0;
      timerRef.current = setInterval(() => {
        p += 1;
        setProgress(p);
        if (p >= 100) {
          clearInterval(timerRef.current!);
          handleVideoEnded();
        }
      }, 40); // 4 segundos
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [videoError, phase]); // eslint-disable-line

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
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{ transition: "opacity 0.55s ease", opacity: videoOpacity, background: "#07101f" }}
        >
          {/* Video real — oculto si da error */}
          {!videoError && (
            <video
              ref={videoRef}
              src="/videos/fwd.mp4"
              autoPlay
              muted={muted}
              playsInline
              loop={false}
              onEnded={handleVideoEnded}
              onError={() => setVideoError(true)}
              className="w-full h-full object-cover"
            />
          )}

          {/* ── Pantalla de marca cuando no hay video ── */}
          {videoError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
              style={{ background: "radial-gradient(ellipse at 50% 40%, #1a0a3e 0%, #07101f 70%)" }}>

              {/* Triángulos decorativos animados */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[
                  { t:"8%",  l:"5%",  s:60, c:"#20BEC6", op:0.3, delay:"0s"   },
                  { t:"15%", l:"85%", s:45, c:"#ED008C", op:0.25, delay:"0.5s" },
                  { t:"70%", l:"3%",  s:50, c:"#662D91", op:0.25, delay:"1s"   },
                  { t:"75%", l:"88%", s:55, c:"#FFCB05", op:0.2,  delay:"0.3s" },
                  { t:"45%", l:"92%", s:35, c:"#20BEC6", op:0.2,  delay:"0.8s" },
                  { t:"40%", l:"1%",  s:40, c:"#ED008C", op:0.2,  delay:"1.2s" },
                ].map((t, i) => (
                  <svg key={i} width={t.s} height={t.s * 0.87} viewBox={`0 0 ${t.s} ${t.s * 0.87}`}
                    style={{ position:"absolute", top:t.t, left:t.l, opacity:t.op,
                      animation:`floatTri 5s ease-in-out infinite`, animationDelay:t.delay }}>
                    <polygon points={`0,0 ${t.s},${(t.s*0.87)/2} 0,${t.s*0.87}`} fill={t.c} />
                  </svg>
                ))}
              </div>

              {/* Logo giratorio */}
              <div className="fwd-spin mb-8" style={{ filter:"drop-shadow(0 0 30px #20BEC688)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/imagenes/logo-removebg-preview.png" alt="FWD" width={120} height={120} />
              </div>

              {/* Texto bienvenida */}
              <div className="mb-2">
                <span className="text-[#20BEC6] text-xs font-semibold uppercase tracking-[0.3em]">
                  ▶▶ Plataforma de innovación
                </span>
              </div>
              <h1 className="text-white font-black text-3xl md:text-5xl leading-tight mb-3"
                style={{ fontFamily:"var(--font-figtree), sans-serif" }}>
                Bienvenido a{" "}
                <span style={{ background:"linear-gradient(90deg,#20BEC6,#ED008C)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                  FWD Costa Rica
                </span>
              </h1>
              <p className="text-white/50 text-sm max-w-xs leading-relaxed">
                Conectamos empresarios con talento tecnológico
              </p>

              {/* Barra de progreso */}
              <div className="mt-10 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-none"
                  style={{ width:`${progress}%`, background:"linear-gradient(90deg,#20BEC6,#ED008C)" }} />
              </div>
              <p className="text-white/25 text-xs mt-2">Cargando experiencia…</p>
            </div>
          )}

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
