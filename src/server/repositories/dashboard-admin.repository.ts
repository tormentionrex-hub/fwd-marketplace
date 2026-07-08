import 'server-only';
import { db } from '@/lib/db';

// Capa de datos del dashboard de administración. Ejecuta TODAS las consultas en
// paralelo y devuelve los resultados crudos; la capa de servicio se encarga de
// darles forma (buckets del gráfico, feed de actividad, serialización).
// "Período" = mes calendario actual.
export async function consultarDashboardAdmin() {
  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const inicioMesPasado = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
  // Primer día del mes de hace 5 meses → 6 buckets contando el mes actual.
  const inicioSerie = new Date(ahora.getFullYear(), ahora.getMonth() - 5, 1);

  const [
    proyectosPublicadosTotal,
    proyectosPubMes,
    proyectosPubMesPasado,
    usuariosActivos,
    usuariosNuevosMes,
    usuariosNuevosMesPasado,
    ofertasPendientes,
    estudiantesOfertaPendiente,
    usuariosPendientes,
    usuariosSerie,
    proyectosSerie,
    ofertasSerie,
    aprobaciones,
    usuariosRecientes,
    proyectosRecientes,
    ofertasRecientes,
    suspensionesRecientes,
    invitaciones,
    solicitudes,
  ] = await Promise.all([
    // ── KPIs ────────────────────────────────────────────────────────────────
    db.proyectos.count({ where: { estado: 'publicado' } }),
    db.proyectos.count({ where: { estado: 'publicado', publicado: { gte: inicioMes } } }),
    db.proyectos.count({
      where: { estado: 'publicado', publicado: { gte: inicioMesPasado, lt: inicioMes } },
    }),
    db.usuarios.count({ where: { estado: 'activo' } }),
    db.usuarios.count({ where: { creado: { gte: inicioMes } } }),
    db.usuarios.count({ where: { creado: { gte: inicioMesPasado, lt: inicioMes } } }),
    db.ofertas.count({ where: { estado: 'pendiente' } }),
    db.ofertas.findMany({
      where: { estado: 'pendiente' },
      select: { id_estudiante: true },
      distinct: ['id_estudiante'],
    }),
    db.usuarios.count({ where: { estado: 'pendiente' } }),

    // ── Series del gráfico (solo fechas; se agrupan en el servicio) ──────────
    db.usuarios.findMany({ where: { creado: { gte: inicioSerie } }, select: { creado: true } }),
    db.proyectos.findMany({
      where: { publicado: { gte: inicioSerie } },
      select: { publicado: true },
    }),
    db.ofertas.findMany({ where: { enviado: { gte: inicioSerie } }, select: { enviado: true } }),

    // ── Proyectos pendientes de revisión (aprobaciones) ─────────────────────
    db.proyectos.findMany({
      where: { estado: 'pendiente_revision' },
      orderBy: { publicado: 'desc' },
      take: 6,
      select: {
        id: true,
        titulo: true,
        area_negocio: true,
        estado: true,
        motivo_estado: true,
        publicado: true,
        perfiles_empresario: { select: { usuarios: { select: { nombre: true } } } },
        _count: { select: { ofertas: true } },
      },
    }),

    // ── Eventos recientes (para el feed de actividad) ───────────────────────
    db.usuarios.findMany({
      orderBy: { creado: 'desc' },
      take: 6,
      select: { id: true, nombre: true, creado: true, roles: { select: { nombre: true } } },
    }),
    db.proyectos.findMany({
      where: { estado: 'publicado', publicado: { not: null } },
      orderBy: { publicado: 'desc' },
      take: 6,
      select: {
        id: true,
        titulo: true,
        area_negocio: true,
        publicado: true,
        perfiles_empresario: { select: { usuarios: { select: { nombre: true } } } },
        _count: { select: { ofertas: true } },
      },
    }),
    db.ofertas.findMany({
      orderBy: { enviado: 'desc' },
      take: 6,
      select: {
        id: true,
        enviado: true,
        proyectos: { select: { titulo: true } },
        perfiles_estudiante: { select: { usuarios: { select: { nombre: true } } } },
      },
    }),
    db.suspensiones.findMany({
      orderBy: { creado: 'desc' },
      take: 6,
      select: {
        id: true,
        accion: true,
        nombre_admin: true,
        creado: true,
        usuarios: { select: { nombre: true } },
      },
    }),

    // ── Invitaciones enviadas y solicitudes de acceso ───────────────────────
    db.pending_verifications.findMany({
      where: { pending: true, tipo: 'invitacion' },
      orderBy: { solicitado: 'desc' },
      take: 12,
      select: { id: true, email: true, rol: true, solicitado: true },
    }),
    db.pending_verifications.findMany({
      where: { pending: true, tipo: 'solicitud' },
      orderBy: { solicitado: 'desc' },
      take: 12,
      select: { id: true, email: true, solicitado: true },
    }),
  ]);

  return {
    proyectosPublicadosTotal,
    proyectosPubMes,
    proyectosPubMesPasado,
    usuariosActivos,
    usuariosNuevosMes,
    usuariosNuevosMesPasado,
    ofertasPendientes,
    estudiantesOfertaPendiente: estudiantesOfertaPendiente.length,
    usuariosPendientes,
    usuariosSerie,
    proyectosSerie,
    ofertasSerie,
    aprobaciones,
    usuariosRecientes,
    proyectosRecientes,
    ofertasRecientes,
    suspensionesRecientes,
    invitaciones,
    solicitudes,
    inicioSerie,
  };
}
