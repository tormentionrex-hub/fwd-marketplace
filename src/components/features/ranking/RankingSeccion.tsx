"use client";

import { useState, useRef, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Trophy, ChevronRight } from "lucide-react";
import type { EstudianteRanking } from "@/server/services/ranking.service";

// ── Colores de medalla ──────────────────────────────────────────────────────
const MEDALLA: Record<1 | 2 | 3, { primary: string; glow: string; badge: string; gradA: string; gradB: string }> = {
  1: {
    primary: "#FFD700",
    glow: "rgba(255,215,0,0.45)",
    badge: "#B8860B",
    gradA: "rgba(255,215,0,0.18)",
    gradB: "rgba(255,215,0,0.04)",
  },
  2: {
    primary: "#C0C0C0",
    glow: "rgba(192,192,192,0.35)",
    badge: "#808080",
    gradA: "rgba(192,192,192,0.15)",
    gradB: "rgba(192,192,192,0.03)",
  },
  3: {
    primary: "#CD7F32",
    glow: "rgba(205,127,50,0.40)",
    badge: "#8B4513",
    gradA: "rgba(205,127,50,0.18)",
    gradB: "rgba(205,127,50,0.04)",
  },
};

// ── Colores de lenguajes ────────────────────────────────────────────────────
const LANG: Record<string, { bg: string; text: string }> = {
  javascript:    { bg: "#F7DF1E", text: "#1a1a00" },
  typescript:    { bg: "#3178C6", text: "#fff" },
  python:        { bg: "#3776AB", text: "#fff" },
  "node.js":     { bg: "#339933", text: "#fff" },
  nodejs:        { bg: "#339933", text: "#fff" },
  react:         { bg: "#0ea5e9", text: "#fff" },
  "next.js":     { bg: "#1a1a1a", text: "#fff" },
  nextjs:        { bg: "#1a1a1a", text: "#fff" },
  angular:       { bg: "#DD0031", text: "#fff" },
  vue:           { bg: "#42B883", text: "#fff" },
  "vue.js":      { bg: "#42B883", text: "#fff" },
  php:           { bg: "#777BB3", text: "#fff" },
  java:          { bg: "#ED8B00", text: "#fff" },
  "c#":          { bg: "#239120", text: "#fff" },
  go:            { bg: "#00ADD8", text: "#fff" },
  ruby:          { bg: "#CC342D", text: "#fff" },
  swift:         { bg: "#FF6B35", text: "#fff" },
  kotlin:        { bg: "#A97BFF", text: "#fff" },
  flutter:       { bg: "#027DFD", text: "#fff" },
  dart:          { bg: "#0175C2", text: "#fff" },
  tensorflow:    { bg: "#FF6F00", text: "#fff" },
  fastapi:       { bg: "#009688", text: "#fff" },
  figma:         { bg: "#F24E1E", text: "#fff" },
  mongodb:       { bg: "#47A248", text: "#fff" },
  postgresql:    { bg: "#336791", text: "#fff" },
  docker:        { bg: "#2496ED", text: "#fff" },
  graphql:       { bg: "#E10098", text: "#fff" },
};

// ── Avatar ──────────────────────────────────────────────────────────────────
const AVATAR_BG = ["#008FD5", "#ED008C", "#662E91", "#20BEC7", "#F7901E"];

function Avatar({ nombre, imagen, size }: { nombre: string; imagen: string | null; size: number }) {
  const [err, setErr] = useState(false);
  const bg = AVATAR_BG[nombre.charCodeAt(0) % AVATAR_BG.length] ?? "#008FD5";
  const inicial = nombre.trim()[0]?.toUpperCase() ?? "U";

  if (!imagen || err) {
    return (
      <div
        className="rounded-full flex items-center justify-center font-black text-white flex-shrink-0 select-none"
        style={{ width: size, height: size, backgroundColor: bg, fontSize: Math.round(size * 0.4) }}
      >
        {inicial}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imagen}
      alt={nombre}
      className="rounded-full object-cover flex-shrink-0"
      style={{ width: size, height: size }}
      onError={() => setErr(true)}
    />
  );
}

// ── Badge de lenguaje ───────────────────────────────────────────────────────
function BadgeLang({ nombre }: { nombre: string }) {
  const estilo = LANG[nombre.toLowerCase()] ?? { bg: "#374151", text: "#e5e7eb" };
  return (
    <span
      className="inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-bold tracking-wide"
      style={{ backgroundColor: estilo.bg, color: estilo.text }}
    >
      {nombre}
    </span>
  );
}

// ── Medalla SVG ─────────────────────────────────────────────────────────────
function Medalla({ pos }: { pos: 1 | 2 | 3 }) {
  const m = MEDALLA[pos];
  return (
    <svg viewBox="0 0 48 60" width={pos === 1 ? 52 : 44} height={pos === 1 ? 62 : 52} aria-hidden>
      <rect x="16" y="0" width="7" height="22" rx="3.5" fill={m.primary} opacity="0.7"
        transform="rotate(-13 19 11)" />
      <rect x="25" y="0" width="7" height="22" rx="3.5" fill={m.primary} opacity="0.7"
        transform="rotate(13 29 11)" />
      <circle cx="24" cy="44" r="16" fill={m.badge} />
      <circle cx="24" cy="44" r="14" fill={m.primary} />
      <circle cx="24" cy="44" r="11" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
      <text x="24" y="50" textAnchor="middle" fill="white"
        fontSize={pos === 1 ? 13 : 12} fontWeight="900" fontFamily="'Arial Black',sans-serif">
        {pos}
      </text>
    </svg>
  );
}

