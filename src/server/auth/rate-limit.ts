import "server-only";

// Limitador de tasa en memoria (ventana fija). Protege contra fuerza bruta y
// abuso del endpoint de recuperación.
//
// Caveat: el estado vive en el proceso. Es suficiente para un solo nodo; en un
// despliegue multi-instancia o serverless habría que usar un store compartido
// (p. ej. Redis / Upstash).

interface Entrada {
  conteo: number;
  reinicia: number;
}

const mapa = new Map<string, Entrada>();

/**
 * Devuelve true si la acción está permitida para `clave` dentro de la ventana.
 * Incrementa el contador en cada llamada permitida.
 */
export function permitido(clave: string, max: number, ventanaMs: number): boolean {
  const ahora = Date.now();
  const entrada = mapa.get(clave);

  if (!entrada || ahora > entrada.reinicia) {
    mapa.set(clave, { conteo: 1, reinicia: ahora + ventanaMs });
    return true;
  }

  if (entrada.conteo >= max) return false;

  entrada.conteo += 1;
  return true;
}
