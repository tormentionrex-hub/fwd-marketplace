"use client";

import { useRef, useState } from "react";
import Card from "@/components/ui/Card";
import {
  IconBolt,
  IconCheck,
  IconFile,
  IconSparkles,
  IconUpload,
  IconX,
} from "@/components/ui/icons";
import type { AnalisisCv } from "@/types/cv-analisis";

interface HabilidadInfo {
  nombre: string;
  nivel: string;
}

interface PortafolioItem {
  id: string;
  titulo: string;
  descripcion: string;
  tecnologias: string;
  fecha: string;
  repoUrl: string;
  demoUrl: string;
}

interface ProyectoCompletado {
  id: string;
  titulo: string;
  calificacion: number;
}

interface CvIaManagerProps {
  nombre: string;
  correo: string;
  resumen: string;
  habilidades: HabilidadInfo[];
  portafolio: PortafolioItem[];
  completados: ProyectoCompletado[];
}

// ── Score circular ────────────────────────────────────────────────────────────

function ScoreCircle({ score }: { score: number }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const label = score >= 75 ? "Muy compatible" : score >= 50 ? "Compatible" : "Brechas importantes";
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

const LABELS: Record<string, string> = {
  tieneContacto: "Informacion de contacto",
  tieneResumen: "Resumen profesional",
  tieneExperiencia: "Experiencia o proyectos",
  tieneEducacion: "Educacion",
  tieneHabilidades: "Habilidades tecnicas",
};

// ── Componente principal ──────────────────────────────────────────────────────

export default function CvIaManager({}: CvIaManagerProps) {
  const [puesto, setPuesto] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [analisis, setAnalisis] = useState<AnalisisCv | null>(null);
  const [expandido, setExpandido] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  function seleccionarArchivo(f: File | undefined) {
    if (!f) return;
    if (f.type !== "application/pdf") {
      setError("El archivo debe ser un PDF.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("El PDF no puede superar 10 MB.");
      return;
    }
    setError("");
    setArchivo(f);
    setAnalisis(null);
  }

  async function analizar() {
    if (!puesto.trim()) {
      setError("Ingresa el puesto al que vas a aplicar.");
      return;
    }
    if (!archivo) {
      setError("Adjunta tu CV en PDF.");
      return;
    }

    setCargando(true);
    setError("");
    setAnalisis(null);

    const fd = new FormData();
    fd.append("puesto", puesto.trim());
    fd.append("archivo", archivo);

    try {
      const res = await fetch("/api/estudiante/cv-ia/analizar-puesto", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo completar el analisis.");
        return;
      }
      setAnalisis(data.analisis);
      setExpandido(true);
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  const puedeAnalizar = puesto.trim().length > 0 && !!archivo && !cargando;

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-5 p-6">
        <div>
          <h2 className="font-display text-lg font-bold text-text">Optimizacion de perfil</h2>
          <p className="text-sm text-text-muted">
            Ingresa el puesto al que queres aplicar y adjunta tu CV en PDF. La IA evaluara que tan compatible es tu perfil con ese rol.
          </p>
        </div>

        {/* Input puesto */}
        <div className="flex flex-col gap-2">
          <label htmlFor="puesto-objetivo" className="text-sm font-semibold text-text">
            Puesto al que vas a aplicar
          </label>
          <input
            id="puesto-objetivo"
            type="text"
            placeholder="Ej. Desarrollador React Junior, Diseñador UX/UI, Analista de Datos..."
            value={puesto}
            onChange={(e) => setPuesto(e.target.value)}
            disabled={cargando}
            className="h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-text outline-none transition-colors placeholder:text-text-muted/60 focus:border-fwd-azul focus:ring-4 focus:ring-fwd-azul/10"
          />
        </div>

        {/* Upload PDF */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-text">Tu CV en PDF</label>
          {archivo ? (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
                <IconFile width={18} height={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text">{archivo.name}</p>
                <p className="text-xs text-text-muted">{(archivo.size / (1024 * 1024)).toFixed(1)} MB</p>
              </div>
              <button
                type="button"
                onClick={() => { setArchivo(null); setAnalisis(null); setError(""); }}
                disabled={cargando}
                className="text-text-muted transition-colors hover:text-text"
                aria-label="Quitar archivo"
              >
                <IconX width={16} height={16} />
              </button>
            </div>
          ) : (
            <label
              onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
              onDragLeave={() => setArrastrando(false)}
              onDrop={(e) => { e.preventDefault(); setArrastrando(false); seleccionarArchivo(e.dataTransfer.files?.[0]); }}
              className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
                arrastrando ? "border-fwd-azul bg-fwd-azul/5" : "border-border hover:border-fwd-azul/50"
              }`}
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-fwd-azul/10 text-fwd-azul">
                <IconUpload width={20} height={20} />
              </span>
              <span className="text-sm font-medium text-text">Arrastra tu CV o haz clic para seleccionarlo</span>
              <span className="text-xs text-text-muted">Solo PDF — max 10 MB</span>
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => seleccionarArchivo(e.target.files?.[0])}
              />
            </label>
          )}
        </div>

        {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}

        <button
          type="button"
          onClick={analizar}
          disabled={!puedeAnalizar}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-fwd-azul px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-fwd-azul/90 disabled:opacity-50"
        >
          <IconSparkles width={16} height={16} />
          {cargando ? "Analizando..." : "Analizar compatibilidad"}
        </button>
      </Card>

      {/* Estado cargando */}
      {cargando && (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fwd-azul/20 opacity-75" />
            <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-fwd-azul/10 text-fwd-azul">
              <IconSparkles width={24} height={24} />
            </span>
          </div>
          <h3 className="mt-4 font-display text-base font-bold text-text">Analizando tu CV...</h3>
          <p className="mt-1 text-xs text-text-muted max-w-xs">
            Fordy esta evaluando tu perfil en relacion al puesto. Puede tardar unos segundos.
          </p>
        </Card>
      )}

      {/* Resultados */}
      {analisis && !cargando && (
        <Card className="flex flex-col gap-4 p-6">
          <div className="flex items-start gap-4">
            <ScoreCircle score={analisis.score} />
            <div className="flex flex-col gap-2 pt-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Compatibilidad con &ldquo;{puesto}&rdquo;
              </p>
              {analisis.requiereCambiosUrgentes && (
                <span className="inline-flex w-fit items-center gap-1.5 rounded-md bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-400">
                  <IconBolt width={12} height={12} />
                  Se necesitan mejoras antes de postular
                </span>
              )}
              {!analisis.requiereCambiosUrgentes && analisis.score >= 75 && (
                <span className="inline-flex w-fit items-center gap-1.5 rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                  <IconCheck width={12} height={12} />
                  Perfil listo para postular
                </span>
              )}
              <p className="text-sm leading-relaxed text-text-muted">{analisis.mensajeGeneral}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setExpandido((v) => !v)}
            className="self-start text-xs font-medium text-fwd-azul underline-offset-2 hover:underline"
          >
            {expandido ? "Ocultar detalle" : "Ver detalle completo"}
          </button>

          {expandido && (
            <div className="flex flex-col gap-4">
              {/* Secciones detectadas */}
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Estructura detectada en el CV
                </h3>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {Object.entries(analisis.validacion).map(([clave, tiene]) => (
                    <span key={clave} className="inline-flex items-center gap-2 text-sm">
                      {tiene ? (
                        <IconCheck width={14} height={14} className="shrink-0 text-emerald-500" />
                      ) : (
                        <IconX width={14} height={14} className="shrink-0 text-red-400" />
                      )}
                      <span className={tiene ? "text-text" : "text-text-muted"}>{LABELS[clave] ?? clave}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Fortalezas */}
              {analisis.fortalezas.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Fortalezas para el puesto</h3>
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

              {/* Sugerencias */}
              {analisis.sugerenciasMejora.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Que mejorar para ser mas competitivo
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

              {analisis.requiereCambiosUrgentes && (
                <div className="flex items-start gap-2.5 rounded-lg border border-amber-200/70 bg-amber-50/60 px-3.5 py-3 dark:border-amber-800/30 dark:bg-amber-950/20">
                  <IconUpload width={14} height={14} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
                    Aplica las sugerencias, actualiza tu CV con la version mejorada y vuelve a analizarlo antes de postular.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end border-t border-border pt-3">
            <button
              type="button"
              onClick={analizar}
              disabled={cargando}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted underline-offset-2 hover:underline disabled:opacity-50"
            >
              <IconSparkles width={12} height={12} />
              Re-analizar
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
