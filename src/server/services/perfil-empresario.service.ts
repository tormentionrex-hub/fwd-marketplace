import 'server-only';
import { Prisma } from '@prisma/client';
import {
  obtenerPerfilEmpresario,
  actualizarPerfilEmpresario,
  obtenerDatosCompletitud,
  actualizarDatosCompletitud,
} from '@/server/repositories/perfil-empresario.repository';

// ── Perfil del empresario (pantalla "Mi perfil", SRS RF-16/17) ──────────────
// Mapea la fila de la DB al DTO que consume el RSC. Solo expone datos que el
// esquema realmente guarda; lo que aún no tiene fuente (rating como cliente,
// reseñas de estudiantes RF-37) se devuelve vacío para que la UI muestre un
// estado vacío honesto, sin inventar datos.

export interface ProyectoPerfilEmpresario {
  id: string;
  titulo: string;
  area: string;
  estado: string;
}

export interface ResenaEmpresario {
  de: string;
  texto: string;
  rating: number;
  proyecto: string;
}

export interface PerfilEmpresarioDTO {
  empresa: string;
  /** Valor editable crudo de nombre_empresa ('' si aún no se definió). */
  nombreEmpresaRaw: string;
  /** Foto de perfil (usuarios.image_url) o null. */
  fotoUrl: string | null;
  responsable: string;
  sector: string | null;
  tipo: string;
  correo: string;
  descripcion: string | null;
  verificado: boolean;
  /** "Enero de 2024" o "—" si no hay fecha. */
  miembroDesde: string;
  /** null hasta que existan reseñas de estudiantes (sin fuente de datos aún). */
  ratingCliente: number | null;
  stats: { publicados: number; enCurso: number; completados: number };
  proyectos: ProyectoPerfilEmpresario[];
  resenas: ResenaEmpresario[];
}

const fmtMesAnio = new Intl.DateTimeFormat('es-CR', { month: 'long', year: 'numeric' });

