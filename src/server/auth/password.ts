import 'server-only';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

// Hasheo de contraseñas con scrypt (módulo crypto nativo, sin dependencias extra).
// Formato almacenado en usuarios.hash_contrasena:  <salt hex>:<hash hex>

export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(plain, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;

  const hashBuf = Buffer.from(hash, 'hex');
  const testBuf = scryptSync(plain, salt, 64);

  // Comparación en tiempo constante para evitar timing attacks.
  return hashBuf.length === testBuf.length && timingSafeEqual(hashBuf, testBuf);
}
