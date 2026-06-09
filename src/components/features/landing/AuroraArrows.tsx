"use client";

import { motion } from "framer-motion";

const COLORS = ["#008fd4", "#662d91", "#20bec6", "#ffcb05", "#f7901e", "#ec008c"];

// Flechas geométricas que se desplazan (sensación de avance).
const ARROWS = [
  { top: "14%", left: "8%", size: 46, color: 0, opacity: 0.5, drift: 16, dur: 7 },
  { top: "68%", left: "5%", size: 60, color: 2, opacity: 0.4, drift: 12, dur: 8 },
  { top: "78%", left: "18%", size: 34, color: 4, opacity: 0.45, drift: 14, dur: 6.5 },
  { top: "22%", left: "86%", size: 54, color: 1, opacity: 0.4, drift: 18, dur: 9 },
  { top: "60%", left: "90%", size: 42, color: 5, opacity: 0.45, drift: 13, dur: 7.5 },
  { top: "10%", left: "68%", size: 30, color: 3, opacity: 0.55, drift: 10, dur: 6 },
] as const;

export default function AuroraArrows() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Auroras difuminadas */}
      <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-fwd-azul/30 blur-3xl animate-aurora" />
      <div
        className="absolute -right-20 top-10 h-72 w-72 rounded-full bg-fwd-magenta/20 blur-3xl animate-aurora"
        style={{ animationDelay: "-4s" }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-fwd-turquesa/20 blur-3xl animate-aurora"
        style={{ animationDelay: "-8s" }}
      />

      {/* Patrón de puntos sutil */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />

      {/* Flechas en movimiento */}
      {ARROWS.map((a, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ top: a.top, left: a.left, width: a.size, height: a.size }}
          animate={{ x: [0, a.drift, 0] }}
          transition={{ duration: a.dur, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg viewBox="0 0 66 76" width="100%" height="100%" fill={COLORS[a.color] ?? "#008fd4"} opacity={a.opacity}>
            <path d="M0 0 L66 38 L0 76 Z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
