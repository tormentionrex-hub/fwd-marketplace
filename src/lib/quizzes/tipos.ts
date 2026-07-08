// Tipos y helpers del sistema de Logros / Quizzes de FWD.
//
// Taxonomía: Categoría -> Tema -> Fase (1..10, dificultad creciente) -> 5 preguntas.
// El banco es estático y se importa tanto en cliente (para jugar) como en
// servidor (para calificar de forma autoritativa). No lleva 'server-only'.

/** Formato compacto de autoría: [pregunta, [4 opciones], índice correcto (0-3), explicación]. */
export type PreguntaCruda = readonly [string, readonly [string, string, string, string], number, string];

export interface QuizPregunta {
  pregunta: string;
  opciones: readonly string[];
  /** Índice 0-based de la opción correcta. */
  correcta: number;
  explicacion: string;
}

export interface QuizFase {
  /** Número de fase 1..10. */
  fase: number;
  preguntas: QuizPregunta[];
}

export interface QuizTema {
  /** Slug único GLOBAL (no se repite entre categorías). Ej: "javascript". */
  id: string;
  nombre: string;
  descripcion: string;
  fases: QuizFase[];
}

export interface QuizCategoria {
  /** Slug único. Ej: "lenguajes". */
  id: string;
  nombre: string;
  descripcion: string;
  /** Nombre de un ícono de lucide-react (nunca emojis — REGLA #6). */
  icono: string;
  /** Color de marca (hex) para tarjetas y acentos. */
  color: string;
  temas: QuizTema[];
}

/** Cantidad de preguntas por fase. */
export const PREGUNTAS_POR_FASE = 5;
/** Cantidad de fases por tema. */
export const FASES_POR_TEMA = 10;
/** Umbral de aciertos (sobre PREGUNTAS_POR_FASE) para aprobar una fase y ganar la insignia. */
export const ACIERTOS_PARA_APROBAR = 4;
/** Puntos otorgados por aprobar una fase (escala con la dificultad). */
export const PUNTOS_BASE_FASE = 50;

/** Etiqueta de dificultad por número de fase. */
export function etiquetaDificultad(fase: number): string {
  const etiquetas = [
    "Principiante",
    "Principiante +",
    "Básico",
    "Básico +",
    "Intermedio",
    "Intermedio +",
    "Avanzado",
    "Avanzado +",
    "Experto",
    "Senior",
  ];
  return etiquetas[fase - 1] ?? "Principiante";
}

/** Puntos por aprobar una fase concreta (crece con la dificultad). */
export function puntosPorFase(fase: number): number {
  return PUNTOS_BASE_FASE * fase;
}

// ── Helpers de autoría: convierten el formato compacto a la estructura tipada ──

/** Construye una fase a partir del formato compacto. Valida que haya 5 preguntas. */
export function fase(numero: number, crudas: readonly PreguntaCruda[]): QuizFase {
  const preguntas: QuizPregunta[] = crudas.map(([pregunta, opciones, correcta, explicacion]) => ({
    pregunta,
    opciones: [...opciones],
    correcta,
    explicacion,
  }));
  return { fase: numero, preguntas };
}

/** Construye un tema a partir de sus 10 fases (en orden). */
export function tema(
  id: string,
  nombre: string,
  descripcion: string,
  fases: QuizFase[],
): QuizTema {
  return { id, nombre, descripcion, fases };
}
