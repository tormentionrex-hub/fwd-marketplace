"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import { IconDownload, IconEye, IconFile } from "@/components/ui/icons";

interface CvPublicoSectionProps {
  username: string;
  fileName: string;
  fileType: string;
  actualizado: string;
}

function etiquetaTipo(mime: string): string {
  if (mime.includes("pdf")) return "PDF";
  if (mime.includes("wordprocessingml")) return "DOCX";
  if (mime.includes("msword")) return "DOC";
  return "Documento";
}

/**
 * Sección "Currículum Profesional" del perfil público. Solo se renderiza si el
 * viewer es un empresario y el estudiante tiene CV público. Al hacer clic en
 * Ver/Descargar, pide la URL firmada a /api/perfil/:username/cv (que registra
 * el acceso en auditoría) y la abre.
 */
export default function CvPublicoSection({
  username,
  fileName,
  fileType,
  actualizado,
}: CvPublicoSectionProps) {
  const [cargando, setCargando] = useState<"ver" | "descargar" | null>(null);
  const [error, setError] = useState("");

  async function abrir(accion: "ver" | "descargar") {
    setError("");
    setCargando(accion);
    try {
      const res = await fetch(`/api/perfil/${username}/cv?accion=${accion}`, { cache: "no-store" });
      if (!res.ok) {
        setError("No se pudo acceder al currículum.");
        return;
      }
      const { cv } = await res.json();
      const url = accion === "descargar" ? cv.downloadUrl : cv.viewUrl;
      if (url) window.open(url, "_blank", "noopener");
    } catch {
      setError("Error de red. Intentá de nuevo.");
    } finally {
      setCargando(null);
    }
  }

  const fecha = new Date(actualizado).toLocaleDateString("es-CR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Card className="flex flex-col gap-4 p-6">
      <h2 className="font-display text-lg font-bold text-text">Currículum Profesional</h2>
      <div className="flex items-center gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-fwd-azul/10 text-fwd-azul">
          <IconFile width={22} height={22} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-text">{fileName}</p>
          <p className="mt-0.5 text-xs text-text-muted">
            {etiquetaTipo(fileType)} · Actualizado {fecha}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => abrir("ver")}
          disabled={cargando !== null}
          className="inline-flex items-center gap-1.5 rounded-lg bg-fwd-azul px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-fwd-azul/90 disabled:opacity-50"
        >
          <IconEye width={16} height={16} /> {cargando === "ver" ? "Abriendo…" : "Ver CV"}
        </button>
        <button
          type="button"
          onClick={() => abrir("descargar")}
          disabled={cargando !== null}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-2 disabled:opacity-50"
        >
          <IconDownload width={16} height={16} /> {cargando === "descargar" ? "Abriendo…" : "Descargar CV"}
        </button>
      </div>

      {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
    </Card>
  );
}
