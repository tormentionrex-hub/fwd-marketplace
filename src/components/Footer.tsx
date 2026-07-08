"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useState } from "react";
import DonacionModal from "@/components/DonacionModal";
import ParticleBackground from "@/components/ParticleBackground";

type EstadoEnvio = "idle" | "enviando" | "ok" | "error";

export default function Footer() {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [estado, setEstado] = useState<EstadoEnvio>("idle");
  const [aviso, setAviso] = useState("");
  const [donacionAbierta, setDonacionAbierta] = useState(false);

  async function enviarMensaje() {
    if (estado === "enviando") return;
    setAviso("");

    const correo = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) {
      setEstado("error");
      setAviso("Ingresá un correo electrónico válido.");
      return;
    }
    if (!mensaje.trim()) {
      setEstado("error");
      setAviso("Escribí un mensaje antes de enviar.");
      return;
    }

    setEstado("enviando");
    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: correo, mensaje: mensaje.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setEstado("error");
        setAviso(data?.error || "No se pudo enviar el mensaje. Intentá más tarde.");
        return;
      }
      setEstado("ok");
      setAviso("¡Mensaje enviado! Te responderemos pronto.");
      setEmail("");
      setMensaje("");
    } catch {
      setEstado("error");
      setAviso("No se pudo enviar el mensaje. Revisá tu conexión.");
    }
  }

  return (
    <>
    <footer
      className="text-white relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0e1628 0%, #2a1060 55%, #7b1fa2 85%, #ED008C 100%)" }}
    >
      <ParticleBackground />

      {/* Ola animada superior */}
      <div className="footer-wave-wrap relative w-full overflow-hidden" style={{ height: "70px" }}>
        <svg
          className="footer-wave absolute bottom-0"
          style={{ width: "200%", height: "100%" }}
          viewBox="0 0 2880 70"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#20BEC6" />
              <stop offset="35%"  stopColor="#662D91" />
              <stop offset="70%"  stopColor="#ED008C" />
              <stop offset="100%" stopColor="#20BEC6" />
            </linearGradient>
          </defs>
          <path
            d="M0,40 C360,0 720,70 1080,35 C1440,0 1800,70 2160,35 C2520,0 2880,70 2880,35 L2880,70 L0,70 Z"
            fill="url(#waveGrad1)"
            opacity="0.7"
          />
        </svg>
        <svg
          className="footer-wave-2 absolute bottom-0"
          style={{ width: "200%", height: "100%" }}
          viewBox="0 0 2880 70"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,50 C480,10 960,70 1440,40 C1920,10 2400,65 2880,40 L2880,70 L0,70 Z"
            fill="#20BEC6"
            opacity="0.3"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* ── Columna 1: Marca + Legal */}
          <div className="flex flex-col gap-3">
            <div>
              <Image
                src="/imagenes/fwd-marketplace.png"
                alt="FWD Marketplace"
                width={1412}
                height={1114}
                className="h-28 w-auto object-contain"
              />
              <p className="text-white/60 text-xs mt-2 leading-relaxed">
                Conectamos empresarios con talento tecnológico para una mejor comunidad.
              </p>
            </div>

            <div>
              <p className="font-black text-xs uppercase tracking-widest text-[#20BEC6] mb-2">Legal</p>
              <Link href="/terminos" className="group flex items-center gap-1 text-white/60 text-sm hover:text-[#20BEC6] transition-all duration-200 hover:translate-x-1 block">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">›</span>
                Términos y Condiciones
              </Link>
              <Link href="/privacidad" className="group flex items-center gap-1 text-white/60 text-sm hover:text-[#20BEC6] transition-all duration-200 hover:translate-x-1 block mt-2">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">›</span>
                Política de Privacidad
              </Link>

              <button
                onClick={() => setDonacionAbierta(true)}
                className="group mt-3 flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-white transition-all duration-300 hover:scale-105 active:scale-95 hover:brightness-110"
                style={{ background: "linear-gradient(135deg, #ED008C, #662D91)", boxShadow: "0 3px 14px rgba(237,0,140,0.4)" }}
              >
                <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                Donación
              </button>
            </div>

            <p className="text-xs text-white/30 mt-auto">
              © {year} FWD Costa Rica.
            </p>
          </div>

          {/* ── Columna 2: Redes Sociales */}
          <div>
            <p className="font-black text-xs uppercase tracking-widest text-[#20BEC6] mb-3">Redes Sociales</p>
            <ul className="flex flex-col gap-2">
              <li>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-white/60 hover:text-white hover:translate-x-1 transition-all duration-200 group"
                >
                  <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#1877F2] transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </span>
                  <span className="font-semibold">Facebook</span>
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-white/60 hover:text-white hover:translate-x-1 transition-all duration-200 group"
                >
                  <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#E1306C] transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                    </svg>
                  </span>
                  <span className="font-semibold">Instagram</span>
                </a>
              </li>
              <li>
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-white/60 hover:text-white hover:translate-x-1 transition-all duration-200 group"
                >
                  <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-black transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </span>
                  <span className="font-semibold">X (Twitter)</span>
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/50672025228"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-white/60 hover:text-white hover:translate-x-1 transition-all duration-200 group"
                >
                  <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#25D366] transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                    </svg>
                  </span>
                  <span className="font-semibold">WhatsApp</span>
                </a>
              </li>
            </ul>
          </div>

          {/* ── Columna 3: Hablemos */}
          <div>
            <p className="font-black text-xs uppercase tracking-widest text-[#20BEC6] mb-3">Hablemos</p>

            <div className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#20BEC6] transition-colors"
              />
              <textarea
                placeholder="¿Cómo quieres ayudar?"
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                rows={3}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#20BEC6] transition-colors resize-none"
              />
              <button
                type="button"
                onClick={enviarMensaje}
                disabled={estado === "enviando"}
                className="w-full text-center font-black text-sm uppercase tracking-widest py-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ background: "linear-gradient(90deg, #20BEC6, #008FD5)" }}
              >
                {estado === "enviando" ? "Enviando…" : "Enviar Mensaje"}
              </button>

              {aviso && (
                <p
                  role="status"
                  className={`text-xs ${estado === "ok" ? "text-[#20BEC6]" : "text-pink-300"}`}
                >
                  {aviso}
                </p>
              )}

              <div className="mt-2 flex flex-col gap-2">
                <a href="mailto:contacto@fwdcostarica.com" className="flex items-center gap-2 text-white/60 hover:text-[#20BEC6] hover:translate-x-1 text-sm transition-all duration-200">
                  <svg className="w-4 h-4 text-[#20BEC6] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  contacto@fwdcostarica.com
                </a>
                <a href="tel:+50672025228" className="flex items-center gap-2 text-white/60 hover:text-[#20BEC6] hover:translate-x-1 text-sm transition-all duration-200">
                  <svg className="w-4 h-4 text-[#20BEC6] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  +506 7202 5228
                </a>
              </div>
            </div>
          </div>

          {/* ── Columna 4: Ubicación */}
          <div>
            <p className="font-black text-xs uppercase tracking-widest text-[#20BEC6] mb-3">Ubicación</p>
            <a
              href="https://maps.google.com/?q=San+Jose+Costa+Rica"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block rounded-2xl overflow-hidden cursor-pointer"
            >
              <Image
                src="/imagenes/imagen-maps.jpg"
                alt="San José, Costa Rica"
                width={400}
                height={300}
                className="w-full h-32 object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all duration-500" />
              <span className="absolute bottom-1/2 translate-y-1/2 left-1/2 -translate-x-1/2 bg-[#20BEC6] text-white text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-xl whitespace-nowrap shadow-lg">
                Abrir Google Maps
              </span>
            </a>
            <p className="text-white/60 text-sm mt-4 leading-relaxed">
              San José, Costa Rica
            </p>
          </div>

        </div>
      </div>
    </footer>

      {donacionAbierta && (
        <DonacionModal onClose={() => setDonacionAbierta(false)} />
      )}
    </>
  );
}
