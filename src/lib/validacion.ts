// Validaciones reutilizables para subida de prototipos/entregables (páginas 10 y 11).

export const FORMATOS_PERMITIDOS = ['.pdf', '.zip', '.png', '.jpg', '.jpeg'];
export const TAMANO_MAX_MB = 10;

// Devuelve un mensaje de error en español, o null si el archivo es válido.
export function validarArchivo(file: File): string | null {
  const nombre = file.name.toLowerCase();
  const formatoOk = FORMATOS_PERMITIDOS.some((ext) => nombre.endsWith(ext));
  if (!formatoOk) {
    return `Formato no permitido. Usá: ${FORMATOS_PERMITIDOS.join(', ')}.`;
  }
  if (file.size > TAMANO_MAX_MB * 1024 * 1024) {
    return `El archivo supera el máximo de ${TAMANO_MAX_MB} MB.`;
  }
  return null;
}

// true si es una URL http/https bien formada.
export function validarUrl(valor: string): boolean {
  try {
    const u = new URL(valor);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}
