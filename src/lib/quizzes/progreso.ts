// Estado de progreso de quizzes del estudiante y derivación de insignias.
//
// Módulo PURO (sin acceso a DB): se usa en servidor, cliente y perfiles.
// El estado se persiste en perfiles_estudiante.preferencias.quizzes (JSON).

import { CATEGORIAS, getTemaConCategoria, TOTAL_FASES } from "./index";
import { FASES_POR_TEMA, etiquetaDificultad } from "./tipos";

export interface QuizzesEstado {
  /** temaId -> número de la fase MÁS ALTA completada (0 = ninguna, hasta 10). */
  progreso: Record<string, number>;
  /** Puntos acumulados por aprobar fases. */
  puntos: number;
  /** ISO string de la última actualización, o null. */
  actualizado: string | null;
}

export interface InsigniaGanada {
  /** Id único de la insignia: `${temaId}-f${fase}`. */
  id: string;
  temaId: string;
  temaNombre: string;
  categoriaId: string;
  categoriaNombre: string;
  /** Color de marca de la categoría (hex). */
  color: string;
  /** Nombre del ícono de lucide de la categoría. */
  icono: string;
  fase: number;
  dificultad: string;
  /** Título legible de la insignia. */
  titulo: string;
}

export const QUIZZES_ESTADO_INICIAL: QuizzesEstado = {
  progreso: {},
  puntos: 0,
  actualizado: null,
};

function clampFase(v: unknown): number {
  if (typeof v !== "number" || !Number.isFinite(v)) return 0;
  return Math.min(FASES_POR_TEMA, Math.max(0, Math.floor(v)));
}

/** Normaliza el objeto crudo (de la DB o del cliente) a un QuizzesEstado válido. */
export function parsearQuizzes(entrada: unknown): QuizzesEstado {
  if (!entrada || typeof entrada !== "object" || Array.isArray(entrada)) {
    return { ...QUIZZES_ESTADO_INICIAL, progreso: {} };
  }
  const e = entrada as Record<string, unknown>;
  const progresoRaw = e.progreso;
  const progreso: Record<string, number> = {};
  if (progresoRaw && typeof progresoRaw === "object" && !Array.isArray(progresoRaw)) {
    for (const [temaId, valor] of Object.entries(progresoRaw as Record<string, unknown>)) {
      // Solo conservamos temas que existen en el banco actual.
      if (getTemaConCategoria(temaId)) {
        const fase = clampFase(valor);
        if (fase > 0) progreso[temaId] = fase;
      }
    }
  }
  const puntos =
    typeof e.puntos === "number" && Number.isFinite(e.puntos) && e.puntos >= 0
      ? Math.floor(e.puntos)
      : 0;
  const actualizado = typeof e.actualizado === "string" ? e.actualizado : null;
  return { progreso, puntos, actualizado };
}

/** Total de fases completadas sumando todos los temas. */
export function contarFasesCompletadas(progreso: Record<string, number>): number {
  return Object.values(progreso).reduce((suma, f) => suma + clampFase(f), 0);
}

/** Porcentaje global de avance en el banco de quizzes (0-100). */
export function porcentajeGlobal(progreso: Record<string, number>): number {
  if (TOTAL_FASES === 0) return 0;
  return Math.round((contarFasesCompletadas(progreso) / TOTAL_FASES) * 100);
}

/**
 * Deriva la lista de insignias ganadas a partir del progreso.
 * Una insignia por cada fase completada de cada tema. Ordenadas por categoría/tema/fase.
 */
export function insigniasDeProgreso(progreso: Record<string, number>): InsigniaGanada[] {
  const insignias: InsigniaGanada[] = [];
  for (const categoria of CATEGORIAS) {
    for (const tema of categoria.temas) {
      const faseMax = clampFase(progreso[tema.id]);
      for (let fase = 1; fase <= faseMax; fase++) {
        insignias.push({
          id: `${tema.id}-f${fase}`,
          temaId: tema.id,
          temaNombre: tema.nombre,
          categoriaId: categoria.id,
          categoriaNombre: categoria.nombre,
          color: categoria.color,
          icono: categoria.icono,
          fase,
          dificultad: etiquetaDificultad(fase),
          titulo: `${tema.nombre} · Fase ${fase}`,
        });
      }
    }
  }
  return insignias;
}

/**
 * Devuelve solo la insignia de la FASE MÁS ALTA por tema (para vistas compactas
 * como el perfil, donde no se quieren mostrar las 10 fases de cada tema).
 */
export function insigniasDestacadas(progreso: Record<string, number>): InsigniaGanada[] {
  const todas = insigniasDeProgreso(progreso);
  const porTema = new Map<string, InsigniaGanada>();
  for (const ins of todas) {
    const previa = porTema.get(ins.temaId);
    if (!previa || ins.fase > previa.fase) porTema.set(ins.temaId, ins);
  }
  return [...porTema.values()].sort((a, b) => b.fase - a.fase);
}
