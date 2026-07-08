import 'server-only';
import { db } from '@/lib/db';

// ── Tipos serializables para los modales de estadísticas ────────────────────

export type ProyectoActivoDetalle = {
  id: string;
  titulo: string;
  descripcion: string;
  publicado: string | null;
  diasPublicado: number;
  imagenes: string[];
  area_negocio: string | null;
  plazo_dias: number | null;
  usa_ia: boolean;
  tecnologias: string[];
  totalOfertas: number;
  recomendado: boolean;
  empresario: {
    nombre: string;
    nombre_empresa: string | null;
    sector: string | null;
  } | null;
};

export type ProyectoCerradoDetalle = {
  id: string;
  titulo: string;
  descripcion: string;
  publicado: string | null;
  cierre: string | null;
  diasDuracion: number | null;
  area_negocio: string | null;
  usa_ia: boolean;
  tecnologias: string[];
  totalOfertas: number;
  empresario: { nombre: string } | null;
};

export type OfertaPeriodo = {
  id: string;
  id_proyecto: string;
  titulo_proyecto: string;
  propuesta: string;
  estado: string;
  enviado: string;
  diasEsperando: number;
  estudiante: { nombre: string } | null;
};

// ── Consultas detalladas para los modales ────────────────────────────────────

export async function listarProyectosActivosDetalle(): Promise<ProyectoActivoDetalle[]> {
  const rows = await db.proyectos.findMany({
    where: { estado: 'publicado' },
    select: {
      id: true,
      titulo: true,
      descripcion: true,
      publicado: true,
      imagenes: true,
      area_negocio: true,
      plazo_dias: true,
      usa_ia: true,
      perfiles_empresario: {
        select: {
          nombre_empresa: true,
          sector: true,
          usuarios: { select: { nombre: true } },
        },
      },
      proyectos_tecnologias: {
        select: { tecnologias: { select: { nombre: true } } },
      },
      _count: { select: { ofertas: true } },
      proyecto_mejoras: {
        where: { mejoras: { codigo: 'ADMIN_DESTACADO' } },
        select: { id: true },
        take: 1,
      },
    },
    orderBy: { publicado: 'desc' },
  });

  const ahora = Date.now();
  return rows.map((p) => {
    const msPublicado = p.publicado ? ahora - new Date(p.publicado).getTime() : 0;
    const diasPublicado = Math.floor(msPublicado / 86_400_000);
    return {
      id: p.id,
      titulo: p.titulo,
      descripcion: p.descripcion,
      publicado: p.publicado ? p.publicado.toISOString() : null,
      diasPublicado,
      imagenes: p.imagenes,
      area_negocio: p.area_negocio,
      plazo_dias: p.plazo_dias,
      usa_ia: p.usa_ia,
      tecnologias: p.proyectos_tecnologias.map((pt) => pt.tecnologias.nombre),
      totalOfertas: p._count.ofertas,
      recomendado: p.proyecto_mejoras.length > 0,
      empresario: p.perfiles_empresario
        ? {
            nombre: p.perfiles_empresario.usuarios.nombre,
            nombre_empresa: p.perfiles_empresario.nombre_empresa,
            sector: p.perfiles_empresario.sector,
          }
        : null,
    };
  });
}

export async function listarProyectosCerradosMesDetalle(): Promise<ProyectoCerradoDetalle[]> {
  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

  const rows = await db.proyectos.findMany({
    where: { estado: 'cerrado', cierre: { gte: inicioMes } },
    select: {
      id: true,
      titulo: true,
      descripcion: true,
      publicado: true,
      cierre: true,
      area_negocio: true,
      usa_ia: true,
      perfiles_empresario: {
        select: { usuarios: { select: { nombre: true } } },
      },
      proyectos_tecnologias: {
        select: { tecnologias: { select: { nombre: true } } },
      },
      _count: { select: { ofertas: true } },
    },
    orderBy: { cierre: 'desc' },
  });

  return rows.map((p) => {
    const diasDuracion =
      p.publicado && p.cierre
        ? Math.max(0, Math.floor((new Date(p.cierre).getTime() - new Date(p.publicado).getTime()) / 86_400_000))
        : null;
    return {
      id: p.id,
      titulo: p.titulo,
      descripcion: p.descripcion,
      publicado: p.publicado ? p.publicado.toISOString() : null,
      cierre: p.cierre ? p.cierre.toISOString() : null,
      diasDuracion,
      area_negocio: p.area_negocio,
      usa_ia: p.usa_ia,
      tecnologias: p.proyectos_tecnologias.map((pt) => pt.tecnologias.nombre),
      totalOfertas: p._count.ofertas,
      empresario: p.perfiles_empresario
        ? { nombre: p.perfiles_empresario.usuarios.nombre }
        : null,
    };
  });
}

export async function listarOfertasPeriodo(): Promise<OfertaPeriodo[]> {
  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const ahoraMs = ahora.getTime();

  const rows = await db.ofertas.findMany({
    where: { enviado: { gte: inicioMes } },
    select: {
      id: true,
      id_proyecto: true,
      propuesta: true,
      estado: true,
      enviado: true,
      perfiles_estudiante: { select: { usuarios: { select: { nombre: true } } } },
      proyectos: { select: { titulo: true } },
    },
    orderBy: { enviado: 'desc' },
  });

  return rows.map((o) => ({
    id: o.id,
    id_proyecto: o.id_proyecto,
    titulo_proyecto: o.proyectos?.titulo ?? '—',
    propuesta: o.propuesta,
    estado: o.estado,
    enviado: o.enviado.toISOString(),
    diasEsperando: Math.floor((ahoraMs - new Date(o.enviado).getTime()) / 86_400_000),
    estudiante: o.perfiles_estudiante?.usuarios
      ? { nombre: o.perfiles_estudiante.usuarios.nombre }
      : null,
  }));
}

// Cierra automáticamente proyectos publicados sin ofertas por más de 60 días.
// Pasa el proyecto a borrador con un motivo_estado especial para que el
// empresario vea el mensaje de alerta al entrar a su panel.
export async function autoCerrarProyectosViejos(): Promise<number> {
  const limite = new Date(Date.now() - 60 * 86_400_000);
  const candidatos = await db.proyectos.findMany({
    where: { estado: 'publicado', publicado: { lte: limite } },
    select: { id: true, _count: { select: { ofertas: true } } },
  });

  const sinOfertas = candidatos.filter((p) => p._count.ofertas === 0);
  if (sinOfertas.length === 0) return 0;

  await db.proyectos.updateMany({
    where: { id: { in: sinOfertas.map((p) => p.id) } },
    data: {
      estado: 'borrador',
      motivo_estado:
        'Tu proyecto no ha recibido ofertas en 60 días. Por favor, actualiza el precio, la descripción o el stack tecnológico y vuelve a publicarlo.',
    },
  });

  return sinOfertas.length;
}

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
