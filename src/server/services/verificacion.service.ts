import 'server-only';
import { db } from '@/lib/db';

// Verificación FWD del estudiante. Fuente de verdad en servidor: se deriva de
// `perfiles_estudiante.estado_verificacion`. NULL se considera verificado porque
// el estudiante solo pudo registrarse tras una invitación pre-aprobada por el
// admin; un estado explícito 'pendiente'/'rechazado'/'en_revision' lo bloquea.

export interface EstadoVerificacionEstudiante {
  verificado: boolean;
  estado: string | null;
  solicitado: Date | null;
}

const ESTADOS_BLOQUEANTES = new Set(['pendiente', 'rechazado', 'en_revision', 'en revisión']);

export function esVerificado(estado: string | null | undefined): boolean {
  return !ESTADOS_BLOQUEANTES.has((estado ?? '').toLowerCase().trim());
}

export async function obtenerVerificacionEstudiante(
  idUsuario: string,
): Promise<EstadoVerificacionEstudiante> {
  const [perfil, pendiente] = await Promise.all([
    db.perfiles_estudiante.findUnique({
      where: { id_usuario: idUsuario },
      select: { estado_verificacion: true },
    }),
    db.pending_verifications.findFirst({
      where: { id_usuario: idUsuario },
      orderBy: { solicitado: 'desc' },
      select: { solicitado: true },
    }),
  ]);

  const estado = perfil?.estado_verificacion ?? null;
  return { verificado: esVerificado(estado), estado, solicitado: pendiente?.solicitado ?? null };
}
