import "server-only";
import { NextResponse } from "next/server";
import type { ZodType } from "zod";

// Helpers de respuesta uniformes para los route handlers.
//
// Contrato CON EL FRONTEND (no romper): los componentes leen `data.error` y
// discriminan por status code. Por eso estos helpers SIEMPRE devuelven la forma
// { error: string } con el status exacto, y NUNCA tocan las respuestas de éxito
// (cada endpoint sigue devolviendo su shape propia: { ok }, { perfil }, etc.).

/** Respuesta de error estándar: { error } + status. */
export function error(mensaje: string, status: number): NextResponse {
  return NextResponse.json({ error: mensaje }, { status });
}

/**
 * Error interno (500): loguea el detalle SOLO en el servidor y devuelve un
 * mensaje genérico al cliente (no se filtran stack traces ni internals).
 */
export function errorInterno(contexto: string, err: unknown): NextResponse {
  console.error(`[${contexto}]`, err);
  return error("Ocurrió un error. Intentá de nuevo.", 500);
}

type ResultadoParseo<T> =
  | { ok: true; data: T }
  | { ok: false; respuesta: NextResponse };

/**
 * Lee y valida el body JSON con un schema de zod.
 * - Si el JSON es inválido → 400 { error: 'Cuerpo inválido' }.
 * - Si no pasa el schema → 400 con el primer mensaje del schema (sin filtrar
 *   el ZodError completo).
 * - Si pasa → { ok: true, data } ya tipado y normalizado por el schema.
 *
 * Uso:
 *   const parseo = await parsearBody(request, miSchema);
 *   if (!parseo.ok) return parseo.respuesta;
 *   const { ... } = parseo.data;
 */
export async function parsearBody<T>(
  request: Request,
  schema: ZodType<T>,
): Promise<ResultadoParseo<T>> {
  let crudo: unknown;
  try {
    crudo = await request.json();
  } catch {
    return { ok: false, respuesta: error("Cuerpo inválido", 400) };
  }

  const resultado = schema.safeParse(crudo);
  if (!resultado.success) {
    const mensaje = resultado.error.issues[0]?.message ?? "Datos inválidos";
    return { ok: false, respuesta: error(mensaje, 400) };
  }

  return { ok: true, data: resultado.data };
}
