import 'server-only';
import { createHmac, timingSafeEqual } from 'crypto';

// Token de invitación FIRMADO (HMAC-SHA256, sin estado en la BD).
// Codifica email + rol + expiración. Solo quien recibió el correo puede usar el
// enlace, y el rol NO es manipulable desde el cliente (viaja firmado). Mismo
// secreto y patrón que la sesión y el reset-token (AUTH_TOKEN_SECRET), con
// prefijo de dominio 'invitacion:' para que una firma no sea reutilizable.

const SECRET = process.env.AUTH_TOKEN_SECRET;

export interface PayloadInvitacion {
  email: string;
  rol: string;
  exp: number; // epoch en ms
}

function firma(valorBase64: string): string {
  if (!SECRET) throw new Error('Falta AUTH_TOKEN_SECRET en el entorno (.env)');
  return createHmac('sha256', SECRET).update(`invitacion:${valorBase64}`).digest('hex');
}

// Firma una invitación. `ttlMs` = tiempo de vida (default 72 h).
export function firmarInvitacion(
  datos: { email: string; rol: string },
  ttlMs: number = 72 * 60 * 60 * 1000,
): string {
  const payload: PayloadInvitacion = {
    email: datos.email.trim().toLowerCase(),
    rol: datos.rol,
    exp: Date.now() + ttlMs,
  };
  const valor = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${valor}.${firma(valor)}`;
}

// Verifica firma + expiración. Devuelve el payload o null si es inválido/vencido.
export function verificarInvitacion(token: string): PayloadInvitacion | null {
  if (!token) return null;
  const idx = token.lastIndexOf('.');
  if (idx <= 0) return null;

  const valor = token.slice(0, idx);
  const sig = token.slice(idx + 1);

  const recibido = Buffer.from(sig);
  const esperado = Buffer.from(firma(valor));
  if (recibido.length !== esperado.length || !timingSafeEqual(recibido, esperado)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(valor, 'base64url').toString('utf8'),
    ) as PayloadInvitacion;
    if (!payload?.email || !payload?.rol || !payload?.exp) return null;
    if (Date.now() > payload.exp) return null; // expirado
    return payload;
  } catch {
    return null;
  }
}
