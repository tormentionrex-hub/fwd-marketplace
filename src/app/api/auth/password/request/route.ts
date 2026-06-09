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
    await solicitarRecuperacion(email);
  } catch (err) {
    // No se filtran fallos internos ni si el correo existe o no.
    console.error("[password/request]", err);
  }

  // Siempre 200: por seguridad no revelamos si el correo está registrado
  // (anti-enumeración). Si existe, se envió el código; si no, no se hace nada.
  return NextResponse.json({ ok: true });
}
