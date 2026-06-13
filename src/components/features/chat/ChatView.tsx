"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconArrowLeft, IconMail, IconSearch } from "@/components/ui/icons";

interface Conversacion {
  id: string;
  otro: { nombre: string; fotoUrl: string | null };
  proyectoTitulo: string | null;
  ultimoMensaje: { texto: string; creado: string } | null;
  noLeidos: number;
  estadoVirtual?: "online" | "busy" | "offline" | undefined;
  esSolicitud?: boolean | undefined;
  solicitudId?: string | undefined;
  mensajeSolicitud?: string | undefined;
  empresa?: string | undefined;
}

interface Mensaje {
  id: string;
  mio: boolean;
  contenido: string | null;
  documentUrl: string | null;
  leido: boolean;
  creado: string;
}

interface Detalle {
  id: string;
  otro: { nombre: string; fotoUrl: string | null; empresa?: string | undefined };
  mensajes: Mensaje[];
  estadoVirtual?: "online" | "busy" | "offline" | undefined;
  esSolicitud?: boolean | undefined;
  solicitudId?: string | undefined;
  mensajeSolicitud?: string | undefined;
  proyectoTitulo?: string | null | undefined;
}

interface SolicitudDTO {
  id: string;
  asunto: string;
  mensaje: string;
  estado: string;
  creado: string;
  empresario: { nombre: string; fotoUrl: string | null; sector: string | null };
  proyecto: { id: string; titulo: string } | null;
}

const POLL_LISTA = 10_000;
const POLL_CHAT = 5_000;

function hora(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit" });
}

// Icons Mocks
interface IconProps { width?: number | string; height?: number | string; className?: string; }
const IconPaperclip = ({ width = 20, height = 20, className }: IconProps) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
);
const IconSmile = ({ width = 20, height = 20, className }: IconProps) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" x2="9.01" y1="9" y2="9" /><line x1="15" x2="15.01" y1="9" y2="9" /></svg>
);
const IconSend = ({ width = 20, height = 20, className }: IconProps) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="22" x2="11" y1="2" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
);

function Avatar({ nombre, fotoUrl, size = 44, estado }: { nombre: string; fotoUrl: string | null; size?: number, estado?: string | undefined }) {
  const estadoColor = estado === "online" ? "bg-fwd-turquesa" : estado === "busy" ? "bg-fwd-naranja" : "bg-gray-400";
  return (
    <div className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      {fotoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={fotoUrl} alt={nombre} className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />
      ) : (
        <span
          className="grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-fwd-azul to-fwd-morado font-bold text-white shadow-sm"
          style={{ width: size, height: size }}
        >
          {nombre.charAt(0)}
        </span>
      )}
      {estado && (
        <span className={`absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full border-2 border-white ${estadoColor}`}></span>
      )}
    </div>
  );
}

