import "server-only";

// Utilidades para inspeccionar la request en route handlers.

/** IP del cliente (mejor esfuerzo detrás de proxies). */
export function clienteIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() || "desconocida";
  return request.headers.get("x-real-ip") || "desconocida";
}

/** Verifica que la petición provenga del mismo origen (mitiga CSRF). */
export function mismoOrigen(request: Request): boolean {
  const origin = request.headers.get("origin");
  // Sin Origin (p. ej. curl o navegaciones same-origin antiguas) lo permitimos:
  // estos endpoints no mutan estado autenticado por cookie de forma sensible.
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}
