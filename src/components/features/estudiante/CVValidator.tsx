"use client";

import { useRef, useState } from "react";
import Card from "@/components/ui/Card";
import { IconCheck, IconFile, IconUpload, IconX, IconSparkles } from "@/components/ui/icons";
import type { AnalisisCv } from "@/types/cv-analisis";

const MAX_MB = 10;
const ACCEPT = ".pdf,application/pdf";

// ── Score circular ────────────────────────────────────────────────────────────

function ScoreCircle({ score }: { score: number }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);

  const color =
    score >= 75
      ? "#10b981" // emerald-500
      : score >= 50
        ? "#f59e0b" // amber-500
        : "#ef4444"; // red-500

  const textColor =
    score >= 75
      ? "text-emerald-600 dark:text-emerald-400"
      : score >= 50
        ? "text-amber-600 dark:text-amber-500"
        : "text-red-600 dark:text-red-400";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={100} height={100} viewBox="0 0 100 100" aria-hidden="true">
        <circle cx={50} cy={50} r={r} fill="none" stroke="currentColor" strokeWidth={7} className="text-border" />
        <circle
          cx={50}
          cy={50}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={7}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <text
          x={50}
          y={46}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={22}
          fontWeight={700}
          fill={color}
        >
          {score}
        </text>
        <text x={50} y={64} textAnchor="middle" dominantBaseline="middle" fontSize={10} fill="#94a3b8">
          / 100
        </text>
      </svg>
      <span className={`text-xs font-semibold ${textColor}`}>
        {score >= 75 ? "Excelente" : score >= 50 ? "Mejorable" : "Requiere trabajo"}
      </span>
    </div>
  );
}

// ── Badge de prioridad ────────────────────────────────────────────────────────

function BadgePrioridad({ p }: { p: "alta" | "media" | "baja" }) {
  const cls =
    p === "alta"
      ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400"
      : p === "media"
        ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
        : "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400";
  return <span className={`rounded px-2 py-0.5 text-xs font-semibold ${cls}`}>{p}</span>;
}

// ── Labels de validacion ──────────────────────────────────────────────────────

const LABELS: Record<string, string> = {
  tieneContacto: "Informacion de contacto",
  tieneResumen: "Resumen profesional",
  tieneExperiencia: "Experiencia o proyectos",
  tieneEducacion: "Educacion",
  tieneHabilidades: "Habilidades tecnicas",
};

// ── Panel de resultados ───────────────────────────────────────────────────────