function capitalizar(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export async function obtenerPerfilEmpresarioDTO(
  idUsuario: string,
): Promise<PerfilEmpresarioDTO | null> {
  const perfil = await obtenerPerfilEmpresario(idUsuario);
  if (!perfil) return null;

  const u = perfil.usuarios;
  const proyectos = perfil.proyectos;

  const nombreEmpresa = perfil.nombre_empresa?.trim() ?? '';

  return {
    empresa: nombreEmpresa || u?.nombre || 'Mi empresa',
    nombreEmpresaRaw: nombreEmpresa,
    fotoUrl: u?.image_url ?? null,
    responsable: u?.nombre ?? '',
    sector: perfil.sector,
    tipo: perfil.tipo?.trim() || 'Empresa',
    correo: u?.correo ?? '',
    descripcion: perfil.descripcion,
    verificado: u?.estado === 'activo',
    miembroDesde: u?.creado ? capitalizar(fmtMesAnio.format(u.creado)) : '—',
    ratingCliente: null,
    stats: {
      publicados: proyectos.length,
      enCurso: proyectos.filter((p) => p.estado === 'en_desarrollo').length,
      completados: proyectos.filter((p) => p.estado === 'cerrado').length,
    },
    proyectos: proyectos.map((p) => ({
      id: p.id,
      titulo: p.titulo,
      area: p.area_negocio?.trim() || 'General',
      estado: p.estado,
    })),
    resenas: [],
  };
}

// ── Guardar perfil del empresario (CRUD "Editar perfil") ────────────────────
// Solo edita lo que pidió el negocio: nombre de la empresa y foto de perfil.
// Valida y normaliza antes de persistir.

// ── Completitud del perfil (gate del modal) ────────────────────────────────
// Obligatorios para operar: numero_identificacion y nombre_empresa.
// Precarga todos los campos editables para el modal.

export interface DatosCompletitudDTO {
  completo: boolean;
  firstName: string;
  lastName: string;
  segundoNombre: string;
  segundoApellido: string;
  edad: number | null;
  correo: string;
  nombreEmpresa: string;
}

export async function estadoCompletitudEmpresario(
  idUsuario: string,
): Promise<DatosCompletitudDTO | null> {
  const perfil = await obtenerDatosCompletitud(idUsuario);
  if (!perfil) return null;

  const u = perfil.usuarios;
  const partes = (u?.nombre ?? '').trim().split(' ');
  const firstName = partes[0] ?? '';
  const lastName = partes.slice(1).join(' ');

  const nombreEmpresa = perfil.nombre_empresa?.trim() ?? '';

  return {
    completo: nombreEmpresa !== '',
    firstName,
    lastName,
    segundoNombre: u?.segundo_nombre?.trim() ?? '',
    segundoApellido: u?.segundo_apellido?.trim() ?? '',
    edad: u?.edad ?? null,
    correo: u?.correo ?? '',
    nombreEmpresa,
  };
}

// ── Guardar datos de completitud (endpoint POST /api/empresario/completar-perfil) ──

export type ResultadoCompletarPerfil = { ok: true } | 'datos_invalidos' | 'no_existe';

const NAME_RE = /^[\p{L}\s''\-]+$/u;

export async function completarPerfilEmpresario(
  idUsuario: string,
  entrada: {
    firstName: string;
    lastName: string;
    segundoNombre?: string | undefined;
    segundoApellido?: string | undefined;
    edad?: number | null | undefined;
    nombreEmpresa: string;
  },
): Promise<ResultadoCompletarPerfil> {
  const firstName = entrada.firstName.trim();
  const lastName = entrada.lastName.trim();
  const segundoNombre = (entrada.segundoNombre ?? '').trim();
  const segundoApellido = (entrada.segundoApellido ?? '').trim();
  const edad = entrada.edad ?? null;
  const nombreEmpresa = entrada.nombreEmpresa.trim();

  if (!firstName || firstName.length > 50 || !NAME_RE.test(firstName)) return 'datos_invalidos';
  if (!lastName || lastName.length > 50 || !NAME_RE.test(lastName)) return 'datos_invalidos';
  if (segundoNombre && (segundoNombre.length > 50 || !NAME_RE.test(segundoNombre))) return 'datos_invalidos';
  if (segundoApellido && (segundoApellido.length > 50 || !NAME_RE.test(segundoApellido))) return 'datos_invalidos';
  if (edad !== null && (edad < 18 || edad > 99)) return 'datos_invalidos';
  if (!nombreEmpresa || nombreEmpresa.length > 200) return 'datos_invalidos';

  const nombre = `${firstName} ${lastName}`.trim();

  try {
    await actualizarDatosCompletitud(idUsuario, {
      nombre,
      segundoNombre: segundoNombre || null,
      segundoApellido: segundoApellido || null,
      edad,
      nombreEmpresa,
    });
    return { ok: true };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      return 'no_existe';
    }
    throw e;
  }
}

export type ResultadoGuardarEmpresario = { ok: true } | 'datos_invalidos' | 'no_existe';

function esUrlValida(v: string): boolean {
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function guardarPerfilEmpresario(
  idUsuario: string,
  entrada: { nombre?: string; nombreEmpresa?: string; fotoUrl?: string | null },
): Promise<ResultadoGuardarEmpresario> {
  const nombre = (entrada.nombre ?? '').trim();
  if (!nombre || nombre.length > 150) return 'datos_invalidos';

  const nombreEmpresa = (entrada.nombreEmpresa ?? '').trim();
  if (nombreEmpresa.length > 200) return 'datos_invalidos';

  const fotoUrl = (entrada.fotoUrl ?? '').trim();
  if (fotoUrl && !esUrlValida(fotoUrl)) return 'datos_invalidos';

  try {
    await actualizarPerfilEmpresario(idUsuario, {
      nombre,
      nombreEmpresa: nombreEmpresa || null,
      imageUrl: fotoUrl || null,
    });
    return { ok: true };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      return 'no_existe';
    }
    throw e;
  }
}