// ── Barra de puntuación mini (en tabla) ─────────────────────────────────────
function BarraPts({ puntuacion, color }: { puntuacion: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-black text-sm w-12 text-right" style={{ color }}>
        {puntuacion.toFixed(1)}
      </span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.07)", minWidth: 60 }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${puntuacion}%`, background: `linear-gradient(90deg, ${color}99, ${color})` }}
        />
      </div>
    </div>
  );
}

// ── Card de Podio ───────────────────────────────────────────────────────────
function PodioCard({
  est,
  pos,
  centro,
}: {
  est: EstudianteRanking;
  pos: 1 | 2 | 3;
  centro: boolean;
}) {
  const m = MEDALLA[pos];
  const ref = useRef<HTMLDivElement>(null);

  const plateHeight = pos === 1 ? 64 : pos === 2 ? 44 : 28;
  const avatarSize = centro ? 80 : 64;

  return (
    <Link
      href={`/estudiantes/${est.id}`}
      className="flex flex-col items-center group"
      style={{ textDecoration: "none" }}
    >
      {/* Card */}
      <div
        ref={ref}
        className="flex flex-col items-center gap-3 rounded-2xl px-5 py-5 border transition-all duration-300 group-hover:-translate-y-1.5"
        style={{
          borderColor: `${m.primary}55`,
          background: `linear-gradient(160deg, ${m.gradA}, ${m.gradB})`,
          boxShadow: `0 0 28px ${m.glow}, inset 0 1px 0 rgba(255,255,255,0.08)`,
          minWidth: centro ? 210 : 172,
          backdropFilter: "blur(8px)",
        }}
      >
        <Medalla pos={pos} />

        {/* Ring + Avatar */}
        <div
          className="rounded-full p-[3px]"
          style={{ background: `linear-gradient(135deg, ${m.primary}, ${m.badge})` }}
        >
          <Avatar nombre={est.nombre} imagen={est.imagen} size={avatarSize} />
        </div>

        {/* Info */}
        <div className="text-center">
          <p className="font-heading font-black text-white leading-tight" style={{ fontSize: centro ? 15 : 13 }}>
            {est.nombre}
          </p>
          {est.especialidad && (
            <p className="text-[11px] mt-0.5" style={{ color: `${m.primary}bb` }}>
              {est.especialidad}
            </p>
          )}
        </div>

        {/* Score */}
        <div className="flex flex-col items-center gap-0.5">
          <span
            className="font-black leading-none"
            style={{ fontSize: centro ? 34 : 26, color: m.primary, textShadow: `0 0 20px ${m.glow}` }}
          >
            {est.puntuacion.toFixed(1)}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">pts</span>
        </div>

        {/* Calificaciones */}
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(est.totalCalificaciones, 5) }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: m.primary }} />
          ))}
          {est.totalCalificaciones > 5 && (
            <span className="text-[10px] font-bold" style={{ color: m.primary }}>+{est.totalCalificaciones - 5}</span>
          )}
          <span className="text-[10px] text-white/30 ml-1">
            {est.totalCalificaciones} {est.totalCalificaciones === 1 ? "proyecto" : "proyectos"}
          </span>
        </div>
      </div>

      {/* Plataforma del podio */}
      <div
        className="w-full rounded-t-xl flex items-center justify-center font-black text-white/80 text-sm transition-all duration-300 group-hover:opacity-90"
        style={{
          height: plateHeight,
          background: `linear-gradient(180deg, ${m.primary}55, ${m.primary}22)`,
          borderTop: `2px solid ${m.primary}88`,
        }}
      >
        #{pos}
      </div>
    </Link>
  );
}

// ── Fila de tabla ───────────────────────────────────────────────────────────
const FILA_COLOR = [
  "#FFD700", "#C0C0C0", "#CD7F32",
  "#008FD5", "#20BEC7", "#662E91", "#ED008C", "#F7901E",
];

