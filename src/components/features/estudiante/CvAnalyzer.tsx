"use client";

import { useState } from "react";
import { IconCheck, IconX, IconSparkles, IconBolt, IconUpload } from "@/components/ui/icons";
import type { AnalisisCv } from "@/types/cv-analisis";

interface Props {
  initialAnalisis: AnalisisCv | null;
  fechaAnalisis: string | null;
}

function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Score circular SVG ────────────────────────────────────────────────────────

function ScoreCircle({ score }: { score: number }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const label = score >= 75 ? "Excelente" : score >= 50 ? "Mejorable" : "Necesita trabajo";
  const labelColor =
    score >= 75
      ? "text-emerald-600 dark:text-emerald-400"
      : score >= 50
        ? "text-amber-600 dark:text-amber-500"
        : "text-red-600 dark:text-red-400";

  return (
    <div className="flex shrink-0 flex-col items-center gap-1">
      <svg width={88} height={88} viewBox="0 0 88 88" aria-hidden="true">
        <circle cx={44} cy={44} r={r} fill="none" stroke="currentColor" strokeWidth={6} className="text-border" />
        <circle
          cx={44}
          cy={44}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 44 44)"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <text x={44} y={40} textAnchor="middle" dominantBaseline="middle" fontSize={20} fontWeight={700} fill={color}>
          {score}
        </text>
        <text x={44} y={56} textAnchor="middle" dominantBaseline="middle" fontSize={9} fill="#94a3b8">
          / 100
        </text>
      </svg>
      <span className={`text-xs font-semibold ${labelColor}`}>{label}</span>
    </div>
  );
}

// ── Badge prioridad ───────────────────────────────────────────────────────────

function BadgePrioridad({ p }: { p: "alta" | "media" | "baja" }) {
  const cls =
    p === "alta"
      ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400"
      : p === "media"
        ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
        : "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400";
  return <span className={`rounded px-2 py-0.5 text-xs font-semibold ${cls}`}>{p}</span>;
}

// ── Labels validacion ─────────────────────────────────────────────────────────

const LABELS: Record<string, string> = {
  tieneContacto: "Informacion de contacto",
  tieneResumen: "Resumen profesional",
  tieneExperiencia: "Experiencia o proyectos",
  tieneEducacion: "Educacion",
  tieneHabilidades: "Habilidades tecnicas",
};

// ── Componente principal ──────────────────────────────────────────────────────

