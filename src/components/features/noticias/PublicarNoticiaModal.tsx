"use client";

import { useEffect, useRef, useState } from "react";
import {
  X,
  Link2,
  ImagePlus,
  Video,
  Loader2,
  Trash2,
  Type,
  Sparkles,
} from "lucide-react";
import { CATEGORIAS_NOTICIA, type NoticiaDTO } from "@/lib/noticias";

interface PreviewEnlace {
  tipo: "link" | "video";
  embedUrl?: string;
  preview?: {
    titulo: string | null;
    descripcion: string | null;
    imagen: string | null;
    sitio: string | null;
    dominio: string | null;
  };
}

export default function PublicarNoticiaModal({
  onCerrar,
  onGuardada,
  noticia,
}: {
  onCerrar: () => void;
  onGuardada: (n: NoticiaDTO, modo: "crear" | "editar") => void;
  /** Si se pasa una noticia, el modal entra en modo edición (PATCH). */
  noticia?: NoticiaDTO;
}) {
  const esEdicion = Boolean(noticia);
  // En edición, si el video era un embed (YouTube/Vimeo) su URL vivía en el
  // campo "enlace"; si era un archivo subido, va en videoUrl.
  const enlaceInicial = noticia?.enlaceUrl ?? (noticia?.videoEmbedUrl ? noticia.videoUrl ?? "" : "");
  const videoSubidoInicial = noticia && noticia.videoUrl && !noticia.videoEmbedUrl ? noticia.videoUrl : null;
  // --- Bloqueo de scroll del body (REGLA #7) ---
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

  const [titulo, setTitulo] = useState(noticia?.titulo ?? "");
  const [texto, setTexto] = useState(noticia?.texto ?? "");
  const [categoria, setCategoria] = useState(noticia?.categoria ?? "");
  const [enlace, setEnlace] = useState(enlaceInicial);
  const [imagenUrl, setImagenUrl] = useState<string | null>(noticia?.imagenUrl ?? null);
  const [videoUrl, setVideoUrl] = useState<string | null>(videoSubidoInicial);

  const [preview, setPreview] = useState<PreviewEnlace | null>(null);
  const [cargandoPreview, setCargandoPreview] = useState(false);
  const [subiendo, setSubiendo] = useState<"imagen" | "video" | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const inputImagen = useRef<HTMLInputElement>(null);
  const inputVideo = useRef<HTMLInputElement>(null);

  // Preview del enlace en vivo (debounce 700ms).
  useEffect(() => {
    const url = enlace.trim();
    if (!url) {
      setPreview(null);
      return;
    }
    setCargandoPreview(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/noticias/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        if (res.ok) {
          setPreview(await res.json());
        } else {
          setPreview(null);
        }
      } catch {
        setPreview(null);
      } finally {
        setCargandoPreview(false);
      }
    }, 700);
    return () => clearTimeout(t);
  }, [enlace]);

  async function subirArchivo(archivo: File, clase: "imagen" | "video") {
    setErrorMsg(null);
    setSubiendo(clase);
    try {
      const fd = new FormData();
      fd.append("archivo", archivo);
      const res = await fetch("/api/noticias/media", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data?.error ?? "No se pudo subir el archivo");
        return;
      }
      if (data.tipo === "imagen") setImagenUrl(data.url);
      else setVideoUrl(data.url);
    } catch {
      setErrorMsg("No se pudo subir el archivo");
    } finally {
      setSubiendo(null);
    }
  }

  async function publicar() {
    setErrorMsg(null);
    if (titulo.trim().length < 4) {
      setErrorMsg("El título es muy corto (mínimo 4 caracteres)");
      return;
    }
    // El enlace puede ser un video de YouTube/Vimeo: en ese caso lo mandamos como videoUrl.
    const enlaceEsVideo = preview?.tipo === "video";
    const payload = {
      titulo: titulo.trim(),
      texto: texto.trim() || undefined,
      enlaceUrl: enlaceEsVideo ? undefined : enlace.trim() || undefined,
      imagenUrl: imagenUrl || undefined,
      videoUrl: videoUrl || (enlaceEsVideo ? enlace.trim() : undefined),
      categoria: categoria || undefined,
    };
    if (!payload.texto && !payload.enlaceUrl && !payload.imagenUrl && !payload.videoUrl) {
      setErrorMsg("Agregá al menos un texto, un enlace, una imagen o un video");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch(esEdicion ? `/api/noticias/${noticia!.id}` : "/api/noticias", {
        method: esEdicion ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data?.error ?? (esEdicion ? "No se pudo guardar" : "No se pudo publicar"));
        return;
      }
      onGuardada(data.noticia, esEdicion ? "editar" : "crear");
    } catch {
      setErrorMsg(esEdicion ? "No se pudo guardar. Intentá de nuevo." : "No se pudo publicar. Intentá de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  const ocupado = enviando || subiendo !== null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-[#0b1437]/60 p-4 backdrop-blur-sm sm:items-center"
      onWheel={(e) => e.stopPropagation()}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
    >
      <div className="relative my-4 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-[#0f172a]">
        {/* Franja superior de color FWD */}
        <div className="h-1.5 w-full shrink-0" style={{ background: "linear-gradient(90deg,#20BEC6,#662D91,#EC008C,#008FD5)" }} />

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-3 px-6 pb-3 pt-5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl text-white" style={{ background: "linear-gradient(135deg,#662D91,#EC008C)" }}>
              <Sparkles size={18} />
            </span>
            <div>
              <h2 className="font-display text-lg font-black leading-tight text-[#0b1437] dark:text-white">
                {esEdicion ? "Editar noticia" : "Publicar noticia"}
              </h2>
              <p className="text-xs text-[#6B7B96] dark:text-white/50">
                {esEdicion ? "Actualizá tu publicación" : "Compartí algo de tecnología con la comunidad"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="grid h-9 w-9 place-items-center rounded-xl text-[#6B7B96] transition-colors hover:bg-[#F4F6FB] dark:text-white/60 dark:hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo scrollable */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-4">
          {/* Título */}
          <label className="mb-4 block">
            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#4C5E7C] dark:text-white/60">
              <Type size={13} /> Título <span className="text-[#EC008C]">*</span>
            </span>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              maxLength={300}
              placeholder="La IA generativa aumenta la productividad un 40% en desarrollo..."
              className="w-full rounded-xl border border-[#E4E9F1] bg-white px-3.5 py-2.5 text-sm text-[#0b1437] outline-none transition focus:border-[#662D91] focus:ring-2 focus:ring-[#662D91]/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </label>

          {/* Categoría */}
          <label className="mb-4 block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#4C5E7C] dark:text-white/60">Categoría</span>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full rounded-xl border border-[#E4E9F1] bg-white px-3.5 py-2.5 text-sm text-[#0b1437] outline-none transition focus:border-[#662D91] focus:ring-2 focus:ring-[#662D91]/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value="">Sin categoría</option>
              {CATEGORIAS_NOTICIA.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          {/* Texto */}
          <label className="mb-4 block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#4C5E7C] dark:text-white/60">Comentario</span>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              maxLength={5000}
              rows={4}
              placeholder="Escribí tu opinión o resumen (opcional)..."
              className="w-full resize-y rounded-xl border border-[#E4E9F1] bg-white px-3.5 py-2.5 text-sm text-[#0b1437] outline-none transition focus:border-[#662D91] focus:ring-2 focus:ring-[#662D91]/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </label>

          {/* Enlace */}
          <label className="mb-2 block">
            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#4C5E7C] dark:text-white/60">
              <Link2 size={13} /> Enlace
            </span>
            <input
              value={enlace}
              onChange={(e) => setEnlace(e.target.value)}
              placeholder="https://... (noticia, artículo o video de YouTube/Vimeo)"
              className="w-full rounded-xl border border-[#E4E9F1] bg-white px-3.5 py-2.5 text-sm text-[#0b1437] outline-none transition focus:border-[#008FD5] focus:ring-2 focus:ring-[#008FD5]/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </label>

          {/* Preview del enlace */}
          {cargandoPreview && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#E4E9F1] bg-[#F4F6FB] px-3.5 py-3 text-sm text-[#6B7B96] dark:border-white/10 dark:bg-white/5">
              <Loader2 size={16} className="animate-spin" /> Leyendo el enlace...
            </div>
          )}
          {!cargandoPreview && preview?.tipo === "video" && preview.embedUrl && (
            <div className="mb-4 overflow-hidden rounded-xl border border-[#E4E9F1] dark:border-white/10">
              <div className="aspect-video w-full">
                <iframe src={preview.embedUrl} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Preview de video" />
              </div>
            </div>
          )}
          {!cargandoPreview && preview?.tipo === "link" && preview.preview && (preview.preview.titulo || preview.preview.imagen) && (
            <div className="mb-4 flex gap-3 overflow-hidden rounded-xl border border-[#E4E9F1] bg-[#F8FAFD] p-2.5 dark:border-white/10 dark:bg-white/5">
              {preview.preview.imagen && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview.preview.imagen} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
              )}
              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-[#008FD5]">{preview.preview.dominio}</p>
                <p className="line-clamp-2 text-sm font-semibold text-[#0b1437] dark:text-white">{preview.preview.titulo}</p>
              </div>
            </div>
          )}

          {/* Media: imagen / video */}
          <div className="mb-2 grid grid-cols-2 gap-3">
            {/* Imagen */}
            <div>
              <input
                ref={inputImagen}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) subirArchivo(f, "imagen");
                  e.target.value = "";
                }}
              />
              {imagenUrl ? (
                <div className="relative overflow-hidden rounded-xl border border-[#E4E9F1] dark:border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagenUrl} alt="" className="h-28 w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImagenUrl(null)}
                    className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-lg bg-black/60 text-white transition hover:bg-black/80"
                    aria-label="Quitar imagen"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => inputImagen.current?.click()}
                  disabled={ocupado}
                  className="flex h-28 w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#C2CCDB] bg-[#F8FAFD] text-sm text-[#6B7B96] transition hover:border-[#662D91] hover:text-[#662D91] disabled:opacity-50 dark:border-white/15 dark:bg-white/5 dark:text-white/60"
                >
                  {subiendo === "imagen" ? <Loader2 size={20} className="animate-spin" /> : <ImagePlus size={20} />}
                  Imagen
                </button>
              )}
            </div>

            {/* Video (archivo) */}
            <div>
              <input
                ref={inputVideo}
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) subirArchivo(f, "video");
                  e.target.value = "";
                }}
              />
              {videoUrl ? (
                <div className="relative overflow-hidden rounded-xl border border-[#E4E9F1] dark:border-white/10">
                  <video src={videoUrl} className="h-28 w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setVideoUrl(null)}
                    className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-lg bg-black/60 text-white transition hover:bg-black/80"
                    aria-label="Quitar video"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => inputVideo.current?.click()}
                  disabled={ocupado}
                  className="flex h-28 w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#C2CCDB] bg-[#F8FAFD] text-sm text-[#6B7B96] transition hover:border-[#008FD5] hover:text-[#008FD5] disabled:opacity-50 dark:border-white/15 dark:bg-white/5 dark:text-white/60"
                >
                  {subiendo === "video" ? <Loader2 size={20} className="animate-spin" /> : <Video size={20} />}
                  Subir video
                </button>
              )}
            </div>
          </div>
          <p className="mb-2 text-[11px] text-[#8A97AB] dark:text-white/40">
            Todo es opcional salvo el título. Imagen hasta 5 MB, video hasta 50 MB o pegá un enlace de YouTube/Vimeo arriba.
          </p>

          {errorMsg && (
            <p className="mt-2 rounded-xl bg-[#EC008C]/10 px-3.5 py-2.5 text-sm font-medium text-[#EC008C]">{errorMsg}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-2.5 border-t border-[#E4E9F1] px-6 py-4 dark:border-white/10">
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#4C5E7C] transition hover:bg-[#F4F6FB] dark:text-white/70 dark:hover:bg-white/10"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={publicar}
            disabled={ocupado}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:brightness-110 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#662D91,#EC008C)" }}
          >
            {enviando && <Loader2 size={16} className="animate-spin" />}
            {esEdicion ? "Guardar cambios" : "Publicar"}
          </button>
        </div>
      </div>
    </div>
  );
}
