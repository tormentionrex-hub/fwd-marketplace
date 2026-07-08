import 'server-only';
import {
  listarVacantesPublicadas,
  obtenerVacanteConDetalle,
  listarVacantesDeEmpresario,
  buscarVacanteActiva,
  crearVacante,
  actualizarVacante,
  publicarVacante,
  cambiarEstadoVacante,
  eliminarVacante,
  listarVacantesSimilares,
  contarPostulacionesVacante,
} from '@/server/repositories/vacante.repository';
import type { Prisma } from '@prisma/client';
import { formatearSalario } from '@/lib/vacante-format';
import type {
  VacanteMarketplace,
  VacanteDetalleDTO,
  VacanteEmpresarioDTO,
  EstadoVacante,
  DocumentoVacante,
  DatosSidebarVacante,
} from '@/types/vacante';

// Los documentos se guardan como jsonb ([{nombre,url}]). Casteo tolerante.
function parseDocumentos(json: Prisma.JsonValue | null | undefined): DocumentoVacante[] {
  if (!Array.isArray(json)) return [];
  return json
    .map((d) => {
      if (d && typeof d === 'object' && 'url' in d) {
        const url = String((d as Record<string, unknown>).url ?? '');
        const nombre = String((d as Record<string, unknown>).nombre ?? '') || 'Documento';
        return url ? { nombre, url } : null;
      }
      return null;
    })
    .filter((d): d is DocumentoVacante => d !== null);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Prisma devuelve los numéricos (Decimal) como objeto; los pasamos a number|null.
function dec(v: Prisma.Decimal | null): number | null {
  return v == null ? null : Number(v);
}

// ── Marketplace público ─────────────────────────────────────────────────────

export async function listarVacantesParaMarketplace(): Promise<VacanteMarketplace[]> {
  const filas = await listarVacantesPublicadas();
  return filas.map((v) => ({
    id: v.id,
    titulo: v.titulo,
    descripcion: v.descripcion,
    area: v.area,
    modalidad: v.modalidad,
    tipoEmpleo: v.tipo_empleo,
    nivelExperiencia: v.nivel_experiencia,
    ubicacion: v.ubicacion,
    salarioMin: dec(v.salario_min),
    salarioMax: dec(v.salario_max),
    salarioMoneda: v.salario_moneda,
    salarioPeriodo: v.salario_periodo,
    salarioVisible: v.salario_visible,
    plazas: v.plazas,
    publicado: v.publicado?.toISOString() ?? null,
    fechaCierre: v.fecha_cierre?.toISOString() ?? null,
    tecnologias: v.vacantes_tecnologias.map((vt) => vt.tecnologias.nombre),
    imagenes: v.imagenes,
    empresario: {
      id: v.perfiles_empresario?.id_usuario ?? '',
      nombre: v.perfiles_empresario?.usuarios?.nombre ?? 'Empresa',
      nombreEmpresa: v.perfiles_empresario?.nombre_empresa ?? null,
      sector: v.perfiles_empresario?.sector ?? null,
      fotoUrl: v.perfiles_empresario?.usuarios?.image_url ?? null,
    },
  }));
}

// ── Ficha pública de la vacante ─────────────────────────────────────────────

export async function obtenerDetalleVacante(id: string): Promise<VacanteDetalleDTO | null> {
  if (!UUID_RE.test(id)) return null;
  const v = await obtenerVacanteConDetalle(id);
  if (!v) return null;

  return {
    id: v.id,
    titulo: v.titulo,
    descripcion: v.descripcion,
    area: v.area,
    modalidad: v.modalidad,
    tipoEmpleo: v.tipo_empleo,
    nivelExperiencia: v.nivel_experiencia,
    ubicacion: v.ubicacion,
    salarioMin: dec(v.salario_min),
    salarioMax: dec(v.salario_max),
    salarioMoneda: v.salario_moneda,
    salarioPeriodo: v.salario_periodo,
    salarioVisible: v.salario_visible,
    plazas: v.plazas,
    publicado: v.publicado?.toISOString() ?? null,
    fechaCierre: v.fecha_cierre?.toISOString() ?? null,
    tecnologias: v.vacantes_tecnologias.map((vt) => vt.tecnologias.nombre),
    imagenes: v.imagenes,
    documentos: parseDocumentos(v.documentos),
    responsabilidades: v.responsabilidades,
    requisitos: v.requisitos,
    beneficios: v.beneficios,
    estado: (v.estado as EstadoVacante) ?? 'borrador',
    empresaDescripcion: v.perfiles_empresario?.descripcion ?? null,
    empresario: {
      id: v.perfiles_empresario?.id_usuario ?? '',
      nombre:
        v.perfiles_empresario?.nombre_empresa?.trim() ||
        v.perfiles_empresario?.usuarios?.nombre ||
        'Empresa',
      nombreEmpresa: v.perfiles_empresario?.nombre_empresa ?? null,
      sector: v.perfiles_empresario?.sector ?? null,
      fotoUrl: v.perfiles_empresario?.usuarios?.image_url ?? null,
    },
  };
}

// Datos agregados para el sidebar de la ficha: cuántas postulaciones lleva y
// vacantes similares (misma área). Tolerante: si algo falla, devuelve vacío.
export async function obtenerDatosSidebarVacante(
  idVacante: string,
  area: string | null,
): Promise<DatosSidebarVacante> {
  const [total, similares] = await Promise.all([
    contarPostulacionesVacante(idVacante),
    listarVacantesSimilares(idVacante, area, 4),
  ]);

  return {
    totalPostulaciones: total,
    similares: similares.map((s) => ({
      id: s.id,
      titulo: s.titulo,
      area: s.area,
      modalidad: s.modalidad,
      empresa:
        s.perfiles_empresario?.nombre_empresa?.trim() ||
        s.perfiles_empresario?.usuarios?.nombre ||
        'Empresa',
      salario: formatearSalario({
        salarioMin: dec(s.salario_min),
        salarioMax: dec(s.salario_max),
        salarioMoneda: s.salario_moneda,
        salarioPeriodo: s.salario_periodo,
        salarioVisible: s.salario_visible,
      }),
    })),
  };
}

// ── Dashboard empresario ────────────────────────────────────────────────────

export async function listarVacantesDeEmpresarioService(
  idEmpresario: string,
): Promise<VacanteEmpresarioDTO[]> {
  const filas = await listarVacantesDeEmpresario(idEmpresario);
  return filas.map((v) => ({
    id: v.id,
    titulo: v.titulo,
    area: v.area,
    modalidad: v.modalidad,
    tipoEmpleo: v.tipo_empleo,
    estado: (v.estado as EstadoVacante) ?? 'borrador',
    plazas: v.plazas,
    publicado: v.publicado?.toISOString() ?? null,
    fechaCierre: v.fecha_cierre?.toISOString() ?? null,
    totalPostulaciones: v._count.postulaciones,
  }));
}

// Devuelve el detalle de una vacante SOLO si pertenece al empresario (para editar).
export async function obtenerVacanteDeEmpresario(
  idVacante: string,
  idEmpresario: string,
): Promise<VacanteDetalleDTO | null> {
  const vacante = await buscarVacanteActiva(idVacante);
  if (!vacante || vacante.id_empresario !== idEmpresario) return null;
  return obtenerDetalleVacante(idVacante);
}

// ── CRUD ────────────────────────────────────────────────────────────────────

type DatosCrear = {
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

export async function crearVacanteService(idEmpresario: string, data: DatosCrear) {
  const vacante = await crearVacante({ idEmpresario, ...data });
  return { id: vacante.id };
}

export async function actualizarVacanteService(
  idVacante: string,
  idEmpresario: string,
  data: Partial<DatosCrear>,
): Promise<'ok' | 'no_autorizado' | 'no_encontrado'> {
  const vacante = await buscarVacanteActiva(idVacante);
  if (!vacante) return 'no_encontrado';
  if (vacante.id_empresario !== idEmpresario) return 'no_autorizado';
  await actualizarVacante(idVacante, data);
  return 'ok';
}

export async function publicarVacanteService(
  idVacante: string,
  idEmpresario: string,
): Promise<'ok' | 'no_autorizado' | 'no_encontrado' | 'ya_publicada'> {
  const vacante = await buscarVacanteActiva(idVacante);
  if (!vacante) return 'no_encontrado';
  if (vacante.id_empresario !== idEmpresario) return 'no_autorizado';
  if (vacante.estado === 'abierta') return 'ya_publicada';
  await publicarVacante(idVacante);
  return 'ok';
}

// Cambia el estado a uno de cierre (cerrada, en_contratacion, finalizada) o
// vuelve a borrador. Valida dueño.
export async function cambiarEstadoVacanteService(
  idVacante: string,
  idEmpresario: string,
  estado: EstadoVacante,
): Promise<'ok' | 'no_autorizado' | 'no_encontrado'> {
  const vacante = await buscarVacanteActiva(idVacante);
  if (!vacante) return 'no_encontrado';
  if (vacante.id_empresario !== idEmpresario) return 'no_autorizado';
  await cambiarEstadoVacante(idVacante, estado);
  return 'ok';
}

export async function eliminarVacanteService(
  idVacante: string,
  idEmpresario: string,
): Promise<'ok' | 'no_autorizado' | 'no_encontrado'> {
  const vacante = await buscarVacanteActiva(idVacante);
  if (!vacante) return 'no_encontrado';
  if (vacante.id_empresario !== idEmpresario) return 'no_autorizado';
  await eliminarVacante(idVacante);
  return 'ok';
}
