import 'server-only';

// Cliente central de OpenRouter con fallback automatico entre modelos.
// Si el modelo primario tarda mas de TIMEOUT_MODELO_MS o retorna error,
// cambia SILENCIOSAMENTE al siguiente modelo. El usuario nunca ve el fallo.

const OR_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Tiempo maximo de espera por modelo antes de probar el siguiente (ms).
// Suficientemente generoso para trafico normal, suficientemente corto para
// que el fallback sea transparente al usuario.
const TIMEOUT_MODELO_MS = 8000;

export interface OpcionesLlamadaIA {
  temperature?: number;
  max_tokens: number;
  response_format?: { type: 'json_object' | 'text' };
}

// Modelos en orden de prioridad. El primero es el mas rapido/barato;
// si falla, se intenta el siguiente de forma transparente.
export const MODELOS_RAPIDOS = [
  'anthropic/claude-3.5-haiku',
  'openai/gpt-4o-mini',
  'poolside/laguna-m.1:free',
] as const;

/**
 * Llama a OpenRouter probando cada modelo en orden.
 * Falla silenciosamente en cada modelo si:
 *   - El timeout por modelo (8s) expira
 *   - La red falla
 *   - El modelo devuelve un error HTTP recuperable (4xx/5xx, 429)
 * Solo lanza error si TODOS los modelos fallan.
 */
export async function llamarIA(
  messages: { role: string; content: string }[],
  opciones: OpcionesLlamadaIA,
): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('OPENROUTER_API_KEY no configurada');

  const headers = {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.NEXT_PUBLIC_URL ?? 'https://fwd.cr',
    'X-Title': 'FWD Marketplace',
  };

  let ultimoError: unknown;

  for (const modelo of MODELOS_RAPIDOS) {
    try {
      const res = await fetch(OR_URL, {
        method: 'POST',
        headers,
        signal: AbortSignal.timeout(TIMEOUT_MODELO_MS),
        body: JSON.stringify({
          model: modelo,
          messages,
          temperature: opciones.temperature ?? 0.3,
          max_tokens: opciones.max_tokens,
          ...(opciones.response_format && { response_format: opciones.response_format }),
        }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        console.warn(`[ia] ${modelo} HTTP ${res.status} — probando siguiente modelo`);
        ultimoError = new Error(`${modelo}: HTTP ${res.status} ${txt.slice(0, 100)}`);
        continue; // probar siguiente modelo
      }

      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const texto = data.choices?.[0]?.message?.content ?? '';
      if (!texto) {
        console.warn(`[ia] ${modelo} devolvio respuesta vacia — probando siguiente modelo`);
        ultimoError = new Error(`${modelo}: respuesta vacia`);
        continue; // probar siguiente modelo
      }

      // Exito: retornar el texto sin exponer que se uso un fallback
      return texto;
    } catch (err) {
      const esTimeout = err instanceof DOMException && err.name === 'TimeoutError';
      const razon = esTimeout ? `timeout ${TIMEOUT_MODELO_MS}ms` : (err instanceof Error ? err.message : String(err));
      const esUltimo = modelo === MODELOS_RAPIDOS[MODELOS_RAPIDOS.length - 1];

      if (esUltimo) {
        // Se agotaron los modelos; ahora si hay que lanzar el error
        throw ultimoError ?? err;
      }

      console.warn(`[ia] ${modelo} fallo (${razon}) — probando siguiente modelo`);
      ultimoError = err;
    }
  }

  throw ultimoError ?? new Error('Todos los modelos de IA fallaron');
}

// Ejecuta un array de thunks en orden; devuelve el resultado del primero que
// resuelva. Si todos fallan, lanza el último error. Útil para tener múltiples
// clientes/keys de IA de la misma API con fallback transparente.
export async function conFallback<T>(thunks: Array<() => Promise<T>>): Promise<T> {
  let ultimoError: unknown;
  for (const thunk of thunks) {
    try {
      return await thunk();
    } catch (err) {
      ultimoError = err;
    }
  }
  throw ultimoError ?? new Error('Todos los proveedores de IA fallaron');
}
