"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconBriefcase, IconCheck, IconX } from "@/components/ui/icons";
import { ESTADO_POSTULACION_META, type EstadoPostulacion } from "@/types/vacante";

type Fase =
  | { tipo: "loading" }
  | { tipo: "sin_sesion" }
  | { tipo: "con_postulacion"; estado: EstadoPostulacion; fecha?: string | undefined }
  | { tipo: "sin_postulacion" }
  | { tipo: "error"; mensaje: string };

interface Props {
  locale: string;
  vacanteId: string;
  /** La vacante ya no está abierta (cerrada / en contratación / vencida). */
  bloqueada: boolean;
  color: string;
}

export default function PostularPanel({ locale, vacanteId, bloqueada, color }: Props) {
  const router = useRouter();
  const [fase, setFase] = useState<Fase>({ tipo: "loading" });
  const [intento, setIntento] = useState(0);
  const [modalAbierto, setModalAbierto] = useState(false);

  useEffect(() => {
    if (bloqueada) return;
    let cancelado = false;
    setFase({ tipo: "loading" });

    (async () => {
      try {
        const res = await fetch(`/api/postulaciones/vacante/${vacanteId}/estado`, { cache: "no-store" });
        if (cancelado) return;
        if (res.status === 401) { setFase({ tipo: "sin_sesion" }); return; }
        if (!res.ok) { setFase({ tipo: "error", mensaje: "No pudimos cargar el estado de tu postulación." }); return; }

        const data: { existe: boolean; estado: EstadoPostulacion | null; fecha: string | null } = await res.json();
        if (cancelado) return;

        if (data.existe && data.estado) {
          const fecha = data.fecha
            ? new Date(data.fecha).toLocaleDateString("es-CR", { day: "numeric", month: "short", year: "numeric" })
            : undefined;
          setFase({ tipo: "con_postulacion", estado: data.estado, fecha });
        } else {
          setFase({ tipo: "sin_postulacion" });
        }
      } catch {
        if (!cancelado) setFase({ tipo: "error", mensaje: "Ocurrió un error de red. Intentá de nuevo." });
      }
    })();

    return () => { cancelado = true; };
  }, [vacanteId, bloqueada, intento]);

  if (bloqueada) {
    return (
      <div className="flex flex-col gap-3">
        <button disabled className="w-full rounded-full bg-surface-2 px-5 py-3 text-sm font-bold text-text-muted cursor-not-allowed">
          Postularme
        </button>
        <p className="text-sm text-text-muted">Esta vacante ya no recibe postulaciones.</p>
      </div>
    );
  }

  if (fase.tipo === "loading") {
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        <div className="h-11 w-full animate-pulse rounded-full bg-surface-2" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-surface-2" />
      </div>
    );
  }

  if (fase.tipo === "error") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-red-600 dark:text-red-400">{fase.mensaje}</p>
        <button onClick={() => setIntento((n) => n + 1)} className="w-full rounded-full border border-border px-5 py-3 text-sm font-bold text-text">
          Reintentar
        </button>
      </div>
    );
  }

  if (fase.tipo === "con_postulacion") {
    const meta = ESTADO_POSTULACION_META[fase.estado];
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-2 p-4">
        <div className="flex items-center gap-2">
          <IconCheck width={18} height={18} style={{ color: meta.color }} />
          <span className="text-sm font-bold text-text">Ya te postulaste</span>
        </div>
        <span className="inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: meta.color }}>
          {meta.label}
        </span>
        {fase.fecha && <p className="text-xs text-text-muted">Enviada el {fase.fecha}</p>}
      </div>
    );
  }

  if (fase.tipo === "sin_sesion") {
    return (
      <div className="flex flex-col gap-3">
        <a
          href={`/${locale}/login?redirect=/${locale}/marketplace/vacantes/${vacanteId}`}
          className="w-full rounded-full px-5 py-3 text-center text-sm font-bold text-white transition-all hover:brightness-110"
          style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
        >
          Postularme
        </a>
        <p className="text-sm text-text-muted">Debes iniciar sesión como estudiante para postularte.</p>
      </div>
    );
  }

  // sin_postulacion
  return (
    <>
      <button
        onClick={() => setModalAbierto(true)}
        className="w-full rounded-full px-5 py-3 text-sm font-bold text-white transition-all hover:brightness-110 hover:scale-[1.02] active:scale-95"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, boxShadow: `0 4px 14px ${color}45` }}
      >
        Postularme
      </button>
      {modalAbierto && (
        <ModalPostular
          vacanteId={vacanteId}
          color={color}
          onClose={() => setModalAbierto(false)}
          onExito={() => { setModalAbierto(false); setIntento((n) => n + 1); router.refresh(); }}
        />
      )}
    </>
  );
}

