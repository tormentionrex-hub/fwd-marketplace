"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Code2,
  LayoutTemplate,
  Server,
  Database,
  GraduationCap,
  Trophy,
  Lock,
  Check,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Award,
  CheckCircle2,
  XCircle,
  Info,
  type LucideIcon,
} from "lucide-react";
import QuizModal from "./QuizModal";
import { CATEGORIAS, getCategoria, getTema } from "@/lib/quizzes";
import {
  ACIERTOS_PARA_APROBAR,
  PREGUNTAS_POR_FASE,
  etiquetaDificultad,
} from "@/lib/quizzes/tipos";
import {
  parsearQuizzes,
  contarFasesCompletadas,
  porcentajeGlobal,
  insigniasDeProgreso,
  type QuizzesEstado,
} from "@/lib/quizzes/progreso";
import { TOTAL_FASES } from "@/lib/quizzes";

const ICONOS: Record<string, LucideIcon> = {
  Code2,
  LayoutTemplate,
  Server,
  Database,
  GraduationCap,
};

const INTRO_STORAGE_KEY = "fwd_logros_intro_visto";
const LETRAS = ["A", "B", "C", "D"];

interface LogrosClienteProps {
  estadoInicial: QuizzesEstado;
}

type Vista = "categorias" | "temas" | "fases" | "quiz";

