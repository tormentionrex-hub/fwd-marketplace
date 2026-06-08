"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Alert, type AlertVariant } from "@/components/ui/alert";

// Alerta global disparada vía sessionStorage. Otro componente (p. ej. <SinPermiso>)
// deja un código en sessionStorage['fwd_alerta'] y vuelve atrás; al llegar al
// destino mostramos el toast. Se revisa en cada cambio de ruta, así funciona
// tanto en navegación SPA (el layout no se re-monta) como en carga completa.
const MENSAJES: Record<string, { variant: AlertVariant; title: string; mensaje: string }> = {
  permisos: {
    variant: "error",
    title: "Permisos insuficientes",
    mensaje: "No tenés acceso a esa sección con tu rol.",
  },
};

export function AlertaGlobal() {
  const pathname = usePathname();
  const [alerta, setAlerta] = useState<(typeof MENSAJES)[string] | null>(null);

  useEffect(() => {
    // No mostrar en la propia ruta restringida; recién en el destino al volver.
    if (pathname.includes("/admin")) return;

    let codigo: string | null = null;
    try {
      codigo = sessionStorage.getItem("fwd_alerta");
    } catch {
      return;
    }

    const mensaje = codigo ? MENSAJES[codigo] : undefined;
    if (mensaje) {
      setAlerta(mensaje);
      try {
        sessionStorage.removeItem("fwd_alerta");
      } catch {
        // ignore
      }
    }
  }, [pathname]);

  // Auto-cierre a los 5s.
  useEffect(() => {
    if (!alerta) return;
    const t = setTimeout(() => setAlerta(null), 5000);
    return () => clearTimeout(t);
  }, [alerta]);

  if (!alerta) return null;

  return (
    <div className="fixed left-1/2 top-4 z-[60] w-[min(92vw,28rem)] -translate-x-1/2">
      <Alert variant={alerta.variant} title={alerta.title} onClose={() => setAlerta(null)}>
        {alerta.mensaje}
      </Alert>
    </div>
  );
}
