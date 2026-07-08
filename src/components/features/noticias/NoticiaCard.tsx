"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { ThumbsUp, MessageCircle, ExternalLink, Trash2, EyeOff, Eye, ArrowUpRight } from "lucide-react";
import {
  type NoticiaDTO,
  type SesionUsuario,
  inicial,
  tiempoRelativo,
  etiquetaRol,
  puedeModerar,
  COLOR_CATEGORIA,
} from "@/lib/noticias";
import { confirmarEliminacion, alertaError } from "@/lib/sweetalert-admin";
import ComentariosNoticia from "./ComentariosNoticia";

function Avatar({ nombre, url }: { nombre: string; url: string | null }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={nombre} className="h-9 w-9 shrink-0 rounded-full object-cover" />;
  }
  return (
    <span
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-black text-white"
      style={{ background: "linear-gradient(135deg,#662D91,#EC008C)" }}
      aria-hidden
    >
      {inicial(nombre)}
    </span>
  );
}

export default function NoticiaCard({
  noticia,
  sesion,
  onEliminada,
  onPedirLogin,
}: {
  noticia: NoticiaDTO;
  sesion: SesionUsuario | null;
  onEliminada: (id: string) => void;
  onPedirLogin: () => void;
}) {
  const [votada, setVotada] = useState(noticia.votada);
  const [votos, setVotos] = useState(noticia.votos);
  const [comentarios, setComentarios] = useState(noticia.comentarios);
  const [verComentarios, setVerComentarios] = useState(false);
  const [estado, setEstado] = useState(noticia.estado);
  const [votando, setVotando] = useState(false);

  const esAutor = sesion?.id === noticia.autor.id;
  const moderador = puedeModerar(sesion?.rol);
  const colorCat = noticia.categoria ? COLOR_CATEGORIA[noticia.categoria] ?? "#662D91" : "#662D91";

  async function votar() {
    if (!sesion) {
      onPedirLogin();
      return;
    }
    if (votando) return;
    setVotando(true);
    // Optimista
    const previo = { votada, votos };
    setVotada(!votada);
    setVotos((v) => v + (votada ? -1 : 1));
    try {
      const res = await fetch(`/api/noticias/${noticia.id}/voto`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setVotada(data.votada);
        setVotos(data.total);
      } else {
        setVotada(previo.votada);
        setVotos(previo.votos);
      }
    } catch {
      setVotada(previo.votada);
      setVotos(previo.votos);
    } finally {
      setVotando(false);
    }
  }

  async function eliminar() {
    const ok = await confirmarEliminacion({
      titulo: "¿Eliminar esta noticia?",
      texto: "Esta acción no se puede deshacer.",
    });
    if (!ok) return;
    const res = await fetch(`/api/noticias/${noticia.id}`, { method: "DELETE" });
    if (res.ok) onEliminada(noticia.id);
    else alertaError("No se pudo eliminar la noticia. Intentá de nuevo.");
  }

  async function moderar(nuevo: "activa" | "oculta") {
    const res = await fetch(`/api/noticias/${noticia.id}/moderar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevo }),
    });
    if (res.ok) setEstado(nuevo);
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-[#E4E9F1] bg-white shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-[#0f172a]">
      {estado === "oculta" && (
        <div className="flex items-center gap-2 bg-[#EC008C]/10 px-4 py-1.5 text-xs font-semibold text-[#EC008C]">
          <EyeOff size={13} /> Oculta por moderación
        </div>
      )}
      <div className="p-4 sm:p-5">
        {/* Cabecera: autor */}
        <div className="mb-3 flex items-center gap-2.5">
          <Avatar nombre={noticia.autor.nombre} url={noticia.autor.avatarUrl} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              {noticia.autor.perfilUrl ? (
                <Link href={noticia.autor.perfilUrl} className="truncate text-sm font-bold text-[#0b1437] hover:underline dark:text-white">
                  {noticia.autor.nombre}
                </Link>
              ) : (
                <span className="truncate text-sm font-bold text-[#0b1437] dark:text-white">{noticia.autor.nombre}</span>
              )}
              <span className="rounded-full bg-[#20BEC6]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[#0f8a90] dark:text-[#20BEC6]">
                {etiquetaRol(noticia.autor.rol)}
              </span>
            </div>
            <span className="text-[11px] text-[#8A97AB] dark:text-white/40">{tiempoRelativo(noticia.creado)}</span>
          </div>

          {noticia.categoria && (
            <span
              className="hidden shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold text-white sm:inline-block"
              style={{ background: colorCat }}
            >
              {noticia.categoria}
            </span>
          )}

          {/* Acciones autor/moderador */}
          {(esAutor || moderador) && (
            <div className="flex shrink-0 items-center gap-1">
              {moderador && !esAutor && (
                <button
                  type="button"
                  onClick={() => moderar(estado === "oculta" ? "activa" : "oculta")}
                  title={estado === "oculta" ? "Reactivar" : "Ocultar"}
                  className="grid h-8 w-8 place-items-center rounded-lg text-[#8A97AB] transition hover:bg-[#F4F6FB] hover:text-[#662D91] dark:hover:bg-white/10"
                >
                  {estado === "oculta" ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              )}
              <button
                type="button"
                onClick={eliminar}
                title="Eliminar"
                className="grid h-8 w-8 place-items-center rounded-lg text-[#8A97AB] transition hover:bg-[#EC008C]/10 hover:text-[#EC008C]"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Título */}
        <h3 className="mb-2 font-display text-lg font-black leading-snug text-[#0b1437] dark:text-white">{noticia.titulo}</h3>

        {/* Texto */}
        {noticia.texto && (
          <p className="mb-3 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-[#28374F] dark:text-white/80">
            {noticia.texto}
          </p>
        )}

        {/* Imagen */}
        {noticia.imagenUrl && (
          <div className="mb-3 overflow-hidden rounded-xl border border-[#E4E9F1] dark:border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={noticia.imagenUrl} alt={noticia.titulo} className="max-h-[520px] w-full object-cover" />
          </div>
        )}

        {/* Video: embed (YouTube/Vimeo) o archivo */}
        {noticia.videoEmbedUrl ? (
          <div className="mb-3 overflow-hidden rounded-xl border border-[#E4E9F1] dark:border-white/10">
            <div className="aspect-video w-full">
              <iframe
                src={noticia.videoEmbedUrl}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={noticia.titulo}
              />
            </div>
          </div>
        ) : noticia.videoUrl ? (
          <div className="mb-3 overflow-hidden rounded-xl border border-[#E4E9F1] dark:border-white/10">
            <video src={noticia.videoUrl} controls className="max-h-[520px] w-full bg-black" />
          </div>
        ) : null}

        {/* Preview del enlace (tarjeta rica) */}
        {noticia.preview && noticia.enlaceUrl && (
          <a
            href={noticia.enlaceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-3 flex flex-col overflow-hidden rounded-xl border border-[#E4E9F1] bg-[#F8FAFD] transition hover:border-[#008FD5] dark:border-white/10 dark:bg-white/5 sm:flex-row"
          >
            {noticia.preview.imagen && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={noticia.preview.imagen} alt="" className="h-40 w-full object-cover sm:h-auto sm:w-48 sm:shrink-0" />
            )}
            <div className="min-w-0 p-3.5">
              <p className="mb-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-[#008FD5]">
                <ExternalLink size={11} /> {noticia.preview.dominio}
              </p>
              {noticia.preview.titulo && (
                <p className="mb-1 line-clamp-2 font-bold text-[#0b1437] dark:text-white">{noticia.preview.titulo}</p>
              )}
              {noticia.preview.descripcion && (
                <p className="line-clamp-2 text-sm text-[#6B7B96] dark:text-white/60">{noticia.preview.descripcion}</p>
              )}
            </div>
          </a>
        )}

        {/* Enlace sin preview (fallback) */}
        {noticia.enlaceUrl && !noticia.preview && (
          <a
            href={noticia.enlaceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-3 inline-flex max-w-full items-center gap-1.5 truncate rounded-lg bg-[#008FD5]/10 px-3 py-1.5 text-sm font-semibold text-[#008FD5] hover:underline"
          >
            <ExternalLink size={14} className="shrink-0" /> <span className="truncate">{noticia.enlaceUrl}</span>
          </a>
        )}

        {/* Botón "Saber más" cuando la noticia tiene enlace */}
        {noticia.enlaceUrl && (
          <a
            href={noticia.enlaceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group mb-3 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white shadow-md transition hover:brightness-110"
            style={{ background: "linear-gradient(135deg,#008FD5,#20BEC6)" }}
          >
            Saber más
            <ArrowUpRight size={17} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        )}

        {/* Barra de acciones */}
        <div className="mt-1 flex items-center gap-2">
          <button
            type="button"
            onClick={votar}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-bold transition ${
              votada
                ? "border-transparent bg-[#662D91] text-white"
                : "border-[#E4E9F1] text-[#4C5E7C] hover:border-[#662D91] hover:text-[#662D91] dark:border-white/15 dark:text-white/70"
            }`}
          >
            <ThumbsUp size={16} className={votada ? "fill-white" : ""} /> {votos}
          </button>

          <button
            type="button"
            onClick={() => setVerComentarios((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#E4E9F1] px-3 py-1.5 text-sm font-bold text-[#4C5E7C] transition hover:border-[#008FD5] hover:text-[#008FD5] dark:border-white/15 dark:text-white/70"
          >
            <MessageCircle size={16} /> {comentarios}
          </button>
        </div>
      </div>

      {verComentarios && (
        <ComentariosNoticia idNoticia={noticia.id} sesion={sesion} onCambioConteo={setComentarios} />
      )}
    </article>
  );
}
