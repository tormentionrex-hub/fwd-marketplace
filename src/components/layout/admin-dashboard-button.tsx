"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

// Burbuja flotante de acceso al panel de administración.
// - Clic (sin arrastrar)  → navega a /{locale}/admin.
// - Mantener presionado y mover → se arrastra libremente por la pantalla.
// - Recuerda su posición (localStorage) y se mantiene dentro del viewport.
// Solo se muestra al rol admin y se oculta dentro de las rutas de /admin.

const STORAGE_KEY = "fwd_admin_btn_pos";
const SIZE = 56; // h-14 w-14
const MARGIN = 16;
const UMBRAL_ARRASTRE = 6; // px: por debajo se considera clic, no arrastre

export function AdminDashboardButton({
  userRole,
  locale,
}: {
  userRole: string | undefined;
  locale: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const drag = useRef({ active: false, moved: false, offX: 0, offY: 0, startX: 0, startY: 0 });

  // Mantiene la posición dentro de la ventana.
  const clamp = useCallback((x: number, y: number) => {
    if (typeof window === "undefined") return { x, y };
    const maxX = Math.max(MARGIN, window.innerWidth - SIZE - MARGIN);
    const maxY = Math.max(MARGIN, window.innerHeight - SIZE - MARGIN);
    return {
      x: Math.min(Math.max(MARGIN, x), maxX),
      y: Math.min(Math.max(MARGIN, y), maxY),
    };
  }, []);

  useEffect(() => {
    setMounted(true);
    let inicial: { x: number; y: number } | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) inicial = JSON.parse(raw);
    } catch {
      /* sin storage */
    }
    if (!inicial) inicial = { x: window.innerWidth - SIZE - MARGIN, y: MARGIN };
    setPos(clamp(inicial.x, inicial.y));

    const onResize = () => setPos((p) => (p ? clamp(p.x, p.y) : p));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clamp]);

  function onPointerDown(e: React.PointerEvent) {
    if (!pos) return;
    const d = drag.current;
    d.active = true;
    d.moved = false;
    d.startX = e.clientX;
    d.startY = e.clientY;
    d.offX = e.clientX - pos.x;
    d.offY = e.clientY - pos.y;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d.active) return;
    if (!d.moved && Math.hypot(e.clientX - d.startX, e.clientY - d.startY) > UMBRAL_ARRASTRE) {
      d.moved = true;
    }
    if (d.moved) setPos(clamp(e.clientX - d.offX, e.clientY - d.offY));
  }

  function onPointerUp(e: React.PointerEvent) {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignorar */
    }
    if (d.moved) {
      // Fue un arrastre: guarda la posición final.
      const fin = clamp(e.clientX - d.offX, e.clientY - d.offY);
      setPos(fin);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fin));
      } catch {
        /* sin storage */
      }
    } else {
      // Fue un clic: navega al panel.
      router.push(`/${locale}/admin`);
    }
  }

  if (userRole !== "admin") return null;
  // Ocultar dentro del panel admin (/es/admin..., /en/admin..., /admin...).
  if (pathname?.split("/").includes("admin")) return null;
  // Espera a montar + tener posición (evita parpadeo y desajuste de hidratación).
  if (!mounted || !pos) return null;

  return (
    <button
      type="button"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      title="Panel de administración — mantené presionado para mover"
      aria-label="Ir al panel de administración"
      style={{ position: "fixed", left: pos.x, top: pos.y, touchAction: "none" }}
      className="z-[70] flex h-14 w-14 select-none items-center justify-center rounded-full bg-fwd-magenta text-white shadow-lg ring-2 ring-white/20 transition-transform hover:scale-105 hover:bg-fwd-purple active:scale-95"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    </button>
  );
}
