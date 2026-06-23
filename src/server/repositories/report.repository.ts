import 'server-only';
import { db } from '@/lib/db';

export type ReporteFila = {
  id: string;
  id_reportante: string;
  reportante_nombre: string;
  tipo_contenido: string;
  id_contenido: string;
  motivo: string;
  estado: string;
  id_moderador: string | null;
  moderador_nombre: string | null;
  resolucion: string | null;
  creado: Date;
  actualizado: Date;
};

export async function crearReporte(
  idReportante: string,
  tipoContenido: 'proyecto' | 'usuario' | 'mensaje',
  idContenido: string,
  motivo: string
) {
  return db.reportes.create({
    data: {
      id_reportante: idReportante,
      tipo_contenido: tipoContenido,
      id_contenido: idContenido,
      motivo,
    },
  });
}

export async function listarReportes(): Promise<ReporteFila[]> {
  const data = await db.reportes.findMany({
    orderBy: { creado: 'desc' },
    include: {
      usuarios_reportante: { select: { nombre: true } },
      usuarios_moderador: { select: { nombre: true } },
    },
  });

  return data.map((r) => ({
    id: r.id,
    id_reportante: r.id_reportante,
    reportante_nombre: r.usuarios_reportante.nombre,
    tipo_contenido: r.tipo_contenido,
    id_contenido: r.id_contenido,
    motivo: r.motivo,
    estado: r.estado,
    id_moderador: r.id_moderador,
    moderador_nombre: r.usuarios_moderador?.nombre ?? null,
    resolucion: r.resolucion,
    creado: r.creado,
    actualizado: r.actualizado,
  }));
}

export async function resolverReporte(
  idReporte: string,
  idModerador: string,
  resolucion: string,
  estado: 'resuelto' | 'desestimado'
) {
  return db.reportes.update({
    where: { id: idReporte },
    data: {
      id_moderador: idModerador,
      resolucion,
      estado,
      actualizado: new Date(),
    },
  });
}
