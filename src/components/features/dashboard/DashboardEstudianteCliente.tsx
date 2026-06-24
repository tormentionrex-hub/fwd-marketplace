"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import {
  IconBriefcase,
  IconFile,
  IconStar,
  IconAward,
  IconCpu,
  IconCheck,
  IconTrendingUp,
  IconSparkles,
  IconSearch,
  IconRocket,
} from "@/components/ui/icons";
import {
  MessageSquare,
  Send,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Clock,
  LayoutDashboard,
  Briefcase,
  Award,
  Lock,
  Eye,
  Trash,
  Trophy,
  Pencil,
} from "lucide-react";
import MatchEmpleabilidad from "./MatchEmpleabilidad";
import { QUIZ_ETAPAS } from "@/lib/quizzes-data";
import type { MiOfertaDTO } from "@/types/oferta";
import type { EventoCard } from "@/types/marketplace";
import { ESTADO_OFERTA_META } from "@/lib/oferta-estado";

interface ResumenDashboard {
  totalOfertas: number;
  proyectosActivos: number;
  proyectosCompletados: number;
  calificacionPromedio: number;
  reputacion: number;
}

interface HabilidadSeleccionada {
  id: string;
  nivel: string;
}

interface PortafolioItem {
  id: string;
  titulo: string;
}

interface PerfilEditable {
  correo: string;
  fotoUrl: string;
  resumen: string;
  habilidades: HabilidadSeleccionada[];
  portafolio: PortafolioItem[];
  catalogo: { id: string; nombre: string }[];
}

interface CvDTO {
  fileName: string;
  fileType: string;
  fileSize: number;
  esPublico: boolean;
  subido: string;
  actualizado: string;
  viewUrl: string | null;
}

interface ProyectoPortafolioItem {
  id: string;
  titulo: string;
  descripcion: string;
  tecnologias: string;
  repoUrl: string;
  demoUrl: string;
  esPublico: boolean;
}

interface DashboardEstudianteClienteProps {
  locale: string;
  nombre: string;
  ultimaSesion: string | null;
  perfilCompletado: number;
  nivelEstudiante: string;
  resumen: ResumenDashboard;
  misOfertas: MiOfertaDTO[];
  perfil: PerfilEditable;
  cv: CvDTO | null;
  habilidadesVerificadas: number;
  eventos: EventoCard[];
}

interface ChatMessage {
  id: string;
  sender: "user" | "other";
  text: string;
  time: string;
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  online: boolean;
  unread: boolean;
  messages: ChatMessage[];
}

