import { NextResponse } from "next/server";
import { verificarCodigo } from "@/server/services/password-reset.service";
import { permitido } from "@/server/auth/rate-limit";
import { clienteIp, mismoOrigen } from "@/server/http/request";

const QUINCE_MIN = 15 * 60_000;

export async function POST(request: Request) {
  if (!mismoOrigen(request)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }

  let email = "";
  let code = "";
  try {
    const body = await request.json();
    email = String(body.email ?? "").trim().toLowerCase();
    code = String(body.code ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: "El código debe tener 6 dígitos." }, { status: 400 });
  }

  // Límite de intentos por IP (además del límite por fila en el service).
  const ip = clienteIp(request);
  if (!permitido(`pwverify:${ip}`, 30, QUINCE_MIN)) {
    return NextResponse.json(
      { error: "Demasiados intentos. Intentá más tarde." },
      { status: 429 },
    );
  }

  try {
    const resultado = await verificarCodigo(email, code);
    if (!resultado.ok) {
      return NextResponse.json({ error: resultado.error }, { status: 400 });
    }
    return NextResponse.json({ resetToken: resultado.resetToken });
  } catch (err) {
    console.error("[password/verify]", err);
    return NextResponse.json({ error: "No se pudo verificar el código." }, { status: 500 });
  }
}
