"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";

// Inserta transformaciones de calidad automática en URLs de Cloudinary.
// Cloudinary procesa q_auto (mejor relación calidad/tamaño), f_auto (formato
// óptimo para el browser: WebP/AVIF), y c_limit,w_N (no superar el ancho dado).
function cdnCalidad(url: string, ancho = 1200): string {
  if (!url.includes("res.cloudinary.com")) return url;
  if (url.includes("/upload/q_") || url.includes("/upload/f_")) return url;
  return url.replace("/upload/", `/upload/q_auto,f_auto,c_limit,w_${ancho}/`);
}

interface Props {
  imagenes: string[];
}

export default function GaleriaImagenes({ imagenes }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [idx, setIdx] = useState(0);

  const prev = useCallback(() => setIdx((i) => (i === 0 ? imagenes.length - 1 : i - 1)), [imagenes.length]);
  const next = useCallback(() => setIdx((i) => (i === imagenes.length - 1 ? 0 : i + 1)), [imagenes.length]);

  // REGLA #7: bloquear scroll del body al abrir el modal
  useEffect(() => {
    if (!abierto) return;
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
  }, [abierto]);

  // Teclado: ← → navegan, Escape cierra
  useEffect(() => {
    if (!abierto) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Escape") setAbierto(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [abierto, prev, next]);

  if (imagenes.length === 0) return null;

  return (
    <>
      {/* ── Card / botón de galería ── */}
      <button
        type="button"
        onClick={() => { setIdx(0); setAbierto(true); }}
        className="group relative w-full overflow-hidden rounded-2xl"
        style={{ border: "1px solid var(--border)" }}
        aria-label="Ver galería de imágenes del proyecto"
      >
        <div className="relative w-full" style={{ aspectRatio: "16/9", background: "#0e1628" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cdnCalidad(imagenes[0]!, 400)}
            alt=""
            aria-hidden="true"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
          {/* Overlay con texto e ícono */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 transition-opacity duration-200 group-hover:opacity-85"
            style={{ background: "rgba(0,0,0,0.56)" }}
          >
            <Images className="text-white" size={26} strokeWidth={1.5} aria-hidden="true" />
            <span className="text-white text-sm font-bold">Ver todas las imagenes</span>
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-black"
              style={{
                background: "rgba(255,255,255,0.14)",
                color: "rgba(255,255,255,0.82)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              {imagenes.length} {imagenes.length === 1 ? "imagen" : "imagenes"}
            </span>
          </div>
        </div>
      </button>

      {/* ── Modal galería full-screen ── */}
      {abierto && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col"
          style={{ background: "rgba(0,0,0,0.93)", backdropFilter: "blur(10px)" }}
          onWheel={(e) => e.stopPropagation()}
        >
          {/* Barra superior: contador + flechas (izquierda) / cerrar (derecha) */}
          <div className="flex shrink-0 items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="tabular-nums text-base font-black text-white">
                {idx + 1} / {imagenes.length}
              </span>
              <span className="text-sm font-medium text-white/45">
                {imagenes.length === 1 ? "imagen" : "imagenes"}
              </span>
              {imagenes.length > 1 && (
                <div className="ml-2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={prev}
                    aria-label="Imagen anterior"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-all duration-150 hover:bg-white/20"
                    style={{ border: "1px solid rgba(255,255,255,0.2)" }}
                  >
                    <ChevronLeft size={15} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    aria-label="Siguiente imagen"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-all duration-150 hover:bg-white/20"
                    style={{ border: "1px solid rgba(255,255,255,0.2)" }}
                  >
                    <ChevronRight size={15} aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar galería"
              className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-all hover:bg-white/15"
              style={{ border: "1px solid rgba(255,255,255,0.2)" }}
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          {/* Imagen principal centrada */}
          <div className="relative min-h-0 flex-1 flex items-center justify-center px-16">
            {/* Flechas laterales */}
            {imagenes.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Imagen anterior"
                  className="absolute left-3 z-10 flex h-11 w-11 items-center justify-center rounded-full text-white transition-all hover:bg-white/20"
                  style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.2)" }}
                >
                  <ChevronLeft size={20} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Siguiente imagen"
                  className="absolute right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full text-white transition-all hover:bg-white/20"
                  style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.2)" }}
                >
                  <ChevronRight size={20} aria-hidden="true" />
                </button>
              </>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={idx}
              src={cdnCalidad(imagenes[idx] ?? "", 1600)}
              alt={`Imagen ${idx + 1} de ${imagenes.length}`}
              style={{
                maxWidth: "100%",
                maxHeight: "calc(100vh - 180px)",
                objectFit: "contain",
                borderRadius: 10,
                display: "block",
                boxShadow: "0 8px 48px rgba(0,0,0,0.6)",
              }}
            />
          </div>

          {/* Miniaturas (solo si hay más de 1 imagen) */}
          {imagenes.length > 1 && (
            <div
              className="flex shrink-0 items-center justify-center gap-2 px-5 py-4"
              style={{ overflowX: "auto" }}
            >
              {imagenes.map((url, i) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setIdx(i)}
                  aria-label={`Ver imagen ${i + 1}`}
                  className="shrink-0 overflow-hidden rounded-lg transition-all duration-150 hover:opacity-90"
                  style={{
                    width: 60,
                    height: 40,
                    border: i === idx ? "2px solid #20BEC6" : "2px solid rgba(255,255,255,0.15)",
                    opacity: i === idx ? 1 : 0.5,
                    padding: 0,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cdnCalidad(url, 160)}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
