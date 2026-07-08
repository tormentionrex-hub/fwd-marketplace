"use client";

import { useRef, MouseEvent, ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function TiltCard({ children, className = "", style }: Props) {
  const cardRef  = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    const glare = glareRef.current;
    if (!card || !glare) return;

    const rect   = card.getBoundingClientRect();
    const x      = e.clientX - rect.left;
    const y      = e.clientY - rect.top;
    const cx     = rect.width  / 2;
    const cy     = rect.height / 2;
    const rotateY =  ((x - cx) / cx) * 12;   // ±12°
    const rotateX = -((y - cy) / cy) * 10;   // ±10°

    card.style.transform  = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`;
    glare.style.background = `radial-gradient(circle at ${(x / rect.width) * 100}% ${(y / rect.height) * 100}%, rgba(255,255,255,0.28) 0%, transparent 65%)`;
    glare.style.opacity    = "1";
  };

  const handleLeave = () => {
    const card  = cardRef.current;
    const glare = glareRef.current;
    if (!card || !glare) return;
    card.style.transform  = "perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)";
    glare.style.opacity   = "0";
  };

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        ...style,
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        willChange: "transform",
      }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {/* Glare overlay */}
      <div
        ref={glareRef}
        className="absolute inset-0 pointer-events-none z-10 rounded-2xl"
        style={{ opacity: 0, transition: "opacity 0.2s ease" }}
      />

      {/* Shine sweep en hover */}
      <div className="shine-sweep absolute inset-0 pointer-events-none z-10 rounded-2xl" />

      {children}
    </div>
  );
}
