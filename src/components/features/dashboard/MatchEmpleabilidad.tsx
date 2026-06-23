"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  IconCheck,
  IconSparkles,
  IconTrendingUp,
  IconStar,
  IconBriefcase,
  IconArrowRight,
  IconAward,
  IconCpu,
  IconEye,
  IconMail,
  IconAlertTriangle,
  IconRocket,
  IconFile,
  IconPalette,
  IconPartyPopper
} from "@/components/ui/icons";

interface MatchEmpleabilidadProps {
  locale: string;
  perfilCompletado: number;
  nivel: string;
  habilidades: string[];
  tieneCV: boolean;
  tienePortafolio: boolean;
  proyectosCompletados: number;
}

export default function MatchEmpleabilidad({
  locale,
  perfilCompletado,
  nivel,
  habilidades,
  tieneCV,
  tienePortafolio,
  proyectosCompletados,
}: MatchEmpleabilidadProps) {
  // --- LÓGICA SIMULADA / CÁLCULOS ---
  
  const bonusProyectos = Math.min(15, proyectosCompletados * 3);
  const bonusHabilidades = Math.min(15, habilidades.length * 2);
  const compatibilidadCruda = perfilCompletado * 0.7 + bonusProyectos + bonusHabilidades;
  const compatibilidadGeneral = Math.min(100, Math.max(0, Math.round(compatibilidadCruda)));

  // Determinar color de compatibilidad general según la escala nueva
  let compatColorText = "text-[#F7901E]";
  let compatGradStart = "#F7901E";
  let compatGradEnd = "#EC008C";
  let compatStatus = "Perfil en desarrollo";
  
  if (compatibilidadGeneral > 70) {
    compatColorText = "text-[#20BEC6]";
    compatGradStart = "#20BEC6";
    compatGradEnd = "#008FD4";
    compatStatus = "Alta empleabilidad";
  } else if (compatibilidadGeneral > 40) {
    compatColorText = "text-[#FFCB05]";
    compatGradStart = "#FFCB05";
    compatGradEnd = "#20BEC6";
    compatStatus = "Buen potencial";
  }

  // Recomendaciones como misiones
  const recomendaciones = useMemo(() => {
    const recs = [];
    if (!habilidades.some(h => h.toLowerCase().includes("react"))) {
      recs.push({ 
        icon: "sparkles", text: "Agregar React", 
        impact: 10, difficulty: "Baja", time: "2 minutos", 
        completed: false 
      });
    }
    
    if (!tieneCV) {
      recs.push({ 
        icon: "file", text: "Subir CV", 
        impact: 12, difficulty: "Media", time: "5 minutos", 
        completed: false 
      });
    }
    
    if (!tienePortafolio) {
      recs.push({ 
        icon: "sparkles", text: "Completar Portafolio", 
        impact: 18, difficulty: "Media", time: "10 minutos", 
        completed: false 
      });
    }
    
    if (proyectosCompletados === 0) {
      recs.push({ 
        icon: "briefcase", text: "Añadir Proyectos", 
        impact: 15, difficulty: "Alta", time: "20 minutos", 
        completed: false 
      });
    }
    
    return recs;
  }, [habilidades, tieneCV, tienePortafolio, proyectosCompletados]);

  const iconMap: Record<string, React.ReactNode> = {
    sparkles: <IconSparkles className="text-[#20BEC6]" />,
    file: <IconFile className="text-[#008FD4]" />,
    palette: <IconPalette className="text-[#EC008C]" />,
    briefcase: <IconBriefcase className="text-[#FFCB05]" />
  };

  const nextStep = recomendaciones.find(r => !r.completed);

  // Top Matches
  const baseSkills = [
    { area: "Frontend React", match: 92, c1: "#008FD4", c2: "#20BEC6" },
    { area: "UI/UX Design", match: 85, c1: "#662D91", c2: "#EC008C" },
    { area: "Backend Node.js", match: 78, c1: "#20BEC6", c2: "#008FD4" },
    { area: "Marketing Digital", match: 65, c1: "#F7901E", c2: "#FFCB05" }
  ];

  const topMatches = habilidades.length > 0 
    ? habilidades.slice(0, 4).map((h, i) => {
        const base = baseSkills[i % baseSkills.length] || { c1: "#008FD4", c2: "#20BEC6" };
        return {
          area: h,
          match: Math.max(40, 95 - (i * 8) - (100 - compatibilidadGeneral) / 2),
          c1: base.c1,
          c2: base.c2
        };
      })
    : baseSkills.map(s => ({ ...s, match: Math.round(s.match * 0.6) }));

  // Mercado / Insights
  const percentil = Math.min(99, Math.max(10, Math.round(compatibilidadGeneral * 0.8 + 10)));
  const probabilidad = Math.min(95, Math.max(15, Math.round(compatibilidadGeneral * 0.9 - 5)));
  const visitas = 12 + Math.round(compatibilidadGeneral * 0.2);

  // Gamificación (Nivel actual y puntos)
  const puntosActuales = Math.min(100, Math.round(compatibilidadGeneral * 1.5));
  const puntosMaximos = 150;
  const progresoGamificacion = Math.round((puntosActuales / puntosMaximos) * 100);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full mb-8 mt-4">
      
      {/* CONTENEDOR HERO PREMIUM */}
      <div 
        className="relative overflow-hidden rounded-[24px] p-6 lg:p-8 flex flex-col gap-8 shadow-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(0,143,212,0.18), rgba(102,45,145,0.25), rgba(32,190,198,0.15))",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 20px 60px rgba(0,143,212,0.15)"
        }}
      >
        {/* Efectos de fondo y conexiones de red digital */}
        <div aria-hidden className="absolute inset-0 z-0 opacity-20 mix-blend-screen pointer-events-none"
             style={{
               backgroundImage: "radial-gradient(circle at 15% 50%, rgba(32,190,198,0.4), transparent 30%), radial-gradient(circle at 85% 30%, rgba(102,45,145,0.4), transparent 30%)"
             }}
        />
        <svg aria-hidden className="absolute inset-0 w-full h-full z-0 opacity-[0.03] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#fff" strokeWidth="1"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Algunas líneas de conexión */}
          <path d="M0 40 L120 160 L300 120 L500 240" fill="none" stroke="#20BEC6" strokeWidth="1" />
          <path d="M100 0 L200 80 L280 40 L450 150" fill="none" stroke="#EC008C" strokeWidth="1" />
        </svg>

        {/* CABECERA */}
        <header className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-[#008FD4] to-[#662D91] shadow-[0_0_20px_rgba(102,45,145,0.5)]">
                  <IconSparkles width={20} height={20} className="text-white" />
                </span>
                <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
                  Match de Empleabilidad IA
                </h2>
              </div>
              <p className="text-sm md:text-base text-white/70 max-w-2xl">
                Analizamos tu perfil y calculamos tu nivel de compatibilidad con las oportunidades disponibles.
              </p>
            </div>
            {/* Gamificación en cabecera */}
            <div className="bg-black/20 border border-white/10 rounded-2xl p-3 backdrop-blur-md min-w-[220px]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-white/60 font-semibold uppercase tracking-wider">Nivel actual</span>
                <span className="text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded-full">{puntosActuales}/{puntosMaximos} pts</span>
              </div>
              <div className="text-sm font-bold text-white mb-2">{nivel}</div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#20BEC6] to-[#EC008C] rounded-full transition-all duration-1000" style={{ width: `${progresoGamificacion}%` }} />
              </div>
            </div>
          </div>
        </header>

        {/* SECCIONES PRINCIPALES */}
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_1fr_1.2fr] items-start">
          
          {/* 1. COMPATIBILIDAD IA */}
          <div className="bg-black/20 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col items-center justify-center text-center h-full group hover:bg-black/30 transition-all duration-300">
            
            <div className="relative w-48 h-48 flex items-center justify-center mb-4">
              {/* Glow dinámico */}
              <div 
                className="absolute inset-0 rounded-full blur-[30px] opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                style={{ background: `linear-gradient(135deg, ${compatGradStart}, ${compatGradEnd})` }}
              />
              {/* Progress Ring Animado */}
              <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="matchGradNew" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={compatGradStart} />
                    <stop offset="100%" stopColor={compatGradEnd} />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                <circle 
                  cx="50" cy="50" r="42" fill="none" stroke="url(#matchGradNew)" strokeWidth="8" 
                  strokeLinecap="round" strokeDasharray="264"
                  strokeDashoffset={264 - (264 * compatibilidadGeneral) / 100}
                  className="transition-all duration-1500 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-5xl font-display font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                  {compatibilidadGeneral}%
                </span>
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-white mb-1">Compatibilidad IA</h3>
            <div className="mt-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold" style={{ color: compatGradEnd }}>
              {compatStatus}
            </div>
          </div>

          {/* 2. ÁREAS DE MAYOR COMPATIBILIDAD */}
          <div className="bg-black/20 border border-white/10 rounded-2xl p-6 backdrop-blur-md h-full flex flex-col justify-center">
            <h3 className="text-sm font-bold text-white/80 mb-5 flex items-center gap-2 uppercase tracking-wider">
              <IconAward width={16} height={16} className="text-[#FFCB05]" />
              Mejores Matches
            </h3>
            
            <div className="space-y-4">
              {topMatches.map((match, idx) => (
                <div key={idx} className="group cursor-default">
                  <div className="flex justify-between items-end mb-1.5">
                    <span className="text-sm font-medium text-white group-hover:translate-x-1 transition-transform duration-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: match.c1 }} />
                      {match.area}
                    </span>
                    <span className="text-xs font-bold text-white/90">{Math.round(match.match)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden shadow-inner relative">
                    <div 
                      className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.3)] group-hover:brightness-125"
                      style={{ 
                        width: `${match.match}%`, 
                        background: `linear-gradient(90deg, ${match.c1}, ${match.c2})`,
                        transitionDelay: `${idx * 100}ms` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. RECOMENDACIONES IA (Panel Misiones) */}
          <div className="bg-black/20 border border-white/10 rounded-2xl p-6 backdrop-blur-md h-full flex flex-col">
            <h3 className="text-sm font-bold text-white/80 mb-4 flex items-center gap-2 uppercase tracking-wider">
              <IconSparkles className="text-[#EC008C]" /> Misiones IA
            </h3>
            
            <div className="space-y-3 flex-1 overflow-y-auto pr-1 hide-scrollbar">
              {recomendaciones.length > 0 ? (
                recomendaciones.map((rec, idx) => (
                  <div 
                    key={idx} 
                    className="group relative p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer overflow-hidden"
                  >
                    <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-sm font-semibold text-white truncate">{rec.text}</h4>
                            <span className="shrink-0 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">+{rec.impact}%</span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-white/50">
                            <span className="flex items-center gap-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${rec.difficulty === 'Baja' ? 'bg-emerald-400' : rec.difficulty === 'Media' ? 'bg-[#FFCB05]' : 'bg-[#EC008C]'}`} />
                              {rec.difficulty}
                            </span>
                            <span className="flex items-center gap-1">
                              {iconMap[rec.icon]}
                            </span>
                          </div>
                        </div>
                      </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-70">
                  <IconPartyPopper className="mr-1" />
                  <p className="text-sm text-white font-medium">¡Misiones completadas!</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* INFERIOR: PRÓXIMO PASO Y ESTADÍSTICAS */}
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_2fr] items-stretch mt-2">
          
          {/* PRÓXIMO PASO CTA */}
          <div className="rounded-[24px] p-6 shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-500"
               style={{ background: "linear-gradient(135deg, #008FD4, #662D91, #EC008C)" }}>
            <div aria-hidden className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.15] mix-blend-overlay" />
            <div aria-hidden className="absolute right-0 top-0 w-32 h-32 bg-white/20 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700" />
            
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-bold text-white mb-4 uppercase tracking-wider">
                  🎯 Próximo Paso Inteligente
                </span>
                {nextStep ? (
                  <>
                    <h4 className="text-white font-display font-extrabold text-2xl leading-tight mb-2 drop-shadow-sm">
                      Completa tu perfil y sube tu nivel.
                    </h4>
                    <p className="text-white/90 text-sm mb-6 font-medium">
                      {nextStep.text} podría incrementar tu compatibilidad un {nextStep.impact}%.
                    </p>
                  </>
                ) : (
                  <>
                    <h4 className="text-white font-display font-extrabold text-2xl leading-tight mb-2 drop-shadow-sm">
                      ¡Tu perfil está optimizado!
                    </h4>
                    <p className="text-white/90 text-sm mb-6 font-medium">
                      Aplica a proyectos hoy mismo.
                    </p>
                  </>
                )}
              </div>
              
              <Link 
                href={nextStep ? `/${locale}/dashboard/estudiante/perfil` : `/${locale}/marketplace`}
                className="w-full flex items-center justify-center gap-2 bg-white text-[#662D91] hover:text-[#EC008C] font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all duration-300 hover:shadow-[0_10px_20px_rgba(0,0,0,0.2)]"
              >
                {nextStep ? "Completar ahora" : "Ver Proyectos"}
                <IconArrowRight width={18} height={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* ESTADÍSTICAS DESTACADAS */}
          <div className="bg-black/20 border border-white/10 rounded-[24px] p-6 backdrop-blur-md grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex flex-col gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <span className="p-2 rounded-lg bg-[#008FD4]/20 text-[#008FD4] w-fit">
                <IconEye width={18} height={18} />
              </span>
              <div>
                <p className="text-[10px] text-white/50 uppercase tracking-wider font-bold mb-0.5">Visitas</p>
                <p className="text-lg font-bold text-white">{visitas} <span className="text-xs text-white/40 font-normal">esta sem</span></p>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <span className="p-2 rounded-lg bg-[#20BEC6]/20 text-[#20BEC6] w-fit">
                <IconMail width={18} height={18} />
              </span>
              <div>
                <p className="text-[10px] text-white/50 uppercase tracking-wider font-bold mb-0.5">Probabilidad</p>
                <p className="text-lg font-bold text-white">{probabilidad}% <span className="text-xs text-white/40 font-normal">de ofertas</span></p>
              </div>
            </div>

            <div className="flex flex-col gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors sm:col-span-2">
              <span className="p-2 rounded-lg bg-[#F7901E]/20 text-[#F7901E] w-fit">
                <IconCpu width={18} height={18} />
              </span>
              <div>
                <p className="text-[10px] text-white/50 uppercase tracking-wider font-bold mb-1">Demandado en el mercado</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded border border-white/10 text-white/80">React</span>
                  <span className="text-[10px] px-2 py-0.5 rounded border border-white/10 text-white/80">Node.js</span>
                  <span className="text-[10px] px-2 py-0.5 rounded border border-white/10 text-white/80">UX/UI</span>
                </div>
              </div>
            </div>
            
            <div className="col-span-2 sm:col-span-4 mt-1 bg-gradient-to-r from-[#662D91]/20 to-transparent p-3 rounded-xl border border-[#662D91]/30 flex items-center gap-3">
              <IconSparkles className="mr-1" />
              <p className="text-sm text-white/90">
                Tu perfil es mejor que el <strong className="text-[#20BEC6] font-bold">{percentil}%</strong> de los estudiantes de FWD.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
