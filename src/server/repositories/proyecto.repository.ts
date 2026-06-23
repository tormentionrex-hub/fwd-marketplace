import 'server-only';
import { db } from '@/lib/db';

// Capa de datos (Prisma puro) sobre el modelo proyectos. Sin lógica de negocio.

// Lista los proyectos de un empresario con el conteo de ofertas (candidatos).
// Una sola query con _count para evitar N+1. (Dashboard empresario, Página 12.)
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
      // Estudiante adjudicado (si lo hay): se deriva de la oferta 'adjudicada'.
      // Una sola query (take:1 filtrado) — sin N+1.
      ofertas: {
        where: { estado: 'adjudicada' },
        select: {
          perfiles_estudiante: { select: { usuarios: { select: { nombre: true } } } },
        },
        take: 1,
      },
    },
    orderBy: { publicado: 'desc' },
  });
}
// Lista todos los proyectos para el panel admin: empresario, estado y nº de
// ofertas. Solo lectura, acotado a los más recientes.
export function listarProyectosAdmin() {
  return db.proyectos.findMany({
    take: 50,
    orderBy: { publicado: 'desc' },
    select: {
      id: true,
      titulo: true,
      descripcion: true,
      estado: true,
      publicado: true,
      cierre: true,
      motivo_estado: true,
      estado_previo: true,
      area_negocio: true,
      plazo_dias: true,
      usa_ia: true,
      perfiles_empresario: { select: { usuarios: { select: { nombre: true } } } },
      _count: { select: { ofertas: true } },
    },
  });
}

export function suspenderProyectoRepo(id: string, motivo: string, estadoActual: string) {
  return db.proyectos.update({
    where: { id },
    data: {
      estado: 'pendiente_revision',
      estado_previo: estadoActual,
      motivo_estado: motivo,
    },
  });
}

export function vistoBuenoProyectoRepo(id: string, estadoPrevio: string | null) {
  return db.proyectos.update({
    where: { id },
    data: {
      estado: estadoPrevio || 'publicado',
      estado_previo: null,
      motivo_estado: null,
    },
  });
}

export function eliminarProyectoRepo(id: string) {
  return db.proyectos.delete({
    where: { id },
  });
}


// Cuenta las ofertas recibidas en los proyectos del empresario desde `desde`
// (para el delta "nuevas esta semana" del dashboard). Una query agregada.
export function contarOfertasDesde(idEmpresario: string, desde: Date) {
  return db.ofertas.count({
    where: { proyectos: { id_empresario: idEmpresario }, enviado: { gte: desde } },
  });
}

// Obtiene fechas de proyectos y ofertas de los últimos 6 meses
export function obtenerActividadSeisMeses(idEmpresario: string) {
  const hace6Meses = new Date();
  hace6Meses.setMonth(hace6Meses.getMonth() - 5);
  hace6Meses.setDate(1);
  hace6Meses.setHours(0, 0, 0, 0);

  const proyectos = db.proyectos.findMany({
    where: { id_empresario: idEmpresario, publicado: { gte: hace6Meses } },
    select: { publicado: true },
  });

  const ofertas = db.ofertas.findMany({
    where: { proyectos: { id_empresario: idEmpresario }, enviado: { gte: hace6Meses } },
    select: { enviado: true },
  });

  return Promise.all([proyectos, ofertas]);
}

// Trae un proyecto con su empresario (nombre + sector) y sus tecnologías
// (ficha pública del proyecto).
export function obtenerProyectoConDetalle(id: string) {
  return db.proyectos.findUnique({
    where: { id },
    select: {
      id: true,
      titulo: true,
      descripcion: true,
      area_negocio: true,
      estado: true,
      plazo_dias: true,
      publicado: true,
      cierre: true,
      imagenes: true,
      perfiles_empresario: {
        select: {
          sector: true,
          usuarios: { select: { nombre: true } },
        },
      },
      proyectos_tecnologias: {
        select: { tecnologias: { select: { nombre: true } } },
      },
    },
  });
}

// ── Actividad reciente del empresario (Dashboard, Página 12) ────────────────
// Tres consultas acotadas a los proyectos del empresario; la capa de servicio
// las mezcla y ordena. Cada una trae solo lo que la UI muestra.

