import 'server-only';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import type { DocumentoVacante } from '@/types/vacante';

// Capa de datos (Prisma puro) sobre el modelo vacantes. Sin lógica de negocio.
// Espeja proyecto.repository.ts. Las tecnologías/habilidades requeridas usan la
// tabla `tecnologias` vía el pivote `vacantes_tecnologias`.

// Campos que necesita el detalle público de una vacante.
type DatosVacante = {
  idEmpresario: string;
  titulo: string;
  descripcion: string;
  area: string | null;
  modalidad: string | null;
  tipoEmpleo: string | null;
  nivelExperiencia: string | null;
  ubicacion: string | null;
  salarioMin: number | null;
  salarioMax: number | null;
  salarioMoneda: string;
  salarioPeriodo: string | null;
  salarioVisible: boolean;
  responsabilidades: string | null;
  requisitos: string | null;
  beneficios: string | null;
  plazas: number;
  fechaCierre: Date | null;
  tecnologias: string[];
  imagenes: string[];
  documentos: DocumentoVacante[];
};

// Lista todas las vacantes 'abierta' para el marketplace público.
export function listarVacantesPublicadas() {
  return db.vacantes.findMany({
    where: { estado: 'abierta' },
    select: {
      id: true,
      titulo: true,
      descripcion: true,
      area: true,
      modalidad: true,
      tipo_empleo: true,
      nivel_experiencia: true,
      ubicacion: true,
      salario_min: true,
      salario_max: true,
      salario_moneda: true,
      salario_periodo: true,
      salario_visible: true,
      plazas: true,
      publicado: true,
      fecha_cierre: true,
      imagenes: true,
      perfiles_empresario: {
        select: {
          id_usuario: true,
          nombre_empresa: true,
          sector: true,
          usuarios: { select: { nombre: true, image_url: true } },
        },
      },
      vacantes_tecnologias: {
        select: { tecnologias: { select: { nombre: true } } },
      },
    },
    orderBy: { publicado: 'desc' },
  });
}

// Trae una vacante con todo su detalle (ficha pública).
export function obtenerVacanteConDetalle(id: string) {
  return db.vacantes.findUnique({
    where: { id },
    select: {
      id: true,
      titulo: true,
      descripcion: true,
      area: true,
      modalidad: true,
      tipo_empleo: true,
      nivel_experiencia: true,
      ubicacion: true,
      salario_min: true,
      salario_max: true,
      salario_moneda: true,
      salario_periodo: true,
      salario_visible: true,
      responsabilidades: true,
      requisitos: true,
      beneficios: true,
      plazas: true,
      estado: true,
      publicado: true,
      fecha_cierre: true,
      imagenes: true,
      documentos: true,
      perfiles_empresario: {
        select: {
          id_usuario: true,
          nombre_empresa: true,
          sector: true,
          descripcion: true,
          usuarios: { select: { nombre: true, image_url: true } },
        },
      },
      vacantes_tecnologias: {
        select: { tecnologias: { select: { nombre: true } } },
      },
    },
  });
}

// Vacantes 'abierta' de la misma área (excluyendo la actual) para el sidebar.
export function listarVacantesSimilares(idVacante: string, area: string | null, limite = 4) {
  return db.vacantes.findMany({
    where: {
      estado: 'abierta',
      id: { not: idVacante },
      ...(area ? { area } : {}),
    },
    select: {
      id: true,
      titulo: true,
      area: true,
      modalidad: true,
      salario_min: true,
      salario_max: true,
      salario_moneda: true,
      salario_periodo: true,
      salario_visible: true,
      perfiles_empresario: {
        select: { nombre_empresa: true, usuarios: { select: { nombre: true } } },
      },
    },
    orderBy: { publicado: 'desc' },
    take: limite,
  });
}

// Cuenta las postulaciones recibidas por una vacante.
export function contarPostulacionesVacante(idVacante: string) {
  return db.postulaciones.count({ where: { id_vacante: idVacante } });
}

// Lista las vacantes de un empresario con el conteo de postulaciones.
export function listarVacantesDeEmpresario(idEmpresario: string) {
  return db.vacantes.findMany({
    where: { id_empresario: idEmpresario },
    select: {
      id: true,
      titulo: true,
      area: true,
      modalidad: true,
      tipo_empleo: true,
      estado: true,
      plazas: true,
      publicado: true,
      fecha_cierre: true,
      _count: { select: { postulaciones: true } },
    },
    orderBy: [{ publicado: 'desc' }, { creado: 'desc' }],
  });
}

// Datos mínimos de la vacante para validar dueño y estado.
export function buscarVacanteActiva(id: string) {
  return db.vacantes.findUnique({
    where: { id },
    select: { id: true, titulo: true, estado: true, id_empresario: true },
  });
}

