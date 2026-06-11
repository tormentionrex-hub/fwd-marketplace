import 'server-only';
import { obtenerPerfilEmpresario } from '@/server/repositories/perfil-empresario.repository';

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

  return {
    // El nombre de empresa (perfiles_empresario.nombre_empresa) aún no existe en
    // la DB actual; usamos el nombre del usuario como nombre de la cuenta.
    empresa: u?.nombre || 'Mi empresa',
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
