import 'server-only';
import { db } from '@/lib/db';

// Estadísticas operativas para el panel de administración.
// El "período" se toma como el mes calendario actual.
export async function obtenerEstadisticasAdmin() {
  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

  const [
    proyectosActivos,
    proyectosCerradosMes,
    ofertasEnviadas,
    ofertasAdjudicadas,
    estudiantesPendientes,
  ] = await Promise.all([
    // Proyectos abiertos recibiendo ofertas ahora mismo.
    db.proyectos.count({ where: { estado: 'publicado' } }),
    // Proyectos cerrados dentro del mes actual.
    db.proyectos.count({
      where: { estado: 'cerrado', cierre: { gte: inicioMes } },
    }),
    // Ofertas enviadas en el período.
    db.ofertas.count({ where: { enviado: { gte: inicioMes } } }),
    // Ofertas adjudicadas (aceptadas) en el período.
    db.ofertas.count({
      where: { estado: { in: ['adjudicada', 'aceptado'] }, enviado: { gte: inicioMes } },
    }),
    // Estudiantes pendientes de validación FWD.
    db.pending_verifications.count({ where: { pending: true } }),
  ]);

  return {
    proyectosActivos,
    proyectosCerradosMes,
    ofertasEnviadas,
    ofertasAdjudicadas,
    estudiantesPendientes,
  };
}