function FilaRanking({ est, pos }: { est: EstudianteRanking; pos: number }) {
  const ref = useRef<HTMLTableRowElement>(null);
  const color = FILA_COLOR[Math.min(pos - 1, FILA_COLOR.length - 1)] ?? "#008FD5";

  return (
    <tr
      ref={ref}
      className="border-b border-white/5 cursor-default group transition-colors hover:bg-white/[0.03]"
    >
      {/* # */}
      <td className="py-3.5 pl-5 pr-2 w-12">
        <span
          className="inline-flex items-center justify-center w-7 h-7 rounded-lg font-black text-xs"
          style={{ backgroundColor: `${color}22`, color }}
        >
          {pos}
        </span>
      </td>

      {/* Nombre + avatar */}
      <td className="py-3.5 px-3">
        <div className="flex items-center gap-3">
          <Avatar nombre={est.nombre} imagen={est.imagen} size={38} />
          <div>
            <p className="font-semibold text-white text-sm leading-tight">{est.nombre}</p>
            {est.especialidad && (
              <p className="text-white/40 text-[11px] mt-0.5 leading-tight">{est.especialidad}</p>
            )}
          </div>
        </div>
      </td>

      {/* Edad */}
      <td className="py-3.5 px-3 text-sm text-white/40 hidden sm:table-cell">
        {est.edad != null ? `${est.edad} a.` : "—"}
      </td>

      {/* Lenguaje */}
      <td className="py-3.5 px-3 hidden md:table-cell">
        {est.lenguajePrincipal
          ? <BadgeLang nombre={est.lenguajePrincipal} />
          : <span className="text-white/25 text-sm">—</span>}
      </td>

      {/* Proyectos */}
      <td className="py-3.5 px-3 text-sm text-white/40 hidden lg:table-cell text-center">
        {est.totalCalificaciones}
      </td>

      {/* Puntuación + barra */}
      <td className="py-3.5 px-3 pr-5">
        <BarraPts puntuacion={est.puntuacion} color={color} />
      </td>
    </tr>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
type Props = {
  estudiantes: EstudianteRanking[];
  showVerMas?: boolean;
};

export function RankingSeccion({ estudiantes, showVerMas = false }: Props) {
  const podioRef = useRef<HTMLDivElement>(null);
  const tablaRef = useRef<HTMLTableSectionElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (podioRef.current) {
      const cards = Array.from(podioRef.current.children);
      gsap.from(cards, {
        y: 60,
        opacity: 0,
        duration: 0.65,
        stagger: 0.14,
        ease: "back.out(1.3)",
        scrollTrigger: { trigger: podioRef.current, start: "top 88%" },
      });
    }

    if (tablaRef.current) {
      const filas = Array.from(tablaRef.current.querySelectorAll("tr"));
      gsap.from(filas, {
        x: -24,
        opacity: 0,
        duration: 0.4,
        stagger: 0.045,
        ease: "power3.out",
        scrollTrigger: { trigger: tablaRef.current, start: "top 92%" },
      });
    }
  }, [estudiantes.length]);

  if (estudiantes.length === 0) {
    return (
      <div className="text-center py-24 flex flex-col items-center gap-4">
        <Trophy size={48} className="text-white/10" />
        <p className="text-white/30 text-sm max-w-xs">
          El ranking se actualiza cuando los primeros proyectos son calificados por empresarios.
        </p>
      </div>
    );
  }

  const top3 = estudiantes.slice(0, 3);
  const resto = estudiantes.slice(3);
  const hayPodio = top3.length === 3;

  // Si hay menos de 3, los del podio también van a la tabla
  const enTabla = hayPodio ? resto : estudiantes;

  return (
    <div className="space-y-12">
      {/* ── Podio ── */}
      {hayPodio && (
        <div ref={podioRef} className="flex items-end justify-center gap-4 sm:gap-8">
          {/* #2 */}
          <PodioCard est={top3[1]!} pos={2} centro={false} />
          {/* #1 */}
          <PodioCard est={top3[0]!} pos={1} centro={true} />
          {/* #3 */}
          <PodioCard est={top3[2]!} pos={3} centro={false} />
        </div>
      )}

      {/* ── Tabla ── */}
      {enTabla.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.02)",
            backdropFilter: "blur(12px)",
          }}
        >
          <table className="w-full text-left">
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <th className="py-3 pl-5 pr-2 text-[10px] font-black uppercase tracking-[0.15em] text-white/30">Rank</th>
                <th className="py-3 px-3 text-[10px] font-black uppercase tracking-[0.15em] text-white/30">Estudiante</th>
                <th className="py-3 px-3 text-[10px] font-black uppercase tracking-[0.15em] text-white/30 hidden sm:table-cell">Edad</th>
                <th className="py-3 px-3 text-[10px] font-black uppercase tracking-[0.15em] text-white/30 hidden md:table-cell">Lenguaje</th>
                <th className="py-3 px-3 text-[10px] font-black uppercase tracking-[0.15em] text-white/30 hidden lg:table-cell text-center">Proyectos</th>
                <th className="py-3 px-3 pr-5 text-[10px] font-black uppercase tracking-[0.15em] text-white/30">Puntuacion</th>
              </tr>
            </thead>
            <tbody ref={tablaRef}>
              {enTabla.map((est, i) => (
                <FilaRanking
                  key={est.id}
                  est={est}
                  pos={hayPodio ? i + 4 : i + 1}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Ver más ── */}
      {showVerMas && (
        <div className="flex justify-center">
          <Link
            href="/ranking"
            className="group inline-flex items-center gap-2 font-black text-sm uppercase tracking-widest px-10 py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_40px_rgba(237,0,140,0.35)] active:scale-95"
            style={{ background: "linear-gradient(90deg, #662E91, #ED008C)", color: "white" }}
          >
            Ver ranking completo
            <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      )}
    </div>
  );
}
