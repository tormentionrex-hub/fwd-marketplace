"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Se renderiza en lugar del contenido cuando el usuario no tiene permiso para una
// ruta. Deja el código de alerta en sessionStorage y vuelve a la página anterior
// del historial (router.back), que es la real aunque hayas pegado la URL a mano.
// Si no hay historial previo, cae al inicio. La alerta la muestra <AlertaGlobal>
// al llegar al destino.
export function SinPermiso({
  codigo = "permisos",
  locale,
}: {
  codigo?: string;
  locale: string;
}) {
  const router = useRouter();

  useEffect(() => {
    try {
      sessionStorage.setItem("fwd_alerta", codigo);
    } catch {
      // sessionStorage no disponible: igual intentamos volver.
    }

    if (window.history.length > 1) {
      router.back();
    } else {
      router.replace(`/${locale}`);
    }
  }, [codigo, locale, router]);

  return null;
}
