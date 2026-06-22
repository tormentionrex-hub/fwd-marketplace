"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";

interface TabSessionGuardProps {
  hasSession: boolean;
}

export function TabSessionGuard({ hasSession }: TabSessionGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Si la ruta es pública o es una API, no hacer nada
    const publicPaths = [
      "/login",
      "/register",
      "/recuperar",
      "/terminos",
      "/privacidad",
      "/solicitar-acceso",
      "/registro/estudiante",
      "/marketplace",
      "/noticias"
    ];
    const isPublic = publicPaths.some(p => pathname.includes(p)) || pathname === "/";

    // 1. Detectar si hay una cookie temporal que indique que iniciamos sesión en este momento.
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
      return null;
    };

    const isNewSession = getCookie("fwd_new_session") === "true";
    if (isNewSession) {
      sessionStorage.setItem("fwd_active", "true");
      // Borrar la cookie para que no se herede accidentalmente luego
      document.cookie = "fwd_new_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }

    const estaActivoEnTab = !!sessionStorage.getItem("fwd_active");

    // Si ya está activa la pestaña actual, no hacer nada
    if (estaActivoEnTab) {
      return;
    }

    if (typeof BroadcastChannel === "undefined") {
      // Si el navegador no soporta BroadcastChannel, proceder con el comportamiento simple
      if (hasSession) {
        fetch("/api/auth/logout", { method: "POST" })
          .then(() => {
            localStorage.removeItem("fwd_perfil");
            sessionStorage.removeItem("fwd_active");
            router.push("/login");
            router.refresh();
          })
          .catch(() => {});
      } else if (!isPublic && !pathname.startsWith("/api")) {
        router.push("/login");
      }
      return;
    }

    // 2. Preguntar a otras pestañas si hay una activa
    const channel = new BroadcastChannel("fwd_session_channel");
    let receivedResponse = false;

    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "SESSION_STATUS_RESPONSE" && event.data.active) {
        receivedResponse = true;
        sessionStorage.setItem("fwd_active", "true");
      }
    };

    channel.addEventListener("message", handleMessage);

    // Enviar solicitud de estado a otras pestañas
    channel.postMessage({ type: "REQUEST_SESSION_STATUS" });

    // Escuchar solicitudes de otras pestañas
    const handleRequest = (event: MessageEvent) => {
      if (event.data && event.data.type === "REQUEST_SESSION_STATUS") {
        const active = !!sessionStorage.getItem("fwd_active");
        if (active) {
          channel.postMessage({ type: "SESSION_STATUS_RESPONSE", active: true });
        }
      }
    };
    channel.addEventListener("message", handleRequest);

    // Esperar un momento a ver si responde alguna pestaña activa
    const timeoutId = setTimeout(() => {
      if (!receivedResponse) {
        // Ninguna pestaña activa respondió.
        // Si el backend tiene sesión, significa que abrimos una nueva pestaña pero la anterior
        // se cerró y no quedan pestañas vivas. Debemos cerrar la sesión para asegurar
        // que el cierre de pestañas limpie la sesión.
        if (hasSession) {
          fetch("/api/auth/logout", { method: "POST" })
            .then(() => {
              localStorage.removeItem("fwd_perfil");
              sessionStorage.removeItem("fwd_active");
              router.push("/login");
              router.refresh();
            })
            .catch(() => {});
        } else if (!isPublic && !pathname.startsWith("/api")) {
          // No hay sesión y es ruta privada -> login
          router.push("/login");
        }
      }
    }, 150); // 150ms es suficiente para la comunicación local

    return () => {
      channel.removeEventListener("message", handleMessage);
      channel.removeEventListener("message", handleRequest);
      channel.close();
      clearTimeout(timeoutId);
    };
  }, [pathname, router, hasSession]);

  return null;
}
