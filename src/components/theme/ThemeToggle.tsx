"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import { IconMoon, IconSun } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";

interface ThemeToggleProps {
  className?: string;
  /** "floating" se posiciona fijo en una esquina; "inline" se integra en otro layout. */
  variant?: "floating" | "inline";
}

export default function ThemeToggle({ className, variant = "inline" }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  const base = cn(
    "grid h-10 w-10 place-items-center rounded-full border border-border bg-surface text-text-muted shadow-sm transition-colors hover:text-fwd-azul hover:border-fwd-azul/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fwd-azul",
    variant === "floating" && "fixed bottom-5 right-5 z-50 glass shadow-lg",
    className,
  );

  if (!mounted) {
    // Placeholder con el mismo tamaño para evitar saltos / mismatch de hidratación.
    return <span aria-hidden className={base} />;
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
      className={base}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.25 }}
        >
          {isDark ? <IconMoon width={18} height={18} /> : <IconSun width={18} height={18} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
