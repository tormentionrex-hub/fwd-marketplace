"use client";

import { useEffect, useRef } from "react";

const COLORS = ["#FFCB05", "#20BEC7", "#662E91", "#008FD5", "#ED008C", "#F8901F"];

class Particle {
  x = 0; y = 0; r = 0; color = ""; alpha = 0; vx = 0; vy = 0; life = 0; age = 0;

  constructor(private w: number, private h: number, init = false) {
    this.reset(init);
  }

  reset(init = false) {
    this.x     = Math.random() * this.w;
    this.y     = Math.random() * this.h;
    this.r     = Math.random() * 3.5 + 1.5;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)] ?? "#20BEC7";
    this.alpha = Math.random() * 0.5 + 0.45;
    this.vx    = (Math.random() - 0.5) * 0.5;
    this.vy    = (Math.random() - 0.5) * 0.5;
    this.life  = Math.random() * 300 + 150;
    this.age   = init ? Math.floor(Math.random() * 200) : 0;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.age++;
    if (
      this.x < -10 || this.x > this.w + 10 ||
      this.y < -10 || this.y > this.h + 10 ||
      this.age > this.life
    ) this.reset(false);
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.alpha * (1 - this.age / this.life);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
}

export default function ParticleBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    let animId: number;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      particles = Array.from(
        { length: 90 },
        (_, i) => new Particle(canvas.width, canvas.height, i === 0),
      );
    };

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => { p.update(); p.draw(ctx); });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const pi = particles[i];
          const pj = particles[j];
          if (!pi || !pj) continue;
          const dx = pi.x - pj.x;
          const dy = pi.y - pj.y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            ctx.save();
            ctx.globalAlpha = (1 - d / 110) * 0.45;
            ctx.strokeStyle = pi.color;
            ctx.lineWidth   = 0.8;
            ctx.beginPath();
            ctx.moveTo(pi.x, pi.y);
            ctx.lineTo(pj.x, pj.y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      animId = requestAnimationFrame(loop);
    };

    window.addEventListener("resize", resize);
    resize();
    loop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        display: "block",
        pointerEvents: "none",
      }}
    />
  );
}
