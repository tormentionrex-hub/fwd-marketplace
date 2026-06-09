import 'server-only';
import { db } from '@/lib/db';
import { listarMisOfertas } from '@/server/services/oferta.service';
import type { ResumenDashboard } from '@/types/sefora';

// Calcula las tarjetas-resumen del dashboard del estudiante con datos reales:
//  - totalOfertas: nº de ofertas enviadas
//  - proyectosActivos: ofertas aceptadas cuyo proyecto sigue abierto/en curso
//  - proyectosCompletados: ofertas aceptadas cuyo proyecto ya cerró
//  - calificacionPromedio / reputacion: promedio de evaluaciones recibidas
export async function resumenDashboardEstudiante(idUsuario: string): Promise<ResumenDashboard> {
  const [ofertas, evalAgg] = await Promise.all([
    listarMisOfertas(idUsuario),
    db.evaluaciones.aggregate({
      where: { id_estudiante: idUsuario },
      _avg: { puntuacion: true },
    }),
  ]);

  const aceptadas = ofertas.filter((o) => o.estado === 'aceptado');
  const proyectosActivos = aceptadas.filter((o) => o.proyecto.estado === 'abierto').length;
  const proyectosCompletados = aceptadas.length - proyectosActivos;
  const promedio = Number((evalAgg._avg.puntuacion ?? 0).toFixed(1));

  return {
    totalOfertas: ofertas.length,
    proyectosActivos,
    proyectosCompletados,
    calificacionPromedio: promedio,
    reputacion: promedio,
  };
}
