import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

// Token que autoriza el paso 3 (cambiar contraseña) tras verificar el OTP.
// Formato: `${idReset}.${HMAC-SHA256(idReset)}` firmado con AUTH_TOKEN_SECRET.
// Es opaco para el cliente y se valida además contra la fila password_resets
// (verificado/usado/expira), por lo que es de un solo uso.

const SECRET = process.env.AUTH_TOKEN_SECRET;

function firma(id: string): string {
  if (!SECRET) throw new Error("Falta AUTH_TOKEN_SECRET en el entorno (.env)");
  return createHmac("sha256", SECRET).update(`reset:${id}`).digest("hex");
}

export function firmarResetToken(id: string): string {
  return `${id}.${firma(id)}`;
}

export function verificarResetToken(token: string): string | null {
  const idx = token.lastIndexOf(".");
  if (idx <= 0) return null;

  const id = token.slice(0, idx);
  const sig = token.slice(idx + 1);

  const recibido = Buffer.from(sig);
  const esperado = Buffer.from(firma(id));

  if (recibido.length !== esperado.length || !timingSafeEqual(recibido, esperado)) {
    return null;
  }
  return id;
}