export default function CvAnalyzer({ initialAnalisis, fechaAnalisis }: Props) {
  const [analisis, setAnalisis] = useState<AnalisisCv | null>(initialAnalisis);
  const [fecha, setFecha] = useState<string | null>(fechaAnalisis);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [expandido, setExpandido] = useState(!!initialAnalisis);

  async function ejecutarAnalisis() {
    setError("");
    setCargando(true);
    try {
      const res = await fetch("/api/estudiante/cv/analizar", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo analizar el CV.");
        return;
      }
      setAnalisis(data.analisis);
      setFecha(new Date().toISOString());
      setExpandido(true);
    } catch {
      setError("Error de red. Intentá de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-dashed border-fwd-azul/30 bg-fwd-azul/[0.03] p-4">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-fwd-azul/10 px-2.5 py-0.5 text-xs font-semibold text-fwd-azul">
              Opcional
            </span>
            <span className="text-sm font-semibold text-text">
              Revisá tu CV antes de publicarlo
            </span>
          </div>
          <p className="text-xs text-text-muted">
            Gemini analiza tu CV y te da recomendaciones concretas para mejorar tus chances de ser contratado
          </p>
        </div>

        <button
          type="button"
          onClick={ejecutarAnalisis}
          disabled={cargando}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-fwd-azul px-3.5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          <IconSparkles width={15} height={15} />
          {cargando ? "Analizando..." : analisis ? "Re-analizar" : "Analizar con IA"}
        </button>
      </div>

      {/* ── Loading ── */}
      {cargando && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3">
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
            <div className="absolute inset-0 animate-ping rounded-full bg-fwd-azul/20" />
            <IconSparkles width={16} height={16} className="relative text-fwd-azul" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-text">Analizando tu curriculum...</span>
            <span className="text-xs text-text-muted">Gemini esta leyendo tu PDF. Puede tardar unos segundos.</span>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* ── Resultados ── */}
      {analisis && !cargando && (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">

          {/* Score + mensaje */}
          <div className="flex items-start gap-4">
            <ScoreCircle score={analisis.score} />
            <div className="flex flex-col gap-2 pt-1">
              {analisis.requiereCambiosUrgentes && (
                <span className="inline-flex w-fit items-center gap-1.5 rounded-md bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-400">
                  <IconBolt width={12} height={12} />
                  Mejorá tu CV antes de publicarlo
                </span>
              )}
              {!analisis.requiereCambiosUrgentes && analisis.score >= 75 && (
                <span className="inline-flex w-fit items-center gap-1.5 rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                  <IconCheck width={12} height={12} />
                  Listo para publicar
                </span>
              )}
              <p className="text-sm leading-relaxed text-text-muted">{analisis.mensajeGeneral}</p>
            </div>
          </div>

          {/* Toggle expandir */}
          <button
            type="button"
            onClick={() => setExpandido((v) => !v)}
            className="self-start text-xs font-medium text-fwd-azul underline-offset-2 hover:underline"
          >
            {expandido ? "Ocultar detalle del analisis" : "Ver detalle completo del analisis"}
          </button>

          {expandido && (
            <div className="flex flex-col gap-4">

              {/* Estructura detectada */}
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Estructura detectada en tu CV
                </h3>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {Object.entries(analisis.validacion).map(([clave, tiene]) => (
                    <span key={clave} className="inline-flex items-center gap-2 text-sm">
                      {tiene ? (
                        <IconCheck width={14} height={14} className="shrink-0 text-emerald-500" />
                      ) : (
                        <IconX width={14} height={14} className="shrink-0 text-red-400" />
                      )}
                      <span className={tiene ? "text-text" : "text-text-muted"}>
                        {LABELS[clave] ?? clave}
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Fortalezas — fondo verde muy suave */}
              {analisis.fortalezas.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Fortalezas
                  </h3>
                  <div className="flex flex-col gap-1.5">
                    {analisis.fortalezas.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 rounded-lg border border-emerald-200/70 bg-emerald-50/80 px-3.5 py-2.5 dark:border-emerald-800/30 dark:bg-emerald-950/20"
                      >
                        <IconCheck width={14} height={14} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <p className="text-sm leading-relaxed text-emerald-900 dark:text-emerald-200">{f}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sugerencias de mejora — gris sutil */}
              {analisis.sugerenciasMejora.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Sugerencias de mejora
                  </h3>
                  <div className="flex flex-col gap-2">
                    {analisis.sugerenciasMejora.map((s, i) => (
                      <div
                        key={i}
                        className="flex flex-col gap-1.5 rounded-lg border border-slate-200/80 bg-slate-50/60 px-3.5 py-3 dark:border-white/8 dark:bg-white/[0.03]"
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

              {/* Nota si hay cambios urgentes */}
              {analisis.requiereCambiosUrgentes && (
                <div className="flex items-start gap-2.5 rounded-lg border border-amber-200/70 bg-amber-50/60 px-3.5 py-3 dark:border-amber-800/30 dark:bg-amber-950/20">
                  <IconUpload width={14} height={14} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
                    Aplica las sugerencias, reemplaza tu CV con la version mejorada y vuelve a analizarlo antes de publicarlo.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Footer: re-analizar + fecha */}
          <div className="flex items-center justify-between border-t border-border pt-3">
            {fecha && (
              <span className="text-xs text-text-muted">Analizado: {formatFecha(fecha)}</span>
            )}
            <button
              type="button"
              onClick={ejecutarAnalisis}
              disabled={cargando}
              className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-text-muted underline-offset-2 hover:underline disabled:opacity-50"
            >
              <IconSparkles width={12} height={12} />
              Re-analizar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
