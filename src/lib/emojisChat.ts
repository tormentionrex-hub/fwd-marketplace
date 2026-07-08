// ─────────────────────────────────────────────────────────────────────────────
// Emojis para el composer de mensajes del chat.
//
// Son CONTENIDO que el usuario inserta en su propio mensaje (como un teclado de
// emojis), no decoración de la UI del producto. Para cumplir la REGLA #6 (cero
// glifos emoji en el código) se definen por sus code points Unicode y se
// materializan en tiempo de ejecución con String.fromCodePoint().
// ─────────────────────────────────────────────────────────────────────────────

const VS16 = 0xfe0f; // selector de presentación emoji para símbolos "de texto"

export interface GrupoEmoji {
  nombre: string;
  puntos: number[][];
}

export const GRUPOS_EMOJI: GrupoEmoji[] = [
  {
    nombre: "Caras",
    puntos: [
      [0x1f600], [0x1f603], [0x1f604], [0x1f601], [0x1f606], [0x1f605],
      [0x1f602], [0x1f923], [0x1f60a], [0x1f607], [0x1f609], [0x1f60d],
      [0x1f618], [0x1f61c], [0x1f60e], [0x1f914], [0x1f642], [0x1f644],
      [0x1f62c], [0x1f62d], [0x1f621], [0x1f615], [0x1f634], [0x1f971],
    ],
  },
  {
    nombre: "Gestos",
    puntos: [
      [0x1f44d], [0x1f44e], [0x1f44c], [0x1f44f], [0x1f64c], [0x1f64f],
      [0x1f91d], [0x1f4aa], [0x1f44b], [0x270c, VS16], [0x1f918], [0x1f919],
      [0x1f446], [0x1f447], [0x1f448], [0x1f449], [0x261d, VS16], [0x1f91e],
    ],
  },
  {
    nombre: "Símbolos",
    puntos: [
      [0x2764, VS16], [0x1f49b], [0x1f49a], [0x1f499], [0x1f49c], [0x1f9e1],
      [0x2b50], [0x1f525], [0x2705], [0x274c], [0x1f4af], [0x2757],
      [0x2753], [0x1f4a1], [0x1f389], [0x1f680], [0x2714, VS16], [0x1f44a],
    ],
  },
  {
    nombre: "Trabajo",
    puntos: [
      [0x1f4bb], [0x1f4f1], [0x1f5a5, VS16], [0x1f4e7], [0x1f4c4], [0x1f4ce],
      [0x1f4c5], [0x23f0], [0x1f4b0], [0x1f4b5], [0x1f4ca], [0x1f4c8],
      [0x2615], [0x1f527], [0x2699, VS16], [0x1f4dd], [0x1f4cc], [0x1f9e0],
    ],
  },
];

/** Convierte un arreglo de code points en su emoji. */
export function emojiDeCodepoints(cps: number[]): string {
  return String.fromCodePoint(...cps);
}
