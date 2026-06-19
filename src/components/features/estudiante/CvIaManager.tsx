"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import {
  IconCheck,
  IconCopy,
  IconCpu,
  IconDownload,
  IconEye,
  IconFile,
  IconSparkles,
  IconTrendingUp,
  IconX,
} from "@/components/ui/icons";

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

interface IaResult {
  compatibilidad: number;
  sugerencias: string[];
  resumenOptimizado: string;
}

export default function CvIaManager({
  nombre,
  correo,
  resumen,
  habilidades,
  portafolio,
  completados,
}: CvIaManagerProps) {
  const [puesto, setPuesto] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [resultado, setResultado] = useState<IaResult | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [mostrarPreview, setMostrarPreview] = useState(false);

  async function analizar() {
    if (!puesto.trim()) {
      setError("Por favor, ingresa el puesto al que vas a aplicar.");
      return;
    }

    setCargando(true);
    setError("");
    setResultado(null);
    setCopiado(false);

    try {
      const res = await fetch("/api/estudiante/cv-ia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          puesto,
          resumen,
          habilidades: habilidades.map((h) => h.nombre),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "No se pudo completar el análisis con IA.");
        return;
      }

      const data = await res.json();
      setResultado(data.result);
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  async function copiarAlPortapapeles(texto: string) {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Fallback silencioso
    }
  }

  function descargarMarkdown() {
    if (!resultado) return;

    let content = `# ${nombre}\n`;
    content += `${correo} | Estudiante FWD Costa Rica\n\n`;

    content += `## Resumen Profesional\n`;
    content += `${resultado.resumenOptimizado}\n\n`;

    if (habilidades && habilidades.length > 0) {
      content += `## Habilidades Técnicas\n`;
      habilidades.forEach((h) => {
        content += `- ${h.nombre} (${h.nivel})\n`;
      });
      content += `\n`;
    }

    if (portafolio && portafolio.length > 0) {
      content += `## Proyectos de Portafolio\n`;
      portafolio.forEach((p) => {
        content += `### ${p.titulo}${p.fecha ? ` (${p.fecha})` : ""}\n`;
        if (p.tecnologias) content += `**Tecnologías:** ${p.tecnologias}\n\n`;
        if (p.descripcion) content += `${p.descripcion}\n\n`;
        if (p.repoUrl) content += `- **Repositorio:** ${p.repoUrl}\n`;
        if (p.demoUrl) content += `- **Demo:** ${p.demoUrl}\n`;
        content += `\n`;
      });
    }

    if (completados && completados.length > 0) {
      content += `## Proyectos Acreditados FWD\n`;
      completados.forEach((c) => {
        content += `- **${c.titulo}:** Calificación: ${c.calificacion}/5\n`;
      });
      content += `\n`;
    }

    const blob = new Blob([content], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `CV_Optimizado_${nombre.replace(/\s+/g, "_")}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-5 p-6">
        <div>
          <h2 className="font-display text-lg font-bold text-text">CV IA - Optimización de Perfil</h2>
          <p className="text-sm text-text-muted">
            Ingresa el puesto al que deseas postularte para evaluar tu compatibilidad y recibir sugerencias personalizadas de redacción y habilidades.
          </p>
        </div>

        {/* Input del puesto */}
        <div className="flex flex-col gap-2">
          <label htmlFor="puesto-interes" className="text-sm font-semibold text-text">
            Puesto al que vas a aplicar
          </label>
          <div className="flex gap-2">
            <input
              id="puesto-interes"
              type="text"
              placeholder="Ej. Desarrollador React Junior, Diseñador UX/UI, Soporte Técnico..."
              value={puesto}
              onChange={(e) => setPuesto(e.target.value)}
              disabled={cargando}
              className="h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-text outline-none transition-colors placeholder:text-text-muted/60 focus:border-fwd-azul focus:ring-4 focus:ring-fwd-azul/10"
            />
            <button
              type="button"
              onClick={analizar}
              disabled={cargando || !puesto.trim()}
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-fwd-azul px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-fwd-azul/90 disabled:opacity-50"
            >
              <IconSparkles width={16} height={16} />
              {cargando ? "Analizando…" : "Optimizar"}
            </button>
          </div>
        </div>

        {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
      </Card>

      {/* Cargando */}
      {cargando && (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fwd-azul/20 opacity-75"></span>
            <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-fwd-azul/10 text-fwd-azul">
              <IconSparkles width={24} height={24} className="animate-spin duration-3000" />
            </span>
          </div>
          <h3 className="mt-4 font-display text-base font-bold text-text">Procesando perfil con IA...</h3>
          <p className="mt-1 text-xs text-text-muted max-w-xs">
            Evaluando coincidencia de palabras clave y reescribiendo resumen profesional.
          </p>
        </Card>
      )}

      {/* Resultados del análisis */}
      {resultado && (
        <div className="grid gap-6 md:grid-cols-[1fr_2fr] animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Compatibilidad */}
          <Card className="flex flex-col items-center justify-center p-6 text-center">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4">Compatibilidad</h3>
            <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-4 border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.01]">
              <span
                className="absolute inset-0 rounded-full border-4 border-fwd-azul transition-all"
                style={{
                  clipPath: `polygon(50% 50%, 50% 0%, ${resultado.compatibilidad >= 25 ? '100% 0%,' : ''} ${resultado.compatibilidad >= 50 ? '100% 100%,' : ''} ${resultado.compatibilidad >= 75 ? '0% 100%,' : ''} ${resultado.compatibilidad >= 100 ? '0% 0%,' : ''} 50% 0%)`,
                  transform: 'rotate(-45deg)',
                }}
              />
              <div className="z-10 flex flex-col items-center">
                <span className="text-4xl font-display font-black text-text">{resultado.compatibilidad}%</span>
                <span className="text-[10px] font-semibold text-text-muted uppercase mt-0.5">Alineación</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 rounded-full bg-fwd-azul/10 px-3.5 py-1 text-xs font-bold text-fwd-azul">
              <IconTrendingUp width={14} height={14} />
              {resultado.compatibilidad > 75
                ? "Listo para aplicar"
                : resultado.compatibilidad > 50
                ? "Buen potencial"
                : "Se sugieren ajustes"}
            </div>
          </Card>

          {/* Sugerencias y Resumen Optimizado */}
          <div className="flex flex-col gap-6">
            <Card className="p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4 flex items-center gap-2">
                <IconCpu width={16} height={16} className="text-fwd-morado" />
                Sugerencias de optimización
              </h3>
              <ul className="space-y-3">
                {resultado.sugerencias.map((sug, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-text-muted">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-fwd-morado" />
                    {sug}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted flex items-center gap-2">
                  <IconFile width={16} height={16} className="text-fwd-turquesa" />
                  Propuesta de resumen optimizado
                </h3>
                <button
                  type="button"
                  onClick={() => copiarAlPortapapeles(resultado.resumenOptimizado)}
                  className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-text transition-colors hover:bg-surface-2"
                >
                  {copiado ? (
                    <>
                      <IconCheck width={14} height={14} className="text-emerald-500" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <IconCopy width={14} height={14} />
                      Copiar texto
                    </>
                  )}
                </button>
              </div>
              <div className="rounded-xl border border-border bg-slate-50/50 dark:bg-white/[0.01] p-4 text-sm leading-relaxed text-text whitespace-pre-wrap">
                {resultado.resumenOptimizado}
              </div>
              <p className="mt-3 text-[11px] text-text-muted">
                Tip: Copia esta propuesta y pégala en la sección de &ldquo;Datos personales&rdquo; para mejorar tu perfil de inmediato.
              </p>

              {/* Botones de Vista Previa y Descarga */}
              <div className="mt-5 flex flex-wrap gap-2.5 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setMostrarPreview(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-fwd-azul px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-fwd-azul/90"
                >
                  <IconEye width={14} height={14} />
                  Vista previa del nuevo CV
                </button>
                <button
                  type="button"
                  onClick={descargarMarkdown}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-xs font-semibold text-text transition-colors hover:bg-surface-2"
                >
                  <IconDownload width={14} height={14} />
                  Descargar Markdown (.md)
                </button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Modal de Vista Previa de CV */}
      {mostrarPreview && resultado && (
        <div
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-start bg-black/70 p-4 md:p-8 overflow-y-auto"
          onClick={() => setMostrarPreview(false)}
        >
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              body * {
                visibility: hidden;
                background: none !important;
              }
              #cv-ia-print-area, #cv-ia-print-area * {
                visibility: visible;
              }
              #cv-ia-print-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                max-width: 100% !important;
                border: none !important;
                box-shadow: none !important;
                padding: 0 !important;
                margin: 0 !important;
                background: white !important;
                color: black !important;
              }
              @page {
                size: auto;
                margin: 1.5cm;
              }
            }
          `}} />

          <div
            className="relative w-full max-w-[21cm] rounded-2xl bg-surface dark:bg-[#1f2937] shadow-2xl flex flex-col my-auto border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h3 className="font-display text-base font-bold text-text">Vista previa del currículum optimizado</h3>
              <button
                type="button"
                onClick={() => setMostrarPreview(false)}
                className="text-text-muted hover:text-text rounded-lg p-1 transition-colors"
                aria-label="Cerrar"
              >
                <IconX width={20} height={20} />
              </button>
            </div>

            {/* Barra de Acciones del Modal */}
            <div className="flex flex-wrap gap-3 bg-surface-2 dark:bg-[#111827]/50 px-6 py-3 border-b border-border">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-fwd-azul px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-fwd-azul/90"
              >
                <IconDownload width={14} height={14} />
                Imprimir / Guardar PDF
              </button>
              <button
                type="button"
                onClick={descargarMarkdown}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-4 text-xs font-semibold text-text transition-colors hover:bg-surface-2 bg-surface"
              >
                <IconFile width={14} height={14} />
                Descargar Markdown (.md)
              </button>
            </div>

            {/* Contenedor del CV tipo A4 */}
            <div className="p-6 md:p-10 bg-slate-100 dark:bg-[#111827]/30 overflow-x-auto rounded-b-2xl">
              <div
                id="cv-ia-print-area"
                className="mx-auto max-w-[21cm] border border-gray-200 dark:border-white/5 bg-white p-8 md:p-12 shadow-md rounded-xl text-slate-800 font-sans leading-relaxed"
              >
                {/* Cabecera */}
                <div className="border-b border-slate-200 pb-4 mb-6">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">{nombre}</h1>
                  <p className="text-xs text-slate-500 mt-1">{correo} | Estudiante FWD Costa Rica</p>
                </div>

                {/* Resumen Profesional */}
                <div className="mb-6">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
                    Resumen Profesional
                  </h2>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {resultado.resumenOptimizado}
                  </p>
                </div>

                {/* Habilidades */}
                {habilidades && habilidades.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
                      Habilidades Técnicas
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {habilidades.map((h, idx) => (
                        <span
                          key={idx}
                          className="inline-block rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-800 capitalize border border-slate-200"
                        >
                          {h.nombre} <span className="text-slate-400 font-normal">({h.nivel})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Portafolio */}
                {portafolio && portafolio.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3">
                      Proyectos de Portafolio
                    </h2>
                    <div className="space-y-4">
                      {portafolio.map((p) => (
                        <div key={p.id} className="text-xs">
                          <div className="flex justify-between items-baseline font-semibold text-slate-800">
                            <span>{p.titulo}</span>
                            {p.fecha && <span className="text-[10px] font-normal text-slate-400">{p.fecha}</span>}
                          </div>
                          {p.tecnologias && (
                            <p className="text-[10px] font-medium text-blue-600 mt-0.5">
                              Tecnologías: {p.tecnologias}
                            </p>
                          )}
                          {p.descripcion && (
                            <p className="text-slate-600 mt-1 leading-relaxed whitespace-pre-wrap">
                              {p.descripcion}
                            </p>
                          )}
                          {(p.repoUrl || p.demoUrl) && (
                            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-slate-400">
                              {p.repoUrl && (
                                <span>
                                  Git: <span className="text-slate-500 break-all">{p.repoUrl}</span>
                                </span>
                              )}
                              {p.demoUrl && (
                                <span>
                                  Demo: <span className="text-slate-500 break-all">{p.demoUrl}</span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* FWD Acreditados */}
                {completados && completados.length > 0 && (
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
                      Experiencia y Proyectos FWD
                    </h2>
                    <div className="space-y-2">
                      {completados.map((c) => (
                        <div key={c.id} className="flex justify-between text-xs text-slate-700">
                          <span className="font-medium">{c.titulo}</span>
                          <span className="text-slate-400 text-[10px]">
                            Calificación: <span className="font-semibold text-slate-600">{c.calificacion}/5</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

