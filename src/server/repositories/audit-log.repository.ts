import 'server-only';
import { db } from '@/lib/db';

export type AuditoriaFila = {
  id: string;
  id_staff: string;
  nombre_staff: string;
  accion: string;
  detalles: unknown;
  justificacion: string | null;
  creado: Date;
};

export async function registrarAuditoria(
  idStaff: string,
  nombreStaff: string,
  accion: string,
  justificacion: string | null = null,
  detalles: unknown = null
) {
  return db.registro_auditoria.create({
    data: {
      id_staff: idStaff,
      nombre_staff: nombreStaff,
      accion,
      justificacion,
      detalles: detalles ? JSON.parse(JSON.stringify(detalles)) : undefined,
    },
  });
}

export async function listarAuditorias(): Promise<AuditoriaFila[]> {
  return db.registro_auditoria.findMany({
    orderBy: { creado: 'desc' },
  });
}
