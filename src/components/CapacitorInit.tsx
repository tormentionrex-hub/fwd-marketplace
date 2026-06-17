"use client";

import { useEffect } from "react";

export default function CapacitorInit() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const initCapacitor = async () => {
        try {
          const { Capacitor } = await import("@capacitor/core");
          if (Capacitor.isNativePlatform()) {
            const { App } = await import("@capacitor/app");

            // Escuchar cuando la app se abre vía deep link (esquema fwdmarketplace)
            App.addListener("appUrlOpen", async (event) => {
              try {
                const url = new URL(event.url);

                if (url.host === "api" && url.pathname === "/auth/callback") {
                  const code = url.searchParams.get("code");
                  const error = url.searchParams.get("error");

                  const { Browser } = await import("@capacitor/browser");
                  await Browser.close();

                  if (error) {
                    window.location.href = `${window.location.origin}/login?error=${error}`;
                  } else if (code) {
                    // Navegar el WebView hacia el callback normal en el dominio del servidor.
                    // Esto intercambiará el código y establecerá la cookie fwd_session
                    // dentro del almacenamiento de sesión del WebView de la app nativa.
                    window.location.href = `${window.location.origin}/api/auth/callback?code=${code}`;
                  }
                }
              } catch (urlErr) {
                console.error("Error al analizar la URL del deep link:", urlErr);
              }
            });
          }
        } catch (initErr) {
          console.error("Error al inicializar listeners de Capacitor:", initErr);
        }
      };

      initCapacitor();
    }
  }, []);

  return null;
}
