"use client";

import { useRef, useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import {
  IconArrowRight,
  IconFile,
  IconSparkles,
  IconUpload,
  IconUser,
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

interface Mensaje {
  id: string;
  rol: "usuario" | "asistente";
  contenido: string;
  archivosNombre?: string[];
}

interface MensajeHistorial {
  rol: "usuario" | "asistente";
  contenido: string;
}

const SUGERENCIAS = [
  "Revisa mi CV y dime que mejorar",
  "Como puedo mejorar mi resumen profesional?",
  "Que habilidades tecnicas deberia destacar?",
  "Mi CV es bueno para aplicar a trabajos de tecnologia?",
];

export default function CvIaManager({ nombre, correo }: CvIaManagerProps) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState("");
  const [archivos, setArchivos] = useState<File[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [cargado, setCargado] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Cargar historial cuando el correo esté disponible
  useEffect(() => {
    if (!correo || cargado) return;
    setCargado(true);
    try {
      const raw = localStorage.getItem(`cv-ia-chat-${correo}`);
      if (raw) {
        const parsed = JSON.parse(raw) as Mensaje[];
        if (Array.isArray(parsed) && parsed.length > 0) setMensajes(parsed);
      }
    } catch {
      // localStorage no disponible o datos corruptos
    }
  }, [correo, cargado]);

  // Persistir historial cada vez que cambia
  useEffect(() => {
    if (!cargado || !correo) return;
    try {
      if (mensajes.length === 0) {
        localStorage.removeItem(`cv-ia-chat-${correo}`);
      } else {
        localStorage.setItem(`cv-ia-chat-${correo}`, JSON.stringify(mensajes.slice(-40)));
      }
    } catch {
      // localStorage lleno o no disponible
    }
  }, [mensajes, cargado, correo]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, cargando]);

  function ajustarAltura() {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }

  async function enviar(textoOverride?: string) {
    const contenido = (textoOverride ?? texto).trim();
    if (!contenido && archivos.length === 0) return;
    if (cargando) return;

    const mensajeTexto = contenido || "Por favor analiza este curriculum adjunto.";
    const archivosSnap = [...archivos];
    const archivosNombre = archivosSnap.map((f) => f.name);

    const nuevoMensaje: Mensaje = {
      id: crypto.randomUUID(),
      rol: "usuario",
      contenido: mensajeTexto,
      ...(archivosNombre.length > 0 ? { archivosNombre } : {}),
    };

    const historialActual: MensajeHistorial[] = mensajes.map((m) => ({
      rol: m.rol,
      contenido: m.contenido,
    }));

    setMensajes((prev) => [...prev, nuevoMensaje]);
    setTexto("");
    setArchivos([]);
    setCargando(true);
    setError("");

    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const fd = new FormData();
    fd.append("mensaje", mensajeTexto);
    fd.append("historial", JSON.stringify(historialActual));
    for (const archivo of archivosSnap) {
      fd.append("archivos", archivo);
    }

    try {
      const res = await fetch("/api/estudiante/cv-ia/chat", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo obtener respuesta.");
        setMensajes((prev) => prev.slice(0, -1));
        return;
      }
      setMensajes((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          rol: "asistente",
          contenido: data.respuesta,
        },
      ]);
    } catch {
      setError("Error de red. Intenta de nuevo.");
      setMensajes((prev) => prev.slice(0, -1));
    } finally {
      setCargando(false);
    }
  }

  function limpiar() {
    setMensajes([]);
    setTexto("");
    setArchivos([]);
    setError("");
  }

  function agregarArchivos(files: FileList | null) {
    if (!files) return;
    const nuevos = Array.from(files)
      .filter((f) => f.type === "application/pdf")
      .slice(0, 3);
    setArchivos((prev) => [...prev, ...nuevos].slice(0, 3));
    if (fileRef.current) fileRef.current.value = "";
  }

  const puedeEnviar = (texto.trim().length > 0 || archivos.length > 0) && !cargando;

  return (
    <Card className="flex flex-col overflow-hidden p-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-fwd-azul/10 text-fwd-azul">
            <IconSparkles width={18} height={18} />
          </span>
          <div>
            <h2 className="text-sm font-bold text-text">Asistente de CV</h2>
            <p className="text-xs text-text-muted">Powered by Gemini · Solo temas de curriculum y perfil</p>
          </div>
        </div>
        {mensajes.length > 0 && (
          <button
            type="button"
            onClick={limpiar}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-surface-2"
          >
            <IconX width={13} height={13} />
            Limpiar chat
          </button>
        )}
      </div>

      {/* Mensajes */}
      <div className="flex min-h-[380px] max-h-[480px] flex-col gap-4 overflow-y-auto px-5 py-5">
        {mensajes.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
            <div>
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-fwd-azul/10 text-fwd-azul">
                <IconSparkles width={26} height={26} />
              </div>
              <p className="mt-3 text-sm font-semibold text-text">
                Hola, {nombre}. Soy tu asistente de CV.
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Adjunta tu CV en PDF o hazme una pregunta para empezar.
              </p>
            </div>
            <div className="flex w-full max-w-sm flex-col gap-2">
              {SUGERENCIAS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => enviar(s)}
                  disabled={cargando}
                  className="rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-left text-xs font-medium text-text-muted transition-colors hover:border-fwd-azul/40 hover:bg-fwd-azul/5 hover:text-text disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {mensajes.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.rol === "usuario" ? "flex-row-reverse" : ""}`}
              >
                <span
                  className={`mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                    m.rol === "usuario" ? "bg-fwd-azul" : "bg-surface-2"
                  }`}
                >
                  {m.rol === "usuario" ? (
                    <IconUser width={13} height={13} className="text-white" />
                  ) : (
                    <IconSparkles width={13} height={13} className="text-fwd-azul" />
                  )}
                </span>
                <div
                  className={`flex max-w-[78%] flex-col gap-1.5 ${
                    m.rol === "usuario" ? "items-end" : "items-start"
                  }`}
                >
                  {m.archivosNombre && m.archivosNombre.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {m.archivosNombre.map((n, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 rounded-md bg-fwd-azul/10 px-2 py-1 text-xs font-medium text-fwd-azul"
                        >
                          <IconFile width={11} height={11} />
                          {n}
                        </span>
                      ))}
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      m.rol === "usuario"
                        ? "rounded-tr-sm bg-fwd-azul text-white"
                        : "rounded-tl-sm bg-surface-2 text-text"
                    }`}
                  >
                    {m.contenido}
                  </div>
                </div>
              </div>
            ))}

            {cargando && (
              <div className="flex gap-3">
                <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface-2">
                  <IconSparkles width={13} height={13} className="text-fwd-azul" />
                </span>
                <div className="rounded-2xl rounded-tl-sm bg-surface-2 px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        {archivos.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {archivos.map((f, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-lg bg-fwd-azul/10 px-2.5 py-1.5 text-xs font-medium text-fwd-azul"
              >
                <IconFile width={12} height={12} />
                {f.name}
                <button
                  type="button"
                  onClick={() => setArchivos((prev) => prev.filter((_, j) => j !== i))}
                  className="ml-0.5 text-fwd-azul/60 hover:text-fwd-azul"
                >
                  <IconX width={11} height={11} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            title="Adjuntar PDF"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border text-text-muted transition-colors hover:border-fwd-azul/40 hover:bg-fwd-azul/5 hover:text-fwd-azul"
          >
            <IconUpload width={16} height={16} />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,application/pdf"
            multiple
            className="hidden"
            onChange={(e) => agregarArchivos(e.target.files)}
          />
          <textarea
            ref={textareaRef}
            rows={1}
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value);
              ajustarAltura();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                enviar();
              }
            }}
            placeholder="Escribi tu pregunta o adjunta tu CV en PDF..."
            className="min-h-[36px] flex-1 resize-none overflow-hidden rounded-xl border border-border bg-surface px-3.5 py-2 text-sm text-text outline-none transition-colors placeholder:text-text-muted/60 focus:border-fwd-azul focus:ring-4 focus:ring-fwd-azul/10"
          />
          <button
            type="button"
            onClick={() => enviar()}
            disabled={!puedeEnviar}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-fwd-azul text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <IconArrowRight width={16} height={16} />
          </button>
        </div>

        {error && (
          <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
        )}

        <p className="mt-2 text-center text-[10px] text-text-muted">
          Adjunta hasta 3 PDFs · Shift+Enter para nueva linea · Enter para enviar
        </p>
      </div>
    </Card>
  );
}
