import 'server-only';
import { db } from '@/lib/db';

// Trae los campos del proyecto necesarios para la página de oferta.
export function buscarProyectoParaOferta(id: string) {
  return db.proyectos.findUnique({
    where: { id },
    select: {
      id: true,
      titulo: true,
      descripcion: true,
      estado: true,
      plazo_dias: true,
      cierre: true,
      publicado: true,
    },
  });
}

// Verifica si el estudiante ya ofertó a este proyecto.
// Usa el índice único (id_proyecto, id_estudiante) del schema.
export function buscarOfertaExistente(idProyecto: string, idEstudiante: string) {
  // Prisma genera el nombre del compound unique como campo1_campo2
  return db.ofertas.findUnique({
    where: {
      id_proyecto_id_estudiante: {
        id_proyecto: idProyecto,
        id_estudiante: idEstudiante,
      },
    },
  });
}

// Crea una nueva oferta con estado 'pendiente'.
export function crearOferta(datos: {
  idProyecto: string;
  idEstudiante: string;
  propuesta: string;
  prototipoUrl?: string | null;
  documentacionUrl?: string | null;
}) {
  return db.ofertas.create({
    data: {
      id_proyecto: datos.idProyecto,
      id_estudiante: datos.idEstudiante,
      propuesta: datos.propuesta,
      prototipo_url: datos.prototipoUrl ?? null,
      documentacion_url: datos.documentacionUrl ?? null,
      estado: 'pendiente',
    },
  });
}

// Retira (elimina) una oferta. Verifica pertenencia y estado antes de borrar.
export async function retirarOferta(
  idOferta: string,
  idEstudiante: string
): Promise<'ok' | 'no_encontrada' | 'no_autorizado' | 'adjudicada'> {
  const oferta = await db.ofertas.findUnique({
    where: { id: idOferta },
    select: { id: true, id_estudiante: true, estado: true },
  });

  if (!oferta) return 'no_encontrada';
  if (oferta.id_estudiante !== idEstudiante) return 'no_autorizado';
  if (oferta.estado === 'adjudicada') return 'adjudicada';

  await db.ofertas.delete({ where: { id: idOferta } });
  return 'ok';
}

// Lista todas las ofertas de un estudiante, incluyendo el detalle de sus proyectos, tecnologías y empresarios.
export function listarOfertasDeEstudiante(idEstudiante: string) {
  return db.ofertas.findMany({
    where: { id_estudiante: idEstudiante },
    orderBy: { enviado: 'desc' },
    select: {
      id: true,
      estado: true,
      propuesta: true,
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
            select: {
              tecnologias: { select: { nombre: true } },
            },
          },
        },
      },
    },
  });
}