export default function ChatView() {
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [fase, setFase] = useState<"loading" | "ready" | "error">("loading");
  const [activoId, setActivoId] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<Detalle | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [escribiendo, setEscribiendo] = useState(false);
  const [respondiendo, setRespondiendo] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);

  const [mostrarModalBusqueda, setMostrarModalBusqueda] = useState(false);
  const [queryBusqueda, setQueryBusqueda] = useState("");
  const [resultadosEstudiantes, setResultadosEstudiantes] = useState<{id: string, nombre: string, fotoUrl: string | null}[]>([]);
  const [buscandoEstudiantes, setBuscandoEstudiantes] = useState(false);

  const mapVirtualState = (id: string, idx: number) => {
    const states: ("online" | "busy" | "offline")[] = ["online", "busy", "offline"];
    return states[idx % 3];
  };

  const cargarConversaciones = useCallback(async () => {
    try {
      const [resChats, resSoli] = await Promise.all([
        fetch("/api/chats", { cache: "no-store" }),
        fetch("/api/solicitudes", { cache: "no-store" })
      ]);
      
      if (!resChats.ok || !resSoli.ok) {
        setFase("error");
        return;
      }
      
      const dataChats: { conversaciones: Conversacion[] } = await resChats.json();
      const dataSoli: { solicitudes: SolicitudDTO[] } = await resSoli.json();
      
      const pendientes = dataSoli.solicitudes.filter(s => s.estado === 'pendiente');
      
      const convosSolicitudes: Conversacion[] = pendientes.map(s => ({
        id: `solicitud_${s.id}`,
        otro: { nombre: s.empresario.nombre, fotoUrl: s.empresario.fotoUrl },
        proyectoTitulo: s.proyecto?.titulo || null,
        ultimoMensaje: { texto: s.asunto || "Nueva solicitud de contacto", creado: s.creado },
        noLeidos: 1,
        esSolicitud: true,
        solicitudId: s.id,
        mensajeSolicitud: s.mensaje,
        empresa: s.empresario.sector || "Empresa"
      }));

      const combinadas = [...convosSolicitudes, ...dataChats.conversaciones].map((c, idx) => ({
        ...c,
        estadoVirtual: mapVirtualState(c.id, idx),
      }));

      setConversaciones(combinadas);
      setFase("ready");
    } catch {
      setFase("error");
    }
  }, []);

  const cargarDetalle = useCallback(async (id: string) => {
    if (id.startsWith("solicitud_")) {
      return; // No se fetchean mensajes para solicitudes pendientes
    }
    
    try {
      const res = await fetch(`/api/chats/${id}/mensajes`, { cache: "no-store" });
      if (!res.ok) return;
      const data: Detalle = await res.json();
      
      setDetalle(prev => {
        return {
          ...data,
          estadoVirtual: prev?.estadoVirtual || "online",
          esSolicitud: false,
          proyectoTitulo: prev?.proyectoTitulo
        };
      });
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    cargarConversaciones();
    const t = setInterval(cargarConversaciones, POLL_LISTA);
    return () => clearInterval(t);
  }, [cargarConversaciones]);

  useEffect(() => {
    if (!activoId || activoId.startsWith("solicitud_")) return;
    cargarDetalle(activoId);
    const t = setInterval(() => cargarDetalle(activoId), POLL_CHAT);
    return () => clearInterval(t);
  }, [activoId, cargarDetalle]);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [detalle?.mensajes?.length, activoId]);

  useEffect(() => {
    if (queryBusqueda.length < 2) {
      setResultadosEstudiantes([]);
      return;
    }
    const t = setTimeout(async () => {
      setBuscandoEstudiantes(true);
      try {
        const res = await fetch(`/api/estudiantes/buscar?q=${encodeURIComponent(queryBusqueda)}`);
        if (res.ok) {
          const data = await res.json();
          setResultadosEstudiantes(data.estudiantes || []);
        }
      } finally {
        setBuscandoEstudiantes(false);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [queryBusqueda]);

  async function iniciarChatEstudiante(idDestino: string) {
    try {
      const res = await fetch("/api/chats/estudiantes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idEstudianteDestino: idDestino })
      });
      if (res.ok) {
        const data = await res.json();
        setMostrarModalBusqueda(false);
        setQueryBusqueda("");
        await cargarConversaciones();
        seleccionar(data.id);
      }
    } catch {}
  }

  async function enviar() {
    const contenido = texto.trim();
    if (!contenido || !activoId || enviando || activoId.startsWith("solicitud_")) return;
    setEnviando(true);
    setTexto("");
    try {
      const res = await fetch(`/api/chats/${activoId}/mensajes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contenido }),
      });
      if (res.ok) {
        const data: { mensaje: Mensaje } = await res.json();
        setDetalle((prev) => (prev ? { ...prev, mensajes: [...prev.mensajes, data.mensaje] } : prev));
        cargarConversaciones();
      }
    } catch {
      /* noop */
    } finally {
      setEnviando(false);
    }
  }

  function seleccionar(id: string) {
    setActivoId(id);
    
    const convo = conversaciones.find(c => c.id === id);
    if (convo) {
      setDetalle({
        id: convo.id,
        otro: { ...convo.otro, empresa: convo.empresa },
        mensajes: [],
        estadoVirtual: convo.estadoVirtual,
        esSolicitud: convo.esSolicitud,
        solicitudId: convo.solicitudId,
        mensajeSolicitud: convo.mensajeSolicitud,
        proyectoTitulo: convo.proyectoTitulo
      });
    } else {
      setDetalle(null);
    }
    
    setConversaciones((prev) => prev.map((c) => (c.id === id ? { ...c, noLeidos: 0 } : c)));
  }

  async function responderSoli(accion: "aceptar" | "rechazar") {
    if (!detalle?.solicitudId) return;
    setRespondiendo(true);
    try {
      const res = await fetch(`/api/solicitudes/${detalle.solicitudId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion }),
      });
      if (res.ok) {
        setActivoId(null);
        await cargarConversaciones();
      }
    } catch {
      /* noop */
    } finally {
      setRespondiendo(false);
    }
  }

  const visibles = conversaciones.filter((c) =>
    c.otro.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()),
  );

  return (
    <div className="glass flex h-[calc(100vh-6rem)] w-full overflow-hidden rounded-[24px] shadow-xl md:flex-row flex-col bg-white/80">
      
      {/* Panel izquierdo: lista */}
      <div
        className={`flex w-full flex-col border-r border-border/50 bg-white/60 backdrop-blur-md md:w-[340px] md:min-w-[340px] ${activoId ? "hidden md:flex" : "flex"}`}
      >
        <div className="bg-gradient-to-r from-fwd-azul to-fwd-morado p-5 text-white shadow-md">
          <div className="flex justify-between items-center">
            <h1 className="font-display text-xl font-bold tracking-wide">Mensajes</h1>
            <button 
              onClick={() => setMostrarModalBusqueda(true)}
              className="bg-white/20 hover:bg-white/30 p-1.5 rounded-full transition-colors"
              title="Nuevo chat con estudiante"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white/20 px-4 py-2 backdrop-blur-sm transition-all focus-within:bg-white/30">
            <IconSearch width={18} height={18} className="text-white/80" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar conversación…"
              className="h-8 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/60"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
          {fase === "loading" && (
            <div className="flex flex-col gap-3 p-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                    <div className="h-3 w-40 animate-pulse rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {fase === "ready" && visibles.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
              <div className="relative">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-fwd-azul/10 text-fwd-azul">
                  <IconMail width={28} height={28} />
                </span>
                <span className="absolute -bottom-1 -right-1 block h-5 w-5 rounded-full border-2 border-white bg-fwd-turquesa"></span>
              </div>
              <div>
                <p className="font-display text-lg font-bold text-slate-800">No tienes conversaciones activas.</p>
                <p className="mt-1 text-sm text-slate-500">
                  Las solicitudes de contacto aparecerán aquí.<br/>Empieza a conectar con nuevos talentos.
                </p>
              </div>
            </div>
          )}
          {visibles.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => seleccionar(c.id)}
              className={`group relative mb-1 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-300 hover:bg-[#EAF6FF] ${
                activoId === c.id ? "bg-[#EAF6FF] shadow-sm" : ""
              }`}
            >
              <Avatar nombre={c.otro.nombre} fotoUrl={c.otro.fotoUrl} estado={c.estadoVirtual} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-bold text-slate-800 group-hover:text-fwd-azul transition-colors">{c.otro.nombre}</p>
                  {c.ultimoMensaje && (
                    <span className={`shrink-0 text-[11px] ${c.noLeidos > 0 ? "font-bold text-fwd-azul" : "text-slate-400"}`}>{hora(c.ultimoMensaje.creado)}</span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className={`truncate text-sm ${c.noLeidos > 0 ? "font-semibold text-slate-700" : "text-slate-500"}`}>
                    {c.esSolicitud ? "Nueva solicitud de contacto" : (c.ultimoMensaje?.texto || "Conversación iniciada")}
                  </p>
                  {c.noLeidos > 0 && (
                    <span className="grid h-5 min-w-[20px] shrink-0 place-items-center rounded-full bg-gradient-to-r from-fwd-morado to-fwd-magenta px-1.5 text-[10px] font-bold text-white shadow-sm">
                      {c.noLeidos}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Panel derecho: conversación activa */}
      <div className={`flex min-h-0 flex-1 flex-col bg-slate-50/50 ${activoId ? "flex" : "hidden md:flex"}`}>
        {!activoId || !detalle ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 p-8 text-center animate-in fade-in zoom-in duration-500">
            <div className="relative">
              <span className="grid h-24 w-24 place-items-center rounded-full bg-gradient-to-tr from-fwd-azul to-fwd-turquesa text-white shadow-lg shadow-fwd-azul/20">
                <IconMail width={40} height={40} />
              </span>
            </div>
            <div className="space-y-2">
              <p className="font-display text-2xl font-bold bg-gradient-to-r from-fwd-azul to-fwd-morado bg-clip-text text-transparent">Centro de Mensajes</p>
              <p className="max-w-xs text-slate-500">
                Selecciona una conversación para empezar a chatear o revisa tus solicitudes de conexión.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header Conversación */}
            <div className="flex items-center gap-4 bg-gradient-to-r from-fwd-azul to-fwd-morado p-4 text-white shadow-md z-10 shrink-0">
              <button
                type="button"
                onClick={() => setActivoId(null)}
                className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20 md:hidden"
                aria-label="Volver"
              >
                <IconArrowLeft width={20} height={20} />
              </button>
              <Avatar nombre={detalle.otro.nombre} fotoUrl={detalle.otro.fotoUrl} size={48} estado={detalle.estadoVirtual} />
              <div className="flex flex-col">
                <p className="font-display text-lg font-bold leading-tight">{detalle.otro.nombre}</p>
                <div className="flex items-center gap-1.5 text-xs text-white/80">
                  <span className="font-medium">Empresario</span>
                  <span>•</span>
                  <span>{detalle.estadoVirtual === "online" ? "En línea" : detalle.estadoVirtual === "busy" ? "Ocupado" : "Desconectado"}</span>
                </div>
              </div>
            </div>

            {/* Mensajes Area */}
            <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              
              {/* Solicitud de Mensaje (Real Backend Integration) */}
              {detalle.esSolicitud && (
                <div className="mx-auto max-w-md animate-in slide-in-from-bottom-4 fade-in duration-500">
                  <div className="rounded-3xl bg-white p-6 shadow-xl shadow-fwd-morado/5 ring-1 ring-border/50">
                    <div className="mb-4 flex items-center gap-4">
                      <Avatar nombre={detalle.otro.nombre} fotoUrl={detalle.otro.fotoUrl} size={56} />
                      <div>
                        <h3 className="font-display font-bold text-slate-800">{detalle.otro.nombre}</h3>
                        <p className="text-sm text-fwd-azul">{detalle.otro.empresa || "Empresa Confidencial"}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Te ha enviado una solicitud</p>
                      </div>
                    </div>
                    {detalle.proyectoTitulo && (
                      <div className="mb-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                        <span className="font-bold">Interesado en proyecto: </span> {detalle.proyectoTitulo}
                      </div>
                    )}
                    <p className="text-sm text-slate-600 mb-6 italic">
                      &quot;{detalle.mensajeSolicitud || "Hola, he visto tu perfil y creo que encajarías perfecto en nuestro equipo. ¿Podemos hablar?"}&quot;
                    </p>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => responderSoli('aceptar')} 
                        disabled={respondiendo}
                        className="flex-1 rounded-xl bg-gradient-to-r from-fwd-turquesa to-fwd-azul py-2.5 text-sm font-bold text-white shadow-md shadow-fwd-azul/20 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                      >
                        Aceptar
                      </button>
                      <button 
                        onClick={() => responderSoli('rechazar')} 
                        disabled={respondiendo}
                        className="flex-1 rounded-xl bg-gradient-to-r from-fwd-naranja to-fwd-amarillo py-2.5 text-sm font-bold text-white shadow-md shadow-fwd-naranja/20 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {!detalle.esSolicitud && detalle.mensajes.map((m, i) => (
                <div key={m.id} className={`flex w-full animate-in slide-in-from-bottom-2 fade-in duration-300 ${m.mio ? "justify-start" : "justify-end"}`} style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}>
                  <div
                    className={`relative max-w-[85%] md:max-w-[70%] rounded-[20px] px-4 py-3 shadow-md ${
                      m.mio
                        ? "rounded-bl-sm border-l-4 border-fwd-turquesa bg-white text-slate-800"
                        : "rounded-br-sm bg-gradient-to-r from-fwd-azul to-fwd-morado text-white"
                    }`}
                  >
                    {m.contenido && <p className="whitespace-pre-line leading-relaxed text-[15px]">{m.contenido}</p>}
                    <div className={`mt-1.5 flex items-center justify-end gap-1 text-[11px] font-medium ${m.mio ? "text-slate-400" : "text-white/70"}`}>
                      {hora(m.creado)}
                      {m.mio && m.leido && (
                        <span className="text-fwd-turquesa ml-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/></svg></span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {escribiendo && (
                <div className="flex w-full justify-end animate-in fade-in">
                  <div className="rounded-[20px] rounded-br-sm bg-gradient-to-r from-fwd-azul to-fwd-morado px-4 py-3 text-white shadow-md">
                    <div className="flex gap-1.5 items-center h-4">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={finRef} className="h-2" />
            </div>

            {/* Input Area */}
            {!detalle.esSolicitud && (
              <div className="bg-white p-4 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] z-10 relative">
                <div className="flex items-end gap-2 max-w-4xl mx-auto relative">
                  <div className="flex-1 bg-slate-50 border border-border/60 rounded-[20px] p-2 flex items-end gap-2 focus-within:ring-2 focus-within:ring-fwd-turquesa/30 focus-within:border-fwd-turquesa transition-all shadow-inner">
                    <button className="p-2 text-slate-400 hover:text-fwd-azul transition-colors rounded-full hover:bg-slate-200/50 shrink-0">
                      <IconPaperclip width={22} height={22} />
                    </button>
                    <textarea
                      rows={1}
                      value={texto}
                      onChange={(e) => {
                        setTexto(e.target.value);
                        if (e.target.value && !escribiendo && Math.random() > 0.7) {
                          setEscribiendo(true);
                          setTimeout(() => setEscribiendo(false), 2000);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          enviar();
                        }
                      }}
                      placeholder="Escribe un mensaje..."
                      className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent py-2 text-[15px] text-slate-700 outline-none placeholder:text-slate-400"
                    />
                    <button className="p-2 text-slate-400 hover:text-fwd-azul transition-colors rounded-full hover:bg-slate-200/50 shrink-0">
                      <IconSmile width={22} height={22} />
                    </button>
                  </div>
                  
                  <button
                    type="button"
                    onClick={enviar}
                    disabled={!texto.trim() || enviando}
                    className="grid h-[56px] w-[56px] shrink-0 place-items-center rounded-full bg-gradient-to-r from-fwd-turquesa to-fwd-azul text-white shadow-lg shadow-fwd-azul/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 group"
                  >
                    <IconSend width={24} height={24} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Búsqueda Estudiantes */}
      {mostrarModalBusqueda && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-fwd-azul to-fwd-morado text-white">
              <h2 className="font-display font-bold text-lg">Buscar Estudiantes</h2>
              <button onClick={() => setMostrarModalBusqueda(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="p-5">
              <div className="relative mb-4">
                <IconSearch width={18} height={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  autoFocus
                  value={queryBusqueda}
                  onChange={(e) => setQueryBusqueda(e.target.value)}
                  placeholder="Escribe el nombre de un estudiante..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-fwd-turquesa focus:ring-1 focus:ring-fwd-turquesa transition-all"
                />
              </div>
              
              <div className="max-h-64 overflow-y-auto space-y-1">
                {buscandoEstudiantes && <p className="text-center text-sm text-slate-500 py-4">Buscando...</p>}
                {!buscandoEstudiantes && queryBusqueda.length >= 2 && resultadosEstudiantes.length === 0 && (
                  <p className="text-center text-sm text-slate-500 py-4">No se encontraron estudiantes.</p>
                )}
                {!buscandoEstudiantes && resultadosEstudiantes.map(est => (
                  <button
                    key={est.id}
                    onClick={() => iniciarChatEstudiante(est.id)}
                    className="flex items-center gap-3 w-full p-2.5 hover:bg-slate-50 rounded-xl transition-colors text-left"
                  >
                    <Avatar nombre={est.nombre} fotoUrl={est.fotoUrl} size={40} />
                    <span className="font-medium text-slate-700">{est.nombre}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
