"use client";

import { useEffect, useState } from "react";
import { Loader2, Send, Trash2, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import {
  type ComentarioDTO,
  type SesionUsuario,
  inicial,
  tiempoRelativo,
  etiquetaRol,
  puedeModerar,
} from "@/lib/noticias";
import { confirmarEliminacion, alertaError } from "@/lib/sweetalert-admin";

function Avatar({ nombre, url, size = 32 }: { nombre: string; url: string | null; size?: number }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={nombre} width={size} height={size} className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />;
  }
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full text-xs font-black text-white"
      style={{ width: size, height: size, background: "linear-gradient(135deg,#662D91,#EC008C)" }}
      aria-hidden
    >
      {inicial(nombre)}
    </span>
  );
}

// Un comentario individual (raíz o respuesta). Muestra autor, texto y acciones.
function Burbuja({
  comentario,
  sesion,
  onResponder,
  onEliminar,
  size = 32,
}: {
  comentario: ComentarioDTO;
  sesion: SesionUsuario | null;
  onResponder: (mencion: string) => void;
  onEliminar: () => void;
  size?: number;
}) {
  const puedeBorrar = sesion && (sesion.id === comentario.autor.id || puedeModerar(sesion.rol));
  return (
    <div className="flex gap-2.5">
      <Avatar nombre={comentario.autor.nombre} url={comentario.autor.avatarUrl} size={size} />
      <div className="min-w-0 flex-1">
        <div className="rounded-2xl bg-[#F4F6FB] px-3.5 py-2.5 dark:bg-white/5">
          <div className="mb-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-sm font-bold text-[#0b1437] dark:text-white">{comentario.autor.nombre}</span>
            <span className="rounded-full bg-[#662D91]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#662D91] dark:bg-purple-400/15 dark:text-purple-300">
              {etiquetaRol(comentario.autor.rol)}
            </span>
            <span className="text-[11px] text-[#8A97AB] dark:text-white/40">{tiempoRelativo(comentario.creado)}</span>
          </div>
          <p className="whitespace-pre-wrap break-words text-sm text-[#28374F] dark:text-white/80">{comentario.texto}</p>
        </div>
        <div className="mt-1 flex items-center gap-3 pl-1">
          {sesion && (
            <button
              type="button"
              onClick={() => onResponder(`@${comentario.autor.nombre} `)}
              className="text-xs font-semibold text-[#6B7B96] transition hover:text-[#662D91] dark:text-white/50"
            >
              Responder
            </button>
          )}
          {puedeBorrar && (
            <button
              type="button"
              onClick={onEliminar}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#8A97AB] transition hover:text-[#EC008C] dark:text-white/40"
            >
              <Trash2 size={12} /> Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Caja de texto reutilizable para escribir un comentario o respuesta.
function CajaEscribir({
  sesion,
  valorInicial = "",
  autoFocus = false,
  placeholder,
  onEnviar,
  onCancelar,
  size = 32,
}: {
  sesion: SesionUsuario;
  valorInicial?: string;
  autoFocus?: boolean;
  placeholder: string;
  onEnviar: (texto: string) => Promise<void>;
  onCancelar?: () => void;
  size?: number;
}) {
  const [texto, setTexto] = useState(valorInicial);
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    if (!texto.trim() || enviando) return;
    setEnviando(true);
    try {
      await onEnviar(texto.trim());
      setTexto("");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex gap-2.5">
      <Avatar nombre={sesion.nombre} url={sesion.image_url} size={size} />
      <div className="flex flex-1 flex-col gap-2">
        <input
          autoFocus={autoFocus}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") enviar();
            if (e.key === "Escape") onCancelar?.();
          }}
          placeholder={placeholder}
          className="w-full rounded-xl border border-[#E4E9F1] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#662D91] dark:border-white/10 dark:bg-white/5 dark:text-white"
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={enviar}
            disabled={enviando || !texto.trim()}
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#662D91,#EC008C)" }}
          >
            {enviando ? <Loader2 size={15} className="animate-spin" /> : <Send size={14} />}
            Comentar
          </button>
          {onCancelar && (
            <button
              type="button"
              onClick={onCancelar}
              className="rounded-xl px-3 py-2 text-sm font-semibold text-[#6B7B96] transition hover:bg-[#F4F6FB] dark:text-white/60 dark:hover:bg-white/10"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Un hilo raíz: el comentario, su caja de respuesta y sus respuestas colapsables.
function Hilo({
  raiz,
  sesion,
  onResponder,
  onEliminar,
}: {
  raiz: ComentarioDTO;
  sesion: SesionUsuario | null;
  onResponder: (rootId: string, texto: string) => Promise<void>;
  onEliminar: (id: string, rootId: string | null) => void;
}) {
  const respuestas = raiz.respuestas ?? [];
  const [mostrarRespuestas, setMostrarRespuestas] = useState(false);
  const [respondiendo, setRespondiendo] = useState(false);
  const [mencion, setMencion] = useState("");

  function abrirRespuesta(m: string) {
    setMencion(m);
    setRespondiendo(true);
  }

  return (
    <div className="flex flex-col gap-2">
      <Burbuja
        comentario={raiz}
        sesion={sesion}
        onResponder={abrirRespuesta}
        onEliminar={() => onEliminar(raiz.id, null)}
      />

      {/* Caja para responder a este hilo */}
      {respondiendo && sesion && (
        <div className="pl-10">
          <CajaEscribir
            sesion={sesion}
            valorInicial={mencion}
            autoFocus
            size={28}
            placeholder="Escribí tu respuesta..."
            onEnviar={async (t) => {
              await onResponder(raiz.id, t);
              setRespondiendo(false);
              setMostrarRespuestas(true);
            }}
            onCancelar={() => setRespondiendo(false)}
          />
        </div>
      )}

      {/* Toggle "Ver N respuestas" */}
      {respuestas.length > 0 && (
        <button
          type="button"
          onClick={() => setMostrarRespuestas((v) => !v)}
          className="ml-10 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold text-[#662D91] transition hover:bg-[#662D91]/10 dark:text-purple-300"
        >
          {mostrarRespuestas ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          {respuestas.length} {respuestas.length === 1 ? "respuesta" : "respuestas"}
        </button>
      )}

      {/* Respuestas (hilo plano) */}
      {mostrarRespuestas && respuestas.length > 0 && (
        <div className="ml-10 flex flex-col gap-3 border-l-2 border-[#E4E9F1] pl-3 dark:border-white/10">
          {respuestas.map((r) => (
            <Burbuja
              key={r.id}
              comentario={r}
              sesion={sesion}
              size={28}
              onResponder={abrirRespuesta}
              onEliminar={() => onEliminar(r.id, raiz.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ComentariosNoticia({
  idNoticia,
  sesion,
  onCambioConteo,
}: {
  idNoticia: string;
  sesion: SesionUsuario | null;
  onCambioConteo?: (total: number) => void;
}) {
  const [comentarios, setComentarios] = useState<ComentarioDTO[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);

  async function cargar(cursorArg?: string) {
    const url = cursorArg
      ? `/api/noticias/${idNoticia}/comentarios?cursor=${encodeURIComponent(cursorArg)}`
      : `/api/noticias/${idNoticia}/comentarios`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("No se pudieron cargar los comentarios");
    return (await res.json()) as { comentarios: ComentarioDTO[]; siguienteCursor: string | null; total: number };
  }

  // Carga inicial.
  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const data = await cargar();
        if (!vivo) return;
        setComentarios(data.comentarios);
        setCursor(data.siguienteCursor);
        setTotal(data.total);
        onCambioConteo?.(data.total);
      } catch {
        /* silencioso en la carga inicial */
      } finally {
        if (vivo) setCargando(false);
      }
    })();
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idNoticia]);

  async function verMas() {
    if (!cursor || cargandoMas) return;
    setCargandoMas(true);
    try {
      const data = await cargar(cursor);
      setComentarios((prev) => [...prev, ...data.comentarios]);
      setCursor(data.siguienteCursor);
      setTotal(data.total);
    } catch {
      alertaError("No se pudieron cargar más comentarios. Revisá tu conexión.");
    } finally {
      setCargandoMas(false);
    }
  }

  // Publica un comentario raíz (idPadre undefined) o una respuesta (idPadre = raíz).
  async function publicar(texto: string, idPadre?: string) {
    try {
      const res = await fetch(`/api/noticias/${idNoticia}/comentarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto, idPadre }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alertaError(data?.error ?? "No se pudo publicar el comentario.");
        return;
      }
      const { comentario } = (await res.json()) as { comentario: ComentarioDTO };
      setTotal((t) => {
        const next = t + 1;
        onCambioConteo?.(next);
        return next;
      });
      if (!comentario.idPadre) {
        // Comentario raíz nuevo: va al principio.
        setComentarios((prev) => [{ ...comentario, respuestas: [] }, ...prev]);
      } else {
        // Respuesta: se cuelga de su raíz (el server la ata a la raíz del hilo).
        const rootId = comentario.idPadre;
        setComentarios((prev) =>
          prev.map((c) =>
            c.id === rootId ? { ...c, respuestas: [...(c.respuestas ?? []), comentario] } : c,
          ),
        );
      }
    } catch {
      alertaError("No se pudo publicar el comentario. Revisá tu conexión e intentá de nuevo.");
    }
  }

  async function eliminar(id: string, rootId: string | null) {
    const ok = await confirmarEliminacion({
      titulo: "¿Eliminar comentario?",
      texto: "Esta acción no se puede deshacer.",
    });
    if (!ok) return;
    try {
      const res = await fetch(`/api/noticias/comentarios/${id}`, { method: "DELETE" });
      if (!res.ok) {
        alertaError("No se pudo eliminar el comentario.");
        return;
      }
      if (rootId === null) {
        // Raíz: se elimina el hilo completo (sus respuestas caen en cascada en la DB).
        setComentarios((prev) => {
          const raiz = prev.find((c) => c.id === id);
          const borrados = 1 + (raiz?.respuestas?.length ?? 0);
          setTotal((t) => {
            const next = Math.max(0, t - borrados);
            onCambioConteo?.(next);
            return next;
          });
          return prev.filter((c) => c.id !== id);
        });
      } else {
        setComentarios((prev) =>
          prev.map((c) =>
            c.id === rootId ? { ...c, respuestas: (c.respuestas ?? []).filter((r) => r.id !== id) } : c,
          ),
        );
        setTotal((t) => {
          const next = Math.max(0, t - 1);
          onCambioConteo?.(next);
          return next;
        });
      }
    } catch {
      alertaError("No se pudo eliminar el comentario. Revisá tu conexión.");
    }
  }

  return (
    <div className="border-t border-[#E4E9F1] px-4 py-4 dark:border-white/10 sm:px-5">
      {/* Encabezado con total */}
      <p className="mb-4 flex items-center gap-1.5 text-sm font-bold text-[#0b1437] dark:text-white">
        <MessageCircle size={16} className="text-[#662D91]" />
        {total} {total === 1 ? "comentario" : "comentarios"}
      </p>

      {/* Caja para comentar (raíz) */}
      {sesion ? (
        <div className="mb-5">
          <CajaEscribir sesion={sesion} placeholder="Sumá un comentario..." onEnviar={(t) => publicar(t)} />
        </div>
      ) : (
        <p className="mb-5 rounded-xl bg-[#F4F6FB] px-4 py-3 text-sm text-[#6B7B96] dark:bg-white/5 dark:text-white/60">
          Iniciá sesión para comentar.
        </p>
      )}

      {cargando ? (
        <div className="flex items-center gap-2 py-4 text-sm text-[#6B7B96]">
          <Loader2 size={16} className="animate-spin" /> Cargando comentarios...
        </div>
      ) : comentarios.length === 0 ? (
        <p className="py-2 text-sm text-[#8A97AB] dark:text-white/40">Todavía no hay comentarios. Sé el primero.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {comentarios.map((c) => (
            <Hilo key={c.id} raiz={c} sesion={sesion} onResponder={publicar} onEliminar={eliminar} />
          ))}

          {cursor && (
            <button
              type="button"
              onClick={verMas}
              disabled={cargandoMas}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-[#E4E9F1] px-4 py-2 text-sm font-bold text-[#662D91] transition hover:bg-[#662D91]/10 disabled:opacity-60 dark:border-white/15 dark:text-purple-300"
            >
              {cargandoMas ? <Loader2 size={15} className="animate-spin" /> : <ChevronDown size={16} />}
              Ver más comentarios
            </button>
          )}
        </div>
      )}
    </div>
  );
}
