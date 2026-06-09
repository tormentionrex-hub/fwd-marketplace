/**
 * Valida que un enlace externo sea seguro de mostrar: debe ser una URL absoluta
 * con protocolo http(s). Evita renderizar `javascript:`, `data:` o cadenas rotas.
 */
export function isValidHttpUrl(value: string | undefined | null): value is string {
  if (!value) return false;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

/** Etiqueta legible del host (sin `www.`) para mostrar junto a un enlace. */
export function prettyHost(value: string): string {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}
