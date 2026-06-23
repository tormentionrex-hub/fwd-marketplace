import 'server-only';

/**
 * Ejecuta los intentos en orden hasta que uno tenga éxito.
 * Si todos fallan, relanza el último error.
 */
export async function conFallback<T>(
  intentos: Array<() => Promise<T>>,
): Promise<T> {
  let ultimoError: unknown;
  for (const intento of intentos) {
    try {
      return await intento();
    } catch (err) {
      console.warn('[ia-fallback] Intento fallido, probando siguiente:', err instanceof Error ? err.message : String(err));
      ultimoError = err;
    }
  }
  throw ultimoError;
}
