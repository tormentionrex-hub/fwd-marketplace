"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FwdIsotipo } from "@/components/ui/fwd-logo";

type Phase = "video" | "alert" | "done";

const STORAGE_KEY = "fwd_onboarding_count";
const MAX_SHOWS   = 3;

/* ── Iconos SVG inline ─────────────────────────────── */

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
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

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
    // Antes el modal se forzaba SIEMPRE en desarrollo (overlay con backdrop-blur a
    // pantalla completa en cada carga). Ahora dev respeta el mismo contador que
    // produccion: aparece como maximo MAX_SHOWS veces. Para volver a verlo en dev,
    // borrar la clave `fwd_onboarding_count` de localStorage.
    const count = parseInt(localStorage.getItem(STORAGE_KEY) ?? "0", 10);
    if (count < MAX_SHOWS) {
      localStorage.setItem(STORAGE_KEY, String(count + 1));
      setPhase("alert");
      requestAnimationFrame(() => setTimeout(() => setAlertIn(true), 30));
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
          {/* Video real en ventana centrada */}
          {!videoError && (
            <div className="relative w-full max-w-3xl mx-6 rounded-2xl overflow-hidden shadow-2xl"
              style={{ boxShadow: "0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)" }}>
              <video
                ref={videoRef}
                src="/videos/fwd.mp4"
                autoPlay
                muted={muted}
                playsInline
                loop={false}
                onEnded={handleVideoEnded}
                onError={() => setVideoError(true)}
                className="w-full h-auto block"
                style={{ maxHeight: "75vh", objectFit: "contain" }}
              />
            </div>
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
                  <FwdIsotipo className="w-9 h-9 fwd-spin group-hover:scale-125 transition-transform duration-300" />
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

                {/* Fila secundaria */}
                <div className="flex gap-3">
                  <button
                    onClick={handleRepeat}
                    className="flex-1 flex items-center justify-center gap-2 border border-[#ED008C]/40 bg-[#ED008C]/10 text-[#ED008C] font-semibold py-3 rounded-xl text-sm hover:bg-[#ED008C]/20 hover:border-[#ED008C] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                    onMouseEnter={(e) => speakText((e.target as HTMLElement).innerText)}
                  >
                    <IconRepeat />
                    Repetir
                  </button>
                  <button
                    onClick={closeModal}
                    className="flex-1 bg-white/5 text-white/40 font-medium py-3 rounded-xl border border-white/10 hover:border-[#ED008C]/40 hover:text-[#ED008C]/80 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm"
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
