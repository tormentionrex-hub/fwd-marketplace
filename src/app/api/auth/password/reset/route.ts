import { NextResponse } from "next/server";
import { cambiarPassword } from "@/server/services/password-reset.service";
import { mismoOrigen } from "@/server/http/request";

export async function POST(request: Request) {
  if (!mismoOrigen(request)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }

  let resetToken = "";
  let password = "";
  try {
    const body = await request.json();
    resetToken = String(body.resetToken ?? "");
    password = String(body.password ?? "");
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  try {
    const resultado = await cambiarPassword(resetToken, password);
    if (!resultado.ok) {
      return NextResponse.json({ error: resultado.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[password/reset]", err);
    return NextResponse.json({ error: "No se pudo cambiar la contraseña." }, { status: 500 });
  }
}
