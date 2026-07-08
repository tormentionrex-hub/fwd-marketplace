"use client";

import { useState } from "react";
import { ThumbsUp, MessageCircle, ExternalLink, Eye, EyeOff, Trash2, Loader2 } from "lucide-react";
import { type NoticiaDTO, tiempoRelativo, etiquetaRol } from "@/lib/noticias";
import { confirmarEliminacion, alertaError } from "@/lib/sweetalert-admin";

export default function AdminNoticiasPanel({ inicial }: { inicial: NoticiaDTO[] }) {
  const [noticias, setNoticias] = useState<NoticiaDTO[]>(inicial);
  const [ocupada, setOcupada] = useState<string | null>(null);

  async function moderar(id: string, estado: "activa" | "oculta") {
    setOcupada(id);
    try {
      const res = await fetch(`/api/noticias/${id}/moderar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      });
      if (res.ok) {
        setNoticias((prev) => prev.map((n) => (n.id === id ? { ...n, estado } : n)));
      }
    } finally {
      setOcupada(null);
    }
  }

  async function eliminar(id: string) {
    const ok = await confirmarEliminacion({
      titulo: "¿Eliminar definitivamente esta noticia?",
      texto: "Esta acción no se puede deshacer.",
    });
    if (!ok) return;
    setOcupada(id);
    try {
      const res = await fetch(`/api/noticias/${id}`, { method: "DELETE" });
      if (res.ok) setNoticias((prev) => prev.filter((n) => n.id !== id));
      else alertaError("No se pudo eliminar la noticia.");
    } finally {
      setOcupada(null);
    }
  }

  if (noticias.length === 0) {
    return (
      <p className="rounded-2xl border border-white/10 bg-white/5 px-5 py-10 text-center text-sm" style={{ color: "var(--adm-ink-muted)" }}>
        No hay noticias publicadas todavía.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide" style={{ color: "var(--adm-ink-muted)" }}>
            <th className="px-4 py-3 font-semibold">Noticia</th>
            <th className="px-4 py-3 font-semibold">Autor</th>
            <th className="px-4 py-3 font-semibold">Categoría</th>
            <th className="px-4 py-3 font-semibold">Actividad</th>
            <th className="px-4 py-3 font-semibold">Estado</th>
            <th className="px-4 py-3 text-right font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {noticias.map((n) => (
            <tr key={n.id} className="border-b border-white/5 align-top last:border-0" style={{ color: "var(--adm-ink)" }}>
              <td className="max-w-xs px-4 py-3">
                <p className="font-semibold">{n.titulo}</p>
                <p className="mt-0.5 line-clamp-1 text-xs" style={{ color: "var(--adm-ink-muted)" }}>
                  {n.texto ?? (n.enlaceUrl ? n.enlaceUrl : n.imagenUrl ? "Imagen" : n.videoUrl ? "Video" : "")}
                </p>
                <div className="mt-1 flex items-center gap-2 text-xs" style={{ color: "var(--adm-ink-muted)" }}>
                  <span>{tiempoRelativo(n.creado)}</span>
                  {n.enlaceUrl && (
                    <a href={n.enlaceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-fwd-blue hover:underline">
                      <ExternalLink size={11} /> enlace
                    </a>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <p className="font-medium">{n.autor.nombre}</p>
                <p className="text-xs" style={{ color: "var(--adm-ink-muted)" }}>{etiquetaRol(n.autor.rol)}</p>
              </td>
              <td className="px-4 py-3">
                {n.categoria ? (
                  <span className="rounded-full bg-fwd-purple/20 px-2 py-0.5 text-xs font-semibold text-fwd-purple">{n.categoria}</span>
                ) : (
                  <span className="text-xs" style={{ color: "var(--adm-ink-muted)" }}>—</span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3 text-xs" style={{ color: "var(--adm-ink-muted)" }}>
                  <span className="inline-flex items-center gap-1"><ThumbsUp size={13} /> {n.votos}</span>
                  <span className="inline-flex items-center gap-1"><MessageCircle size={13} /> {n.comentarios}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                {n.estado === "oculta" ? (
                  <span className="rounded-full bg-fwd-magenta/20 px-2 py-0.5 text-xs font-semibold text-fwd-magenta">Oculta</span>
                ) : (
                  <span className="rounded-full bg-fwd-turquoise/20 px-2 py-0.5 text-xs font-semibold text-fwd-turquoise">Activa</span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => moderar(n.id, n.estado === "oculta" ? "activa" : "oculta")}
                    disabled={ocupada === n.id}
                    title={n.estado === "oculta" ? "Reactivar" : "Ocultar"}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-white/70 transition hover:bg-white/10 disabled:opacity-50"
                  >
                    {ocupada === n.id ? <Loader2 size={15} className="animate-spin" /> : n.estado === "oculta" ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => eliminar(n.id)}
                    disabled={ocupada === n.id}
                    title="Eliminar"
                    className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-fwd-magenta transition hover:bg-fwd-magenta/15 disabled:opacity-50"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
