import 'server-only';
import { db } from '@/lib/db';

// Capa de datos: queries Prisma sobre el modelo ofertas. La unicidad
// (un estudiante = una oferta por proyecto) la garantiza el índice
// @@unique([id_proyecto, id_estudiante]) del schema.

export function buscarOfertaDeEstudiante(idProyecto: string, idEstudiante: string) {
  return db.ofertas.findUnique({
    where: {
      id_proyecto_id_estudiante: {
        id_proyecto: idProyecto,
        id_estudiante: idEstudiante,
      },
    },
    select: { id: true, estado: true, enviado: true },
  });
}

// Lista las ofertas de un estudiante con el proyecto, su empresario y tecnologías.
export function listarOfertasDeEstudiante(idEstudiante: string) {
  return db.ofertas.findMany({
    where: { id_estudiante: idEstudiante },
    orderBy: { enviado: 'desc' },
    select: {
      id: true,
      estado: true,
      propuesta: true,
      prototipo_url: true,
      enviado: true,
      proyectos: {
        select: {
          id: true,
          titulo: true,
          area_negocio: true,
          estado: true,
          cierre: true,
          perfiles_empresario: {
            select: {
              sector: true,
              usuarios: { select: { nombre: true } },
            },
          },
          proyectos_tecnologias: {
            select: { tecnologias: { select: { nombre: true } } },
          },
        },
      },
    },
  });
}

export function crearOferta(datos: {
  idProyecto: string;
  idEstudiante: string;
  propuesta: string;
  prototipoUrl?: string | null;
}) {
  return db.ofertas.create({
    data: {
      id_proyecto: datos.idProyecto,
      id_estudiante: datos.idEstudiante,
      propuesta: datos.propuesta,
      prototipo_url: datos.prototipoUrl ?? null,
      estado: 'enviada',
    },
    select: { id: true, estado: true, enviado: true },
  });
}
