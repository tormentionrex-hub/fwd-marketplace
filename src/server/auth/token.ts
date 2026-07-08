import 'server-only';
import { createHmac, randomBytes } from 'crypto';

// Firma secreta para generar los tokens. Vive solo en el entorno del servidor
// (sin prefijo NEXT_PUBLIC_), nunca llega al navegador.
const SECRET = process.env.AUTH_TOKEN_SECRET;

/**
 * Genera un token de sesión opaco de 16 caracteres alfanuméricos.
 *
 * Toma bytes aleatorios y los firma con AUTH_TOKEN_SECRET (definido en .env)
 * vía HMAC-SHA256; luego recorta el resultado a 16 chars [A-Za-z0-9]. Cada
 * llamada produce un token distinto.
 */
export function generarToken(): string {
  if (!SECRET) {
    throw new Error('Falta AUTH_TOKEN_SECRET en el entorno (.env)');
  }

  const aleatorio = randomBytes(24);
  const firma = createHmac('sha256', SECRET).update(aleatorio).digest('base64');

  // base64 puede traer +, / y =; nos quedamos solo con alfanuméricos y cortamos a 16.
  return firma.replace(/[^A-Za-z0-9]/g, '').slice(0, 16);
}
