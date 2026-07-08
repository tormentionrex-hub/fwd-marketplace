import { NextResponse } from "next/server";
import { getUser } from "@/server/auth/get-user";
import { mismoOrigen } from "@/server/http/request";
import { error, errorInterno, parsearBody } from "@/server/http/responder";
import { cotizacionSchema } from "@/server/validation/cotizaciones.schema";
import {
  guardarCotizacionService,
  listarCotizacionesService,
  eliminarCotizacionService,
} from "@/server/services/cotizaciones.service";

/**
 * GET /api/cotizaciones — Lista todas las cotizaciones guardadas del estudiante.
 */
export async function GET() {
  const user = await getUser();
  if (!user) return error("No autorizado", 401);
  if (user.roles.nombre !== "estudiante") {
    return error("Solo los estudiantes pueden ver sus cotizaciones", 403);
  }

  try {
    const cotizaciones = await listarCotizacionesService(user.id);
    return NextResponse.json({ ok: true, cotizaciones });
  } catch (e) {
    return errorInterno("cotizaciones/GET", e);
  }
}

/**
 * POST /api/cotizaciones — Guarda una nueva cotización calculada.
 */
export async function POST(request: Request) {
  if (!mismoOrigen(request)) return error("Origen no permitido", 403);

  const user = await getUser();
  if (!user) return error("No autorizado", 401);
  if (user.roles.nombre !== "estudiante") {
    return error("Solo los estudiantes pueden guardar cotizaciones", 403);
  }

  const parseo = await parsearBody(request, cotizacionSchema);
  if (!parseo.ok) return parseo.respuesta;

  try {
    const cotizacion = await guardarCotizacionService(user.id, parseo.data);
    return NextResponse.json(
      { ok: true, id: cotizacion.id, nombre: cotizacion.nombre_proyecto },
      { status: 201 }
    );
  } catch (e) {
    return errorInterno("cotizaciones/POST", e);
  }
}

/**
 * DELETE /api/cotizaciones — Elimina una cotización.
 */
export async function DELETE(request: Request) {
  if (!mismoOrigen(request)) return error("Origen no permitido", 403);

  const user = await getUser();
  if (!user) return error("No autorizado", 401);
  if (user.roles.nombre !== "estudiante") {
    return error("Solo los estudiantes pueden eliminar cotizaciones", 403);
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return error("Falta el ID de la cotización", 400);

  try {
    const resultado = await eliminarCotizacionService(id, user.id);

    if (resultado === "no_encontrado") return error("Cotización no encontrada", 404);
    if (resultado === "no_autorizado") return error("No tienes permiso para eliminar esta cotización", 403);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorInterno("cotizaciones/DELETE", e);
  }
}