function ModalPostular({
  vacanteId,
  color,
  onClose,
  onExito,
}: {
  vacanteId: string;
  color: string;
  onClose: () => void;
  onExito: () => void;
}) {
  const [mensaje, setMensaje] = useState("");
  const [cvUrl, setCvUrl] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Bloqueo de scroll del body (REGLA #7).
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyPosition = body.style.position;
    const prevBodyTop = body.style.top;
    const prevBodyLeft = body.style.left;
    const prevBodyRight = body.style.right;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.position = prevBodyPosition;
      body.style.top = prevBodyTop;
      body.style.left = prevBodyLeft;
      body.style.right = prevBodyRight;
      window.scrollTo(scrollX, scrollY);
    };
  }, []);

  const enviar = async () => {
    setError(null);
    if (!mensaje.trim()) { setError("Escribí un mensaje de presentación."); return; }
    if (cvUrl.trim()) {
      try { new URL(cvUrl.trim()); } catch { setError("La URL del CV no es válida."); return; }
    }
    setEnviando(true);
    try {
      const res = await fetch("/api/postulaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idVacante: vacanteId, mensaje: mensaje.trim(), cvUrl: cvUrl.trim() || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error ?? "No se pudo enviar la postulación."); setEnviando(false); return; }
      onExito();
    } catch {
      setError("Error de red. Intentá de nuevo.");
      setEnviando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onWheel={(e) => e.stopPropagation()}
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <IconBriefcase width={20} height={20} style={{ color }} />
            <h2 className="font-heading text-lg font-black text-text">Postularme a la vacante</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-text-muted transition-colors hover:bg-surface-2" aria-label="Cerrar">
            <IconX width={18} height={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5">
          <label className="mb-1.5 block text-sm font-bold text-text">Mensaje de presentación *</label>
          <textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            rows={6}
            maxLength={3000}
            placeholder="Contale a la empresa por qué sos la persona indicada para este puesto..."
            className="w-full resize-none rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-text placeholder-text-muted/60 focus:outline-none focus:ring-2"
            style={{ ["--tw-ring-color" as string]: color }}
          />
          <p className="mt-1 text-right text-xs text-text-muted">{mensaje.length}/3000</p>

          <label className="mb-1.5 mt-4 block text-sm font-bold text-text">Enlace a tu CV (opcional)</label>
          <input
            type="url"
            value={cvUrl}
            onChange={(e) => setCvUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-text placeholder-text-muted/60 focus:outline-none focus:ring-2"
            style={{ ["--tw-ring-color" as string]: color }}
          />
          <p className="mt-1 text-xs text-text-muted">Podés pegar un enlace a tu CV en Drive, tu portafolio o LinkedIn.</p>

          {error && <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          <button onClick={onClose} disabled={enviando} className="rounded-full border border-border px-5 py-2.5 text-sm font-bold text-text transition-colors hover:bg-surface-2">
            Cancelar
          </button>
          <button
            onClick={enviar}
            disabled={enviando}
            className="rounded-full px-6 py-2.5 text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
          >
            {enviando ? "Enviando..." : "Enviar postulación"}
          </button>
        </div>
      </div>
    </div>
  );
}
