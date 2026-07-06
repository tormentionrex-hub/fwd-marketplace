// ─────────────────────────────────────────────────────────────────────────────
// Moderación de mensajes del chat.
//
// Detecta lenguaje ofensivo o agresivo para marcar el mensaje en rojo y avisar
// al usuario antes de enviarlo. La detección es del lado del cliente (feedback
// inmediato); cuando exista el backend conviene revalidar en el servidor.
// ─────────────────────────────────────────────────────────────────────────────

// Patrones base (sin límites de palabra). Se usan clases de caracteres para
// tolerar tildes y variantes de género/número. No se listan formas explícitas
// más allá de lo necesario para el filtro.
const PATRONES_BASE: string[] = [
  "put[oa]s?",
  "put[ai]t[ao]s?",
  "est[uú]pid[oa]s?",
  "pendej[oa]s?",
  "imb[eé]cil(?:es)?",
  "idiotas?",
  "mierdas?",
  "cabr[oó]n(?:es|a|as)?",
  "gilipollas",
  "coño",
  "conch[ae]",
  "joder",
  "j[oó]dete",
  "maric[oó]n(?:es)?",
  "marica",
  "zorras?",
  "malparid[oa]s?",
  "hijue?puta",
  "hdp",
  "culer[oa]s?",
  "vergas?",
  "mam[oó]n(?:es)?",
  "mamadas?",
  "subnormal(?:es)?",
  "retrasad[oa]s?",
  "basura",
  "asqueros[oa]s?",
  // Inglés
  "fuck\\w*",
  "shit",
  "bitch(?:es)?",
  "assholes?",
  "idiots?",
  "stupid",
  "moron",
  "bastards?",
  "dick(?:head)?",
  "dumb(?:ass)?",
];

// Compila cada patrón con un límite de palabra tolerante a Unicode (tildes, ñ).
const REGLAS: RegExp[] = PATRONES_BASE.map(
  (p) => new RegExp(`(^|[^\\p{L}])(?:${p})([^\\p{L}]|$)`, "iu"),
);

export interface ResultadoModeracion {
  ofensivo: boolean;
}

/** Devuelve si el texto contiene lenguaje ofensivo o agresivo. */
export function detectarLenguajeOfensivo(texto: string): ResultadoModeracion {
  if (!texto) return { ofensivo: false };
  const ofensivo = REGLAS.some((re) => re.test(texto));
  return { ofensivo };
}