// Crea una vacante en borrador y asocia las tecnologías (upsert por nombre).
export async function crearVacante(data: DatosVacante) {
  const techIds = await upsertTecnologias(data.tecnologias);

  return db.vacantes.create({
    data: {
      id_empresario: data.idEmpresario,
      titulo: data.titulo,
      descripcion: data.descripcion,
      area: data.area,
      modalidad: data.modalidad,
      tipo_empleo: data.tipoEmpleo,
      nivel_experiencia: data.nivelExperiencia,
      ubicacion: data.ubicacion,
      salario_min: data.salarioMin,
      salario_max: data.salarioMax,
      salario_moneda: data.salarioMoneda,
      salario_periodo: data.salarioPeriodo,
      salario_visible: data.salarioVisible,
      responsabilidades: data.responsabilidades,
      requisitos: data.requisitos,
      beneficios: data.beneficios,
      plazas: data.plazas,
      fecha_cierre: data.fechaCierre,
      estado: 'borrador',
      imagenes: data.imagenes,
      documentos: data.documentos as unknown as Prisma.InputJsonValue,
      vacantes_tecnologias: {
        create: techIds.map((t) => ({ id_tecnologia: t.id })),
      },
    },
    select: { id: true },
  });
}

// Actualiza los campos enviados. Si viene `tecnologias`, reemplaza las relaciones.
export async function actualizarVacante(
  idVacante: string,
  data: Partial<Omit<DatosVacante, 'idEmpresario'>>,
) {
  const { tecnologias, ...campos } = data;

  if (tecnologias !== undefined) {
    const techIds = await upsertTecnologias(tecnologias);
    await db.vacantes_tecnologias.deleteMany({ where: { id_vacante: idVacante } });
    if (techIds.length > 0) {
      await db.vacantes_tecnologias.createMany({
        data: techIds.map((t) => ({ id_vacante: idVacante, id_tecnologia: t.id })),
        skipDuplicates: true,
      });
    }
  }

  return db.vacantes.update({
    where: { id: idVacante },
    data: {
      ...(campos.titulo !== undefined && { titulo: campos.titulo }),
      ...(campos.descripcion !== undefined && { descripcion: campos.descripcion }),
      ...(campos.area !== undefined && { area: campos.area }),
      ...(campos.modalidad !== undefined && { modalidad: campos.modalidad }),
      ...(campos.tipoEmpleo !== undefined && { tipo_empleo: campos.tipoEmpleo }),
      ...(campos.nivelExperiencia !== undefined && { nivel_experiencia: campos.nivelExperiencia }),
      ...(campos.ubicacion !== undefined && { ubicacion: campos.ubicacion }),
      ...(campos.salarioMin !== undefined && { salario_min: campos.salarioMin }),
      ...(campos.salarioMax !== undefined && { salario_max: campos.salarioMax }),
      ...(campos.salarioMoneda !== undefined && { salario_moneda: campos.salarioMoneda }),
      ...(campos.salarioPeriodo !== undefined && { salario_periodo: campos.salarioPeriodo }),
      ...(campos.salarioVisible !== undefined && { salario_visible: campos.salarioVisible }),
      ...(campos.responsabilidades !== undefined && { responsabilidades: campos.responsabilidades }),
      ...(campos.requisitos !== undefined && { requisitos: campos.requisitos }),
      ...(campos.beneficios !== undefined && { beneficios: campos.beneficios }),
      ...(campos.plazas !== undefined && { plazas: campos.plazas }),
      ...(campos.fechaCierre !== undefined && { fecha_cierre: campos.fechaCierre }),
      ...(campos.imagenes !== undefined && { imagenes: campos.imagenes }),
      ...(campos.documentos !== undefined && {
        documentos: campos.documentos as unknown as Prisma.InputJsonValue,
      }),
      actualizado: new Date(),
    },
    select: { id: true },
  });
}

// Publica la vacante: estado 'abierta' + fecha de publicación.
export function publicarVacante(idVacante: string) {
  return db.vacantes.update({
    where: { id: idVacante },
    data: { estado: 'abierta', publicado: new Date() },
    select: { id: true },
  });
}

// Cambia el estado de la vacante (cerrar, en contratación, finalizar, etc.).
export function cambiarEstadoVacante(idVacante: string, estado: string) {
  return db.vacantes.update({
    where: { id: idVacante },
    data: { estado, actualizado: new Date() },
    select: { id: true },
  });
}

// Elimina la vacante y sus relaciones de tecnologías (postulaciones caen por cascade).
export async function eliminarVacante(idVacante: string) {
  await db.vacantes_tecnologias.deleteMany({ where: { id_vacante: idVacante } });
  return db.vacantes.delete({ where: { id: idVacante } });
}

// Upsert de tecnologías por nombre → devuelve sus ids.
function upsertTecnologias(nombres: string[]) {
  return Promise.all(
    nombres.map((nombre) =>
      db.tecnologias.upsert({
        where: { nombre },
        create: { nombre },
        update: {},
        select: { id: true },
      }),
    ),
  );
}
