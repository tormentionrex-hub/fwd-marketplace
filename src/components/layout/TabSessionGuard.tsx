"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";

interface TabSessionGuardProps {
  hasSession: boolean;
}

// Prefijos de rutas que REQUIEREN sesión. Todo lo demás es público por defecto.
// Antes esto era una lista BLANCA de rutas públicas: cualquier página nueva que
// no estuviera en la lista (p.ej. /empresa, /ranking, /perfil) redirigía por
// error al login. Se invirtió a lista de PROTEGIDAS para que eso no vuelva a
// pasar. La protección real vive en el servidor (cada layout/página protegida
// hace su propio redirect); esto es solo una red de apoyo para el cierre de
// sesión multi-pestaña. El pathname de next-intl viene SIN prefijo de locale.
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/empresario",
  "/admin",
  "/staff",
  "/mensajes",
];

function esRutaProtegida(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

function leerCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() ?? null;
  return null;
}

export function TabSessionGuard({ hasSession }: TabSessionGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detectar login reciente (cookie temporal que dura 1 minuto)
    const isNewLogin = leerCookie("fwd_new_session") === "true";
    if (isNewLogin) {
      sessionStorage.setItem("fwd_active", "true");
      document.cookie = "fwd_new_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }

    // ── Caso 1: el servidor confirma que hay sesión válida ────────────────────
    // La cookie fwd_session es httpOnly y fue verificada con HMAC-SHA256 en el
    // servidor. Es la fuente de verdad. No necesitamos BroadcastChannel para
    // verificar si "hay sesión activa": el servidor ya lo confirmó.
    // Marcar esta pestaña como activa y escuchar si otra pestaña cierra sesión.
    if (hasSession) {
      sessionStorage.setItem("fwd_active", "true");

      if (typeof BroadcastChannel !== "undefined") {
        const channel = new BroadcastChannel("fwd_session_channel");

        const handleMessage = (event: MessageEvent) => {
          const tipo = event.data?.type;
          // Otra pestaña cerró sesión → propagar aquí también
          if (tipo === "SESSION_ENDED") {
            sessionStorage.removeItem("fwd_active");
            router.push("/login");
            router.refresh();
            return;
          }
          // Responder si alguna pestaña nueva pregunta si hay sesión activa
          if (tipo === "REQUEST_SESSION_STATUS") {
            channel.postMessage({ type: "SESSION_STATUS_RESPONSE", active: true });
          }
        };

        channel.addEventListener("message", handleMessage);
        return () => {
          channel.removeEventListener("message", handleMessage);
          channel.close();
        };
      }

      return;
    }

    // ── Caso 2: el servidor NO tiene sesión ───────────────────────────────────
    // Limpiar estado local por si quedó residual
    const estabaActivo = !!sessionStorage.getItem("fwd_active");
    if (estabaActivo) {
      sessionStorage.removeItem("fwd_active");
    }

    // Solo redirigir si la ruta es de un área protegida (dashboard, empresario,
    // admin, staff, mensajes). Las páginas públicas nunca se tocan.
    if (esRutaProtegida(pathname)) {
      router.push("/login");
    }
  }, [pathname, router, hasSession]);

  return null;
}