export default function LogrosCliente({ estadoInicial }: LogrosClienteProps) {
  const [estado, setEstado] = useState<QuizzesEstado>(estadoInicial);
  const [vista, setVista] = useState<Vista>("categorias");
  const [catId, setCatId] = useState<string | null>(null);
  const [temaId, setTemaId] = useState<string | null>(null);
  const [introAbierto, setIntroAbierto] = useState(false);

  // --- Estado del resolutor de quiz ---
  const [faseNum, setFaseNum] = useState(1);
  const [preguntaIdx, setPreguntaIdx] = useState(0);
  const [respuestas, setRespuestas] = useState<number[]>([]);
  const [seleccion, setSeleccion] = useState<number | null>(null);
  const [respondido, setRespondido] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{
    aprobado: boolean;
    aciertos: number;
    total: number;
    insigniaNueva: boolean;
  } | null>(null);

  // Modal explicativo la primera vez que se entra a Logros.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(INTRO_STORAGE_KEY)) {
      setIntroAbierto(true);
    }
  }, []);

  const cerrarIntro = () => {
    setIntroAbierto(false);
    if (typeof window !== "undefined") localStorage.setItem(INTRO_STORAGE_KEY, "1");
  };

  const categoriaSel = catId ? getCategoria(catId) : undefined;
  const temaSel = temaId ? getTema(temaId) : undefined;

  const fasesCompletadas = useMemo(() => contarFasesCompletadas(estado.progreso), [estado.progreso]);
  const porcentaje = useMemo(() => porcentajeGlobal(estado.progreso), [estado.progreso]);
  const totalInsignias = fasesCompletadas;
  const insigniasRecientes = useMemo(
    () => insigniasDeProgreso(estado.progreso).slice(-8).reverse(),
    [estado.progreso],
  );

  // --- Navegación ---
  const irACategorias = () => {
    setVista("categorias");
    setCatId(null);
    setTemaId(null);
  };
  const abrirCategoria = (id: string) => {
    setCatId(id);
    setTemaId(null);
    setVista("temas");
  };
  const abrirTema = (id: string) => {
    setTemaId(id);
    setVista("fases");
  };

  // --- Resolutor ---
  const iniciarFase = (fase: number) => {
    setFaseNum(fase);
    setPreguntaIdx(0);
    setRespuestas([]);
    setSeleccion(null);
    setRespondido(false);
    setResultado(null);
    setErrorMsg(null);
    setVista("quiz");
  };

  const faseData = useMemo(
    () => temaSel?.fases.find((f) => f.fase === faseNum),
    [temaSel, faseNum],
  );
  const preguntaActual = faseData?.preguntas[preguntaIdx];

  const seleccionarOpcion = (idx: number) => {
    if (respondido) return;
    setSeleccion(idx);
  };

  const verificar = () => {
    if (seleccion === null || respondido || !preguntaActual) return;
    setRespuestas((prev) => {
      const copia = [...prev];
      copia[preguntaIdx] = seleccion;
      return copia;
    });
    setRespondido(true);
  };

  const enviarFase = async (respuestasFinales: number[]) => {
    if (!temaId) return;
    setEnviando(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/estudiante/quizzes/completar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ temaId, fase: faseNum, respuestas: respuestasFinales }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data?.error ?? "No se pudo registrar la fase.");
        setEnviando(false);
        return;
      }
      if (data.estado) setEstado(parsearQuizzes(data.estado));
      setResultado({
        aprobado: data.aprobado,
        aciertos: data.aciertos,
        total: data.total,
        insigniaNueva: data.insigniaNueva,
      });
    } catch {
      setErrorMsg("Error de conexión. Intentá de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  const siguiente = () => {
    if (!respondido) return;
    if (preguntaIdx + 1 >= PREGUNTAS_POR_FASE) {
      // Última pregunta: enviar todas las respuestas al servidor.
      void enviarFase(respuestas);
      return;
    }
    setPreguntaIdx((i) => i + 1);
    setSeleccion(null);
    setRespondido(false);
  };

  const cerrarResultado = () => {
    setResultado(null);
    setVista("fases");
  };

  const reintentar = () => {
    setResultado(null);
    iniciarFase(faseNum);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* HERO */}
      <header className="relative overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-br from-[#0B1F3A] via-[#1E1145] to-[#0D2D4A] p-6 text-white shadow-2xl lg:p-8">
        <div aria-hidden className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#20BEC6]/10 blur-3xl" />
        <div aria-hidden className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-[#EC008C]/10 blur-3xl" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-[#20BEC6]">
                <Trophy width={14} height={14} /> Logros FWD
              </span>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                Quizzes y minijuegos
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80 md:text-base">
                Pon a prueba tus conocimientos por tema. Cada tema tiene 10 fases de dificultad creciente,
                de principiante a senior. Completa cada fase para ganar insignias y subir tu barra de habilidades.
              </p>
              <button
                type="button"
                onClick={() => setIntroAbierto(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/20"
              >
                <Info className="h-3.5 w-3.5" /> ¿Cómo funciona?
              </button>
            </div>

            {/* Tarjeta de progreso de habilidades */}
            <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/60">Barra de habilidades</span>
                <span className="text-sm font-bold text-[#FFCB05]">{porcentaje}%</span>
              </div>
              <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#20BEC6] to-[#EC008C] transition-all duration-1000"
                  style={{ width: `${porcentaje}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-black text-white">{totalInsignias}</p>
                  <p className="text-[10px] uppercase tracking-wider text-white/50">Insignias</p>
                </div>
                <div>
                  <p className="text-lg font-black text-[#FFCB05]">{estado.puntos}</p>
                  <p className="text-[10px] uppercase tracking-wider text-white/50">Puntos</p>
                </div>
                <div>
                  <p className="text-lg font-black text-white">{fasesCompletadas}/{TOTAL_FASES}</p>
                  <p className="text-[10px] uppercase tracking-wider text-white/50">Fases</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* INSIGNIAS RECIENTES */}
      {insigniasRecientes.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <span className="h-1.5 w-8 rounded-full bg-[#FFCB05]" />
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Insignias recientes</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {insigniasRecientes.map((ins) => (
              <div
                key={ins.id}
                className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.03]"
              >
                <span
                  className="grid h-11 w-11 place-items-center rounded-2xl"
                  style={{ backgroundColor: `${ins.color}1a`, color: ins.color }}
                >
                  <Award className="h-5 w-5" />
                </span>
                <p className="text-xs font-bold leading-tight text-slate-900 dark:text-white">{ins.temaNombre}</p>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  Fase {ins.fase} · {ins.dificultad}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* BREADCRUMB */}
      {vista !== "categorias" && (
        <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <button onClick={irACategorias} className="hover:text-[#008FD4]">Categorías</button>
          {categoriaSel && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <button
                onClick={() => abrirCategoria(categoriaSel.id)}
                className={vista === "temas" ? "text-slate-900 dark:text-white" : "hover:text-[#008FD4]"}
              >
                {categoriaSel.nombre}
              </button>
            </>
          )}
          {temaSel && (vista === "fases" || vista === "quiz") && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <button
                onClick={() => abrirTema(temaSel.id)}
                className={vista === "fases" ? "text-slate-900 dark:text-white" : "hover:text-[#008FD4]"}
              >
                {temaSel.nombre}
              </button>
            </>
          )}
          {vista === "quiz" && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-slate-900 dark:text-white">Fase {faseNum}</span>
            </>
          )}
        </nav>
      )}

      {/* VISTA: CATEGORÍAS */}
      {vista === "categorias" && (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIAS.map((cat) => {
            const Icono = ICONOS[cat.icono] ?? Code2;
            const completadasCat = cat.temas.reduce(
              (s, t) => s + Math.min(10, estado.progreso[t.id] ?? 0),
              0,
            );
            const totalCat = cat.temas.length * 10;
            const pct = Math.round((completadasCat / totalCat) * 100);
            return (
              <button
                key={cat.id}
                onClick={() => abrirCategoria(cat.id)}
                className="group flex flex-col rounded-[24px] border border-slate-200 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03]"
              >
                <span
                  className="mb-4 grid h-12 w-12 place-items-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${cat.color}1a`, color: cat.color }}
                >
                  <Icono className="h-6 w-6" />
                </span>
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">{cat.nombre}</h3>
                <p className="mt-1.5 flex-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{cat.descripcion}</p>
                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500">
                    <span>{cat.temas.length} temas</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                  </div>
                </div>
              </button>
            );
          })}
        </section>
      )}

      {/* VISTA: TEMAS */}
      {vista === "temas" && categoriaSel && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={irACategorias}
              className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5"
              aria-label="Volver"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">{categoriaSel.nombre}</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {categoriaSel.temas.map((tema) => {
              const faseMax = Math.min(10, estado.progreso[tema.id] ?? 0);
              const pct = Math.round((faseMax / 10) * 100);
              return (
                <button
                  key={tema.id}
                  onClick={() => abrirTema(tema.id)}
                  className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03]"
                >
                  <span
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-sm font-black"
                    style={{ backgroundColor: `${categoriaSel.color}1a`, color: categoriaSel.color }}
                  >
                    {faseMax}/10
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">{tema.nombre}</h3>
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{tema.descripcion}</p>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: categoriaSel.color }} />
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-slate-300 transition-transform group-hover:translate-x-1 dark:text-slate-600" />
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* VISTA: FASES */}
      {vista === "fases" && temaSel && categoriaSel && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => abrirCategoria(categoriaSel.id)}
              className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5"
              aria-label="Volver"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">{temaSel.nombre}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{temaSel.descripcion}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {temaSel.fases.map((f) => {
              const faseMax = estado.progreso[temaSel.id] ?? 0;
              const completada = f.fase <= faseMax;
              const desbloqueada = f.fase <= faseMax + 1;
              return (
                <div
                  key={f.fase}
                  className={`flex items-center justify-between gap-3 rounded-2xl border p-4 transition-all duration-300 ${
                    desbloqueada
                      ? "border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03]"
                      : "border-slate-200 bg-slate-50/50 opacity-60 dark:border-white/5 dark:bg-white/[0.01]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-black ${
                        completada
                          ? "bg-emerald-500/10 text-emerald-500"
                          : desbloqueada
                            ? "text-white"
                            : "bg-slate-200 text-slate-400 dark:bg-white/5"
                      }`}
                      style={desbloqueada && !completada ? { backgroundColor: categoriaSel.color } : undefined}
                    >
                      {completada ? <Check className="h-4 w-4" /> : desbloqueada ? f.fase : <Lock className="h-3.5 w-3.5" />}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Fase {f.fase}</p>
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{etiquetaDificultad(f.fase)}</p>
                    </div>
                  </div>
                  {completada ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <Award className="h-3 w-3" /> Insignia
                      </span>
                      <button
                        onClick={() => iniciarFase(f.fase)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-600 transition-colors hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                      >
                        Repasar
                      </button>
                    </div>
                  ) : desbloqueada ? (
                    <button
                      onClick={() => iniciarFase(f.fase)}
                      className="rounded-xl px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm transition-transform hover:scale-[1.03]"
                      style={{ backgroundColor: categoriaSel.color }}
                    >
                      Jugar
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-[10px] font-bold text-slate-400 dark:bg-white/5">
                      <Lock className="h-3 w-3" /> Bloqueada
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* VISTA: QUIZ */}
      {vista === "quiz" && temaSel && categoriaSel && faseData && preguntaActual && (
        <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-md dark:border-white/10 dark:bg-white/[0.02]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-white/5">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-widest" style={{ color: categoriaSel.color }}>
                {temaSel.nombre} · Fase {faseNum} · {etiquetaDificultad(faseNum)}
              </span>
              <h4 className="mt-0.5 font-display text-sm font-bold text-slate-900 dark:text-white">
                Pregunta {preguntaIdx + 1} de {PREGUNTAS_POR_FASE}
              </h4>
            </div>
            <button
              onClick={() => setVista("fases")}
              className="h-8 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
            >
              Salir
            </button>
          </div>

          {/* Progreso de la fase */}
          <div className="mt-4 flex gap-1.5">
            {Array.from({ length: PREGUNTAS_POR_FASE }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full ${
                  i < preguntaIdx || (i === preguntaIdx && respondido)
                    ? "bg-[#20BEC6]"
                    : "bg-slate-100 dark:bg-white/10"
                }`}
              />
            ))}
          </div>

          <p className="mt-6 text-sm font-bold leading-relaxed text-slate-800 dark:text-slate-100">
            {preguntaActual.pregunta}
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3">
            {preguntaActual.opciones.map((opc, idx) => {
              const isSelected = seleccion === idx;
              const isCorrect = idx === preguntaActual.correcta;
              let styles =
                "border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.01] dark:hover:bg-white/[0.04]";
              if (isSelected && !respondido) {
                styles = "border-[#008FD4] bg-[#008FD4]/5 text-[#008FD4]";
              }
              if (respondido) {
                if (isCorrect) styles = "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
                else if (isSelected) styles = "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400";
                else styles = "border-slate-200 opacity-55 dark:border-white/5";
              }
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={respondido}
                  onClick={() => seleccionarOpcion(idx)}
                  className={`flex w-full items-center gap-3.5 rounded-xl border p-4 text-left text-xs font-semibold transition-all ${styles}`}
                >
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg text-[10px] font-black ${
                      respondido && isCorrect
                        ? "bg-emerald-500 text-white"
                        : respondido && isSelected
                          ? "bg-red-500 text-white"
                          : isSelected
                            ? "bg-[#008FD4] text-white"
                            : "bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300"
                    }`}
                  >
                    {LETRAS[idx]}
                  </span>
                  <span>{opc}</span>
                </button>
              );
            })}
          </div>

          {/* Retroalimentación */}
          {respondido && (
            <div
              className={`mt-4 rounded-xl border p-4 ${
                seleccion === preguntaActual.correcta
                  ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-500/10 dark:bg-emerald-500/[0.02]"
                  : "border-red-200 bg-red-50/50 dark:border-red-500/10 dark:bg-red-500/[0.02]"
              }`}
            >
              <div className="flex items-start gap-2.5">
                {seleccion === preguntaActual.correcta ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                ) : (
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                )}
                <div>
                  <h5 className={`text-xs font-bold ${seleccion === preguntaActual.correcta ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}>
                    {seleccion === preguntaActual.correcta ? "Correcto" : "Incorrecto"}
                  </h5>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400/90">{preguntaActual.explicacion}</p>
                </div>
              </div>
            </div>
          )}

          {errorMsg && <p className="mt-4 text-xs font-semibold text-red-500">{errorMsg}</p>}

          <div className="mt-6 flex justify-end">
            {!respondido ? (
              <button
                type="button"
                onClick={verificar}
                disabled={seleccion === null}
                className="h-11 rounded-xl bg-[#008FD4] px-6 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all hover:bg-[#008FD4]/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Verificar
              </button>
            ) : (
              <button
                type="button"
                onClick={siguiente}
                disabled={enviando}
                className="h-11 rounded-xl bg-gradient-to-r from-[#008FD4] to-[#20BEC6] px-6 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-transform hover:scale-[1.01] disabled:opacity-60"
              >
                {enviando
                  ? "Guardando..."
                  : preguntaIdx + 1 >= PREGUNTAS_POR_FASE
                    ? "Finalizar fase"
                    : "Siguiente"}
              </button>
            )}
          </div>
        </section>
      )}

      {/* MODAL EXPLICATIVO */}
      <QuizModal abierto={introAbierto} onCerrar={cerrarIntro} titulo="Logros y quizzes FWD">
        <div className="flex flex-col gap-4 text-sm text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#662D91]/10 text-[#662D91] dark:text-purple-400">
              <Sparkles className="h-6 w-6" />
            </span>
            <p className="font-semibold text-slate-900 dark:text-white">
              Este apartado son minijuegos de preguntas sobre programación.
            </p>
          </div>
          <p className="leading-relaxed">
            Elegí una <strong>categoría</strong> (lenguajes de programación, frameworks, backend, bases de datos
            y fundamentos). Dentro de cada categoría hay <strong>5 temas</strong>. Al elegir un tema, jugás
            preguntas exclusivas de ese tema.
          </p>
          <p className="leading-relaxed">
            Cada tema tiene <strong>10 fases</strong> con 5 preguntas cada una. La <strong>fase 1</strong> es de
            principiante y la dificultad sube hasta la <strong>fase 10</strong>, nivel senior. Debés acertar al
            menos <strong>{ACIERTOS_PARA_APROBAR} de {PREGUNTAS_POR_FASE}</strong> para aprobar y desbloquear la
            siguiente fase.
          </p>
          <p className="leading-relaxed">
            Al completar cada fase ganás una <strong>insignia</strong> y sube tu <strong>barra de habilidades</strong>.
            Tus insignias quedan visibles en tu perfil.
          </p>
          <button
            onClick={cerrarIntro}
            className="mt-2 h-11 rounded-xl bg-gradient-to-r from-[#008FD4] to-[#20BEC6] text-xs font-bold uppercase tracking-wider text-white shadow-md transition-transform hover:scale-[1.01]"
          >
            Empezar
          </button>
        </div>
      </QuizModal>

      {/* MODAL DE RESULTADO */}
      <QuizModal abierto={resultado !== null} onCerrar={cerrarResultado} sinCerrar={enviando}>
        {resultado && (
          <div className="flex flex-col items-center gap-4 text-center">
            <span
              className={`grid h-16 w-16 place-items-center rounded-full ${
                resultado.aprobado ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
              }`}
            >
              {resultado.aprobado ? <Trophy className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
            </span>
            <div>
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                {resultado.aprobado ? "¡Fase superada!" : "Casi lo logras"}
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Acertaste {resultado.aciertos} de {resultado.total} preguntas.
              </p>
            </div>

            {resultado.insigniaNueva && (
              <div className="flex w-full items-center gap-3 rounded-2xl border border-[#FFCB05]/30 bg-[#FFCB05]/10 p-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#FFCB05]/20 text-[#B8860B] dark:text-[#FFCB05]">
                  <Award className="h-5 w-5" />
                </span>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Nueva insignia desbloqueada</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {temaSel?.nombre} · Fase {faseNum}
                  </p>
                </div>
              </div>
            )}

            {!resultado.aprobado && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Necesitás {ACIERTOS_PARA_APROBAR} de {PREGUNTAS_POR_FASE} aciertos. ¡Repasá la explicación e intentá otra vez!
              </p>
            )}

            <div className="mt-2 flex w-full gap-3">
              <button
                onClick={cerrarResultado}
                className="h-11 flex-1 rounded-xl border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600 transition-colors hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
              >
                Volver a fases
              </button>
              <button
                onClick={reintentar}
                className="h-11 flex-1 rounded-xl bg-gradient-to-r from-[#008FD4] to-[#20BEC6] text-xs font-bold uppercase tracking-wider text-white shadow-md transition-transform hover:scale-[1.01]"
              >
                {resultado.aprobado ? "Repetir fase" : "Reintentar"}
              </button>
            </div>
          </div>
        )}
      </QuizModal>
    </div>
  );
}