// Últimas ofertas recibidas en los proyectos del empresario (con autor y proyecto).
export function ofertasRecientesDeEmpresario(idEmpresario: string, limite: number) {
  return db.ofertas.findMany({
    where: { proyectos: { id_empresario: idEmpresario } },
    select: {
      id: true,
      enviado: true,
      id_proyecto: true,
      proyectos: { select: { titulo: true } },
      perfiles_estudiante: { select: { usuarios: { select: { nombre: true } } } },
    },
    orderBy: { enviado: 'desc' },
    take: limite,
  });
}

// Últimas entregas subidas en los proyectos del empresario.
export function entregablesRecientesDeEmpresario(idEmpresario: string, limite: number) {
  return db.entregables.findMany({
    where: { proyectos: { id_empresario: idEmpresario } },
    select: {
      id: true,
      creado: true,
      id_proyecto: true,
      proyectos: { select: { titulo: true } },
      perfiles_estudiante: { select: { usuarios: { select: { nombre: true } } } },
    },
    orderBy: { creado: 'desc' },
    take: limite,
  });
}

// Últimos proyectos cerrados del empresario.
export function proyectosCerradosDeEmpresario(idEmpresario: string, limite: number) {
  return db.proyectos.findMany({
    where: { id_empresario: idEmpresario, estado: 'cerrado', cierre: { not: null } },
    select: { id: true, titulo: true, cierre: true },
    orderBy: { cierre: 'desc' },
    take: limite,
  });
}

// Datos mínimos del proyecto para la pantalla de gestión (Página 14) y para
// validar dueño. `buscarProyectoActivo` es el alias que usan las páginas 11/14.
export function buscarProyectoGestion(id: string) {
  return db.proyectos.findUnique({
    where: { id },
    select: { id: true, titulo: true, estado: true, id_empresario: true },
  });
}

export function buscarProyectoActivo(id: string) {
  return db.proyectos.findUnique({
    where: { id },
    select: { id: true, titulo: true, estado: true, id_empresario: true },
  });
}

// El estudiante adjudicado se deriva de la oferta 'adjudicada' del proyecto.
export function buscarEstudianteAdjudicado(idProyecto: string) {
  return db.ofertas.findFirst({
    where: { id_proyecto: idProyecto, estado: 'adjudicada' },
    select: { id_estudiante: true },
  });
}

// Lista todos los proyectos con estado 'publicado' para el marketplace.
// Incluye tecnologías y datos del empresario (empresa + sector).
export function listarProyectosPublicados() {
  return db.proyectos.findMany({
    where: { estado: 'publicado' },
    select: {
      id: true,
      titulo: true,
      descripcion: true,
      area_negocio: true,
      plazo_dias: true,
      publicado: true,
      usa_ia: true,
      imagenes: true,
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
    },
    orderBy: { publicado: 'desc' },
  });
}


// Cierra el proyecto: estado 'cerrado' y marca la fecha de cierre.
export function cerrarProyectoRepo(idProyecto: string) {
  return db.proyectos.update({
    where: { id: idProyecto },
    data: { estado: 'cerrado', cierre: new Date() },
  });
}

// ── Embeddings (pgvector) ───────────────────────────────────────────────────

// Guarda el embedding de un proyecto usando SQL raw (pgvector no es soportado
// por el cliente de Prisma de forma nativa).
export async function guardarEmbedding(idProyecto: string, embedding: number[]) {
  await db.$executeRawUnsafe(
    `UPDATE proyectos SET embedding = $1::vector WHERE id = $2::uuid`,
    JSON.stringify(embedding),
    idProyecto,
  );
}

// Resultado mínimo que necesita el marketplace para reordenar por similitud.
export type ProyectoSimilitud = {
  id: string;
  similitud: number;
};

// Busca los proyectos publicados más similares al embedding dado.
// Usa el operador de distancia coseno (<=>): similitud = 1 - distancia.
export async function buscarProyectosPorSimilitud(
  embedding: number[],
  limite = 20,
): Promise<ProyectoSimilitud[]> {
  const filas = await db.$queryRawUnsafe<{ id: string; similitud: number }[]>(
    `SELECT id, (1 - (embedding <=> $1::vector))::float AS similitud
     FROM proyectos
     WHERE estado = 'publicado' AND embedding IS NOT NULL
     ORDER BY embedding <=> $1::vector
     LIMIT $2`,
    JSON.stringify(embedding),
    limite,
  );
  return filas;
}

