import 'server-only';
import { db } from '@/lib/db';

export type AdminKPIs = {
  estudiantesVerificados: { total: number; tendencia: number };
  empresariosRegistrados: { total: number; tendencia: number };
  proyectosPublicados: { total: number; tendencia: number };
  validacionesPendientes: { total: number; tendencia: number };
};

export type GraficoData = {
  mes: string;
  estudiantes: number;
  empresarios: number;
  proyectos: number;
};

export type AlertaCritica = {
  id: string;
  tipo: 'conducta' | 'spam' | 'demora';
  prioridad: 'alta' | 'media';
  titulo: string;
  descripcion: string;
  creado: Date;
  idReferencia: string;
};

// Calcula la tendencia porcentual entre el mes actual y el mes anterior
function calcularTendencia(actual: number, anterior: number): number {
  if (anterior === 0) return actual > 0 ? 100 : 0;
  return Math.round(((actual - anterior) / anterior) * 100);
}

export async function obtenerKPIsAdmin(): Promise<AdminKPIs> {
  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const inicioMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);

  // Consultas paralelas para el mes actual y el mes anterior
  const [
    estudiantesVerificadosTotal,
    estudiantesVerificadosMes,
    estudiantesVerificadosAnterior,

    empresariosTotal,
    empresariosMes,
    empresariosAnterior,

    proyectosPublicadosTotal,
    proyectosPublicadosMes,
    proyectosPublicadosAnterior,

    validacionesPendientesTotal,
    validacionesPendientesMes,
    validacionesPendientesAnterior,
  ] = await Promise.all([
    // Estudiantes verificados
    db.perfiles_estudiante.count({ where: { estado_verificacion: 'verificado' } }),
    db.usuarios.count({
      where: {
        roles: { nombre: 'estudiante' },
        creado: { gte: inicioMes },
        perfiles_estudiante: { estado_verificacion: 'verificado' },
      },
    }),
    db.usuarios.count({
      where: {
        roles: { nombre: 'estudiante' },
        creado: { gte: inicioMesAnterior, lt: inicioMes },
        perfiles_estudiante: { estado_verificacion: 'verificado' },
      },
    }),

    // Empresarios
    db.perfiles_empresario.count(),
    db.usuarios.count({
      where: {
        roles: { nombre: 'empresario' },
        creado: { gte: inicioMes },
      },
    }),
    db.usuarios.count({
      where: {
        roles: { nombre: 'empresario' },
        creado: { gte: inicioMesAnterior, lt: inicioMes },
      },
    }),

    // Proyectos publicados
    db.proyectos.count({ where: { estado: 'publicado' } }),
    db.proyectos.count({
      where: { estado: 'publicado', publicado: { gte: inicioMes } },
    }),
    db.proyectos.count({
      where: { estado: 'publicado', publicado: { gte: inicioMesAnterior, lt: inicioMes } },
    }),

    // Validaciones pendientes (usuarios con estado 'pendiente')
    db.usuarios.count({ where: { estado: 'pendiente' } }),
    db.usuarios.count({
      where: { estado: 'pendiente', creado: { gte: inicioMes } },
    }),
    db.usuarios.count({
      where: { estado: 'pendiente', creado: { gte: inicioMesAnterior, lt: inicioMes } },
    }),
  ]);

  return {
    estudiantesVerificados: {
      total: estudiantesVerificadosTotal,
      tendencia: calcularTendencia(estudiantesVerificadosMes, estudiantesVerificadosAnterior),
    },
    empresariosRegistrados: {
      total: empresariosTotal,
      tendencia: calcularTendencia(empresariosMes, empresariosAnterior),
    },
    proyectosPublicados: {
      total: proyectosPublicadosTotal,
      tendencia: calcularTendencia(proyectosPublicadosMes, proyectosPublicadosAnterior),
    },
    validacionesPendientes: {
      total: validacionesPendientesTotal,
      tendencia: calcularTendencia(validacionesPendientesMes, validacionesPendientesAnterior),
    },
  };
}

export async function obtenerDatosGraficoAdmin(): Promise<GraficoData[]> {
  const ahora = new Date();
  const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const datos: GraficoData[] = [];

  // Obtenemos los últimos 6 meses
  for (let i = 5; i >= 0; i--) {
    const fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
    const fechaFin = new Date(ahora.getFullYear(), ahora.getMonth() - i + 1, 1);
    const mesNombre = `${mesesNombres[fechaInicio.getMonth()]} ${fechaInicio.getFullYear().toString().substring(2)}`;

    const [estudiantes, empresarios, proyectos] = await Promise.all([
      db.usuarios.count({
        where: {
          roles: { nombre: 'estudiante' },
          creado: { gte: fechaInicio, lt: fechaFin },
        },
      }),
      db.usuarios.count({
        where: {
          roles: { nombre: 'empresario' },
          creado: { gte: fechaInicio, lt: fechaFin },
        },
      }),
      db.proyectos.count({
        where: {
          publicado: { gte: fechaInicio, lt: fechaFin },
        },
      }),
    ]);

    datos.push({
      mes: mesNombre,
      estudiantes,
      empresarios,
      proyectos,
    });
  }

  return datos;
}

export async function obtenerAlertasCriticasAdmin(): Promise<AlertaCritica[]> {
  const alertas: AlertaCritica[] = [];
  const limite48h = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const [reportesPendientes, estudiantesDemorados] = await Promise.all([
    // Reportes de moderación pendientes
    db.reportes.findMany({
      where: { estado: { in: ['pendiente', 'en_revision'] } },
      orderBy: { creado: 'desc' },
      take: 10,
      include: {
        usuarios_reportante: { select: { nombre: true } },
      },
    }),
    // Estudiantes en estado pendiente con más de 48 horas de registro
    db.usuarios.findMany({
      where: {
        estado: 'pendiente',
        creado: { lt: limite48h },
        roles: { nombre: 'estudiante' },
      },
      orderBy: { creado: 'asc' },
      take: 10,
    }),
  ]);

  // Transformar reportes pendientes
  for (const r of reportesPendientes) {
    alertas.push({
      id: r.id,
      tipo: r.tipo_contenido === 'proyecto' ? 'spam' : 'conducta',
      prioridad: 'alta',
      titulo: `Contenido Reportado: ${r.tipo_contenido}`,
      descripcion: `Reportante: ${r.usuarios_reportante.nombre}. Motivo: ${r.motivo}`,
      creado: r.creado,
      idReferencia: r.id_contenido,
    });
  }

  // Transformar validaciones demoradas
  for (const u of estudiantesDemorados) {
    alertas.push({
      id: u.id,
      tipo: 'demora',
      prioridad: 'media',
      titulo: 'Validación Académica Retrasada',
      descripcion: `El estudiante ${u.nombre} (${u.correo}) está en espera de validación por más de 48 horas.`,
      creado: u.creado,
      idReferencia: u.id,
    });
  }

  // Ordenar de más reciente a más antiguo
  return alertas.sort((a, b) => b.creado.getTime() - a.creado.getTime());
}
