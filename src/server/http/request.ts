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
  if (process.env.NODE_ENV !== "production") return true;
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}
