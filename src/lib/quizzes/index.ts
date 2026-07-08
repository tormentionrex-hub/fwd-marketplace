// Banco estático de quizzes de FWD y helpers de acceso.
//
// Estructura: CATEGORIAS -> Tema -> Fase (1..10) -> 5 preguntas.
// Importable en cliente (para jugar) y en servidor (para calificar).

import type { QuizCategoria, QuizTema, QuizFase } from "./tipos";
import { FASES_POR_TEMA } from "./tipos";
import { TEMAS_LENGUAJES } from "./lenguajes";
import { TEMAS_FRAMEWORKS } from "./frameworks";
import { TEMAS_BACKEND } from "./backend";
import { TEMAS_BASES_DATOS } from "./bases-datos";
import { TEMAS_FUNDAMENTOS } from "./fundamentos";

export * from "./tipos";

export const CATEGORIAS: QuizCategoria[] = [
  {
    id: "lenguajes",
    nombre: "Lenguajes de programación",
    descripcion: "Domina la sintaxis y los conceptos de los lenguajes más usados de la industria.",
    icono: "Code2",
    color: "#008FD4",
    temas: TEMAS_LENGUAJES,
  },
  {
    id: "frameworks",
    nombre: "Frameworks",
    descripcion: "Pon a prueba tu conocimiento de los frameworks de UI y aplicaciones más demandados.",
    icono: "LayoutTemplate",
    color: "#662D91",
    temas: TEMAS_FRAMEWORKS,
  },
  {
    id: "backend",
    nombre: "Backend",
    descripcion: "Servidores, APIs, seguridad y arquitectura del lado del servidor.",
    icono: "Server",
    color: "#20BEC6",
    temas: TEMAS_BACKEND,
  },
  {
    id: "bases-datos",
    nombre: "Bases de datos",
    descripcion: "SQL, NoSQL, ORMs y motores de almacenamiento y caché.",
    icono: "Database",
    color: "#EC008C",
    temas: TEMAS_BASES_DATOS,
  },
  {
    id: "fundamentos",
    nombre: "Fundamentos de programación",
    descripcion: "Git, estructuras de datos, algoritmos, POO y las bases de la web.",
    icono: "GraduationCap",
    color: "#F7901E",
    temas: TEMAS_FUNDAMENTOS,
  },
];

// ── Índices para búsquedas rápidas (los ids de tema son únicos globalmente) ──

const TEMA_POR_ID = new Map<string, { tema: QuizTema; categoria: QuizCategoria }>();
const CATEGORIA_POR_ID = new Map<string, QuizCategoria>();

for (const categoria of CATEGORIAS) {
  CATEGORIA_POR_ID.set(categoria.id, categoria);
  for (const tema of categoria.temas) {
    TEMA_POR_ID.set(tema.id, { tema, categoria });
  }
}

export function getCategoria(id: string): QuizCategoria | undefined {
  return CATEGORIA_POR_ID.get(id);
}

export function getTema(id: string): QuizTema | undefined {
  return TEMA_POR_ID.get(id)?.tema;
}

export function getTemaConCategoria(id: string) {
  return TEMA_POR_ID.get(id);
}

export function getFase(temaId: string, fase: number): QuizFase | undefined {
  return getTema(temaId)?.fases.find((f) => f.fase === fase);
}

/** Total de temas en todo el banco. */
export const TOTAL_TEMAS = TEMA_POR_ID.size;

/** Total de fases posibles en todo el banco (cada tema aporta FASES_POR_TEMA). */
export const TOTAL_FASES = TOTAL_TEMAS * FASES_POR_TEMA;

/** Lista plana de todos los ids de tema (útil para validar entrada). */
export const IDS_TEMAS: string[] = [...TEMA_POR_ID.keys()];
