"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Card from "@/components/ui/Card";
import {
  IconCheck,
  IconDownload,
  IconEye,
  IconFile,
  IconUpload,
  IconX,
} from "@/components/ui/icons";

const MAX_MB = 10;
const ACCEPT = ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

interface CvData {
  fileName: string;
  fileType: string;
  fileSize: number;
  esPublico: boolean;
  subido: string;
  actualizado: string;
  viewUrl: string | null;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CR", { day: "numeric", month: "short", year: "numeric" });
}
function etiquetaTipo(mime: string): string {
  if (mime.includes("pdf")) return "PDF";
  if (mime.includes("wordprocessingml")) return "DOCX";
  if (mime.includes("msword")) return "DOC";
  return "Documento";
}
function validar(file: File): string | null {
  const okExt = /\.(pdf|docx?|doc)$/i.test(file.name);
  if (!okExt) return "Formato no permitido. Solo PDF, DOC o DOCX.";
  if (file.size > MAX_MB * 1024 * 1024) return `El archivo supera el máximo de ${MAX_MB} MB.`;
  if (file.size === 0) return "El archivo está vacío.";
  return null;
}

export default function CvManager() {
  const [estado, setEstado] = useState<"loading" | "ready" | "error">("loading");
  const [cv, setCv] = useState<CvData | null>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [verAbierto, setVerAbierto] = useState(false);
  const [confirmarBorrar, setConfirmarBorrar] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const cargar = useCallback(async () => {
    try {
      const res = await fetch("/api/estudiante/cv", { cache: "no-store" });
      if (!res.ok) {
        setEstado("error");
        return;
      }
      const data: { cv: CvData | null } = await res.json();
      setCv(data.cv);
      setEstado("ready");
    } catch {
      setEstado("error");
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  function subir(file: File | undefined) {
    if (!file) return;
    setError("");
    setOk("");
    const err = validar(file);
    if (err) {
      setError(err);
      return;
    }
    setSubiendo(true);
    setProgreso(0);

    const xhr = new XMLHttpRequest();
    const fd = new FormData();
    fd.append("archivo", file);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setProgreso(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      setSubiendo(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const d = JSON.parse(xhr.responseText);
          setCv(d.cv);
          setOk("Currículum guardado.");
        } catch {
          cargar();
        }
      } else {
        try {
          setError(JSON.parse(xhr.responseText).error ?? "No se pudo subir el archivo.");
        } catch {
          setError("No se pudo subir el archivo.");
        }
      }
    };
    xhr.onerror = () => {
      setSubiendo(false);
      setError("Error de red. Intentá de nuevo.");
    };
    xhr.open("POST", "/api/estudiante/cv");
    xhr.send(fd);
  }

  async function eliminar() {
    setError("");
    try {
      const res = await fetch("/api/estudiante/cv", { method: "DELETE" });
      if (!res.ok) {
        setError("No se pudo eliminar el CV.");
        return;
      }
      setCv(null);
      setConfirmarBorrar(false);
      setOk("Currículum eliminado.");
    } catch {
      setError("Error de red. Intentá de nuevo.");
    }
  }

  async function togglePrivacidad() {
    if (!cv) return;
    const nuevo = !cv.esPublico;
    setCv({ ...cv, esPublico: nuevo }); // optimista
    try {
      const res = await fetch("/api/estudiante/cv/privacidad", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ esPublico: nuevo }),
      });
      if (!res.ok) setCv({ ...cv, esPublico: !nuevo }); // revertir
    } catch {
      setCv({ ...cv, esPublico: !nuevo });
    }
  }

  const esPdf = cv?.fileType.includes("pdf");

  // ── Render ───────────────────────────────────────────────────────
  if (estado === "loading") {
    return (
      <Card className="flex flex-col gap-4 p-6">
        <div className="h-24 animate-pulse rounded-xl bg-surface-2" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-surface-2" />
      </Card>
    );
  }
  if (estado === "error") {
    return (
      <Card className="p-6 text-sm text-text-muted">No pudimos cargar tu currículum. Recargá la página.</Card>
    );
  }

  return (
    <Card className="flex flex-col gap-5 p-6">
      <div>
        <h2 className="font-display text-lg font-bold text-text">Currículum</h2>
        <p className="text-sm text-text-muted">
          Subí tu CV en PDF, DOC o DOCX (máx {MAX_MB} MB). Opcionalmente, mostralo en tu perfil público.
        </p>
      </div>

      {/* input oculto reutilizado para subir/reemplazar */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => subir(e.target.files?.[0])}
      />

      {subiendo ? (
        <div className="flex flex-col gap-2 rounded-xl border border-border p-5">
          <span className="text-sm font-medium text-text">Subiendo… {progreso}%</span>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
            <div className="h-2 rounded-full bg-fwd-azul transition-all" style={{ width: `${progreso}%` }} />
          </div>
        </div>
      ) : !cv ? (
        // ── Zona de carga (drag & drop) ──
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setArrastrando(true);
          }}
          onDragLeave={() => setArrastrando(false)}
          onDrop={(e) => {
            e.preventDefault();
            setArrastrando(false);
            subir(e.dataTransfer.files?.[0]);
          }}
          className={`flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
            arrastrando ? "border-fwd-azul bg-fwd-azul/5" : "border-border hover:border-fwd-azul/50"
          }`}
        >
          <span className="grid h-12 w-12 place-items-center rounded-full bg-fwd-azul/10 text-fwd-azul">
            <IconUpload width={22} height={22} />
          </span>
          <span className="text-sm font-medium text-text">Arrastrá tu CV o hacé clic para subirlo</span>
          <span className="text-xs text-text-muted">PDF · DOC · DOCX — máx {MAX_MB} MB</span>
          <input
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => subir(e.target.files?.[0])}
          />
        </label>
      ) : (
        // ── Tarjeta del CV cargado ──
        <div className="flex flex-col gap-4 rounded-xl border border-border p-5">
          <div className="flex items-start gap-4">
            <span
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${
                esPdf ? "bg-red-500/10 text-red-600 dark:text-red-400" : "bg-fwd-azul/10 text-fwd-azul"
              }`}
            >
              <IconFile width={22} height={22} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-text">{cv.fileName}</p>
              <p className="mt-0.5 text-xs text-text-muted">
                {etiquetaTipo(cv.fileType)} · {formatBytes(cv.fileSize)} · Actualizado {formatFecha(cv.actualizado)}
              </p>
            </div>
          </div>

          {/* Privacidad */}
          <label className="flex items-center gap-2.5 rounded-lg bg-surface-2 px-3 py-2.5 text-sm">
            <input
              type="checkbox"
              checked={cv.esPublico}
              onChange={togglePrivacidad}
              className="h-4 w-4 accent-fwd-azul"
            />
            <span className="text-text">Mostrar currículum en mi perfil público</span>
            {cv.esPublico && (
              <span className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <IconCheck width={13} height={13} /> Visible
              </span>
            )}
          </label>

          {/* Acciones */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => (esPdf ? setVerAbierto(true) : window.open(cv.viewUrl ?? "#", "_blank"))}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-2"
            >
              <IconEye width={16} height={16} /> Ver CV
            </button>
            <button
              type="button"
              onClick={() => window.open("/api/estudiante/cv/descargar", "_blank", "noopener")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-2"
            >
              <IconDownload width={16} height={16} /> Descargar
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-2"
            >
              <IconUpload width={16} height={16} /> Reemplazar
            </button>
            {confirmarBorrar ? (
              <span className="inline-flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm">
                <span className="text-red-600 dark:text-red-400">¿Eliminar?</span>
                <button type="button" onClick={eliminar} className="font-semibold text-red-600 hover:underline dark:text-red-400">
                  Sí
                </button>
                <button type="button" onClick={() => setConfirmarBorrar(false)} className="text-text-muted hover:underline">
                  No
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmarBorrar(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-500/10 dark:border-red-500/40 dark:text-red-400"
              >
                <IconX width={16} height={16} /> Eliminar
              </button>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
      {ok && (
        <p className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
          <IconCheck width={15} height={15} /> {ok}
        </p>
      )}

      {/* Visor PDF integrado */}
      {verAbierto && cv?.viewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setVerAbierto(false)}
        >
          <div
            className="flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-surface"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="truncate text-sm font-medium text-text">{cv.fileName}</span>
              <button
                type="button"
                onClick={() => setVerAbierto(false)}
                aria-label="Cerrar"
                className="text-text-muted hover:text-text"
              >
                <IconX width={20} height={20} />
              </button>
            </div>
            <iframe src={cv.viewUrl} title="Visor de CV" className="h-full w-full" />
          </div>
        </div>
      )}
    </Card>
  );
}
