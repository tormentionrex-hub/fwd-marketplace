"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Plus, Loader2, Clock, Flame, Newspaper, LogIn, X } from "lucide-react";
import {
  type NoticiaDTO,
  type SesionUsuario,
  CATEGORIAS_NOTICIA,
  COLOR_CATEGORIA,
} from "@/lib/noticias";
import NoticiaCard from "./NoticiaCard";
import PublicarNoticiaModal from "./PublicarNoticiaModal";

type Orden = "recientes" | "populares";

export default function ForoNoticias() {
  const searchParams = useSearchParams();

  const [sesion, setSesion] = useState<SesionUsuario | null>(null);
  const [orden, setOrden] = useState<Orden>("recientes");
  const [categoria, setCategoria] = useState<string>("");

  const [noticias, setNoticias] = useState<NoticiaDTO[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [pedirLogin, setPedirLogin] = useState(false);

  // Sesión (una vez).
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (res.ok) setSesion(await res.json());
      } catch {
        /* anónimo */
      }
    })();
  }, []);

  // Abrir el modal automáticamente si llegamos con ?publicar=1 (desde el sidebar).
  useEffect(() => {
    if (searchParams.get("publicar") === "1") setModalAbierto(true);
  }, [searchParams]);

  const cargarFeed = useCallback(async () => {
    setCargando(true);
    try {
      const params = new URLSearchParams({ orden });
      if (categoria) params.set("categoria", categoria);
      const res = await fetch(`/api/noticias?${params}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setNoticias(data.noticias);
        setCursor(data.siguienteCursor);
      }
    } finally {
      setCargando(false);
    }
  }, [orden, categoria]);

  useEffect(() => {
    cargarFeed();
  }, [cargarFeed]);

  async function cargarMas() {
    if (!cursor || cargandoMas) return;
    setCargandoMas(true);
    try {
      const params = new URLSearchParams({ orden, cursor });
      if (categoria) params.set("categoria", categoria);
      const res = await fetch(`/api/noticias?${params}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setNoticias((prev) => [...prev, ...data.noticias]);
        setCursor(data.siguienteCursor);
      }
    } finally {
      setCargandoMas(false);
    }
  }

  function alPublicar() {
    if (!sesion) {
      setPedirLogin(true);
      return;
    }
    setModalAbierto(true);
  }

  function onGuardada(n: NoticiaDTO, modo: "crear" | "editar") {
    setModalAbierto(false);
    if (modo === "crear") setNoticias((prev) => [n, ...prev]);
  }

  return (
    <section className="relative mx-auto w-full max-w-3xl px-4 pb-24 sm:px-6">
      {/* Barra de controles */}
      <div className="sticky top-[60px] z-20 -mx-4 mb-5 border-b border-[#E4E9F1] bg-white/85 px-4 py-3 backdrop-blur-md dark:border-white/10 dark:bg-[#0b1437]/85 sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          {/* Tabs de orden */}
          <div className="inline-flex rounded-xl bg-[#F4F6FB] p-1 dark:bg-white/5">
            <button
              type="button"
              onClick={() => setOrden("recientes")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold transition ${
                orden === "recientes" ? "bg-white text-[#662D91] shadow-sm dark:bg-white/10 dark:text-purple-300" : "text-[#6B7B96] dark:text-white/50"
              }`}
            >
              <Clock size={15} /> Recientes
            </button>
            <button
              type="button"
              onClick={() => setOrden("populares")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold transition ${
                orden === "populares" ? "bg-white text-[#EC008C] shadow-sm dark:bg-white/10 dark:text-pink-300" : "text-[#6B7B96] dark:text-white/50"
              }`}
            >
              <Flame size={15} /> Populares
            </button>
          </div>

          <button
            type="button"
            onClick={alPublicar}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white shadow-lg transition hover:brightness-110"
            style={{ background: "linear-gradient(135deg,#662D91,#EC008C)" }}
          >
            <Plus size={17} /> <span className="hidden sm:inline">Publicar noticia</span>
            <span className="sm:hidden">Publicar</span>
          </button>
        </div>

        {/* Filtro de categorías */}
        <div className="sidebar-scroll -mb-1 mt-3 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setCategoria("")}
            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition ${
              categoria === "" ? "border-[#662D91] bg-[#662D91] text-white" : "border-[#E4E9F1] text-[#6B7B96] hover:border-[#662D91] dark:border-white/15 dark:text-white/60"
            }`}
          >
            Todas
          </button>
          {CATEGORIAS_NOTICIA.map((c) => {
            const activa = categoria === c;
            const color = COLOR_CATEGORIA[c] ?? "#662D91";
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCategoria(activa ? "" : c)}
                className="shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition"
                style={
                  activa
                    ? { background: color, borderColor: color, color: "#fff" }
                    : { borderColor: "rgba(196,204,219,0.6)", color: "#6B7B96" }
                }
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feed */}
      {cargando ? (
        <div className="flex flex-col items-center gap-3 py-20 text-[#6B7B96]">
          <Loader2 size={28} className="animate-spin text-[#662D91]" />
          <p className="text-sm font-medium">Cargando el foro...</p>
        </div>
      ) : noticias.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-[#C2CCDB] bg-white/60 py-16 text-center dark:border-white/15 dark:bg-white/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/imagenes/fordy/fordy-telescopio.png" alt="" aria-hidden className="h-24 w-auto opacity-90" />
          <div>
            <p className="font-display text-lg font-black text-[#0b1437] dark:text-white">Todavía no hay noticias aquí</p>
            <p className="mt-1 text-sm text-[#6B7B96] dark:text-white/60">
              {categoria ? "Probá con otra categoría o sé el primero." : "Sé el primero en compartir algo de tecnología."}
            </p>
          </div>
          <button
            type="button"
            onClick={alPublicar}
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-lg transition hover:brightness-110"
            style={{ background: "linear-gradient(135deg,#662D91,#EC008C)" }}
          >
            <Plus size={17} /> Publicar noticia
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {noticias.map((n) => (
            <NoticiaCard
              key={n.id}
              noticia={n}
              sesion={sesion}
              onEliminada={(id) => setNoticias((prev) => prev.filter((x) => x.id !== id))}
              onPedirLogin={() => setPedirLogin(true)}
            />
          ))}

          {cursor && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={cargarMas}
                disabled={cargandoMas}
                className="inline-flex items-center gap-2 rounded-xl border border-[#E4E9F1] bg-white px-5 py-2.5 text-sm font-bold text-[#4C5E7C] transition hover:border-[#662D91] hover:text-[#662D91] disabled:opacity-60 dark:border-white/15 dark:bg-white/5 dark:text-white/70"
              >
                {cargandoMas ? <Loader2 size={16} className="animate-spin" /> : <Newspaper size={16} />}
                Cargar más
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal publicar */}
      {modalAbierto && <PublicarNoticiaModal onCerrar={() => setModalAbierto(false)} onGuardada={onGuardada} />}

      {/* Prompt de login para anónimos */}
      {pedirLogin && <PromptLogin onCerrar={() => setPedirLogin(false)} />}
    </section>
  );
}

function PromptLogin({ onCerrar }: { onCerrar: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b1437]/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}
    >
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl dark:bg-[#0f172a]">
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar"
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-[#6B7B96] transition hover:bg-[#F4F6FB] dark:hover:bg-white/10"
        >
          <X size={18} />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/imagenes/fordy/fordy-pulgar.png" alt="" aria-hidden className="mx-auto mb-3 h-20 w-auto" />
        <h3 className="font-display text-lg font-black text-[#0b1437] dark:text-white">Uní tu voz a la comunidad</h3>
        <p className="mt-1 text-sm text-[#6B7B96] dark:text-white/60">
          Iniciá sesión para publicar, votar y comentar noticias.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-lg transition hover:brightness-110"
          style={{ background: "linear-gradient(135deg,#662D91,#EC008C)" }}
        >
          <LogIn size={16} /> Iniciar sesión
        </Link>
      </div>
    </div>
  );
}
