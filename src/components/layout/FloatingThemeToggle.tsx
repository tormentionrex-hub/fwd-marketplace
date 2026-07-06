"use client";

import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

/**
 * FloatingThemeToggle renders the ThemeToggle button inside a small floating
 * bubble. The bubble is positioned at the bottom‑left of the viewport so it
 * appears visually "below" the "Inicio" navigation link in the header. The
 * styling follows the project's design system – rounded corners, subtle
 * backdrop blur and a light shadow – without any emojis.
 */
export default function FloatingThemeToggle() {
  const pathname = usePathname();

  // Ocultar el botón flotante en páginas con barra lateral/portal para evitar duplicaciones
  const esDashboard =
    pathname.includes("/dashboard") ||
    pathname.includes("/empresario") ||
    pathname.includes("/admin") ||
    pathname.includes("/mis-ofertas") ||
    pathname.includes("/mis-proyectos") ||
    pathname.includes("/mensajes") ||
    /\/marketplace\/[^/]+/.test(pathname);

  if (esDashboard) {
    return null;
  }

  return (
    <div className="fixed left-6 bottom-6 z-50">
      {/* Bubble container */}
      <div className="flex items-center rounded-full bg-white/10 backdrop-blur-md p-2 shadow-xl">
        <ThemeToggle />
      </div>
    </div>
  );
}

