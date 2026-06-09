import 'server-only';
import { db } from '@/lib/db';

// Capa de datos (Prisma puro) sobre el modelo proyectos. Sin lógica de negocio.

// Lista los proyectos de un empresario con el conteo de ofertas (candidatos).
// Una sola query con _count para evitar N+1.
export function listarProyectosDeEmpresario(idEmpresario: string) {
  return db.proyectos.findMany({
    where: { id_empresario: idEmpresario },
    select: {
      id: true,
      titulo: true,
      estado: true,
      plazo_dias: true,
      publicado: true,
      cierre: true,
      _count: { select: { ofertas: true } },
    },
    orderBy: { publicado: 'desc' },
  });
}

// Datos del proyecto para la pantalla de gestión (Página 14) y para validar dueño.
export function buscarProyectoGestion(id: string) {
  return db.proyectos.findUnique({
    where: { id },
    select: { id: true, titulo: true, estado: true, id_empresario: true },
  });
}

// Cierra el proyecto (lo llama el service tras validar el entregable final aprobado).
export async function cerrarProyectoRepo(id: string) {
  await db.proyectos.update({
    where: { id },
    data: { estado: 'cerrado', cierre: new Date() },
  });
}
