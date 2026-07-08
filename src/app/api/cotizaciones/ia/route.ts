import { NextResponse } from "next/server";
import { z } from "zod";
import { getUser } from "@/server/auth/get-user";
import { mismoOrigen } from "@/server/http/request";
import { error, errorInterno, parsearBody } from "@/server/http/responder";
import { estimarCotizacionConIA } from "@/server/services/cotizaciones.service";

const promptIaSchema = z.object({
  descripcion: z
    .string()
    .trim()
    .min(10, "La descripción del proyecto debe tener al menos 10 caracteres para que la IA realice una estimación correcta"),
  stack: z.array(z.string().trim()).default([]),
});

/**
 * POST /api/cotizaciones/ia — Procesa el brief del proyecto usando Gemini para sugerir estimaciones.
 */
export async function POST(request: Request) {
  if (!mismoOrigen(request)) return error("Origen no permitido", 403);

  const user = await getUser();
  if (!user) return error("No autorizado", 401);
  if (user.roles.nombre !== "estudiante") {
    return error("Solo los estudiantes pueden utilizar el asistente de cotizaciones IA", 403);
  }

  const parseo = await parsearBody(request, promptIaSchema);
  if (!parseo.ok) return parseo.respuesta;

  const { descripcion, stack } = parseo.data;

  try {
    const resultado = await estimarCotizacionConIA(descripcion, stack ?? []);
    return NextResponse.json({ ok: true, resultado });
  } catch (e) {
    return errorInterno("cotizaciones/ia/POST", e);
  }
}
