"use client";

import { useEffect, useRef } from "react";

const COLORS = [
  "#20BEC6", "#20BEC6", "#20BEC6",
  "#ED008C", "#ED008C",
  "#FFCB05", "#FFCB05",
  "#662D91",
  "#008FD4", "#008FD4",
  "#F7901E",
  "#a855f7", "#6366f1",
];

interface Dot {
  x: number; y: number;
  ox: number; oy: number;
  r: number;
  color: string;
  alpha: number;
  vx: number; vy: number;
  floatVx: number; floatVy: number;
}

export default function PaintDots() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef   = useRef<Dot[]>([]);
  const mouse     = useRef({ x: -9999, y: -9999 });
  const raf       = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const init = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      // Densidad alta igual que la imagen de referencia
      const count = Math.floor((canvas.width * canvas.height) / 2200);
      dotsRef.current = Array.from({ length: count }, () => {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        // Mezcla de tamaños: muchos pequeños, pocos grandes (como la imagen)
        const rand = Math.random();
        const r = rand < 0.6
          ? Math.random() * 4 + 2        // pequeños: 2–6px
          : rand < 0.85
          ? Math.random() * 6 + 6        // medianos: 6–12px
          : Math.random() * 8 + 12;      // grandes: 12–20px

        return {
          x, y, ox: x, oy: y,
          r,
          color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? "#20BEC6",
          alpha: Math.random() * 0.55 + 0.45, // 0.45 – 1.0 como la imagen
          vx: 0, vy: 0,
          floatVx: (Math.random() - 0.5) * 0.3,
          floatVy: (Math.random() - 0.5) * 0.3,
        };
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const { x: mx, y: my } = mouse.current;
      const REPEL = 100;

      dotsRef.current.forEach((d) => {
        // Flotación lenta y orgánica
        d.ox += d.floatVx;
        d.oy += d.floatVy;
        if (d.ox < 0 || d.ox > canvas.width)  d.floatVx *= -1;
        if (d.oy < 0 || d.oy > canvas.height) d.floatVy *= -1;

        // Repulsión al cursor
        const dx = d.x - mx;
        const dy = d.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < REPEL && dist > 0) {
          const force = ((REPEL - dist) / REPEL) * 6;
          d.vx += (dx / dist) * force;
          d.vy += (dy / dist) * force;
        }

        // Resorte al origen flotante
        d.vx += (d.ox - d.x) * 0.05;
        d.vy += (d.oy - d.y) * 0.05;
        d.vx *= 0.80;
        d.vy *= 0.80;
        d.x += d.vx;
        d.y += d.vy;

        // Dibujo: círculo nítido con opacidad variable
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = d.color;
        ctx.globalAlpha = d.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      raf.current = requestAnimationFrame(draw);
    };

    init();
    raf.current = requestAnimationFrame(draw);

    const onResize = () => init();
    window.addEventListener("resize", onResize);

    const parent = canvas.parentElement;
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => { mouse.current = { x: -9999, y: -9999 }; };
    parent?.addEventListener("mousemove", onMove);
    parent?.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", onResize);
      parent?.removeEventListener("mousemove", onMove);
      parent?.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
