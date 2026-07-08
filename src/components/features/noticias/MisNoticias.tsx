"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  Plus,
  Loader2,
  Pencil,
  Trash2,
  ThumbsUp,
  MessageCircle,
  ExternalLink,
  Newspaper,
  ArrowUpRight,
} from "lucide-react";
import { type NoticiaDTO, tiempoRelativo, COLOR_CATEGORIA } from "@/lib/noticias";
import { confirmarEliminacion, alertaError, toastExito } from "@/lib/sweetalert-admin";
import PublicarNoticiaModal from "./PublicarNoticiaModal";

export default function MisNoticias({ titulo = "Mis noticias" }: { titulo?: string }) {
  const [noticias, setNoticias] = useState<NoticiaDTO[]>([]);
  const [cargando, setCargando] = useState(true);
  const [creando, setCreando] = useState(false);
  const [editando, setEditando] = useState<NoticiaDTO | null>(null);

  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const res = await fetch("/api/noticias/mias", { cache: "no-store" });
        if (res.ok && vivo) {
          const data = await res.json();
          setNoticias(data.noticias ?? []);
        }
      } catch {
        /* silencioso */
      } finally {
        if (vivo) setCargando(false);
      }
    })();
    return () => {
      vivo = false;
    };
  }, []);

  function onGuardada(n: NoticiaDTO, modo: "crear" | "editar") {
    if (modo === "crear") {
      setNoticias((prev) => [n, ...prev]);
      toastExito("Noticia publicada");
    } else {
      setNoticias((prev) => prev.map((x) => (x.id === n.id ? n : x)));
      toastExito("Noticia actualizada");
    }
    setCreando(false);
    setEditando(null);
  }

  async function eliminar(n: NoticiaDTO) {
    const ok = await confirmarEliminacion({
      titulo: "¿Eliminar esta noticia?",
      texto: "Se borrará junto con sus comentarios. Esta acción no se puede deshacer.",
    });
    if (!ok) return;
    try {
      const res = await fetch(`/api/noticias/${n.id}`, { method: "DELETE" });
      if (!res.ok) {
        alertaError("No se pudo eliminar la noticia.");
        return;
      }
      setNoticias((prev) => prev.filter((x) => x.id !== n.id));
      toastExito("Noticia eliminada");
    } catch {
      alertaError("No se pudo eliminar la noticia. Revisá tu conexión.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Encabezado + acciones */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-black text-[#0b1437] dark:text-white">{titulo}</h1>
          <p className="text-sm text-[#6B7B96] dark:text-white/60">
            Gestioná las noticias que publicaste: editalas o eliminalas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/noticias"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E4E9F1] px-3.5 py-2 text-sm font-bold text-[#4C5E7C] transition hover:border-[#662D91] hover:text-[#662D91] dark:border-white/15 dark:text-white/70"
          >
            <ArrowUpRight size={16} /> Ir al foro
          </Link>
          <button
            type="button"
            onClick={() => setCreando(true)}
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white shadow-lg transition hover:brightness-110"
            style={{ background: "linear-gradient(135deg,#662D91,#EC008C)" }}
          >
            <Plus size={17} /> Publicar noticia
          </button>
        </div>
      </div>

      {cargando ? (
        <div className="flex items-center gap-2 py-16 text-sm text-[#6B7B96]">
          <Loader2 size={20} className="animate-spin text-[#662D91]" /> Cargando tus noticias...
        </div>
      ) : noticias.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-[#C2CCDB] bg-white/60 py-14 text-center dark:border-white/15 dark:bg-white/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/imagenes/fordy/fordy-telescopio.png" alt="" aria-hidden className="h-20 w-auto opacity-90" />
          <div>
            <p className="font-display text-lg font-black text-[#0b1437] dark:text-white">Todavía no publicaste noticias</p>
            <p className="mt-1 text-sm text-[#6B7B96] dark:text-white/60">Compartí algo de tecnología con la comunidad.</p>
          </div>
          <button
            type="button"
            onClick={() => setCreando(true)}
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-lg transition hover:brightness-110"
            style={{ background: "linear-gradient(135deg,#662D91,#EC008C)" }}
          >
            <Plus size={17} /> Publicar noticia
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {noticias.map((n) => {
            const thumb = n.imagenUrl || n.preview?.imagen || null;
            const colorCat = n.categoria ? COLOR_CATEGORIA[n.categoria] ?? "#662D91" : "#662D91";
            return (
              <article
                key={n.id}
                className="flex gap-3 rounded-2xl border border-[#E4E9F1] bg-white p-3 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-[#0f172a]"
              >
                {/* Miniatura */}
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb} alt="" className="h-20 w-24 shrink-0 rounded-xl object-cover" />
                ) : (
                  <div className="grid h-20 w-24 shrink-0 place-items-center rounded-xl bg-[#F4F6FB] text-[#C2CCDB] dark:bg-white/5">
                    <Newspaper size={22} />
                  </div>
                )}

                {/* Contenido */}
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    {n.categoria && (
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: colorCat }}>
                        {n.categoria}
                      </span>
                    )}
                    {n.estado === "oculta" ? (
                      <span className="rounded-full bg-[#EC008C]/12 px-2 py-0.5 text-[10px] font-bold text-[#EC008C]">
                        Oculta por moderación
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#20BEC6]/15 px-2 py-0.5 text-[10px] font-bold text-[#0f8a90] dark:text-[#20BEC6]">
                        Publicada
                      </span>
                    )}
                    <span className="text-[11px] text-[#8A97AB] dark:text-white/40">{tiempoRelativo(n.creado)}</span>
                  </div>

                  <h3 className="truncate font-bold text-[#0b1437] dark:text-white">{n.titulo}</h3>
                  {n.texto && <p className="line-clamp-1 text-sm text-[#6B7B96] dark:text-white/55">{n.texto}</p>}

                  <div className="mt-auto flex items-center gap-3 pt-1.5 text-xs text-[#8A97AB] dark:text-white/40">
                    <span className="inline-flex items-center gap-1"><ThumbsUp size={13} /> {n.votos}</span>
                    <span className="inline-flex items-center gap-1"><MessageCircle size={13} /> {n.comentarios}</span>
                    {n.enlaceUrl && (
                      <span className="inline-flex items-center gap-1 truncate text-[#008FD5]">
                        <ExternalLink size={12} /> enlace
                      </span>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex shrink-0 flex-col items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditando(n)}
                    title="Editar"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#E4E9F1] px-3 py-1.5 text-xs font-bold text-[#4C5E7C] transition hover:border-[#662D91] hover:text-[#662D91] dark:border-white/15 dark:text-white/70"
                  >
                    <Pencil size={14} /> Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => eliminar(n)}
                    title="Eliminar"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#E4E9F1] px-3 py-1.5 text-xs font-bold text-[#8A97AB] transition hover:border-[#EC008C] hover:text-[#EC008C] dark:border-white/15"
                  >
                    <Trash2 size={14} /> Eliminar
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modales */}
      {creando && <PublicarNoticiaModal onCerrar={() => setCreando(false)} onGuardada={onGuardada} />}
      {editando && (
        <PublicarNoticiaModal noticia={editando} onCerrar={() => setEditando(null)} onGuardada={onGuardada} />
      )}
    </div>
  );
}