function ResultadoPanel({
  analisis,
  nombre,
  onReset,
}: {
  analisis: AnalisisCv;
  nombre: string;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* Header — score + mensaje */}
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface-2/50 p-6 sm:flex-row sm:items-start sm:gap-6">
        <ScoreCircle score={analisis.score} />
        <div className="flex flex-col gap-2 text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{nombre}</p>
          {analisis.requiereCambiosUrgentes && (
            <span className="inline-flex w-fit items-center gap-1.5 self-center rounded-md bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-400 sm:self-start">
              <IconX width={12} height={12} />
              Requiere cambios urgentes
            </span>
          )}
          <p className="max-w-prose text-sm leading-relaxed text-text-muted">{analisis.mensajeGeneral}</p>
        </div>
      </div>

      {/* Estructura detectada */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Estructura detectada
        </h3>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(analisis.validacion).map(([clave, tiene]) => (
            <span key={clave} className="inline-flex items-center gap-2 text-sm">
              {tiene ? (
                <IconCheck width={15} height={15} className="shrink-0 text-emerald-500" />
              ) : (
                <IconX width={15} height={15} className="shrink-0 text-red-400" />
              )}
              <span className={tiene ? "text-text" : "text-text-muted"}>{LABELS[clave] ?? clave}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Fortalezas — fondo verde muy suave */}
      {analisis.fortalezas.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Fortalezas</h3>
          <div className="flex flex-col gap-2">
            {analisis.fortalezas.map((f, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl border border-emerald-200/70 bg-emerald-50/80 px-4 py-3 dark:border-emerald-800/30 dark:bg-emerald-950/20"
              >
                <IconCheck
                  width={16}
                  height={16}
                  className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                />
                <p className="text-sm leading-relaxed text-emerald-900 dark:text-emerald-200">{f}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sugerencias de mejora — gris/azul sutil */}
      {analisis.sugerenciasMejora.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Sugerencias de mejora
          </h3>
          <div className="flex flex-col gap-2.5">
            {analisis.sugerenciasMejora.map((s, i) => (
              <div
                key={i}
                className="flex flex-col gap-2 rounded-xl border border-slate-200/80 bg-slate-50/60 px-4 py-3.5 dark:border-white/8 dark:bg-white/[0.03]"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-text">{s.seccion}</span>
                  <BadgePrioridad p={s.prioridad} />
                </div>
                <p className="text-sm leading-relaxed text-text-muted">{s.consejo}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accion */}
      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text transition-colors hover:bg-surface-2"
        >
          <IconUpload width={15} height={15} />
          Validar otro PDF
        </button>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function CVValidator() {
  const [analisis, setAnalisis] = useState<AnalisisCv | null>(null);
  const [nombreArchivo, setNombreArchivo] = useState("");
  const [arrastrando, setArrastrando] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setAnalisis(null);
    setNombreArchivo("");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  function validarArchivo(file: File): string | null {
    if (!file.type.includes("pdf")) return "Solo se admiten archivos PDF.";
    if (file.size > MAX_MB * 1024 * 1024) return `El archivo supera el máximo de ${MAX_MB} MB.`;
    if (file.size === 0) return "El archivo está vacío.";
    return null;
  }

  async function procesar(file: File) {
    setError("");
    const err = validarArchivo(file);
    if (err) { setError(err); return; }

    setNombreArchivo(file.name);
    setProcesando(true);

    try {
      const fd = new FormData();
      fd.append("archivo", file);
      const res = await fetch("/api/estudiante/cv/validar", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo analizar el archivo.");
        setNombreArchivo("");
        return;
      }
      setAnalisis(data.analisis);
    } catch {
      setError("Error de red. Intentá de nuevo.");
      setNombreArchivo("");
    } finally {
      setProcesando(false);
    }
  }

  return (
    <Card className="flex flex-col gap-5 p-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <IconSparkles width={18} height={18} className="text-fwd-azul" />
          <h2 className="font-display text-lg font-bold text-text">Validar CV con IA</h2>
        </div>
        <p className="text-sm text-text-muted">
          Arrastra cualquier PDF para recibir retroalimentacion antes de subirlo oficialmente. El archivo no se guarda.
        </p>
      </div>

      {/* Input oculto */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) procesar(f); }}
      />

      {/* Estado: procesando */}
      {procesando && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-fwd-azul/40 bg-fwd-azul/5 p-10">
          <div className="relative flex h-14 w-14 items-center justify-center">
            <div className="absolute inset-0 animate-ping rounded-full bg-fwd-azul/20" />
            <div className="relative grid h-10 w-10 place-items-center rounded-full bg-fwd-azul/10">
              <IconSparkles width={20} height={20} className="text-fwd-azul" />
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm font-medium text-text">Analizando tu curriculum...</p>
            <p className="text-xs text-text-muted">Gemini esta revisando el documento. Puede tardar unos segundos.</p>
          </div>
          <div className="h-1 w-48 overflow-hidden rounded-full bg-surface-2">
            <div className="h-1 animate-pulse rounded-full bg-fwd-azul/60" style={{ width: "100%" }} />
          </div>
        </div>
      )}

      {/* Estado: resultado */}
      {!procesando && analisis && (
        <ResultadoPanel analisis={analisis} nombre={nombreArchivo} onReset={reset} />
      )}

      {/* Estado: idle (zona drag & drop) */}
      {!procesando && !analisis && (
        <label
          onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
          onDragLeave={() => setArrastrando(false)}
          onDrop={(e) => {
            e.preventDefault();
            setArrastrando(false);
            const f = e.dataTransfer.files?.[0];
            if (f) procesar(f);
          }}
          className={`flex cursor-pointer flex-col items-center gap-4 rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
            arrastrando
              ? "border-fwd-azul bg-fwd-azul/5 scale-[1.01]"
              : "border-border hover:border-fwd-azul/50 hover:bg-surface-2/40"
          }`}
        >
          <span
            className={`grid h-14 w-14 place-items-center rounded-2xl transition-colors ${
              arrastrando ? "bg-fwd-azul/15 text-fwd-azul" : "bg-surface-2 text-text-muted"
            }`}
          >
            <IconFile width={26} height={26} />
          </span>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-text">
              Arrastra tu CV aqui o haz clic para seleccionarlo
            </span>
            <span className="text-xs text-text-muted">Solo PDF · max {MAX_MB} MB · no se guarda en el servidor</span>
          </div>
          <span className="inline-flex items-center gap-2 rounded-xl bg-fwd-azul px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90">
            <IconUpload width={15} height={15} />
            Seleccionar PDF
          </span>
          <input
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) procesar(f); }}
          />
        </label>
      )}

      {error && (
        <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
      )}
    </Card>
  );
}