// Trae los datos de un proyecto publicado para generar su embedding (titulo,
// descripcion, area y tecnologías). Solo se llama después de publicar.
export function obtenerDatosParaEmbedding(idProyecto: string) {
  return db.proyectos.findUnique({
    where: { id: idProyecto },
    select: {
      titulo: true,
      descripcion: true,
      area_negocio: true,
      proyectos_tecnologias: {
        select: { tecnologias: { select: { nombre: true } } },
      },
    },
  });
}

// ── CRUD empresario ─────────────────────────────────────────────────────────

// Lista todas las tecnologías disponibles (para el selector del formulario).
export function listarTecnologias() {
  return db.tecnologias.findMany({
    select: { id: true, nombre: true },
    orderBy: { nombre: 'asc' },
  });
}

// Crea un proyecto en borrador y asocia las tecnologías indicadas (por nombre,
// haciendo upsert para reutilizar las que ya existen).
export async function crearProyecto(data: {
  idEmpresario: string;
  titulo: string;
  descripcion: string;
  areaNegocio: string | null;
  plazoDias: number | null;
  tecnologias: string[];
  imagenes: string[];
}) {
  const techIds = await Promise.all(
    data.tecnologias.map((nombre) =>
      db.tecnologias.upsert({
        where: { nombre },
        create: { nombre },
        update: {},
        select: { id: true },
      }),
    ),
  );

  return db.proyectos.create({
    data: {
      id_empresario: data.idEmpresario,
      titulo: data.titulo,
      descripcion: data.descripcion,
      area_negocio: data.areaNegocio,
      plazo_dias: data.plazoDias,
      estado: 'borrador',
      proyectos_tecnologias: {
        create: techIds.map((t) => ({ id_tecnologia: t.id })),
      },
    },
    select: { id: true },
  });
}

// Actualiza los campos enviados y, si se envía `tecnologias`, reemplaza las
// asociaciones (borra las viejas y crea las nuevas). Usa PATCH semántico:
// solo toca los campos presentes en el objeto.
export async function actualizarProyecto(
  idProyecto: string,
  data: {
    titulo?: string | undefined;
    descripcion?: string | undefined;
    areaNegocio?: string | null | undefined;
    plazoDias?: number | null | undefined;
    tecnologias?: string[] | undefined;
    imagenes?: string[] | undefined;
  },
) {
  const { tecnologias, ...campos } = data;

  if (tecnologias !== undefined) {
    const techIds = await Promise.all(
      tecnologias.map((nombre) =>
        db.tecnologias.upsert({
          where: { nombre },
          create: { nombre },
          update: {},
          select: { id: true },
        }),
      ),
    );
    await db.proyectos_tecnologias.deleteMany({ where: { id_proyecto: idProyecto } });
    if (techIds.length > 0) {
      await db.proyectos_tecnologias.createMany({
        data: techIds.map((t) => ({ id_proyecto: idProyecto, id_tecnologia: t.id })),
        skipDuplicates: true,
      });
    }
  }

  return db.proyectos.update({
    where: { id: idProyecto },
    data: {
      ...(campos.titulo !== undefined && { titulo: campos.titulo }),
      ...(campos.descripcion !== undefined && { descripcion: campos.descripcion }),
      ...(campos.areaNegocio !== undefined && { area_negocio: campos.areaNegocio }),
      ...(campos.plazoDias !== undefined && { plazo_dias: campos.plazoDias }),
    },
    select: { id: true },
  });
}

// Cambia el estado a 'publicado' y marca la fecha de publicación.
export function publicarProyecto(idProyecto: string) {
  return db.proyectos.update({
    where: { id: idProyecto },
    data: { estado: 'publicado', publicado: new Date() },
    select: { id: true },
  });
}

// Regresa el proyecto a borrador desde publicado (lo deshabilita del marketplace).
export function deshabilitarProyecto(idProyecto: string) {
  return db.proyectos.update({
    where: { id: idProyecto },
    data: { estado: 'borrador', estado_previo: 'publicado' },
    select: { id: true },
  });
}

// Elimina el proyecto y sus relaciones de tecnologías.
// La guarda de "solo borrador" la hace la capa de servicio.
export async function eliminarProyecto(idProyecto: string) {
  await db.proyectos_tecnologias.deleteMany({ where: { id_proyecto: idProyecto } });
  return db.proyectos.delete({ where: { id: idProyecto } });
}

