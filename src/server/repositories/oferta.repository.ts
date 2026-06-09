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

// Lista las ofertas de UN estudiante con su proyecto, empresario y tecnologías.
// Ownership: filtra estrictamente por id_estudiante — cada quien ve solo lo suyo.
export function listarOfertasDeEstudiante(idEstudiante: string) {
  return db.ofertas.findMany({
    where: { id_estudiante: idEstudiante },
    orderBy: { enviado: 'desc' },
    select: {
      id: true,
      propuesta: true,
      estado: true,
      enviado: true,
      proyectos: {
        select: {
          id: true,
          titulo: true,
          area_negocio: true,
          estado: true,
          cierre: true,
          perfiles_empresario: {
            select: { sector: true, usuarios: { select: { nombre: true } } },
          },
          proyectos_tecnologias: {
            select: { tecnologias: { select: { nombre: true } } },
          },
        },
      },
    },
  });
}

// Busca el proyecto "activo" del estudiante: su oferta adjudicada/aceptada más
// reciente, con los datos del proyecto y del empresario. Ownership por id_estudiante.
export function buscarProyectoActivoDeEstudiante(idEstudiante: string) {
  return db.ofertas.findFirst({
    where: {
      id_estudiante: idEstudiante,
      estado: { in: ['adjudicada', 'aceptada', 'aceptado'] },
    },
    orderBy: { enviado: 'desc' },
    select: {
      id: true,
      estado: true,
      proyectos: {
        select: {
          id: true,
          titulo: true,
          estado: true,
          publicado: true,
          cierre: true,
          perfiles_empresario: {
            select: { sector: true, usuarios: { select: { nombre: true } } },
          },
        },
      },
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

// ── Página 14 (gestión del empresario) ─────────────────────────────────────

// Lista todas las ofertas de un proyecto, de la más antigua a la más nueva.
export function listarOfertasDeProyecto(idProyecto: string) {
  return db.ofertas.findMany({
    where: { id_proyecto: idProyecto },
    orderBy: { enviado: 'asc' },
  });
}

// Trae una oferta mínima (para validar a qué proyecto pertenece).
export function buscarOferta(id: string) {
  return db.ofertas.findUnique({
    where: { id },
    select: { id: true, id_proyecto: true },
  });
}

// Adjudica una oferta de forma atómica: la elegida pasa a 'adjudicada', las demás
// del proyecto a 'no_seleccionada' y el proyecto a 'en_desarrollo'.
export function adjudicarOferta(idOferta: string, idProyecto: string) {
  return db.$transaction([
    db.ofertas.update({ where: { id: idOferta }, data: { estado: 'adjudicada' } }),
    db.ofertas.updateMany({
      where: { id_proyecto: idProyecto, id: { not: idOferta } },
      data: { estado: 'no_seleccionada' },
    }),
    db.proyectos.update({ where: { id: idProyecto }, data: { estado: 'en_desarrollo' } }),
  ]);
}
