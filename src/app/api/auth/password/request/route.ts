import { NextResponse } from "next/server";
import { solicitarRecuperacion } from "@/server/services/password-reset.service";
import { permitido } from "@/server/auth/rate-limit";
import { clienteIp, mismoOrigen } from "@/server/http/request";

const QUINCE_MIN = 15 * 60_000;

export async function POST(request: Request) {
  if (!mismoOrigen(request)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }

  let email = "";
  try {
    const body = await request.json();
    email = String(body.email ?? "").trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "Ingresa un correo electrónico válido." }, { status: 400 });
  }

  // Rate limiting: por correo+IP y por IP global.
  const ip = clienteIp(request);
  if (
    !permitido(`pwreset:${ip}:${email}`, 5, QUINCE_MIN) ||
    !permitido(`pwreset-ip:${ip}`, 20, QUINCE_MIN)
  ) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intentá de nuevo más tarde." },
      { status: 429 },
    );
  }

  try {
    const resultado = await solicitarRecuperacion(email);

    // Por requerimiento de producto SÍ se valida la existencia del correo: si no
    // hay cuenta, se informa con 404 en vez de un éxito falso (así el usuario
    // sabe que el código solo llega a correos realmente registrados).
    if (!resultado.existe) {
      return NextResponse.json(
        { error: "No encontramos una cuenta con ese correo." },
        { status: 404 },
      );
    }

    // El código fue enviado. Devolvemos la última sesión para mostrarla en la
    // pantalla de verificación (ISO 8601 o null si nunca inició sesión).
    return NextResponse.json({
      ok: true,
      ultimaSesion: resultado.ultimaSesion ? resultado.ultimaSesion.toISOString() : null,
    });
  } catch (err) {
    console.error("[password/request]", err);
    return NextResponse.json(
      { error: "No se pudo enviar el código. Intentá de nuevo." },
      { status: 500 },
    );
  }
}
