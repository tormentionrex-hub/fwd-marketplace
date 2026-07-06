"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ChevronRight, Info, X, Clock, Shield } from "lucide-react";
import { Link } from "@/i18n/navigation";

gsap.registerPlugin(useGSAP);

const CORREO = "contacto@fwdcostarica.com";

export function SolicitarAccesoCliente() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [canalOpen, setCanalOpen] = useState(false);
  const [correoSolicitud, setCorreoSolicitud] = useState("");
  const [emailEnviado, setEmailEnviado] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const correoTexto = correoSolicitud.trim() || "(coloca tu correo aquí)";
  const whatsappUrl = `https://wa.me/50672025228?text=${encodeURIComponent(`Hola, envié mi solicitud de invitación para unirme al FWD Marketplace. Mi correo es ${correoTexto}.`)}`;
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${CORREO}&su=${encodeURIComponent("Solicitud de invitación a FWD Marketplace")}&body=${encodeURIComponent(`Hola equipo FWD,\n\nEnvié mi solicitud de invitación para unirme al Marketplace. Quedo atento a la aprobación.\n\nMi correo es: ${correoSolicitud.trim()}`)}`;

  useEffect(() => {
    const saved = localStorage.getItem("solicitud_acceso_enviada_email");
    if (saved) {
      setEmailEnviado(saved);
    }
  }, []);

  async function handleEnviarSolicitud() {
    const email = correoSolicitud.trim();
    if (!email) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/solicitar-acceso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Ocurrió un error al enviar la solicitud.");
        return;
      }

      localStorage.setItem("solicitud_acceso_enviada_email", email);
      setEmailEnviado(email);
    } catch {
      setErrorMsg("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [modalOpen]);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        ".js-header",
        { autoAlpha: 0, y: -20 },
        { autoAlpha: 1, y: 0, duration: 0.65 },
      ).fromTo(
        ".js-card",
        { autoAlpha: 0, y: 44, scale: 0.97 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.75 },
        "-=0.25",
      );
    },
    { scope: containerRef },
  );

  return (
    <>
    <style>{`
      .modal-info-scroll::-webkit-scrollbar { width: 5px; }
      .modal-info-scroll::-webkit-scrollbar-track { background: transparent; }
      .modal-info-scroll::-webkit-scrollbar-thumb { background: rgba(109,40,217,0.7); border-radius: 4px; }
      .modal-info-scroll::-webkit-scrollbar-thumb:hover { background: rgba(109,40,217,0.9); }
    `}</style>
    <div
      ref={containerRef}
      className="relative flex min-h-screen flex-col overflow-hidden"
      style={{
        backgroundImage: "url('/imagenes/background-fordy.png')",
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* ── Header ── */}
      <header
        className="js-header relative z-20 border-b overflow-visible"
        style={{ borderColor: "rgba(255,255,255,0.12)", height: "90px" }}
      >
        <div className="flex w-full items-center justify-between px-2" style={{ height: "90px" }}>
          <div className="flex items-center gap-4">
            <img src="/imagenes/logo-azul.png" alt="FWD Costa Rica" className="h-48 w-auto" style={{ marginTop: "1px", transform: "translateX(18px)" }} />
            <div className="flex items-center gap-4">
              <div className="h-8 w-px bg-white/20" />
              <div className="flex flex-col gap-1.5">
                <span className="font-body text-[9px] font-bold uppercase tracking-[0.25em] text-white/30">
                  Las herramientas del futuro
                </span>
                <div className="flex items-center gap-3.5">
                  {/* GitHub */}
                  <svg viewBox="0 0 24 24" className="h-5 w-5 opacity-70" fill="white" aria-label="GitHub">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                  {/* HTML5 */}
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-label="HTML5">
                    <path fill="#E34F26" d="M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z"/>
                  </svg>
                  {/* React */}
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-label="React">
                    <circle cx="12" cy="12" r="1.8" fill="#61DAFB"/>
                    <ellipse cx="12" cy="12" rx="10" ry="3.8" stroke="#61DAFB" strokeWidth="1.1" fill="none"/>
                    <ellipse cx="12" cy="12" rx="10" ry="3.8" stroke="#61DAFB" strokeWidth="1.1" fill="none" transform="rotate(60 12 12)"/>
                    <ellipse cx="12" cy="12" rx="10" ry="3.8" stroke="#61DAFB" strokeWidth="1.1" fill="none" transform="rotate(120 12 12)"/>
                  </svg>
                  {/* JavaScript */}
                  <img src="/imagenes/js.png" alt="JavaScript" className="h-5 w-5 rounded-sm object-cover" />
                  {/* Claude */}
                  <img src="/imagenes/claude-color.svg" alt="Claude" className="h-5 w-5 object-contain" />
                </div>
              </div>
            </div>
          </div>
          <Link
            href="/login"
            className="text-sm font-semibold text-white/60 transition-colors hover:text-white"
          >
            ← Volver al inicio de sesión
          </Link>
        </div>
      </header>

      {/* ── Burbuja "más info" ── */}
      <button
        onClick={() => setModalOpen(true)}
        className="js-bubble absolute z-20 flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/25"
        style={{ animation: "bounce-x 2s ease-in-out infinite", top: "20px", left: "46%" }}
      >
        <Info className="h-4 w-4 shrink-0 text-fwd-teal" />
        <span>¿Necesitas más info? Pulsa aquí</span>
        <div
          className="absolute -right-2 top-1/2 -translate-y-1/2"
          style={{
            width: 0,
            height: 0,
            borderTop: "6px solid transparent",
            borderBottom: "6px solid transparent",
            borderLeft: "8px solid rgba(255,255,255,0.25)",
          }}
        />
      </button>

      {/* ── Modal de información ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />

          {/* Modal */}
          <div
            className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            style={{
              backgroundImage: "url('/imagenes/modal-fordy.png')",
              backgroundSize: "cover",
              backgroundPosition: "center top",
            }}
          >
            {/* Capa semitransparente para legibilidad sobre fondo claro */}
            <div className="absolute inset-0 bg-fwd-purple/88" />

            <div
              className="modal-info-scroll relative z-10 px-6 py-7 text-white overflow-y-auto flex-1 min-h-0"
              style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(109,40,217,0.7) transparent", overscrollBehavior: "contain" }}
            >
              {/* Botón cerrar */}
              <button
                onClick={() => setModalOpen(false)}
                className="absolute right-4 top-4 rounded-full p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Encabezado */}
              <p className="font-heading text-[11px] font-bold uppercase tracking-[0.28em] text-fwd-teal">
                Acceso por invitación
              </p>
              <h2 className="mt-2 font-heading text-2xl font-black leading-snug">
                ¿Cómo funciona el proceso?
              </h2>

              {/* Sección principal */}
              <div className="mt-4 space-y-3 font-body text-sm font-semibold leading-relaxed text-white drop-shadow-sm">
                <p>
                  Un administrador de FWD Marketplace revisará tu solicitud y,
                  una vez aprobada, recibirás acceso a la plataforma. Este proceso
                  existe para garantizar que solo estudiantes activos o graduados
                  de Forward Costa Rica puedan ingresar.
                </p>
                <p>
                  Si querés agilizar tu ingreso, podés comunicarte directamente
                  con alguno de los profesores o coordinadores correspondientes
                  e indicarles que ya enviaste tu solicitud y que estás esperando
                  ser aceptado.
                </p>
              </div>

              {/* Canales de contacto */}
              <div className="mt-4 rounded-xl border border-white/20 bg-white/10 p-3">
                <p className="mb-3 font-heading text-xs font-bold uppercase tracking-widest text-white/60">
                  Podés contactar por
                </p>
                <div className="flex flex-wrap gap-3">
                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/50672025228?text=${encodeURIComponent("Hola, envié mi solicitud de invitación para unirme al FWD Marketplace. Mi correo es (coloca tu correo aquí).")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-[#25D366]/20"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="#25D366">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </a>
                  {/* Gmail */}
                  <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${CORREO}&su=${encodeURIComponent("Solicitud de invitación a FWD Marketplace")}&body=${encodeURIComponent("Hola equipo FWD,\n\nEnvié mi solicitud de invitación para unirme al Marketplace. Quedo atento a la aprobación.\n\nMi correo es: ")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-[#EA4335]/20"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
                      <path fill="#EA4335" d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.548l8.073-6.055C21.69 2.28 24 3.434 24 5.457z"/>
                      <path fill="#4285F4" d="M24 5.457v1.818l-5.455 4.09V21h3.819A1.636 1.636 0 0024 19.366V5.457z"/>
                      <path fill="#34A853" d="M0 5.457v13.909c0 .904.732 1.636 1.636 1.636h3.819V11.365L0 7.275V5.457z"/>
                      <path fill="#FBBC05" d="M0 7.275l5.455 4.09V11.73L0 7.275z"/>
                      <path fill="#EA4335" d="M24 7.275l-5.455 4.09V11.73L24 7.275z"/>
                    </svg>
                    Gmail
                  </a>
                  {/* Slack */}
                  <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
                      <path fill="#E01E5A" d="M5.042 15.165a2.528 2.528 0 01-2.52 2.523A2.528 2.528 0 010 15.165a2.527 2.527 0 012.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 012.521-2.52 2.527 2.527 0 012.521 2.52v6.313A2.528 2.528 0 018.834 24a2.528 2.528 0 01-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 01-2.521-2.52A2.528 2.528 0 018.834 0a2.528 2.528 0 012.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 012.521 2.521 2.528 2.528 0 01-2.521 2.521H2.522A2.528 2.528 0 010 8.834a2.528 2.528 0 012.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 012.522-2.521A2.528 2.528 0 0124 8.834a2.528 2.528 0 01-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 01-2.523 2.521 2.527 2.527 0 01-2.52-2.521V2.522A2.527 2.527 0 0115.165 0a2.528 2.528 0 012.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 012.523 2.522A2.528 2.528 0 0115.165 24a2.527 2.527 0 01-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 01-2.52-2.523 2.526 2.526 0 012.52-2.52h6.313A2.527 2.527 0 0124 15.165a2.528 2.528 0 01-2.522 2.523h-6.313z"/>
                    </svg>
                    Slack
                  </div>
                </div>
              </div>

              {/* Tiempo de espera */}
              <div className="mt-3 flex items-start gap-3 rounded-xl border border-fwd-teal/30 bg-fwd-teal/10 p-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-fwd-teal" />
                <p className="font-body text-sm font-semibold leading-relaxed text-white drop-shadow-sm">
                  El tiempo de aprobación es normalmente de{" "}
                  <span className="font-black text-fwd-teal">24 a 48 horas</span>.
                  Te pedimos paciencia y te agradecemos mucho tu espera.
                </p>
              </div>

              {/* Nota de seguridad */}
              <div className="mt-3 flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
                <p className="font-body text-xs font-semibold leading-relaxed text-white/90 drop-shadow-sm">
                  Este método de invitación existe para asegurar que únicamente
                  personas vinculadas a Forward Costa Rica — ya sea como
                  estudiantes activos o graduados — puedan acceder a la
                  plataforma.
                </p>
              </div>

              {/* Botón cerrar */}
              <button
                onClick={() => setModalOpen(false)}
                className="mt-5 w-full rounded-full py-2 font-heading text-sm font-bold text-white/70 transition-colors hover:bg-white/10 hover:text-white border border-white/20"
              >
                Entendido, cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal selector de canal ── */}
      {canalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setCanalOpen(false)}
          />
          <div
            className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl"
            style={{ animation: "slide-down 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both" }}
          >
            <div className="px-8 py-8">
              <button
                onClick={() => setCanalOpen(false)}
                className="absolute right-4 top-4 rounded-full p-1 text-fwd-ink/30 transition-colors hover:bg-fwd-ink/5 hover:text-fwd-ink"
              >
                <X className="h-5 w-5" />
              </button>

              <p className="font-heading text-[11px] font-bold uppercase tracking-[0.28em] text-fwd-teal">
                Contacto
              </p>
              <h2 className="mt-2 font-heading text-xl font-black leading-snug text-fwd-ink">
                ¿Por dónde deseas escribirnos?
              </h2>
              <p className="mt-1.5 font-body text-xs text-fwd-ink/50">
                Elegí la plataforma que prefieras y te redirigimos.
              </p>

              <div className="mt-6 flex gap-3">
                {/* Gmail — izquierda */}
                <a
                  href={gmailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 flex-col items-center gap-2 rounded-xl border border-[#EA4335]/25 bg-[#EA4335]/5 px-4 py-5 font-heading font-bold text-fwd-ink transition-all hover:bg-[#EA4335]/12 hover:scale-[1.03] active:scale-[0.98]"
                >
                  <svg viewBox="0 0 24 24" className="h-8 w-8 shrink-0">
                    <path fill="#EA4335" d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.548l8.073-6.055C21.69 2.28 24 3.434 24 5.457z"/>
                    <path fill="#4285F4" d="M24 5.457v1.818l-5.455 4.09V21h3.819A1.636 1.636 0 0024 19.366V5.457z"/>
                    <path fill="#34A853" d="M0 5.457v13.909c0 .904.732 1.636 1.636 1.636h3.819V11.365L0 7.275V5.457z"/>
                    <path fill="#FBBC05" d="M0 7.275l5.455 4.09V11.73L0 7.275z"/>
                    <path fill="#EA4335" d="M24 7.275l-5.455 4.09V11.73L24 7.275z"/>
                  </svg>
                  <span className="text-sm">Gmail</span>
                </a>

                {/* WhatsApp — derecha */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 flex-col items-center gap-2 rounded-xl border border-[#25D366]/25 bg-[#25D366]/5 px-4 py-5 font-heading font-bold text-fwd-ink transition-all hover:bg-[#25D366]/12 hover:scale-[1.03] active:scale-[0.98]"
                >
                  <svg viewBox="0 0 24 24" className="h-8 w-8 shrink-0" fill="#25D366">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span className="text-sm">WhatsApp</span>
                </a>
              </div>

              <button
                onClick={() => setCanalOpen(false)}
                className="mt-5 w-full rounded-full py-2 font-heading text-xs font-semibold text-fwd-ink/40 transition-colors hover:text-fwd-ink/70"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Card central ── */}
      <main className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-5 pb-32 pt-8">
        <div
          className="js-card w-full rounded-2xl bg-white px-9 py-11 text-center"
          style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.28)" }}
        >
          {emailEnviado ? (
            <div className="flex flex-col items-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-fwd-blue/10 text-fwd-blue mb-5">
                <Clock className="h-8 w-8 animate-pulse" />
              </div>
              <p className="font-heading text-[11px] font-bold uppercase tracking-[0.28em] text-fwd-blue">
                Solicitud en espera
              </p>
              <h1 className="mt-3 font-heading text-2xl font-black leading-snug text-fwd-ink sm:text-3xl">
                Tu solicitud está en revisión
              </h1>
              <p className="mt-4 font-body text-sm leading-relaxed text-fwd-ink/60">
                Hemos registrado tu solicitud para el correo:
              </p>
              <p className="mt-1 font-body text-sm font-bold text-fwd-ink break-all">
                {emailEnviado}
              </p>
              <p className="mt-4 font-body text-sm leading-relaxed text-fwd-ink/60">
                El equipo de FWD Costa Rica revisará tu caso en un plazo máximo de <span className="font-bold text-fwd-blue">24 horas</span>.
              </p>
              <p className="mt-2 font-body text-xs text-fwd-ink/40">
                Recibirás un correo electrónico de confirmación con los pasos a seguir una vez aprobada.
              </p>
              <div className="mt-7 w-full border-t border-fwd-ink/10 pt-6">
                <button
                  onClick={() => {
                    localStorage.removeItem("solicitud_acceso_enviada_email");
                    setEmailEnviado(null);
                    setCorreoSolicitud("");
                    setErrorMsg(null);
                  }}
                  className="inline-flex w-full h-11 items-center justify-center gap-2 rounded-full border border-fwd-ink/15 font-heading font-bold text-fwd-ink/65 transition-all hover:scale-[1.02] hover:border-fwd-ink/30 hover:text-fwd-ink active:scale-[0.98]"
                >
                  Volver a solicitar
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="font-heading text-[11px] font-bold uppercase tracking-[0.28em] text-fwd-blue">
                Acceso por invitación
              </p>
              <h1 className="mt-3 font-heading text-2xl font-black leading-snug text-fwd-ink sm:text-3xl">
                Solicitá una invitación
              </h1>
              <p className="mt-4 font-body text-sm leading-relaxed text-fwd-ink/60">
                FWD Marketplace es una comunidad por invitación: el ingreso de
                estudiantes es aprobado por el equipo de FWD · Costa Rica. Si
                todavía no recibiste tu invitación, escribinos y con gusto revisamos
                tu solicitud.
              </p>

              {errorMsg && (
                <div role="alert" className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-xs text-red-600 font-semibold">
                  {errorMsg}
                </div>
              )}

              <div className="mt-6 text-left">
                <label htmlFor="correo-solicitud" className="block font-heading text-[11px] font-bold uppercase tracking-[0.2em] text-fwd-ink/50 mb-2">
                  Tu correo electrónico
                </label>
                <input
                  id="correo-solicitud"
                  type="text"
                  value={correoSolicitud}
                  onChange={(e) => setCorreoSolicitud(e.target.value)}
                  maxLength={254}
                  placeholder="tucorreo@fwd.cr"
                  className="w-full rounded-xl border border-fwd-ink/15 bg-fwd-ink/[0.03] px-4 py-3 font-body text-sm text-fwd-ink placeholder:text-fwd-ink/30 focus:border-fwd-blue/50 focus:outline-none focus:ring-2 focus:ring-fwd-blue/15 transition-all"
                />
                <p className="mt-1.5 text-right font-body text-[11px] text-fwd-ink/30">
                  {correoSolicitud.length}/254
                </p>
              </div>

              <button
                onClick={handleEnviarSolicitud}
                disabled={correoSolicitud.trim().length === 0 || loading}
                className="mt-2 inline-flex w-full h-11 items-center justify-center gap-2 rounded-full font-heading font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ backgroundColor: "#1a1633" }}
              >
                {loading ? "Registrando..." : "Enviar solicitud de invitación"}
              </button>

              <div className="mt-5 border-t border-fwd-ink/10 pt-5">
                <p className="font-heading text-[11px] font-bold uppercase tracking-[0.2em] text-fwd-ink/35 mb-3">
                  O contactanos directamente
                </p>
              </div>

              <button
                onClick={() => setCanalOpen(true)}
                className="inline-flex w-full h-11 items-center justify-center gap-2 rounded-full border border-fwd-ink/15 font-heading font-bold text-fwd-ink/70 transition-all hover:scale-[1.02] hover:border-fwd-ink/30 hover:text-fwd-ink active:scale-[0.98]"
              >
                Escribir al equipo FWD
                <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
              </button>
              <p className="mt-3 font-body text-xs text-fwd-ink/45">
                O escribinos directamente a{" "}
                <a
                  href={`mailto:${CORREO}`}
                  className="font-semibold text-fwd-blue transition-colors hover:text-fwd-purple"
                >
                  {CORREO}
                </a>
                .
              </p>
              <div className="mt-7 border-t border-fwd-ink/10 pt-5">
                <Link
                  href="/register-estudiante"
                  className="font-body text-sm font-semibold text-fwd-blue transition-colors hover:text-fwd-purple"
                >
                  ¿Ya tenés invitación? Registrate →
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
    </>
  );
}
