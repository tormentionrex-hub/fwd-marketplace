"use client";

import { useState } from "react";
import { IconCheck, IconMail, IconX } from "@/components/ui/icons";

interface ContactarEstudianteButtonProps {
  idEstudiante: string;
  nombreEstudiante: string;
  /** Proyecto relacionado (opcional), si se contacta desde un proyecto. */
  idProyecto?: string | null;
}

type Estado = "idle" | "enviando" | "enviada" | "error";

export default function ContactarEstudianteButton({
  idEstudiante,
  nombreEstudiante,
  idProyecto = null,
}: ContactarEstudianteButtonProps) {
  const [abierto, setAbierto] = useState(false);
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [estado, setEstado] = useState<Estado>("idle");
  const [error, setError] = useState("");

  const puedeEnviar = asunto.trim().length > 0 && mensaje.trim().length > 0;

  function cerrar() {
    setAbierto(false);
    setEstado("idle");
    setError("");
    setAsunto("");
    setMensaje("");
  }

  async function enviar() {
    if (!puedeEnviar) return;
    setEstado("enviando");
    setError("");
    try {
      const res = await fetch("/api/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idEstudiante, asunto, mensaje, idProyecto }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "No se pudo enviar la solicitud.");
        setEstado("error");
        return;
      }
      setEstado("enviada");
    } catch {
      setError("Error de red. Intentá de nuevo.");
      setEstado("error");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="inline-flex items-center gap-2 rounded-full bg-fwd-azul px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-fwd-azul/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-fwd-morado"
      >
        <IconMail width={16} height={16} />
        Contactar estudiante
      </button>

      {abierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={cerrar}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-3xl bg-surface shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border bg-gradient-fwd-soft px-6 py-4">
              <h2 className="font-display text-lg font-bold text-white">
                Contactar a {nombreEstudiante}
              </h2>
              <button
                type="button"
                onClick={cerrar}
                aria-label="Cerrar"
                className="grid h-8 w-8 place-items-center rounded-full text-white/90 transition-colors hover:bg-white/20"
              >
                <IconX width={18} height={18} />
              </button>
            </div>

            {estado === "enviada" ? (
              <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <IconCheck width={28} height={28} />
                </span>
                <h3 className="font-display text-lg font-bold text-text">Solicitud enviada</h3>
                <p className="max-w-sm text-sm text-text-muted">
                  {nombreEstudiante} recibirá una notificación. Cuando acepte, podrán chatear.
                </p>
                <button
                  type="button"
                  onClick={cerrar}
                  className="mt-2 rounded-full bg-fwd-azul px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-fwd-morado"
                >
                  Entendido
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4 px-6 py-5">
                <label className="flex flex-col gap-1.5 text-sm font-medium text-text">
                  Asunto
                  <input
                    type="text"
                    value={asunto}
                    onChange={(e) => setAsunto(e.target.value)}
                    maxLength={200}
                    placeholder="Ej: Oportunidad de colaboración"
                    className="h-11 rounded-xl border border-border bg-surface px-3.5 text-sm text-text outline-none transition-colors placeholder:text-text-muted/60 focus:border-fwd-azul focus:ring-4 focus:ring-fwd-azul/10"
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-sm font-medium text-text">
                  Mensaje inicial
                  <textarea
                    rows={4}
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    placeholder="Contale por qué te gustaría contactarlo/a…"
                    className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-text-muted/60 focus:border-fwd-azul focus:ring-4 focus:ring-fwd-azul/10"
                  />
                </label>

                {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}

                <div className="mt-1 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={cerrar}
                    className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-text-muted transition-colors hover:text-text"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={enviar}
                    disabled={!puedeEnviar || estado === "enviando"}
                    className="inline-flex items-center gap-2 rounded-full bg-fwd-azul px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-fwd-morado disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {estado === "enviando" ? "Enviando…" : "Enviar solicitud"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
