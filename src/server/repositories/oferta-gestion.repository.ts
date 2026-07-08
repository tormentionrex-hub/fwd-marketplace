import 'server-only';
import { db } from '@/lib/db';

// Queries de gestión de ofertas para la Página 14 (separadas de oferta.repository.ts
// del flujo de envío, para no tocar ese archivo).

// Lista las ofertas de un proyecto con el nombre del estudiante.
export function listarOfertasDeProyecto(idProyecto: string) {
  return db.ofertas.findMany({
    where: { id_proyecto: idProyecto },
    orderBy: { enviado: 'asc' },
    select: {
      id: true,
      id_estudiante: true,
      propuesta: true,
      prototipo_url: true,
      documentacion_url: true,
      estado: true,
      enviado: true,
      perfiles_estudiante: { select: { usuarios: { select: { nombre: true } } } },
    },
  });
}

// Para validar pertenencia: de qué proyecto es una oferta.
export function buscarOfertaConProyecto(id: string) {
  return db.ofertas.findUnique({ where: { id }, select: { id: true, id_proyecto: true } });
}

// El estudiante adjudicado se deriva de la oferta en estado 'adjudicada'
// (el schema no tiene columna estudiante_adjudicado).
export function buscarEstudianteAdjudicado(idProyecto: string) {
  return db.ofertas.findFirst({
    where: { id_proyecto: idProyecto, estado: 'adjudicada' },
    select: { id_estudiante: true },
  });
}

// Adjudica en UNA transacción: la elegida -> 'adjudicada', las demás -> 'no_seleccionada',
// y el proyecto pasa a 'en_desarrollo'.
export async function adjudicarOferta(idOferta: string, idProyecto: string) {
  await db.$transaction([
    db.ofertas.update({ where: { id: idOferta }, data: { estado: 'adjudicada' } }),
    db.ofertas.updateMany({
      where: { id_proyecto: idProyecto, id: { not: idOferta } },
      data: { estado: 'no_seleccionada' },
    }),
    db.proyectos.update({ where: { id: idProyecto }, data: { estado: 'en_desarrollo' } }),
  ]);
}
