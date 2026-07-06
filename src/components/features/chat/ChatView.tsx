"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconArrowLeft, IconMail, IconSearch } from "@/components/ui/icons";

interface Conversacion {
  id: string;
  otro: { id: string; nombre: string; fotoUrl: string | null };
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
  otro: { id: string; nombre: string; fotoUrl: string | null; empresa?: string | undefined };
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
  empresario: { id: string; nombre: string; fotoUrl: string | null; sector: string | null };
  proyecto: { id: string; titulo: string } | null;
}

const POLL_LISTA = 10_000;
const POLL_CHAT = 5_000;

function hora(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

// Icons Mocks
interface IconProps { width?: number | string; height?: number | string; className?: string; }
const IconPaperclip = ({ width = 20, height = 20, className }: IconProps) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
);
const IconSmile = ({ width = 20, height = 20, className }: IconProps) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" x2="9.01" y1="9" y2="9" /><line x1="15" x2="15.01" y1="9" y2="9" /></svg>
);

function Avatar({ nombre, fotoUrl, size = 44, estado, className }: { nombre: string; fotoUrl: string | null; size?: number, estado?: string | undefined, className?: string }) {
  const estadoColor = estado === "online" ? "bg-fwd-turquesa" : estado === "busy" ? "bg-fwd-naranja" : "bg-gray-400";
  return (
    <div className={`relative inline-block shrink-0 ${className || ""}`} style={{ width: size, height: size }}>
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

const obtenerListadoEmojis = () => {
  const emojis: string[] = [];
  const codePoints = [
    0x1F600, 0x1F601, 0x1F602, 0x1F603, 0x1F604, 0x1F605, 0x1F606, 0x1F609,
    0x1F60A, 0x1F60B, 0x1F60E, 0x1F60D, 0x1F618, 0x1F617, 0x1F619, 0x1F61A,
    0x1F641, 0x1F642, 0x1F643, 0x1F60F, 0x1F612, 0x1F61E, 0x1F614, 0x1F61F,
    0x1F622, 0x1F62D, 0x1F629, 0x1F62B, 0x1F621, 0x1F620, 0x1F632, 0x1F631,
    0x1F608, 0x1F44D, 0x1F44E, 0x1F44C, 0x1F44F, 0x1F64F, 0x1F525, 0x2728,
    0x1F4A9, 0x1F389, 0x1F4AC, 0x1F4A1, 0x1F4BB, 0x2705, 0x274C, 0x2611
  ];
  for (const cp of codePoints) {
    try {
      emojis.push(String.fromCodePoint(cp));
    } catch {
      // noop
    }
  }
  return emojis;
};

const renderContenidoMensaje = (contenido: string) => {
  if (contenido.startsWith("[Sticker: ") && contenido.endsWith("]")) {
    const name = contenido.slice(10, -1);
    if (name === "cohete") {
      return (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-500 animate-bounce py-1">
          <path d="M4.5 16.5c-1.5 1.25-2.5 3.5-2.5 3.5s2.25-1 3.5-2.5" />
          <path d="M12 2C6.5 2 2 6.5 2 12c0 1.2.2 2.4.6 3.4L6 12l6 6 3.4 3.4c1-.4 2.2-.6 3.4-.6 5.5 0 10-4.5 10-10S17.5 2 12 2Z" />
          <path d="M9 15 5 19" />
          <path d="M15 9 19 5" />
          <circle cx="14" cy="10" r="2" fill="currentColor" />
        </svg>
      );
    }
    if (name === "estrella") {
      return (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400 animate-pulse py-1">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    }
    if (name === "fuego") {
      return (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-orange-500 py-1">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      );
    }
    if (name === "corazon") {
      return (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" className="text-red-500 hover:scale-110 transition-transform py-1">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      );
    }
    if (name === "fiesta") {
      return (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-pink-500 py-1">
          <path d="M4 22V4c0-.5.2-1 .6-1.4C5 2.2 5.5 2 6 2h12c.5 0 1 .2 1.4.6.4.4.6.9.6 1.4v18l-10-4-10 4Z" />
          <path d="M12 18V2" />
        </svg>
      );
    }
  }
  return <p className="whitespace-pre-line">{contenido}</p>;
};

export default function ChatView() {
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [solicitudesRecibidas, setSolicitudesRecibidas] = useState<SolicitudDTO[]>([]);
  const [solicitudesEnviadas, setSolicitudesEnviadas] = useState<SolicitudDTO[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: string; rol: string } | null>(null);
  const [fase, setFase] = useState<"loading" | "ready" | "error">("loading");
  const [activoId, setActivoId] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<Detalle | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [escribiendo, setEscribiendo] = useState(false);
  const [respondiendo, setRespondiendo] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);

  // File Upload State
  const [archivoAdjunto, setArchivoAdjunto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [subiendoArchivo, setSubiendoArchivo] = useState(false);

  // Audio Recording State
  const [grabando, setGrabando] = useState(false);
  const [duracionGrabacion, setDuracionGrabacion] = useState(0);

  // Emoji & Sticker State
  const [mostrarEmojiPicker, setMostrarEmojiPicker] = useState(false);
  const [activeTab, setActiveTab] = useState<"emojis" | "stickers">("emojis");

  // Hidden File input references
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Modal de Búsqueda
  const [mostrarModalBusqueda, setMostrarModalBusqueda] = useState(false);
  const [queryBusqueda, setQueryBusqueda] = useState("");
  const [resultadosUsuarios, setResultadosUsuarios] = useState<{ id: string; nombre: string; fotoUrl: string | null; rol: string }[]>([]);
  const [buscandoUsuarios, setBuscandoUsuarios] = useState(false);

  // Formulario de Nueva Solicitud
  const [nuevoAsunto, setNuevoAsunto] = useState("");
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [enviandoSolicitud, setEnviandoSolicitud] = useState(false);

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

      // Chats activos — crítico para mostrar la sidebar
      let chatsData: { conversaciones: Conversacion[]; currentUser?: { id: string; rol: string } } = { conversaciones: [] };
      if (resChats.ok) {
        chatsData = await resChats.json();
        if (chatsData.currentUser) setCurrentUser(chatsData.currentUser);
      } else {
        console.error("[ChatView] /api/chats error:", resChats.status, await resChats.text().catch(() => ""));
        setFase("error");
        return;
      }

      // Solicitudes pendientes — opcional: si falla no bloquea el chat
      let recibidasValidas: SolicitudDTO[] = [];
      let enviadasValidas: SolicitudDTO[] = [];
      if (resSoli.ok) {
        const dataSoli: { solicitudes: SolicitudDTO[]; recibidas: SolicitudDTO[]; enviadas: SolicitudDTO[] } = await resSoli.json();
        recibidasValidas = dataSoli.recibidas || dataSoli.solicitudes || [];
        enviadasValidas = dataSoli.enviadas || [];
      } else {
        console.error("[ChatView] /api/solicitudes error:", resSoli.status, await resSoli.text().catch(() => ""));
      }

      setSolicitudesRecibidas(recibidasValidas);
      setSolicitudesEnviadas(enviadasValidas);

      const convosSolicitudes: Conversacion[] = recibidasValidas.map(s => ({
        id: `solicitud_${s.id}`,
        otro: { id: s.empresario.id, nombre: s.empresario.nombre, fotoUrl: s.empresario.fotoUrl },
        proyectoTitulo: s.proyecto?.titulo || null,
        ultimoMensaje: { texto: s.asunto || "Nueva solicitud de contacto", creado: s.creado },
        noLeidos: 1,
        esSolicitud: true,
        solicitudId: s.id,
        mensajeSolicitud: s.mensaje,
        empresa: s.empresario.sector || "Empresa"
      }));

      const combinadas = [...convosSolicitudes, ...chatsData.conversaciones].map((c, idx) => ({
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
    if (id.startsWith("solicitud_") || id.startsWith("new_request_") || id.startsWith("pending_request_")) {
      return;
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
    if (!activoId || activoId.startsWith("solicitud_") || activoId.startsWith("new_request_") || activoId.startsWith("pending_request_")) return;
    cargarDetalle(activoId);
    const t = setInterval(() => cargarDetalle(activoId), POLL_CHAT);
    return () => clearInterval(t);
  }, [activoId, cargarDetalle]);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [detalle?.mensajes?.length, activoId]);

  // Búsqueda de usuarios
  useEffect(() => {
    if (queryBusqueda.length < 2) {
      setResultadosUsuarios([]);
      return;
    }
    const t = setTimeout(async () => {
      setBuscandoUsuarios(true);
      try {
        const res = await fetch(`/api/chats/buscar-usuarios?q=${encodeURIComponent(queryBusqueda)}`);
        if (res.ok) {
          const data = await res.json();
          setResultadosUsuarios(data.usuarios || []);
        }
      } catch {
        /* noop */
      } finally {
        setBuscandoUsuarios(false);
      }
    }, 400);
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

  const seleccionarUsuarioBuscado = async (u: { id: string; nombre: string; fotoUrl: string | null; rol: string }) => {
    // 1. Verificar si hay un chat activo con este usuario
    const chatExistente = conversaciones.find(c => !c.esSolicitud && c.otro.id === u.id);
    if (chatExistente) {
      seleccionar(chatExistente.id);
      setMostrarModalBusqueda(false);
      setQueryBusqueda("");
      return;
    }

    // 2. Verificar si hay una solicitud recibida pendiente de este usuario
    const soliRecibida = solicitudesRecibidas.find(s => s.empresario.id === u.id);
    if (soliRecibida) {
      seleccionar(`solicitud_${soliRecibida.id}`);
      setMostrarModalBusqueda(false);
      setQueryBusqueda("");
      return;
    }

    // 3. Verificar si hay una solicitud enviada pendiente a este usuario
    const soliEnviada = solicitudesEnviadas.find(s => s.empresario.id === u.id);
    if (soliEnviada) {
      setActivoId(`pending_request_${u.id}`);
      setDetalle({
        id: `pending_request_${u.id}`,
        otro: {
          id: u.id,
          nombre: u.nombre,
          fotoUrl: u.fotoUrl,
          empresa: u.rol === "empresario" ? "Empresario" : "Estudiante"
        },
        mensajes: [],
        esSolicitud: false,
        solicitudId: soliEnviada.id,
        mensajeSolicitud: soliEnviada.mensaje,
        proyectoTitulo: soliEnviada.proyecto?.titulo || null
      });
      setMostrarModalBusqueda(false);
      setQueryBusqueda("");
      return;
    }

    // 4. No hay conexión previa.
    // Si ambos son estudiantes, iniciamos chat directo (colaboración directa)
    if (currentUser?.rol === "estudiante" && u.rol === "estudiante") {
      await iniciarChatEstudiante(u.id);
      return;
    }

    // En otro caso (Empresario <-> Estudiante), mostramos formulario de solicitud
    setActivoId(`new_request_${u.id}`);
    setDetalle({
      id: `new_request_${u.id}`,
      otro: {
        id: u.id,
        nombre: u.nombre,
        fotoUrl: u.fotoUrl,
        empresa: u.rol === "empresario" ? "Empresario" : "Estudiante"
      },
      mensajes: [],
      esSolicitud: false
    });
    setMostrarModalBusqueda(false);
    setQueryBusqueda("");
  };

  async function enviarNuevaSolicitud(idDestino: string) {
    const asunto = nuevoAsunto.trim();
    const mensaje = nuevoMensaje.trim();
    if (!asunto || !mensaje || enviandoSolicitud) return;

    setEnviandoSolicitud(true);
    try {
      const res = await fetch("/api/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idDestino,
          asunto,
          mensaje
        })
      });
      if (res.ok) {
        setNuevoAsunto("");
        setNuevoMensaje("");
        await cargarConversaciones();
        
        // Transicionar a vista de pendiente
        setActivoId(`pending_request_${idDestino}`);
        setDetalle({
          id: `pending_request_${idDestino}`,
          otro: {
            id: idDestino,
            nombre: detalle?.otro.nombre || "Usuario",
            fotoUrl: detalle?.otro.fotoUrl || null,
            empresa: detalle?.otro.empresa || "Empresa"
          },
          mensajes: [],
          esSolicitud: false,
          mensajeSolicitud: mensaje
        });
      }
    } catch {
      /* noop */
    } finally {
      setEnviandoSolicitud(false);
    }
  }

  const handleSeleccionarImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setArchivoAdjunto(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    e.target.value = "";
  };

  const handleSeleccionarDocumento = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setArchivoAdjunto(file);
    setPreviewUrl(null);
    e.target.value = "";
  };

  const cancelarAdjunto = () => {
    setArchivoAdjunto(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const iniciarGrabacion = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = { mimeType: 'audio/webm' };
      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch {
        recorder = new MediaRecorder(stream);
      }

      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setGrabando(true);
      setDuracionGrabacion(0);
      timerRef.current = setInterval(() => {
        setDuracionGrabacion(d => d + 1);
      }, 1000);
    } catch (err) {
      console.error("Error al acceder al micrófono:", err);
      alert("No se pudo acceder al micrófono o no está disponible.");
    }
  };

  const cancelarGrabacion = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setGrabando(false);
    setDuracionGrabacion(0);
  };

  const detenerYEnviarGrabacion = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") return;

    const recorder = mediaRecorderRef.current;
    recorder.stop();
    setGrabando(false);
    setDuracionGrabacion(0);

    setTimeout(async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
      const file = new File([audioBlob], `audio-${Date.now()}.webm`, { type: audioBlob.type });
      
      setEnviando(true);
      try {
        const fd = new FormData();
        fd.append('archivo', file);
        fd.append('tipo', 'prototipo');

        const uploadRes = await fetch('/api/upload/archivo', {
          method: 'POST',
          body: fd,
        });

        if (!uploadRes.ok) {
          throw new Error('Error al subir audio');
        }

        const uploadData = await uploadRes.json();
        
        const res = await fetch(`/api/chats/${activoId}/mensajes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            contenido: "Mensaje de voz", 
            documentUrl: uploadData.url 
          }),
        });

        if (res.ok) {
          const data: { mensaje: Mensaje } = await res.json();
          setDetalle((prev) => {
            if (!prev) return prev;
            const existe = prev.mensajes.some((m) => m.id === data.mensaje.id);
            if (existe) return prev;
            return { ...prev, mensajes: [...prev.mensajes, data.mensaje] };
          });
          cargarConversaciones();
        }
      } catch (err) {
        console.error("Error al enviar nota de voz:", err);
      } finally {
        setEnviando(false);
      }
    }, 200);
  };

  async function enviarSticker(name: string) {
    if (!activoId || enviando || activoId.startsWith("solicitud_") || activoId.startsWith("new_request_") || activoId.startsWith("pending_request_")) return;
    setEnviando(true);
    setMostrarEmojiPicker(false);
    try {
      const res = await fetch(`/api/chats/${activoId}/mensajes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contenido: `[Sticker: ${name}]` }),
      });
      if (res.ok) {
        const data: { mensaje: Mensaje } = await res.json();
        setDetalle((prev) => {
          if (!prev) return prev;
          const existe = prev.mensajes.some((m) => m.id === data.mensaje.id);
          if (existe) return prev;
          return { ...prev, mensajes: [...prev.mensajes, data.mensaje] };
        });
        cargarConversaciones();
      }
    } catch (error) {
      console.error("Error al enviar sticker:", error);
    } finally {
      setEnviando(false);
    }
  }

  async function enviar() {
    const contenido = texto.trim();
    if (!contenido && !archivoAdjunto) return;
    if (!activoId || enviando || activoId.startsWith("solicitud_") || activoId.startsWith("new_request_") || activoId.startsWith("pending_request_")) return;
    setEnviando(true);

    let uploadedUrl: string | null = null;

    try {
      if (archivoAdjunto) {
        setSubiendoArchivo(true);
        const fd = new FormData();
        fd.append('archivo', archivoAdjunto);
        fd.append('tipo', 'prototipo');

        const uploadRes = await fetch('/api/upload/archivo', {
          method: 'POST',
          body: fd,
        });

        if (!uploadRes.ok) {
          const errText = await uploadRes.text();
          throw new Error(`Error de subida: ${errText}`);
        }

        const uploadData = await uploadRes.json();
        uploadedUrl = uploadData.url;
        setSubiendoArchivo(false);
        setArchivoAdjunto(null);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
      }

      setTexto("");

      const res = await fetch(`/api/chats/${activoId}/mensajes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contenido: contenido || null, documentUrl: uploadedUrl }),
      });
      if (res.ok) {
        const data: { mensaje: Mensaje } = await res.json();
        setDetalle((prev) => {
          if (!prev) return prev;
          const existe = prev.mensajes.some((m) => m.id === data.mensaje.id);
          if (existe) return prev;
          return { ...prev, mensajes: [...prev.mensajes, data.mensaje] };
        });
        cargarConversaciones();
      }
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
    } finally {
      setEnviando(false);
      setSubiendoArchivo(false);
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
      if (id.startsWith("pending_request_")) {
        const targetUserId = id.replace("pending_request_", "");
        const soliEnviada = solicitudesEnviadas.find(s => s.empresario.id === targetUserId);
        if (soliEnviada) {
          setDetalle({
            id,
            otro: {
              id: targetUserId,
              nombre: soliEnviada.empresario.nombre,
              fotoUrl: soliEnviada.empresario.fotoUrl,
              empresa: "Pendiente"
            },
            mensajes: [],
            esSolicitud: false,
            solicitudId: soliEnviada.id,
            mensajeSolicitud: soliEnviada.mensaje,
            proyectoTitulo: soliEnviada.proyecto?.titulo || null
          });
        }
      } else {
        setDetalle(null);
      }
    }
    
    setConversaciones((prev) => prev.map((c) => (c.id === id ? { ...c, noLeidos: 0 } : c)));
  }

  async function responderSoli(soliId: string, accion: "aceptar" | "rechazar") {
    setRespondiendo(true);
    try {
      const res = await fetch(`/api/solicitudes/${soliId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion }),
      });
      if (res.ok) {
        setActivoId(null);
        setDetalle(null);
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
    <div className="glass flex h-[calc(100vh-6rem)] w-full overflow-hidden rounded-[24px] shadow-xl md:flex-row flex-col bg-white/80 dark:bg-slate-900/80">
      
      {/* Panel izquierdo: lista */}
      <div
        className={`flex w-full flex-col border-r border-border/50 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md md:w-[340px] md:min-w-[340px] ${activoId ? "hidden md:flex" : "flex"}`}
      >
        <div className="bg-gradient-to-r from-fwd-azul to-fwd-morado p-5 text-white shadow-md">
          <div className="flex justify-between items-center">
            <h1 className="font-display text-xl font-bold tracking-wide">Mensajes</h1>
            <button 
              onClick={() => setMostrarModalBusqueda(true)}
              className="bg-white/20 hover:bg-white/30 p-1.5 rounded-full transition-colors"
              title="Buscar usuarios para conectar"
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
                  <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-3 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
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
                <p className="font-display text-lg font-bold text-slate-800 dark:text-slate-100">No tienes conversaciones activas.</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
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
              className={`group relative mb-1 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-300 hover:bg-[#EAF6FF] dark:hover:bg-slate-800 ${
                activoId === c.id ? "bg-[#EAF6FF] dark:bg-slate-800 shadow-sm" : ""
              }`}
            >
              <Avatar nombre={c.otro.nombre} fotoUrl={c.otro.fotoUrl} estado={c.estadoVirtual} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-bold text-slate-800 dark:text-slate-100 group-hover:text-fwd-azul transition-colors">{c.otro.nombre}</p>
                  {c.ultimoMensaje && (
                    <span className={`shrink-0 text-[11px] ${c.noLeidos > 0 ? "font-bold text-fwd-azul" : "text-slate-400 dark:text-slate-500"}`}>{hora(c.ultimoMensaje.creado)}</span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className={`truncate text-sm ${c.noLeidos > 0 ? "font-semibold text-slate-700 dark:text-slate-200" : "text-slate-500 dark:text-slate-400"}`}>
                    {c.esSolicitud ? `Solicitud: ${c.ultimoMensaje?.texto}` : (c.ultimoMensaje?.texto || "Conversación iniciada")}
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
      <div className={`flex min-h-0 flex-1 flex-col bg-slate-50/50 dark:bg-slate-800/50 ${activoId ? "flex" : "hidden md:flex"}`}>
        {!activoId || !detalle ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 p-8 text-center animate-in fade-in zoom-in duration-500">
            <div className="relative">
              <span className="grid h-24 w-24 place-items-center rounded-full bg-gradient-to-tr from-fwd-azul to-fwd-turquesa text-white shadow-lg shadow-fwd-azul/20">
                <IconMail width={40} height={40} />
              </span>
            </div>
            <div className="space-y-2">
              <p className="font-display text-2xl font-bold bg-gradient-to-r from-fwd-azul to-fwd-morado bg-clip-text text-transparent">Centro de Mensajes</p>
              <p className="max-w-xs text-slate-500 dark:text-slate-400">
                Selecciona una conversación para empezar a chatear o busca a cualquier usuario para conectar.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header Conversacion — estilo Instagram */}
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 shadow-sm z-10 shrink-0">
              <button
                type="button"
                onClick={() => setActivoId(null)}
                className="mr-1 grid h-9 w-9 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 md:hidden"
                aria-label="Volver"
              >
                <IconArrowLeft width={20} height={20} />
              </button>
              <div className="relative cursor-pointer">
                <Avatar nombre={detalle.otro.nombre} fotoUrl={detalle.otro.fotoUrl} size={42} />
                {detalle.estadoVirtual === "online" && (
                  <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-white bg-green-400" />
                )}
              </div>
              <div className="flex flex-col leading-tight">
                <p className="font-bold text-slate-900 dark:text-slate-100" style={{ fontSize: 15 }}>{detalle.otro.nombre}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {detalle.estadoVirtual === "online" ? "Activo ahora" : detalle.estadoVirtual === "busy" ? "Ocupado" : "Desconectado"}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <button className="grid h-9 w-9 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                </button>
              </div>
            </div>

            {/* Mensajes Area — estilo Instagram */}
            <div
              className="min-h-0 flex-1 overflow-y-auto px-4 py-5 bg-white dark:bg-slate-900"
            >
              {/* Solicitud Recibida */}
              {detalle.esSolicitud && (
                <div className="mx-auto max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-500">
                  <div className="rounded-3xl bg-white dark:bg-slate-800 p-6 shadow-xl shadow-fwd-morado/5 ring-1 ring-border/50 dark:ring-white/10">
                    <div className="mb-4 flex items-center gap-4">
                      <Avatar nombre={detalle.otro.nombre} fotoUrl={detalle.otro.fotoUrl} size={56} />
                      <div>
                        <h3 className="font-display font-bold text-slate-800 dark:text-slate-100">{detalle.otro.nombre}</h3>
                        <p className="text-sm text-fwd-azul">{detalle.otro.empresa || "Usuario"}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Te ha enviado una solicitud</p>
                      </div>
                    </div>
                    {detalle.proyectoTitulo && (
                      <div className="mb-4 rounded-xl bg-slate-50 dark:bg-white/5 p-3 text-sm text-slate-700 dark:text-slate-200">
                        <span className="font-bold">Interesado en: </span>{detalle.proyectoTitulo}
                      </div>
                    )}
                    <div className="mb-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Mensaje</div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 italic p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                      &quot;{detalle.mensajeSolicitud || "Hola, me gustaría conectar contigo."}&quot;
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => responderSoli(detalle.solicitudId!, 'rechazar')}
                        disabled={respondiendo}
                        className="flex-1 rounded-xl border border-slate-200 dark:border-slate-600 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-50"
                      >
                        Rechazar
                      </button>
                      <button
                        onClick={() => responderSoli(detalle.solicitudId!, 'aceptar')}
                        disabled={respondiendo}
                        className="flex-1 rounded-xl bg-gradient-to-r from-fwd-azul to-fwd-morado py-2.5 text-sm font-bold text-white shadow-md shadow-fwd-azul/20 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                      >
                        Aceptar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Solicitud Enviada Pendiente */}
              {activoId?.startsWith("pending_request_") && (
                <div className="mx-auto max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-500">
                  <div className="rounded-3xl bg-white dark:bg-slate-800 p-6 shadow-xl ring-1 ring-border/50 dark:ring-white/10 text-center">
                    <Avatar nombre={detalle.otro.nombre} fotoUrl={detalle.otro.fotoUrl} size={64} className="mx-auto mb-3" />
                    <h3 className="font-display font-bold text-slate-800 dark:text-slate-100 text-lg">{detalle.otro.nombre}</h3>
                    <span className="inline-block rounded-full bg-slate-100 dark:bg-white/10 px-3 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 mb-4">Solicitud Pendiente</span>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                      Has enviado una solicitud. Podrán escribirse una vez que {detalle.otro.nombre} acepte tu invitación.
                    </p>
                    {detalle.mensajeSolicitud && (
                      <div className="text-left bg-slate-50 dark:bg-white/5 p-4 rounded-2xl mb-4">
                        <span className="block text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mb-1">Mensaje enviado</span>
                        <p className="text-sm text-slate-600 dark:text-slate-300 italic">&quot;{detalle.mensajeSolicitud}&quot;</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Formulario Nueva Solicitud */}
              {activoId?.startsWith("new_request_") && (
                <div className="mx-auto max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-500">
                  <div className="rounded-3xl bg-white dark:bg-slate-800 p-6 shadow-xl ring-1 ring-border/50 dark:ring-white/10">
                    <div className="mb-5 text-center">
                      <Avatar nombre={detalle.otro.nombre} fotoUrl={detalle.otro.fotoUrl} size={64} className="mx-auto mb-2" />
                      <h3 className="font-display font-bold text-slate-800 dark:text-slate-100 text-lg">{detalle.otro.nombre}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Para iniciar una conversación debes enviar una solicitud de chat.</p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Asunto</label>
                        <input
                          type="text"
                          value={nuevoAsunto}
                          onChange={(e) => setNuevoAsunto(e.target.value)}
                          placeholder="Ej. Colaboracion en Proyecto..."
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-400 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-fwd-azul focus:ring-1 focus:ring-fwd-azul transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Mensaje Inicial</label>
                        <textarea
                          rows={4}
                          value={nuevoMensaje}
                          onChange={(e) => setNuevoMensaje(e.target.value)}
                          placeholder="Escribe un mensaje de presentacion..."
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-400 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-fwd-azul focus:ring-1 focus:ring-fwd-azul transition-all resize-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => enviarNuevaSolicitud(detalle.otro.id)}
                        disabled={!nuevoAsunto.trim() || !nuevoMensaje.trim() || enviandoSolicitud}
                        className="w-full rounded-xl bg-gradient-to-r from-fwd-azul to-fwd-morado py-2.5 text-sm font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                      >
                        {enviandoSolicitud ? "Enviando..." : "Enviar Solicitud"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Mensajes Chat Normal — burbujas estilo Instagram */}
              {!detalle.esSolicitud && !activoId?.startsWith("new_request_") && !activoId?.startsWith("pending_request_") && (
                <div className="flex flex-col gap-1">
                  {detalle.mensajes.map((m, i) => {
                    const prevM = detalle.mensajes[i - 1];
                    // Mostrar timestamp si es el primero o pasaron mas de 5 minutos
                    const showTime = !prevM || (new Date(m.creado).getTime() - new Date(prevM.creado).getTime()) > 5 * 60 * 1000;
                    // Agrupar: mismo emisor que el anterior
                    const sameSender = prevM && prevM.mio === m.mio;
                    // El siguiente mensaje
                    const nextM = detalle.mensajes[i + 1];
                    const isLastInGroup = !nextM || nextM.mio !== m.mio;
                    return (
                      <div key={m.id} className="animate-in fade-in slide-in-from-bottom-1 duration-200" style={{ animationFillMode: "both", animationDelay: `${Math.min(i * 30, 300)}ms` }}>
                        {showTime && (
                          <div className="my-3 flex justify-center">
                            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">{hora(m.creado)}</span>
                          </div>
                        )}
                        <div className={`flex items-end gap-2 ${m.mio ? "justify-end" : "justify-start"} ${sameSender && !showTime ? "mt-0.5" : "mt-2"}`}>
                          {/* Avatar del otro — solo en el ultimo mensaje del grupo (izquierda) */}
                          {!m.mio ? (
                            isLastInGroup ? (
                              <Avatar nombre={detalle.otro.nombre} fotoUrl={detalle.otro.fotoUrl} size={28} className="mb-0.5 shrink-0" />
                            ) : (
                              <span className="w-7 shrink-0" />
                            )
                          ) : null}

                          <div
                            className={`relative max-w-[75%] px-4 py-2.5 text-[15px] leading-relaxed shadow-sm ${
                              m.mio
                                ? "rounded-[22px] rounded-br-[6px] bg-gradient-to-br from-fwd-azul to-fwd-morado text-white"
                                : "rounded-[22px] rounded-bl-[6px] bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                            } ${sameSender && !showTime && m.mio ? "rounded-tr-[8px]" : ""} ${sameSender && !showTime && !m.mio ? "rounded-tl-[8px]" : ""}`}
                          >
                            {m.contenido && renderContenidoMensaje(m.contenido)}
                            {m.documentUrl && (
                              m.documentUrl.match(/\.(jpeg|jpg|png|gif|webp|svg)($|\?)/i) ? (
                                <div className="mt-1.5 overflow-hidden rounded-2xl border border-black/5 bg-white/10">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={m.documentUrl} alt="Adjunto" className="max-h-60 max-w-full object-cover rounded-2xl cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(m.documentUrl!, "_blank")} />
                                </div>
                              ) : m.documentUrl.match(/\.(webm|mp3|wav|ogg|m4a)($|\?)/i) ? (
                                <div className="mt-1.5 flex items-center min-w-[220px] max-w-full py-1">
                                  <audio src={m.documentUrl} controls className={`h-9 w-full max-w-xs ${m.mio ? "invert brightness-200" : ""}`} />
                                </div>
                              ) : (
                                <a href={m.documentUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1.5 text-sm underline mt-1 ${m.mio ? "text-white/90" : "text-fwd-azul"}`}>
                                  <IconPaperclip width={13} height={13} />
                                  Ver archivo adjunto
                                </a>
                              )
                            )}
                          </div>

                          {/* Tick de leido solo en el ultimo mensaje mio */}
                          {m.mio && isLastInGroup && (
                            <span className={`mb-1 shrink-0 text-[10px] ${m.leido ? "text-fwd-turquesa" : "text-slate-300 dark:text-slate-600"}`}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/>
                              </svg>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing indicator */}
                  {escribiendo && (
                    <div className="mt-2 flex items-end gap-2 justify-start">
                      <Avatar nombre={detalle.otro.nombre} fotoUrl={detalle.otro.fotoUrl} size={28} className="mb-0.5 shrink-0" />
                      <div className="flex items-center gap-1 rounded-[22px] rounded-bl-[6px] bg-slate-100 dark:bg-slate-800 px-4 py-3">
                        <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div ref={finRef} className="h-2" />
            </div>

            {/* Input Area — estilo Instagram */}
            {!detalle.esSolicitud && !activoId?.startsWith("new_request_") && !activoId?.startsWith("pending_request_") && (
              <div className="relative shrink-0 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 z-10">
                
                {/* Popover Emoji & Sticker Picker */}
                {mostrarEmojiPicker && (
                  <div className="absolute bottom-16 right-4 z-20 w-72 rounded-3xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-xl ring-1 ring-black/5 dark:ring-white/10 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex border-b border-slate-100 dark:border-slate-700 mb-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab("emojis")}
                        className={`flex-1 pb-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === "emojis" ? "text-fwd-azul border-b-2 border-fwd-azul" : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"}`}
                      >
                        Emojis
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("stickers")}
                        className={`flex-1 pb-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === "stickers" ? "text-fwd-azul border-b-2 border-fwd-azul" : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"}`}
                      >
                        Stickers
                      </button>
                      <button
                        type="button"
                        onClick={() => setMostrarEmojiPicker(false)}
                        className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 text-xs font-bold pb-1.5 px-2"
                      >
                        Cerrar
                      </button>
                    </div>

                    {activeTab === "emojis" ? (
                      <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1">
                        {obtenerListadoEmojis().map((emoji, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setTexto(t => t + emoji);
                            }}
                            className="text-xl p-1 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors duration-150 active:scale-95"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-3 max-h-48 overflow-y-auto p-1">
                        <button
                          type="button"
                          onClick={() => enviarSticker("cohete")}
                          className="flex flex-col items-center justify-center p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors"
                        >
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-500"><path d="M4.5 16.5c-1.5 1.25-2.5 3.5-2.5 3.5s2.25-1 3.5-2.5" /><path d="M12 2C6.5 2 2 6.5 2 12c0 1.2.2 2.4.6 3.4L6 12l6 6 3.4 3.4c1-.4 2.2-.6 3.4-.6 5.5 0 10-4.5 10-10S17.5 2 12 2Z" /><path d="M9 15 5 19" /><path d="M15 9 19 5" /><circle cx="14" cy="10" r="2" fill="currentColor" /></svg>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-bold">Cohete</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => enviarSticker("estrella")}
                          className="flex flex-col items-center justify-center p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors"
                        >
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-bold">Estrella</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => enviarSticker("fuego")}
                          className="flex flex-col items-center justify-center p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors"
                        >
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-500"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-bold">Fuego</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => enviarSticker("corazon")}
                          className="flex flex-col items-center justify-center p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors"
                        >
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="text-red-500"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-bold">Amor</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => enviarSticker("fiesta")}
                          className="flex flex-col items-center justify-center p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors"
                        >
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-pink-500"><path d="M4 22V4c0-.5.2-1 .6-1.4C5 2.2 5.5 2 6 2h12c.5 0 1 .2 1.4.6.4.4.6.9.6 1.4v18l-10-4-10 4Z" /><path d="M12 18V2" /></svg>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-bold">Fiesta</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Preview de archivo adjunto */}
                {archivoAdjunto && (
                  <div className="mb-2 flex items-center gap-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-slate-700 rounded-2xl p-2 animate-in fade-in slide-in-from-bottom-2">
                    {previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previewUrl} alt="Vista previa" className="h-14 w-14 rounded-xl object-cover border border-slate-200 dark:border-slate-600" />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-fwd-azul/10 text-fwd-azul shrink-0">
                        <IconPaperclip width={24} height={24} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{archivoAdjunto.name}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{(archivoAdjunto.size / 1024).toFixed(1)} KB</p>
                    </div>
                    {subiendoArchivo ? (
                      <span className="text-xs font-semibold text-fwd-azul animate-pulse">Subiendo...</span>
                    ) : (
                      <button 
                        type="button" 
                        onClick={cancelarAdjunto}
                        className="grid h-7 w-7 place-items-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {/* Camara */}
                  <button 
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                  </button>

                  {/* Campo de texto / Grabadora */}
                  {grabando ? (
                    <div className="flex flex-1 items-center justify-between rounded-full border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/30 px-4 py-2 text-red-600 dark:text-red-400 animate-pulse">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-500 shrink-0" />
                        <span className="text-sm font-medium">Grabando audio... {duracionGrabacion}s</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={cancelarGrabacion}
                          className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors px-2 py-1 rounded"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={detenerYEnviarGrabacion}
                          className="text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors bg-red-100 dark:bg-red-950/40 hover:bg-red-200 dark:hover:bg-red-900/50 px-3 py-1.5 rounded-full"
                        >
                          Enviar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative flex flex-1 items-center rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 focus-within:border-slate-300 dark:focus-within:border-slate-600 transition-colors">
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
                        placeholder="Mensaje..."
                        className="max-h-28 min-h-[24px] w-full resize-none bg-transparent text-[15px] text-slate-700 dark:text-slate-100 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-400 leading-normal"
                      />
                      {/* Emoji */}
                      <button 
                        type="button"
                        onClick={() => {
                          setActiveTab("emojis");
                          setMostrarEmojiPicker(!mostrarEmojiPicker);
                        }}
                        className="ml-2 shrink-0 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                      >
                        <IconSmile width={22} height={22} />
                      </button>
                    </div>
                  )}

                  {texto.trim() || archivoAdjunto ? (
                    /* Boton Enviar cuando hay texto o adjunto */
                    <button
                      type="button"
                      onClick={enviar}
                      disabled={enviando || subiendoArchivo}
                      className="shrink-0 font-bold text-fwd-azul text-sm px-1 transition-opacity hover:opacity-70 disabled:opacity-40"
                    >
                      Enviar
                    </button>
                  ) : (
                    /* Iconos Mic + Galeria + Sticker cuando no hay texto */
                    !grabando && (
                      <div className="flex items-center gap-1">
                        <button 
                          type="button"
                          onClick={iniciarGrabacion}
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                        >
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                        </button>
                        <button 
                          type="button"
                          onClick={() => imageInputRef.current?.click()}
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                        >
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                        </button>
                        <button 
                          type="button"
                          onClick={() => {
                            setActiveTab("stickers");
                            setMostrarEmojiPicker(!mostrarEmojiPicker);
                          }}
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                        >
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>
                        </button>
                        <button 
                          type="button"
                          onClick={() => docInputRef.current?.click()}
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                        >
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Búsqueda de Usuarios */}
      {mostrarModalBusqueda && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-gradient-to-r from-fwd-azul to-fwd-morado text-white">
              <h2 className="font-display font-bold text-lg">Buscar contactos</h2>
              <button onClick={() => setMostrarModalBusqueda(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="p-5">
              <div className="relative mb-4">
                <IconSearch width={18} height={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  autoFocus
                  value={queryBusqueda}
                  onChange={(e) => setQueryBusqueda(e.target.value)}
                  placeholder="Escribe el nombre de un contacto..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-fwd-turquesa focus:ring-1 focus:ring-fwd-turquesa transition-all"
                />
              </div>
              
              <div className="max-h-64 overflow-y-auto space-y-1">
                {buscandoUsuarios && <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-4">Buscando...</p>}
                {!buscandoUsuarios && queryBusqueda.length >= 2 && resultadosUsuarios.length === 0 && (
                  <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-4">No se encontraron contactos.</p>
                )}
                {!buscandoUsuarios && resultadosUsuarios.map(userResult => (
                  <button
                    key={userResult.id}
                    onClick={() => seleccionarUsuarioBuscado(userResult)}
                    className="flex items-center justify-between w-full p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar nombre={userResult.nombre} fotoUrl={userResult.fotoUrl} size={40} />
                      <div>
                        <span className="font-medium text-slate-700 dark:text-slate-200 block leading-tight">{userResult.nombre}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">
                          {userResult.rol === "empresario" ? "Empresario" : "Estudiante"}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-fwd-azul font-bold hover:underline">
                      Conectar
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inputs de archivos ocultos */}
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleSeleccionarImagen}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={docInputRef}
        onChange={handleSeleccionarDocumento}
        accept=".pdf,.zip"
        className="hidden"
      />
    </div>
  );
}
