import "server-only";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

// DTO para la creación/edición de cotizaciones.
export interface GuardarCotizacionDTO {
  nombreProyecto: string;
  descripcion?: string | null;
  duracionSemanas: number;
  horasEstimadas: number;
  complejidad: string;
  stack: string[];
  funcionalidades: Prisma.InputJsonValue; // Se guardará como JSON en Prisma
  tarifaBaseHora: number;
  modalidad: string;
  iva: boolean;
  rangoMin: number;
  rangoEstimado: number;
  rangoMax: number;
  moneda: string;
  desglose: Prisma.InputJsonValue; // Se guardará como JSON en Prisma
  explicacionIa?: string | null;
  idProyecto?: string | null;
  idPostulacion?: string | null;
}

/**
 * Guarda una nueva cotización creada por un estudiante.
 */
export async function guardarCotizacion(idEstudiante: string, data: GuardarCotizacionDTO) {
  return db.cotizaciones.create({
    data: {
      id_estudiante: idEstudiante,
      nombre_proyecto: data.nombreProyecto,
      descripcion: data.descripcion ?? null,
      duracion_semanas: data.duracionSemanas,
      horas_estimadas: data.horasEstimadas,
      complejidad: data.complejidad,
      stack: data.stack,
      funcionalidades: data.funcionalidades as Prisma.InputJsonValue,
      tarifa_base_hora: data.tarifaBaseHora,
      modalidad: data.modalidad,
      iva: data.iva,
      rango_min: data.rangoMin,
      rango_estimado: data.rangoEstimado,
      rango_max: data.rangoMax,
      moneda: data.moneda,
      desglose: data.desglose as Prisma.InputJsonValue,
      explicacion_ia: data.explicacionIa ?? null,
      id_proyecto: data.idProyecto || null,
      id_postulacion: data.idPostulacion || null,
    },
    select: {
      id: true,
      nombre_proyecto: true,
    },
  });
}

/**
 * Obtiene todas las cotizaciones guardadas por un estudiante con sus relaciones.
 */
export async function obtenerCotizacionesDeEstudiante(idEstudiante: string) {
  return db.cotizaciones.findMany({
    where: { id_estudiante: idEstudiante },
    include: {
      proyectos: {
        select: {
          id: true,
          titulo: true,
        },
      },
      postulaciones: {
        select: {
          id: true,
          vacantes: {
            select: {
              id: true,
              titulo: true,
            },
          },
        },
      },
    },
    orderBy: {
      creado: "desc",
    },
  });
}

/**
 * Elimina una cotización verificando que pertenezca al estudiante.
 */
export async function eliminarCotizacion(
  idCotizacion: string,
  idEstudiante: string
): Promise<"ok" | "no_encontrado" | "no_autorizado"> {
  const c = await db.cotizaciones.findUnique({
    where: { id: idCotizacion },
    select: { id_estudiante: true },
  });

  if (!c) return "no_encontrado";
  if (c.id_estudiante !== idEstudiante) return "no_autorizado";

  await db.cotizaciones.delete({
    where: { id: idCotizacion },
  });

  return "ok";
}