export default function DashboardEstudianteCliente({
  locale,
  nombre,
  ultimaSesion,
  perfilCompletado,
  resumen,
  misOfertas,
  perfil,
  cv,
  habilidadesVerificadas,
  eventos,
}: DashboardEstudianteClienteProps) {
  // --- NAVEGACIÓN Y TABS ---
  const [activeTab, setActiveTab] = useState<"dashboard" | "proyectos" | "mensajes" | "academia">("dashboard");

  // --- ESTADOS DE GAMIFICACIÓN & PORTAFOLIO CON PERSISTENCIA ---
  const [score, setScore] = useState<number>(0);
  const [etapaActual, setEtapaActual] = useState<number>(1);
  const [intentosHoy, setIntentosHoy] = useState<number>(0);
  const [_ultimoIntentoFecha, setUltimoIntentoFecha] = useState<string | null>(null);
  const [insignias, setInsignias] = useState<string[]>([]);
  const [proyectosPortafolio, setProyectosPortafolio] = useState<ProyectoPortafolioItem[]>([]);
  const [etapaProgress, setEtapaProgress] = useState<Record<string, number>>({
    "etapa-1": 0,
    "etapa-2": 0,
    "etapa-3": 0,
  });

  // Estado para el resolutor de quizzes
  const [quizActivo, setQuizActivo] = useState<{
    etapaId: string;
    preguntaActualIndex: number;
    opcionSeleccionada: number | null;
    respondido: boolean;
    esCorrecto: boolean;
  } | null>(null);

  // Formulario para añadir proyecto
  const [nuevoProyecto, setNuevoProyecto] = useState({
    titulo: "",
    descripcion: "",
    tecnologias: "",
    repoUrl: "",
    demoUrl: "",
    esPublico: true,
  });
  const [errorProyecto, setErrorProyecto] = useState("");
  const [exitoProyecto, setExitoProyecto] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  // --- CARGAR DATOS DESDE LOCALSTORAGE AL MONTAR ---
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedScore = localStorage.getItem("fwd_quiz_score");
      if (savedScore) setScore(Number(savedScore));

      const savedEtapa = localStorage.getItem("fwd_quiz_etapa");
      if (savedEtapa) setEtapaActual(Number(savedEtapa));

      const savedFecha = localStorage.getItem("fwd_quiz_fecha");
      const hoy = new Date().toDateString();

      const savedIntentos = localStorage.getItem("fwd_quiz_intentos");
      if (savedIntentos) {
        if (savedFecha === hoy) {
          setIntentosHoy(Number(savedIntentos));
          setUltimoIntentoFecha(savedFecha);
        } else {
          setIntentosHoy(0);
          setUltimoIntentoFecha(hoy);
          localStorage.setItem("fwd_quiz_intentos", "0");
          localStorage.setItem("fwd_quiz_fecha", hoy);
        }
      } else {
        setUltimoIntentoFecha(hoy);
        localStorage.setItem("fwd_quiz_fecha", hoy);
      }

      const savedInsignias = localStorage.getItem("fwd_quiz_insignias");
      if (savedInsignias) {
        setInsignias(JSON.parse(savedInsignias));
      } else {
        const inicial = ["Iniciador FWD"];
        setInsignias(inicial);
        localStorage.setItem("fwd_quiz_insignias", JSON.stringify(inicial));
      }

      const savedProgress = localStorage.getItem("fwd_quiz_progress");
      if (savedProgress) {
        setEtapaProgress(JSON.parse(savedProgress));
      }

      const savedProyectos = localStorage.getItem("fwd_portafolio_proyectos");
      if (savedProyectos) {
        setProyectosPortafolio(JSON.parse(savedProyectos));
      } else {
        const iniciales = perfil.portafolio.map((p, idx) => ({
          id: p.id || `manual-${idx}`,
          titulo: p.titulo,
          descripcion: "Proyecto desarrollado como parte de la formación académica en la plataforma FWD Costa Rica.",
          tecnologias: "HTML, CSS, React, TypeScript",
          repoUrl: "https://github.com",
          demoUrl: "https://demo.com",
          esPublico: true,
        }));
        setProyectosPortafolio(iniciales);
        localStorage.setItem("fwd_portafolio_proyectos", JSON.stringify(iniciales));
      }
    }
  }, [perfil]);

  // --- CÁLCULO DE NIVELES ---
  const getNivelRank = (puntos: number) => {
    if (puntos >= 3000) return "Profesional Elite FWD";
    if (puntos >= 1500) return "Talento Competente";
    if (puntos >= 500) return "Desarrollador Junior";
    return "Novato FWD";
  };

  // --- FUNCIONES GESTIÓN DE PROYECTOS ---
  const guardarProyectos = (nuevos: ProyectoPortafolioItem[]) => {
    setProyectosPortafolio(nuevos);
    localStorage.setItem("fwd_portafolio_proyectos", JSON.stringify(nuevos));
  };

  const handleToggleProyectoVisibilidad = (proyectoId: string) => {
    const nuevos = proyectosPortafolio.map((p) => {
      if (p.id === proyectoId) {
        return { ...p, esPublico: !p.esPublico };
      }
      return p;
    });
    guardarProyectos(nuevos);
  };

  const handleEliminarProyecto = (proyectoId: string) => {
    const nuevos = proyectosPortafolio.filter((p) => p.id !== proyectoId);
    guardarProyectos(nuevos);
  };

  const startEditing = (p: ProyectoPortafolioItem) => {
    setEditingProjectId(p.id);
    setNuevoProyecto({
      titulo: p.titulo,
      descripcion: p.descripcion,
      tecnologias: p.tecnologias,
      repoUrl: p.repoUrl || "",
      demoUrl: p.demoUrl || "",
      esPublico: p.esPublico,
    });
    setErrorProyecto("");
    setExitoProyecto(false);
  };

  const cancelEditing = () => {
    setEditingProjectId(null);
    setNuevoProyecto({
      titulo: "",
      descripcion: "",
      tecnologias: "",
      repoUrl: "",
      demoUrl: "",
      esPublico: true,
    });
  };

  const handleAgregarProyecto = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorProyecto("");
    setExitoProyecto(false);

    if (!nuevoProyecto.titulo.trim()) {
      setErrorProyecto("El título del proyecto es requerido.");
      return;
    }

    if (editingProjectId) {
      const nuevos = proyectosPortafolio.map((p) => {
        if (p.id === editingProjectId) {
          return {
            ...p,
            titulo: nuevoProyecto.titulo,
            descripcion: nuevoProyecto.descripcion || "Sin descripción.",
            tecnologias: nuevoProyecto.tecnologias || "HTML, CSS, JS",
            repoUrl: nuevoProyecto.repoUrl || "https://github.com",
            demoUrl: nuevoProyecto.demoUrl || "https://demo.com",
            esPublico: nuevoProyecto.esPublico,
          };
        }
        return p;
      });
      guardarProyectos(nuevos);
      setEditingProjectId(null);
      setExitoProyecto(true);
    } else {
      const nuevoItem = {
        id: `manual-${Date.now()}`,
        titulo: nuevoProyecto.titulo,
        descripcion: nuevoProyecto.descripcion || "Sin descripción.",
        tecnologias: nuevoProyecto.tecnologias || "HTML, CSS, JS",
        repoUrl: nuevoProyecto.repoUrl || "https://github.com",
        demoUrl: nuevoProyecto.demoUrl || "https://demo.com",
        esPublico: nuevoProyecto.esPublico,
      };
      const nuevos = [...proyectosPortafolio, nuevoItem];
      guardarProyectos(nuevos);
      setExitoProyecto(true);
    }

    setNuevoProyecto({
      titulo: "",
      descripcion: "",
      tecnologias: "",
      repoUrl: "",
      demoUrl: "",
      esPublico: true,
    });
    setTimeout(() => setExitoProyecto(false), 3000);
  };

  // --- FUNCIONES DE QUIZZES ---
  const startQuiz = (etapaId: string) => {
    if (intentosHoy >= 3) {
      alert("Has alcanzado tu límite diario de 3 quizzes. ¡Vuelve mañana para seguir aprendiendo!");
      return;
    }

    const progresoActual = etapaProgress[etapaId] || 0;
    const startIndex = progresoActual < 20 ? progresoActual : 0;

    setQuizActivo({
      etapaId,
      preguntaActualIndex: startIndex,
      opcionSeleccionada: null,
      respondido: false,
      esCorrecto: false,
    });
  };

  const handleAnswerSelection = (opcionIndex: number) => {
    if (!quizActivo || quizActivo.respondido) return;
    setQuizActivo({
      ...quizActivo,
      opcionSeleccionada: opcionIndex,
    });
  };

  const handleVerifyAnswer = () => {
    if (!quizActivo || quizActivo.opcionSeleccionada === null || quizActivo.respondido) return;

    const etapa = QUIZ_ETAPAS.find((e) => e.id === quizActivo.etapaId);
    const pregunta = etapa?.preguntas[quizActivo.preguntaActualIndex];
    if (!pregunta) return;

    const esCorrecto = quizActivo.opcionSeleccionada === pregunta.respuestaCorrecta;
    const nuevoScore = score + (esCorrecto ? 100 : 0);
    const nuevosIntentos = intentosHoy + 1;
    const hoy = new Date().toDateString();

    setScore(nuevoScore);
    localStorage.setItem("fwd_quiz_score", String(nuevoScore));

    setIntentosHoy(nuevosIntentos);
    localStorage.setItem("fwd_quiz_intentos", String(nuevosIntentos));
    setUltimoIntentoFecha(hoy);
    localStorage.setItem("fwd_quiz_fecha", hoy);

    setQuizActivo({
      ...quizActivo,
      respondido: true,
      esCorrecto,
    });

    if (esCorrecto) {
      const currentProg = etapaProgress[quizActivo.etapaId] || 0;
      const nuevoProg = Math.min(20, currentProg + 1);
      const nuevosProgs = {
        ...etapaProgress,
        [quizActivo.etapaId]: nuevoProg,
      };
      setEtapaProgress(nuevosProgs);
      localStorage.setItem("fwd_quiz_progress", JSON.stringify(nuevosProgs));
    }
  };

  const handleNextQuiz = () => {
    if (!quizActivo) return;

    const etapa = QUIZ_ETAPAS.find((e) => e.id === quizActivo.etapaId);
    if (!etapa) return;

    const currentProg = etapaProgress[quizActivo.etapaId] || 0;

    if (currentProg >= 20) {
      const nuevasInsignias = [...insignias];
      let nuevaEtapa = etapaActual;

      const insigniaEtapaMap: Record<string, string> = {
        "etapa-1": "Especialista UI",
        "etapa-2": "Mago de JS",
        "etapa-3": "Arquitecto Full-Stack",
      };

      const nuevaInsignia = insigniaEtapaMap[etapa.id];
      if (nuevaInsignia && !nuevasInsignias.includes(nuevaInsignia)) {
        nuevasInsignias.push(nuevaInsignia);
        setInsignias(nuevasInsignias);
        localStorage.setItem("fwd_quiz_insignias", JSON.stringify(nuevasInsignias));
      }

      if (etapa.orden === etapaActual) {
        nuevaEtapa = etapaActual + 1;
        setEtapaActual(nuevaEtapa);
        localStorage.setItem("fwd_quiz_etapa", String(nuevaEtapa));
      }

      setQuizActivo(null);
      alert(`¡Felicitaciones! Has completado la etapa "${etapa.titulo}" y ganado la insignia "${nuevaInsignia || ""}".`);
    } else {
      const nextIndex = (quizActivo.preguntaActualIndex + 1) % etapa.preguntas.length;
      setQuizActivo({
        etapaId: quizActivo.etapaId,
        preguntaActualIndex: nextIndex,
        opcionSeleccionada: null,
        respondido: false,
        esCorrecto: false,
      });
    }
  };

  const handleSkipOrForceComplete = (etapaId: string) => {
    const confirmacion = window.confirm("¿Deseas simular la completación de esta etapa para pruebas?");
    if (!confirmacion) return;

    const nuevosProgs = {
      ...etapaProgress,
      [etapaId]: 20,
    };
    setEtapaProgress(nuevosProgs);
    localStorage.setItem("fwd_quiz_progress", JSON.stringify(nuevosProgs));

    const nuevasInsignias = [...insignias];
    let nuevaEtapa = etapaActual;

    const insigniaEtapaMap: Record<string, string> = {
      "etapa-1": "Especialista UI",
      "etapa-2": "Mago de JS",
      "etapa-3": "Arquitecto Full-Stack",
    };

    const nuevaInsignia = insigniaEtapaMap[etapaId];
    if (nuevaInsignia && !nuevasInsignias.includes(nuevaInsignia)) {
      nuevasInsignias.push(nuevaInsignia);
      setInsignias(nuevasInsignias);
      localStorage.setItem("fwd_quiz_insignias", JSON.stringify(nuevasInsignias));
    }

    const etapa = QUIZ_ETAPAS.find((e) => e.id === etapaId);
    if (etapa && etapa.orden === etapaActual) {
      nuevaEtapa = etapaActual + 1;
      setEtapaActual(nuevaEtapa);
      localStorage.setItem("fwd_quiz_etapa", String(nuevaEtapa));
    }

    setQuizActivo(null);
  };

  // --- CHAT INTERACTIVO STATE ---
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "fwd-support",
      name: "Soporte FWD Costa Rica",
      avatar: "/imagenes/fwd-marketplace.png",
      lastMessage: "Tu perfil ha sido verificado con éxito. ¡Bienvenido!",
      time: "10m",
      online: true,
      unread: true,
      messages: [
        { id: "1", sender: "other", text: "Hola! Bienvenido al Marketplace de FWD.", time: "10:15 AM" },
        { id: "2", sender: "other", text: "Tu perfil ha sido verificado con éxito por nuestro equipo administrativo.", time: "10:16 AM" },
        { id: "3", sender: "other", text: "Ya puedes postularte a los proyectos disponibles y completar tus misiones.", time: "10:17 AM" },
      ],
    },
    {
      id: "empresa-1",
      name: "Sofia Mendez (Recruitment Lead)",
      avatar: "",
      lastMessage: "Vimos tu proyecto de React y quisiéramos coordinar una llamada.",
      time: "2h",
      online: true,
      unread: true,
      messages: [
        { id: "1", sender: "other", text: "Hola Estudiante! Excelente portafolio.", time: "Yesterday" },
        { id: "2", sender: "user", text: "Muchas gracias Sofia! Quedo a disposición.", time: "Yesterday" },
        { id: "3", sender: "other", text: "Vimos tu proyecto de React y quisiéramos coordinar una llamada esta semana.", time: "08:30 AM" },
      ],
    },
    {
      id: "mentor-chris",
      name: "Christopher (Mentor FWD)",
      avatar: "",
      lastMessage: "Buen trabajo en el portafolio. Revisa las recomendaciones.",
      time: "1d",
      online: false,
      unread: false,
      messages: [
        { id: "1", sender: "other", text: "Hola! ¿Cómo vas con las misiones de empleabilidad?", time: "2 days ago" },
        { id: "2", sender: "user", text: "Hola Chris! Ya completé el CV y subí dos proyectos.", time: "2 days ago" },
        { id: "3", sender: "other", text: "Buen trabajo en el portafolio. Revisa las recomendaciones del dashboard analítico.", time: "1 day ago" },
      ],
    },
  ]);

  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [newMessageText, setNewMessageText] = useState("");
  const [chatSearch, setChatSearch] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeChat = useMemo(() => {
    return conversations.find((c) => c.id === activeChatId) || null;
  }, [conversations, activeChatId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages]);

  const filteredConversations = useMemo(() => {
    return conversations.filter((c) =>
      c.name.toLowerCase().includes(chatSearch.toLowerCase())
    );
  }, [conversations, chatSearch]);

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: false } : c))
    );
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeChatId) return;

    const timeString = new Date().toLocaleTimeString("es-CR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeChatId) {
          const updatedMessages: ChatMessage[] = [
            ...c.messages,
            {
              id: Date.now().toString(),
              sender: "user",
              text: newMessageText,
              time: timeString,
            },
          ];
          return {
            ...c,
            lastMessage: newMessageText,
            time: "Ahora",
            messages: updatedMessages,
          };
        }
        return c;
      })
    );
    setNewMessageText("");
  };

  // --- GRÁFICO INTERACTIVO ---
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; val: number; label: string } | null>(null);
  
  const chartData = useMemo(() => [
    { label: "Ene", val: 40 },
    { label: "Feb", val: 55 },
    { label: "Mar", val: 48 },
    { label: "Abr", val: 70 },
    { label: "May", val: 82 },
    { label: "Jun", val: perfilCompletado },
  ], [perfilCompletado]);

  const width = 500;
  const height = 180;
  const padding = 30;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = useMemo(() => {
    return chartData.map((d, i) => {
      const x = padding + (i / (chartData.length - 1)) * chartWidth;
      const y = padding + chartHeight - (d.val / 100) * chartHeight;
      return { x, y, val: d.val, label: d.label };
    });
  }, [chartData, chartWidth, chartHeight, padding]);

  const pathD = useMemo(() => {
    if (points.length === 0) return "";
    return points.reduce((acc, p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = points[i - 1]!;
      const cpX1 = prev.x + (p.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (p.x - prev.x) / 2;
      const cpY2 = p.y;
      return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
    }, "");
  }, [points]);

  const fillD = useMemo(() => {
    if (points.length === 0) return "";
    const first = points[0]!;
    const last = points[points.length - 1]!;
    return `${pathD} L ${last.x} ${padding + chartHeight} L ${first.x} ${padding + chartHeight} Z`;
  }, [pathD, points, chartHeight, padding]);

  // Filtrar proyectos manuales según visibilidad
  const proyectosPublicos = useMemo(() => proyectosPortafolio.filter((p) => p.esPublico), [proyectosPortafolio]);
  const proyectosPrivados = useMemo(() => proyectosPortafolio.filter((p) => !p.esPublico), [proyectosPortafolio]);

  return (
    <div className="flex flex-col gap-8">
      
      {/* SECCIÓN SUPERIOR: HERO PREMIUM SAAS */}
      <header className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#0B1F3A] via-[#1E1145] to-[#0D2D4A] p-6 lg:p-8 text-white shadow-2xl border border-white/10">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(102,45,145,0.25),transparent_45%)]" />
        <div aria-hidden className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#20BEC6]/10 blur-3xl" />
        <div aria-hidden className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-[#EC008C]/10 blur-3xl" />

        <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[2fr_1.2fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-[#20BEC6] mb-4">
              <IconSparkles width={14} height={14} /> FWD Academy Control
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Hola, {nombre}
            </h1>
            <p className="mt-3 max-w-xl text-sm md:text-base text-white/80 leading-relaxed">
              Bienvenido a tu centro de control integral. Monitorea tu índice de empleabilidad, chatea con empleadores potenciales y optimiza tu portafolio profesional en tiempo real.
            </p>
            {ultimaSesion && (
              <p className="mt-4 text-xs text-white/50 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Última sesión activa: {ultimaSesion}
              </p>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/${locale}/marketplace`}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-[#008FD4] to-[#20BEC6] px-6 text-sm font-semibold text-white shadow-lg shadow-[#008FD4]/30 hover:scale-[1.02] transition-transform duration-200"
              >
                <IconRocket width={16} height={16} /> Explorar Proyectos Activos
              </Link>
              <Link
                href={`/${locale}/dashboard/estudiante/perfil`}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 px-6 text-sm font-semibold text-white transition-colors"
              >
                Editar Perfil FWD
              </Link>
            </div>
          </div>

          {/* Tarjeta de Progreso Destacada */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md flex flex-col justify-between h-full">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs uppercase tracking-wider text-white/60 font-semibold">Completitud del perfil</span>
              <span className="text-sm font-bold text-[#FFCB05]">{perfilCompletado}%</span>
            </div>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-[#20BEC6] to-[#EC008C] rounded-full transition-all duration-1000"
                style={{ width: `${perfilCompletado}%` }}
              />
            </div>
            <div className="text-xs text-white/70 space-y-2">
              <div className="flex justify-between">
                <span>Nivel actual:</span>
                <span className="font-semibold text-white">{getNivelRank(score)}</span>
              </div>
              <div className="flex justify-between">
                <span>Puntos acumulados:</span>
                <span className="font-semibold text-[#FFCB05]">{score} pts</span>
              </div>
              <div className="flex justify-between">
                <span>Habilidades verificadas:</span>
                <span className="font-semibold text-white">{habilidadesVerificadas}</span>
              </div>
              <div className="flex justify-between">
                <span>Proyectos manuales:</span>
                <span className="font-semibold text-white">{proyectosPortafolio.length}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* DISEÑO PRINCIPAL CON SUB-BARRA LATERAL MINIMALISTA TIPO SAAS */}
      <div className="flex flex-col lg:flex-row gap-8 items-stretch w-full">
        
        {/* BARRA LATERAL SUB-MINIMALISTA CON GRADIENTE VERTICAL */}
        <div className="lg:w-64 shrink-0 rounded-[24px] bg-gradient-to-b from-[#008FD4] via-[#662D91] to-[#20BEC6] p-5 text-white shadow-xl flex flex-col justify-between border border-white/10 relative overflow-hidden">
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
          
          <div className="relative z-10 flex flex-col gap-6">
            <div className="px-2 py-3 border-b border-white/20">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#20BEC6]">FWD Academia</span>
              <h3 className="font-display font-extrabold text-white text-lg mt-0.5">SaaS Dashboard</h3>
            </div>
            
            <nav className="flex flex-col gap-2">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs uppercase tracking-wider font-extrabold transition-all duration-200 ${
                  activeTab === "dashboard"
                    ? "bg-white text-[#662D91] shadow-lg scale-[1.02]"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <LayoutDashboard className="w-4.5 h-4.5" />
                <span>Dashboard</span>
              </button>
              
              <button
                onClick={() => setActiveTab("proyectos")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs uppercase tracking-wider font-extrabold transition-all duration-200 ${
                  activeTab === "proyectos"
                    ? "bg-white text-[#662D91] shadow-lg scale-[1.02]"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Briefcase className="w-4.5 h-4.5" />
                <span>Mis Proyectos</span>
              </button>
              
              <button
                onClick={() => setActiveTab("mensajes")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs uppercase tracking-wider font-extrabold transition-all duration-200 ${
                  activeTab === "mensajes"
                    ? "bg-white text-[#662D91] shadow-lg scale-[1.02]"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <MessageSquare className="w-4.5 h-4.5" />
                <span>Mensajes</span>
              </button>
              
              <button
                onClick={() => setActiveTab("academia")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs uppercase tracking-wider font-extrabold transition-all duration-200 ${
                  activeTab === "academia"
                    ? "bg-white text-[#662D91] shadow-lg scale-[1.02]"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Award className="w-4.5 h-4.5" />
                <span>Academia FWD</span>
              </button>
            </nav>
          </div>
          
          <div className="relative z-10 pt-4 border-t border-white/20 mt-8 lg:mt-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-white/70 font-semibold uppercase">Puntaje</span>
              <span className="text-[10px] text-white/70 font-semibold uppercase">Insignias</span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-black text-[#FFCB05]">{score} <span className="text-[10px] font-normal text-white">pts</span></span>
              <span className="text-sm font-bold text-[#20BEC6]">{insignias.length}</span>
            </div>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="flex-1 min-w-0">

          {/* TAB 1: RESUMEN DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="flex flex-col gap-8">
              
              {/* Tarjetas de Métricas SaaS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Tarjeta 1 */}
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-4 shadow-sm hover:-translate-y-1.5 transition-transform duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Postulaciones</span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#008FD4]/10 text-[#008FD4]">
                      <IconFile width={16} height={16} />
                    </span>
                  </div>
                  <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{resumen.totalOfertas}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Ofertas enviadas</p>
                </div>

                {/* Tarjeta 2 */}
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-4 shadow-sm hover:-translate-y-1.5 transition-transform duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">En Curso</span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#662D91]/10 text-[#662D91]">
                      <IconBriefcase width={16} height={16} />
                    </span>
                  </div>
                  <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{resumen.proyectosActivos}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Proyectos activos</p>
                </div>

                {/* Tarjeta 3 */}
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-4 shadow-sm hover:-translate-y-1.5 transition-transform duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Finalizados</span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#20BEC6]/10 text-[#20BEC6]">
                      <IconAward width={16} height={16} />
                    </span>
                  </div>
                  <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{resumen.proyectosCompletados}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Proyectos terminados</p>
                </div>

                {/* Tarjeta 4 */}
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-4 shadow-sm hover:-translate-y-1.5 transition-transform duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Reputación</span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFCB05]/10 text-[#FFCB05]">
                      <IconStar width={16} height={16} />
                    </span>
                  </div>
                  <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{resumen.reputacion.toFixed(1)}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Calificación promedio</p>
                </div>
              </div>

              {/* Gráfico de Métricas Suaves */}
              <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">Análisis de Progreso</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Evolución de tu empleabilidad y búsquedas en los últimos 6 meses</p>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-white/5 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300">
                    <IconTrendingUp className="text-[#20BEC6]" width={14} height={14} />
                    <span>+24% vs. trimestre anterior</span>
                  </div>
                </div>

                {/* Contenedor Gráfico SVG */}
                <div className="relative w-full h-[180px]">
                  <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#008FD4" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#662D91" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#20BEC6" />
                        <stop offset="50%" stopColor="#008FD4" />
                        <stop offset="100%" stopColor="#EC008C" />
                      </linearGradient>
                    </defs>

                    {/* Líneas de cuadrícula horizontales */}
                    {[0, 25, 50, 75, 100].map((gridVal) => {
                      const y = padding + chartHeight - (gridVal / 100) * chartHeight;
                      return (
                        <line
                          key={gridVal}
                          x1={padding}
                          y1={y}
                          x2={width - padding}
                          y2={y}
                          stroke="rgba(148, 163, 184, 0.08)"
                          strokeWidth="1"
                        />
                      );
                    })}

                    {/* Relleno bajo la línea */}
                    <path d={fillD} fill="url(#chartGradient)" />

                    {/* Línea de tendencia curveada */}
                    <path d={pathD} fill="none" stroke="url(#strokeGradient)" strokeWidth="3" strokeLinecap="round" />

                    {/* Nodos de datos */}
                    {points.map((p, i) => (
                      <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r={hoveredPoint?.x === p.x ? "6" : "4"}
                        fill={hoveredPoint?.x === p.x ? "#fff" : "#008FD4"}
                        stroke={hoveredPoint?.x === p.x ? "#008FD4" : "#fff"}
                        strokeWidth="2"
                        className="cursor-pointer transition-all duration-150"
                        onMouseEnter={() => setHoveredPoint(p)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    ))}

                    {/* Etiquetas de eje X */}
                    {points.map((p, i) => (
                      <text
                        key={i}
                        x={p.x}
                        y={height - 8}
                        textAnchor="middle"
                        fill="currentColor"
                        className="text-[10px] font-semibold text-slate-400 dark:text-slate-500"
                      >
                        {p.label}
                      </text>
                    ))}
                  </svg>

                  {/* Tooltip flotante interactivo */}
                  {hoveredPoint && (
                    <div
                      className="absolute bg-slate-900 text-white rounded-lg p-2 text-xs shadow-md border border-white/10 pointer-events-none transition-all duration-150 -translate-x-1/2 -translate-y-full"
                      style={{
                        left: `${(hoveredPoint.x / width) * 100}%`,
                        top: `${(hoveredPoint.y / height) * 100 - 4}%`,
                      }}
                    >
                      <p className="font-bold">{hoveredPoint.label}</p>
                      <p className="text-[10px] text-slate-300">Índice: {hoveredPoint.val}%</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Componente del Match de Empleabilidad */}
              <MatchEmpleabilidad
                locale={locale}
                perfilCompletado={perfilCompletado}
                nivel={getNivelRank(score)}
                habilidades={perfil.habilidades.map((h) => perfil.catalogo.find((c) => c.id === h.id)?.nombre || "")}
                tieneCV={Boolean(cv)}
                tienePortafolio={proyectosPortafolio.length > 0}
                proyectosCompletados={resumen.proyectosCompletados}
              />

              {/* Oportunidades recomendadas */}
              <section className="mt-2">
                <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
                  <div>
                    <span className="inline-flex items-center gap-2">
                      <span className="h-1.5 w-8 rounded-full bg-gradient-to-r from-[#008FD4] to-[#662D91]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-[#008FD4]">
                        Recomendaciones FWD
                      </span>
                    </span>
                    <h2 className="mt-2 font-display text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                      Oportunidades recomendadas para ti
                    </h2>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#008FD4] to-[#20BEC6] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm">
                    <IconSparkles width={14} height={14} />
                    Match Inteligente
                  </span>
                </div>

                <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-300 dark:border-white/15 py-12 text-center bg-white dark:bg-white/[0.01]">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-[#008FD4] to-[#20BEC6] text-white">
                    <IconSparkles width={22} height={22} />
                  </span>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Aún no hay proyectos recomendados</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400/80 max-w-sm px-4">
                    Cuando los empresarios publiquen proyectos compatibles con tus habilidades seleccionadas, aparecerán aquí de forma automática.
                  </p>
                </div>
              </section>

              {/* Próximos Eventos FWD */}
              <section className="mt-4">
                <div className="flex items-center gap-2 mb-6">
                  <span className="h-1.5 w-8 rounded-full bg-[#20BEC6]" />
                  <h2 className="font-display text-xl font-extrabold text-slate-900 dark:text-white">Próximos Eventos FWD</h2>
                </div>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {eventos.map((evento) => (
                    <div
                      key={evento.id}
                      className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-5 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300"
                    >
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#662D91]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#662D91] mb-3 capitalize">
                        <Calendar className="w-3 h-3 mr-1" /> {evento.categoria}
                      </span>
                      <h4 className="font-display text-sm font-bold text-slate-900 dark:text-white mb-2 leading-snug">{evento.titulo}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400/80 mb-4 line-clamp-2">{evento.lugar}</p>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-white/5 pt-3">
                        <span>{evento.fecha}</span>
                        <span className="font-semibold">{evento.modalidad || "Virtual"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: PORTAFOLIO Y VISIBILIDAD */}
          {activeTab === "proyectos" && (
            <div className="flex flex-col gap-8">

              {/* MIS POSTULACIONES */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="h-2 w-2 rounded-full bg-[#008FD4]" />
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    Mis Postulaciones ({misOfertas.length})
                  </h3>
                </div>
                {misOfertas.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 dark:border-white/15 py-8 text-center bg-slate-50/50 dark:bg-white/[0.01]">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Aún no te has postulado a ningún proyecto.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {misOfertas.map((oferta) => {
                      const fallback = { label: "Proyecto cerrado", badge: "bg-slate-500/10 text-slate-500 dark:text-slate-400" };
                      const meta = oferta.badge === "proyecto_cerrado"
                        ? fallback
                        : ESTADO_OFERTA_META[oferta.badge];
                      return (
                        <div
                          key={oferta.id}
                          className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-4 shadow-sm hover:shadow-md transition-all duration-300"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1.5">
                                <h4 className="font-display font-bold text-slate-900 dark:text-white truncate">
                                  {oferta.proyecto.titulo}
                                </h4>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${meta.badge}`}>
                                  {meta.label}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
                                {oferta.propuesta}
                              </p>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 dark:text-slate-500">
                                <span>{oferta.proyecto.area}</span>
                                <span>{oferta.proyecto.empresario}</span>
                                <span>{new Date(oferta.fechaEnvio).toLocaleDateString("es-CR", { day: "numeric", month: "long", year: "numeric" })}</span>
                              </div>
                            </div>
                            <Link
                              href={`/${locale}/proyectos/${oferta.proyecto.id}`}
                              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-[#008FD4]/10 px-3.5 text-[11px] font-bold text-[#008FD4] hover:bg-[#008FD4]/20 transition-colors"
                            >
                              Ver proyecto
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Formulario Agregar Proyecto */}
              <div className="rounded-[24px] border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] p-6 shadow-sm">
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-1.5">
                  {editingProjectId ? "Editar Proyecto del Portafolio" : "Agregar Proyecto al Portafolio"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                  {editingProjectId ? "Modifica los detalles de tu proyecto seleccionado." : "Agrega un nuevo proyecto manual y define su visibilidad en el portal."}
                </p>
                
                <form onSubmit={handleAgregarProyecto} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Título del Proyecto</label>
                      <input
                        type="text"
                        placeholder="Ej: Chat App en tiempo real"
                        value={nuevoProyecto.titulo}
                        onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, titulo: e.target.value })}
                        className="h-11 w-full rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/[0.03] px-3.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#008FD4] focus:ring-2 focus:ring-[#008FD4]/10 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Tecnologías (separadas por coma)</label>
                      <input
                        type="text"
                        placeholder="React, Socket.io, Node.js"
                        value={nuevoProyecto.tecnologias}
                        onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, tecnologias: e.target.value })}
                        className="h-11 w-full rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/[0.03] px-3.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#008FD4] focus:ring-2 focus:ring-[#008FD4]/10 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Descripción del Proyecto</label>
                    <textarea
                      rows={3}
                      placeholder="Explica qué problema soluciona tu proyecto y cómo lo estructuraste..."
                      value={nuevoProyecto.descripcion}
                      onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, descripcion: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/[0.03] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#008FD4] focus:ring-2 focus:ring-[#008FD4]/10 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Enlace al Repositorio (Git)</label>
                      <input
                        type="url"
                        placeholder="https://github.com/usuario/repo"
                        value={nuevoProyecto.repoUrl}
                        onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, repoUrl: e.target.value })}
                        className="h-11 w-full rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/[0.03] px-3.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#008FD4] focus:ring-2 focus:ring-[#008FD4]/10 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Enlace a Demo (Opcional)</label>
                      <input
                        type="url"
                        placeholder="https://midemo.com"
                        value={nuevoProyecto.demoUrl}
                        onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, demoUrl: e.target.value })}
                        className="h-11 w-full rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/[0.03] px-3.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#008FD4] focus:ring-2 focus:ring-[#008FD4]/10 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Visibilidad Inicial</label>
                      <select
                        value={nuevoProyecto.esPublico ? "publico" : "privado"}
                        onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, esPublico: e.target.value === "publico" })}
                        className="h-11 w-full rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/[0.03] px-3.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#008FD4] focus:ring-2 focus:ring-[#008FD4]/10 transition-colors"
                      >
                        <option value="publico">Público (Visible en Perfil)</option>
                        <option value="privado">Privado (Solo para mí)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-xs">
                      {errorProyecto && <p className="text-red-500 font-semibold">{errorProyecto}</p>}
                      {exitoProyecto && <p className="text-emerald-500 font-semibold">
                        {editingProjectId ? "¡Proyecto editado exitosamente!" : "¡Proyecto agregado exitosamente!"}
                      </p>}
                    </div>
                    <div className="flex gap-2">
                      {editingProjectId && (
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="inline-flex h-11 items-center justify-center px-5 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider"
                        >
                          Cancelar
                        </button>
                      )}
                      <button
                        type="submit"
                        className="inline-flex h-11 items-center justify-center px-6 rounded-xl bg-gradient-to-r from-[#008FD4] to-[#20BEC6] text-xs font-bold text-white uppercase tracking-wider shadow-md hover:scale-[1.01] transition-transform"
                      >
                        {editingProjectId ? "Guardar Cambios" : "Añadir Proyecto"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* LISTADO DE PROYECTOS PÚBLICOS */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">Proyectos Públicos ({proyectosPublicos.length})</h3>
                </div>
                {proyectosPublicos.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 dark:border-white/15 py-8 text-center bg-slate-50/50 dark:bg-white/[0.01]">
                    <p className="text-xs text-slate-500 dark:text-slate-400">No tienes proyectos públicos configurados. Los empleadores no verán tu portafolio.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {proyectosPublicos.map((p) => (
                      <div
                        key={p.id}
                        className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-5 shadow-sm hover:shadow-md transition-all duration-300 relative group flex flex-col justify-between h-full"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500">
                              <Eye className="w-3 h-3" /> Público
                            </span>
                            
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => startEditing(p)}
                                title="Editar"
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleToggleProyectoVisibilidad(p.id)}
                                title="Hacer Privado"
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
                              >
                                <Lock className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleEliminarProyecto(p.id)}
                                title="Eliminar"
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          
                          <h4 className="font-display font-bold text-slate-900 dark:text-white leading-snug mb-1">{p.titulo}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed">{p.descripcion}</p>
                        </div>
                        
                        <div className="border-t border-slate-100 dark:border-white/5 pt-3 mt-auto">
                          <div className="flex flex-wrap gap-1 mb-3">
                            {p.tecnologias.split(",").map((tech: string, i: number) => (
                              <span key={i} className="text-[10px] bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-medium">
                                {tech.trim()}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            {p.repoUrl && (
                              <a href={p.repoUrl} target="_blank" rel="noopener noreferrer" className="text-[#008FD4] font-semibold hover:underline">
                                GitHub
                              </a>
                            )}
                            {p.demoUrl && (
                              <a href={p.demoUrl} target="_blank" rel="noopener noreferrer" className="text-[#20BEC6] font-semibold hover:underline">
                                Demo
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* LISTADO DE PROYECTOS PRIVADOS */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">Proyectos Privados (Ocultos) ({proyectosPrivados.length})</h3>
                </div>
                {proyectosPrivados.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 dark:border-white/15 py-8 text-center bg-slate-50/50 dark:bg-white/[0.01]">
                    <p className="text-xs text-slate-500 dark:text-slate-400">No tienes proyectos privados. Todos tus proyectos manuales son visibles públicamente.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {proyectosPrivados.map((p) => (
                      <div
                        key={p.id}
                        className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-5 shadow-sm hover:shadow-md transition-all duration-300 relative group flex flex-col justify-between h-full"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500">
                              <Lock className="w-3 h-3" /> Privado
                            </span>
                            
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => startEditing(p)}
                                title="Editar"
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleToggleProyectoVisibilidad(p.id)}
                                title="Hacer Público"
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleEliminarProyecto(p.id)}
                                title="Eliminar"
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          
                          <h4 className="font-display font-bold text-slate-900 dark:text-white leading-snug mb-1">{p.titulo}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed">{p.descripcion}</p>
                        </div>
                        
                        <div className="border-t border-slate-100 dark:border-white/5 pt-3 mt-auto">
                          <div className="flex flex-wrap gap-1 mb-3">
                            {p.tecnologias.split(",").map((tech: string, i: number) => (
                              <span key={i} className="text-[10px] bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-medium">
                                {tech.trim()}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            {p.repoUrl && (
                              <a href={p.repoUrl} target="_blank" rel="noopener noreferrer" className="text-[#008FD4] font-semibold hover:underline">
                                GitHub
                              </a>
                            )}
                            {p.demoUrl && (
                              <a href={p.demoUrl} target="_blank" rel="noopener noreferrer" className="text-[#20BEC6] font-semibold hover:underline">
                                Demo
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: MENSAJES (Inbox) */}
          {activeTab === "mensajes" && (
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] shadow-sm flex flex-col lg:flex-row h-full overflow-hidden min-h-[580px] max-h-[800px]">
              
              {/* Columna Izquierda: Listado de Chats */}
              <div className="w-full lg:w-80 border-r border-slate-200 dark:border-white/15 flex flex-col shrink-0">
                <div className="p-4 border-b border-slate-200 dark:border-white/15">
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#008FD4]/15 text-[#008FD4]">
                      <MessageSquare className="h-4.5 w-4.5" />
                    </span>
                    <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">Bandeja de Entrada</h3>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar chats..."
                      value={chatSearch}
                      onChange={(e) => setChatSearch(e.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/[0.03] pl-9 pr-4 text-xs text-slate-900 dark:text-white outline-none focus:border-[#008FD4] focus:ring-2 focus:ring-[#008FD4]/10 transition-colors"
                    />
                    <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5 hide-scrollbar">
                  {filteredConversations.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500">
                      No se encontraron conversaciones.
                    </div>
                  ) : (
                    filteredConversations.map((chat) => (
                      <button
                        key={chat.id}
                        onClick={() => handleSelectChat(chat.id)}
                        className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${
                          activeChatId === chat.id
                            ? "bg-slate-50 dark:bg-white/5"
                            : "hover:bg-slate-50/50 dark:hover:bg-white/[0.02]"
                        }`}
                      >
                        <div className="relative shrink-0">
                          {chat.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={chat.avatar}
                              alt={chat.name}
                              className="h-9 w-9 rounded-full object-cover border border-slate-200 dark:border-white/10"
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-[#662D91]/15 text-[#662D91] font-bold text-xs flex items-center justify-center">
                              {chat.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          {chat.online && (
                            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0f172a]" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-0.5">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{chat.name}</h4>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 ml-2">{chat.time}</span>
                          </div>
                          <p className={`text-[11px] truncate ${chat.unread ? "font-bold text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}>
                            {chat.lastMessage}
                          </p>
                        </div>

                        {chat.unread && (
                          <span className="h-2 w-2 rounded-full bg-[#008FD4] shrink-0 self-center" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Columna Derecha: Contenido del Chat */}
              <div className="flex-1 bg-slate-50/50 dark:bg-white/[0.01] flex flex-col overflow-hidden min-h-[400px]">
                {activeChat ? (
                  <>
                    {/* Header Chat */}
                    <div className="p-4 border-b border-slate-200 dark:border-white/15 bg-white dark:bg-[#0f172a] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {activeChat.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={activeChat.avatar} alt={activeChat.name} className="h-8 w-8 rounded-full object-cover" />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-[#662D91]/15 text-[#662D91] font-bold text-xs flex items-center justify-center">
                              {activeChat.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          {activeChat.online && (
                            <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-[#0f172a]" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">{activeChat.name}</h4>
                          <span className="text-[10px] text-emerald-500 font-semibold">{activeChat.online ? "En línea" : "Desconectado"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Historial Mensajes */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {activeChat.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex flex-col max-w-[85%] ${
                            msg.sender === "user" ? "ml-auto items-end" : "items-start"
                          }`}
                        >
                          <div
                            className={`rounded-2xl px-3.5 py-2 text-xs leading-normal ${
                              msg.sender === "user"
                                ? "bg-[#008FD4] text-white rounded-tr-none shadow-sm"
                                : "bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white rounded-tl-none border border-slate-200/50 dark:border-white/5"
                            }`}
                          >
                            {msg.text}
                          </div>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 px-1">
                            {msg.time}
                          </span>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Formulario Envío */}
                    <form
                      onSubmit={handleSendMessage}
                      className="p-3 border-t border-slate-200 dark:border-white/15 bg-white dark:bg-[#0b1329] flex gap-2"
                    >
                      <input
                        type="text"
                        placeholder="Escribe un mensaje..."
                        value={newMessageText}
                        onChange={(e) => setNewMessageText(e.target.value)}
                        className="h-9 flex-1 rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/[0.03] px-3.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#008FD4] focus:ring-1 focus:ring-[#008FD4]/10 transition-colors"
                      />
                      <button
                        type="submit"
                        disabled={!newMessageText.trim()}
                        className="h-9 w-9 rounded-xl bg-[#008FD4] text-white flex items-center justify-center hover:bg-[#008FD4]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </form>
                  </>
                ) : (
                  /* Estado Vacío Chat */
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <div className="h-12 w-12 rounded-full bg-[#008FD4]/10 text-[#008FD4] flex items-center justify-center mb-3">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">Bandeja de Entrada FWD</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[240px] leading-relaxed">
                      Elige una conversación en la columna de la izquierda para comenzar a enviar mensajes a tus reclutadores o mentores.
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 4: ACADEMIA (Gamificación / Quizzes) */}
          {activeTab === "academia" && (
            <div className="flex flex-col gap-8">
              
              {/* HEADER DE LA ACADEMIA: SCORE Y MEDALLAS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Score Card */}
                <div className="rounded-[24px] border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] p-5 shadow-sm flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Puntaje Total</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{score} pts</span>
                  </div>
                </div>

                {/* Level Card */}
                <div className="rounded-[24px] border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] p-5 shadow-sm flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Nivel de Rango</span>
                    <span className="text-base font-black text-slate-900 dark:text-white leading-tight">{getNivelRank(score)}</span>
                  </div>
                </div>

                {/* Daily limit check */}
                <div className="rounded-[24px] border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] p-5 shadow-sm flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Quizzes Completados Hoy</span>
                    <span className="text-base font-black text-slate-900 dark:text-white leading-tight">
                      {intentosHoy} de 3
                    </span>
                    {intentosHoy >= 3 && <span className="text-[9px] text-amber-500 font-semibold block">Límite alcanzado</span>}
                  </div>
                </div>
              </div>

              {/* CONTENEDOR INSIGNIAS */}
              <div className="rounded-[24px] border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] p-5 shadow-sm">
                <span className="text-[10px] font-black text-[#20BEC6] uppercase tracking-widest block mb-1">Logros & Progresión</span>
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white mb-4">Tus Insignias Ganadas</h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Insignia 1: Iniciador */}
                  <div className={`p-4 rounded-2xl border text-center transition-all duration-300 ${
                    insignias.includes("Iniciador FWD")
                      ? "border-purple-200 dark:border-purple-500/20 bg-purple-50/50 dark:bg-purple-500/5 text-purple-600 dark:text-purple-400 font-bold"
                      : "border-slate-200 dark:border-white/5 opacity-40 bg-slate-50/30 text-slate-400"
                  }`}>
                    <Trophy className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-xs font-bold leading-tight">Iniciador FWD</p>
                    <span className="text-[9px] font-normal block mt-1">Registrado en FWD</span>
                  </div>

                  {/* Insignia 2: Especialista UI */}
                  <div className={`p-4 rounded-2xl border text-center transition-all duration-300 ${
                    insignias.includes("Especialista UI")
                      ? "border-blue-200 dark:border-blue-500/20 bg-blue-50/50 dark:bg-blue-500/5 text-blue-600 dark:text-blue-400 font-bold"
                      : "border-slate-200 dark:border-white/5 opacity-40 bg-slate-50/30 text-slate-400"
                  }`}>
                    <Award className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-xs font-bold leading-tight">Especialista UI</p>
                    <span className="text-[9px] font-normal block mt-1">Completar Etapa 1</span>
                  </div>

                  {/* Insignia 3: Mago JS */}
                  <div className={`p-4 rounded-2xl border text-center transition-all duration-300 ${
                    insignias.includes("Mago de JS")
                      ? "border-teal-200 dark:border-teal-500/20 bg-teal-50/50 dark:bg-teal-500/5 text-teal-600 dark:text-teal-400 font-bold"
                      : "border-slate-200 dark:border-white/5 opacity-40 bg-slate-50/30 text-slate-400"
                  }`}>
                    <IconCpu className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-xs font-bold leading-tight">Mago de JS</p>
                    <span className="text-[9px] font-normal block mt-1">Completar Etapa 2</span>
                  </div>

                  {/* Insignia 4: Arquitecto Full Stack */}
                  <div className={`p-4 rounded-2xl border text-center transition-all duration-300 ${
                    insignias.includes("Arquitecto Full-Stack")
                      ? "border-pink-200 dark:border-pink-500/20 bg-pink-50/50 dark:bg-pink-500/5 text-pink-600 dark:text-pink-400 font-bold"
                      : "border-slate-200 dark:border-white/5 opacity-40 bg-slate-50/30 text-slate-400"
                  }`}>
                    <Trophy className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-xs font-bold leading-tight">Arquitecto FS</p>
                    <span className="text-[9px] font-normal block mt-1">Completar Etapa 3</span>
                  </div>
                </div>
              </div>

              {/* RENDERIZADOR DE QUIZ ACTIVO O MAPA DE ETAPAS */}
              {quizActivo ? (
                /* RESOLUTOR DE QUIZ INTERACTIVO */
                <div className="rounded-[24px] border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] p-6 shadow-md">
                  {(() => {
                    const etapa = QUIZ_ETAPAS.find((e) => e.id === quizActivo.etapaId);
                    const pregunta = etapa?.preguntas[quizActivo.preguntaActualIndex];
                    if (!pregunta) return null;

                    const letrasOpciones = ["A", "B", "C", "D"];

                    return (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
                          <div>
                            <span className="text-[10px] font-bold text-[#008FD4] uppercase tracking-widest block">{etapa?.titulo}</span>
                            <h4 className="font-display text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                              Pregunta {quizActivo.preguntaActualIndex + 1} de {etapa?.preguntas.length}
                            </h4>
                          </div>
                          <button
                            onClick={() => setQuizActivo(null)}
                            className="h-8 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors"
                          >
                            Salir del Quiz
                          </button>
                        </div>

                        <div className="space-y-4">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
                            {pregunta.pregunta}
                          </p>

                          <div className="grid grid-cols-1 gap-3">
                            {pregunta.opciones.map((opc, idx) => {
                              const isSelected = quizActivo.opcionSeleccionada === idx;
                              const isCorrect = idx === pregunta.respuestaCorrecta;
                              
                              let buttonStyles = "border-slate-200 dark:border-white/10 bg-slate-50 hover:bg-slate-100 dark:bg-white/[0.01] dark:hover:bg-white/[0.04]";
                              if (isSelected) {
                                buttonStyles = "border-[#008FD4] bg-[#008FD4]/5 text-[#008FD4]";
                              }
                              if (quizActivo.respondido) {
                                if (isCorrect) {
                                  buttonStyles = "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
                                } else if (isSelected) {
                                  buttonStyles = "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400";
                                } else {
                                  buttonStyles = "border-slate-200 dark:border-white/5 opacity-55";
                                }
                              }

                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  disabled={quizActivo.respondido}
                                  onClick={() => handleAnswerSelection(idx)}
                                  className={`w-full text-left p-4 rounded-xl border text-xs font-semibold flex items-center gap-3.5 transition-all ${buttonStyles}`}
                                >
                                  <span className={`h-6 w-6 rounded-lg font-black flex items-center justify-center shrink-0 text-[10px] ${
                                    isSelected
                                      ? "bg-[#008FD4] text-white"
                                      : quizActivo.respondido && isCorrect
                                      ? "bg-emerald-500 text-white"
                                      : quizActivo.respondido && isSelected
                                      ? "bg-red-500 text-white"
                                      : "bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300"
                                  }`}>
                                    {letrasOpciones[idx]}
                                  </span>
                                  <span>{opc}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Banner Retroalimentación */}
                        {quizActivo.respondido && (
                          <div className={`p-4 rounded-xl border ${
                            quizActivo.esCorrecto
                              ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-500/10 dark:bg-emerald-500/[0.02]"
                              : "border-red-200 bg-red-50/50 dark:border-red-500/10 dark:bg-red-500/[0.02]"
                          }`}>
                            <div className="flex items-start gap-2.5">
                              {quizActivo.esCorrecto ? (
                                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                              )}
                              <div>
                                <h5 className={`text-xs font-bold ${quizActivo.esCorrecto ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}>
                                  {quizActivo.esCorrecto ? "¡Excelente! Respuesta correcta (+100 pts)" : "Incorrecto"}
                                </h5>
                                <p className="text-xs text-slate-500 dark:text-slate-400/90 mt-1 leading-relaxed">
                                  {pregunta.explicacion}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end gap-3 pt-2">
                          {!quizActivo.respondido ? (
                            <button
                              type="button"
                              onClick={handleVerifyAnswer}
                              disabled={quizActivo.opcionSeleccionada === null}
                              className="h-11 px-6 rounded-xl bg-[#008FD4] text-xs font-bold text-white uppercase tracking-wider shadow-md hover:bg-[#008FD4]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                              Verificar Respuesta
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={handleNextQuiz}
                              className="h-11 px-6 rounded-xl bg-gradient-to-r from-[#008FD4] to-[#20BEC6] text-xs font-bold text-white uppercase tracking-wider shadow-md hover:scale-[1.01] transition-transform"
                            >
                              Siguiente
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                /* MAPA GENERAL DE ETAPAS DE APRENDIZAJE */
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="h-1.5 w-8 rounded-full bg-[#662D91]" />
                    <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">Progresión de Etapas</h3>
                  </div>

                  <div className="flex flex-col gap-4">
                    {QUIZ_ETAPAS.map((etapa) => {
                      const isLocked = etapa.orden > etapaActual;
                      const progressVal = etapaProgress[etapa.id] || 0;
                      const percent = Math.min(100, Math.round((progressVal / 20) * 100));
                      const isCompleted = progressVal >= 20;

                      return (
                        <div
                          key={etapa.id}
                          className={`rounded-[24px] border p-6 transition-all duration-300 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                            isLocked
                              ? "border-slate-200 dark:border-white/5 bg-slate-100/20 dark:bg-white/[0.01] opacity-60"
                              : "border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] shadow-sm hover:shadow-md"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                              <span className={`grid h-8 w-8 place-items-center rounded-xl text-xs font-black shrink-0 ${
                                isLocked
                                  ? "bg-slate-200 dark:bg-white/5 text-slate-400"
                                  : isCompleted
                                  ? "bg-emerald-500/10 text-emerald-500"
                                  : "bg-[#008FD4]/10 text-[#008FD4]"
                              }`}>
                                {isLocked ? <Lock className="w-4 h-4" /> : isCompleted ? <IconCheck width={14} height={14} /> : etapa.orden}
                              </span>
                              <div>
                                <h4 className="font-display text-sm font-bold text-slate-900 dark:text-white">{etapa.titulo}</h4>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block">
                                  {isLocked ? "Bloqueado" : isCompleted ? "Etapa Completada" : "En curso"}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 max-w-xl leading-relaxed">{etapa.descripcion}</p>
                            
                            {/* Progreso bar */}
                            {!isLocked && (
                              <div className="mt-4 max-w-sm">
                                <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 mb-1.5 font-bold">
                                  <span>Progreso</span>
                                  <span>{progressVal} / 20 Quizzes correctos ({percent}%)</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                  <div className="h-full bg-[#008FD4] rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            {/* Force Complete simulation button for testing */}
                            {!isLocked && !isCompleted && (
                              <button
                                type="button"
                                onClick={() => handleSkipOrForceComplete(etapa.id)}
                                className="h-9 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5 text-[10px] font-bold text-slate-500 dark:text-slate-400 transition-colors uppercase tracking-wider"
                              >
                                Simular
                              </button>
                            )}

                            {isLocked ? (
                              <div className="h-11 px-6 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 text-xs font-bold flex items-center justify-center gap-2 select-none">
                                <Lock className="w-3.5 h-3.5" />
                                <span>Bloqueado</span>
                              </div>
                            ) : isCompleted ? (
                              <div className="h-11 px-6 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 select-none">
                                <IconCheck width={14} height={14} />
                                <span>Completado</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => startQuiz(etapa.id)}
                                className="inline-flex h-11 items-center justify-center px-6 rounded-xl bg-gradient-to-r from-[#008FD4] to-[#20BEC6] text-xs font-bold text-white uppercase tracking-wider shadow-md hover:scale-[1.01] transition-transform"
                              >
                                Resolver Quiz
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
        
      </div>

    </div>
  );
}
