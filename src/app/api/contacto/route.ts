import { NextResponse } from "next/server";
import {
  enviarMensajeContacto,
  enviarConfirmacionContacto,
} from "@/server/services/email.service";
import { permitido } from "@/server/auth/rate-limit";
import { clienteIp, mismoOrigen } from "@/server/http/request";

const QUINCE_MIN = 15 * 60_000;

// Buzón que recibe los mensajes del formulario "Hablemos".
const DESTINO = process.env.CONTACT_TO || "contacto@fwdcostarica.com";

// POST /api/contacto — recibe { email, mensaje } del formulario del Footer y
// envía un correo de marca (con logo) al buzón de FWD.
export async function POST(request: Request) {
  if (!mismoOrigen(request)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }

  let email = "";
  let mensaje = "";
  try {
    const body = await request.json();
    email = String(body.email ?? "").trim().toLowerCase();
    mensaje = String(body.mensaje ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "Ingresá un correo electrónico válido." }, { status: 400 });
  }
  if (mensaje.length < 1 || mensaje.length > 2000) {
    return NextResponse.json(
      { error: "El mensaje debe tener entre 1 y 2000 caracteres." },
      { status: 400 },
    );
  }

  // Rate limiting: por correo+IP y por IP global.
  const ip = clienteIp(request);
  if (
    !permitido(`contacto:${ip}:${email}`, 5, QUINCE_MIN) ||
    !permitido(`contacto-ip:${ip}`, 20, QUINCE_MIN)
  ) {
    return NextResponse.json(
      { error: "Demasiados mensajes. Intentá de nuevo más tarde." },
      { status: 429 },
    );
  }

  try {
    // 1) Confirmación a la persona que llenó el formulario (lo que el usuario ve).
    // 2) Notificación al buzón de FWD para que el equipo dé seguimiento.
    await Promise.all([
      enviarConfirmacionContacto(email, mensaje),
      enviarMensajeContacto(DESTINO, email, mensaje),
    ]);
  } catch (err) {
    console.error("[contacto]", err);
    return NextResponse.json(
      { error: "No se pudo enviar el mensaje. Intentá más tarde." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
