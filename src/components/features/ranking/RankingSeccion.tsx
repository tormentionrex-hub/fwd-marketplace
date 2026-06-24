"use client";

import { useState, useRef, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { EstudianteRanking } from "@/server/services/ranking.service";

/* ── Medalla SVG ─────────────────────────────────── */
const MEDALLA_CONFIG = {
  1: { circulo: "#FFD700", borde: "#D4A000", cinta: "#F59E0B" },
  2: { circulo: "#D1D5DB", borde: "#9CA3AF", cinta: "#9CA3AF" },
  3: { circulo: "#CD7F32", borde: "#92400E", cinta: "#B45309" },
} as const;

function IconoMedalla({ posicion }: { posicion: 1 | 2 | 3 }) {
  const c = MEDALLA_CONFIG[posicion];
  return (
    <svg viewBox="0 0 44 56" width="44" height="56" aria-hidden="true" role="img">
      <rect x="15" y="0" width="6" height="20" rx="3" fill={c.cinta}
        transform="rotate(-12 18 10)" />
      <rect x="23" y="0" width="6" height="20" rx="3" fill={c.cinta}
        transform="rotate(12 26 10)" />
      <circle cx="22" cy="40" r="15" fill={c.borde} />
      <circle cx="22" cy="40" r="13" fill={c.circulo} />
      <circle cx="22" cy="40" r="10" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
      <text x="22" y="46" textAnchor="middle" fill="white"
        fontSize="13" fontWeight="900" fontFamily="'Arial Black',sans-serif">
        {posicion}
      </text>
    </svg>
  );
}

/* ── Avatar ──────────────────────────────────────── */
const AVATAR_COLORES = ["#008FD5", "#ED008C", "#662E91", "#20BEC7", "#F7901E"];

function AvatarEstudiante({ nombre, imagen, size }: { nombre: string; imagen: string | null; size: number }) {
  const [error, setError] = useState(false);
  const inicial = nombre.trim()[0]?.toUpperCase() ?? "U";
  const bg = AVATAR_COLORES[nombre.charCodeAt(0) % AVATAR_COLORES.length] ?? "#008FD5";

  if (!imagen || error) {
    return (
      <div className="rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
        style={{ width: size, height: size, backgroundColor: bg, fontSize: Math.round(size * 0.38) }}>
        {inicial}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={imagen} alt={nombre} className="rounded-full object-cover flex-shrink-0"
      style={{ width: size, height: size }} onError={() => setError(true)} />
  );
}

/* ── Badge de lenguaje ───────────────────────────── */
const LANG_COLORES: Record<string, { bg: string; text: string }> = {
  javascript:  { bg: "#F7DF1E", text: "#000" },
  typescript:  { bg: "#3178C6", text: "#fff" },
  python:      { bg: "#3776AB", text: "#fff" },
  "node.js":   { bg: "#68A063", text: "#fff" },
  nodejs:      { bg: "#68A063", text: "#fff" },
  react:       { bg: "#0ea5e9", text: "#fff" },
  angular:     { bg: "#DD0031", text: "#fff" },
  vue:         { bg: "#42B883", text: "#fff" },
  php:         { bg: "#777BB3", text: "#fff" },
  java:        { bg: "#ED8B00", text: "#fff" },
  "c#":        { bg: "#239120", text: "#fff" },
  ruby:        { bg: "#CC342D", text: "#fff" },
  swift:       { bg: "#FF6B35", text: "#fff" },
  kotlin:      { bg: "#A97BFF", text: "#fff" },
  go:          { bg: "#00ADD8", text: "#fff" },
  rust:        { bg: "#B7410E", text: "#fff" },
};

function BadgeLenguaje({ nombre }: { nombre: string }) {
  const key = nombre.toLowerCase();
  const estilo = LANG_COLORES[key] ?? { bg: "#374151", text: "#fff" };
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
      style={{ backgroundColor: estilo.bg, color: estilo.text }}>
      {nombre}
    </span>
  );
}

/* ── Podio ───────────────────────────────────────── */
function PodioCard({
  estudiante,
  posicion,
  escentro,
}: {
  estudiante: EstudianteRanking;
  posicion: 1 | 2 | 3;
  escentro: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const borde = MEDALLA_CONFIG[posicion].circulo;

  return (
    <Link href={`/estudiantes/${estudiante.id}`}
      className="flex flex-col items-center gap-3 group"
      style={{ textDecoration: "none" }}>
      <div
        ref={cardRef}
        className="flex flex-col items-center gap-3 rounded-2xl px-6 py-6 border-2 transition-transform duration-300 group-hover:scale-105"
        style={{
          borderColor: borde,
          backgroundColor: `${borde}14`,
          minWidth: escentro ? 220 : 180,
        }}
      >
        <IconoMedalla posicion={posicion} />
        <AvatarEstudiante nombre={estudiante.nombre} imagen={estudiante.imagen}
          size={escentro ? 72 : 60} />
        <div className="text-center">
          <p className="font-heading font-black text-text leading-tight text-base">
            {estudiante.nombre}
          </p>
          {estudiante.especialidad && (
            <p className="text-xs text-text-muted mt-0.5">{estudiante.especialidad}</p>
          )}
        </div>
        <div className="flex flex-col items-center">
          <span className="font-black text-2xl" style={{ color: borde }}>
            {estudiante.puntuacion.toFixed(1)}
          </span>
          <span className="text-[10px] text-text-muted uppercase tracking-wider">pts</span>
        </div>
      </div>
      {/* Base del podio */}
      <div className="rounded-t-lg w-full flex items-end justify-center pb-1 font-black text-white text-sm"
        style={{
          backgroundColor: borde,
          height: escentro ? 56 : posicion === 2 ? 40 : 28,
        }}>
        #{posicion}
      </div>
    </Link>
  );
}

/* ── Tabla de posiciones ─────────────────────────── */
function FilaRanking({ estudiante, posicion }: { estudiante: EstudianteRanking; posicion: number }) {
  const rowRef = useRef<HTMLTableRowElement>(null);

  const onEnter = () => {
    gsap.to(rowRef.current, {
      backgroundColor: "rgba(0,143,213,0.07)",
      x: 4,
      duration: 0.18,
      ease: "power2.out",
    });
  };
  const onLeave = () => {
    gsap.to(rowRef.current, {
      backgroundColor: "rgba(0,0,0,0)",
      x: 0,
      duration: 0.22,
      ease: "power2.out",
    });
  };

  return (
    <tr ref={rowRef} onMouseEnter={onEnter} onMouseLeave={onLeave}
      className="border-b border-border cursor-default transition-colors">
      <td className="py-3 px-4">
        <span className="font-black text-sm text-text-muted w-8 inline-block text-center">
          {posicion}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <AvatarEstudiante nombre={estudiante.nombre} imagen={estudiante.imagen} size={36} />
          <span className="font-semibold text-text text-sm">{estudiante.nombre}</span>
        </div>
      </td>
      <td className="py-3 px-4 text-sm text-text-muted">
        {estudiante.edad != null ? `${estudiante.edad} años` : "—"}
      </td>
      <td className="py-3 px-4 text-sm text-text-muted">
        {estudiante.especialidad ?? "—"}
      </td>
      <td className="py-3 px-4">
        {estudiante.lenguajePrincipal
          ? <BadgeLenguaje nombre={estudiante.lenguajePrincipal} />
          : <span className="text-text-muted text-sm">—</span>
        }
      </td>
      <td className="py-3 px-4 text-right">
        <span className="font-black text-[#FFD700] text-sm">
          {estudiante.puntuacion.toFixed(1)}
        </span>
      </td>
    </tr>
  );
}

/* ── Componente principal ────────────────────────── */
type Props = {
  estudiantes: EstudianteRanking[];
  showVerMas?: boolean;
};

export function RankingSeccion({ estudiantes, showVerMas = false }: Props) {
  const podioRef = useRef<HTMLDivElement>(null);
  const tablaRef = useRef<HTMLTableSectionElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (podioRef.current && estudiantes.length >= 3) {
      const cards = Array.from(podioRef.current.children);
      gsap.from(cards, {
        y: 48,
        opacity: 0,
        duration: 0.55,
        stagger: 0.12,
        ease: "back.out(1.4)",
        scrollTrigger: { trigger: podioRef.current, start: "top 85%" },
      });
    }

    if (tablaRef.current) {
      const filas = Array.from(tablaRef.current.querySelectorAll("tr"));
      gsap.from(filas, {
        x: -20,
        opacity: 0,
        duration: 0.35,
        stagger: 0.04,
        ease: "power2.out",
        scrollTrigger: { trigger: tablaRef.current, start: "top 92%" },
      });
    }
  }, [estudiantes.length]);

  if (estudiantes.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-text-muted text-base">
          El ranking se actualizará cuando los primeros proyectos sean calificados.
        </p>
      </div>
    );
  }

  const top3 = estudiantes.slice(0, 3) as [EstudianteRanking, EstudianteRanking, EstudianteRanking];
  const resto = estudiantes.slice(3);
  const hayPodio = estudiantes.length >= 3;

  return (
    <div>
      {/* Podio — orden visual: #2 izquierda, #1 centro, #3 derecha */}
      {hayPodio && (
        <div ref={podioRef} className="flex items-end justify-center gap-6 mb-14">
          <PodioCard estudiante={top3[1]!} posicion={2} escentro={false} />
          <PodioCard estudiante={top3[0]!} posicion={1} escentro={true} />
          <PodioCard estudiante={top3[2]!} posicion={3} escentro={false} />
        </div>
      )}

      {/* Tabla de posiciones */}
      {(hayPodio ? resto : estudiantes).length > 0 && (
        <div className="rounded-2xl overflow-hidden border border-border">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-surface-2">
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-widest text-text-muted">Rank</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-widest text-text-muted">Nombre</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-widest text-text-muted">Edad</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-widest text-text-muted">Especialidad</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-widest text-text-muted">Lenguaje Principal</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-widest text-text-muted text-right">Pts</th>
              </tr>
            </thead>
            <tbody ref={tablaRef}>
              {(hayPodio ? resto : estudiantes).map((est, i) => (
                <FilaRanking
                  key={est.id}
                  estudiante={est}
                  posicion={hayPodio ? i + 4 : i + 1}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tabla compacta cuando no hay suficientes para podio */}
      {!hayPodio && estudiantes.length > 0 && (
        <div className="rounded-2xl overflow-hidden border border-border">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-surface-2">
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-widest text-text-muted">Rank</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-widest text-text-muted">Nombre</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-widest text-text-muted">Edad</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-widest text-text-muted">Especialidad</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-widest text-text-muted">Lenguaje Principal</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-widest text-text-muted text-right">Pts</th>
              </tr>
            </thead>
            <tbody ref={tablaRef}>
              {estudiantes.map((est, i) => (
                <FilaRanking key={est.id} estudiante={est} posicion={i + 1} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Ver más */}
      {showVerMas && (
        <div className="flex justify-center mt-10">
          <Link
            href="/ranking"
            className="group relative overflow-hidden inline-flex items-center font-black text-sm uppercase tracking-widest px-10 py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_30px_rgba(102,46,145,0.4)] active:scale-95"
            style={{ background: "linear-gradient(90deg, #662E91, #ED008C)", color: "white" }}
          >
            <span className="relative z-10">Ver ranking completo</span>
            <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-white/20 skew-x-[-20deg] transition-transform duration-700" />
          </Link>
        </div>
      )}
    </div>
  );
}
