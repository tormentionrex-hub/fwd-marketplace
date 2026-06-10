import 'server-only';
import { obtenerProyectoConDetalle } from '@/server/repositories/proyecto.repository';
import type { EstadoProyecto } from '@/types/sefora';

// Lógica de negocio del proyecto: mapea la fila de la DB al DTO que consume la
// ficha pública (estado normalizado, días restantes, empresario y tecnologías).

export interface ProyectoDetalleDTO {
  id: string;
  titulo: string;
  descripcion: string;
  area: string;
  tecnologias: string[];
  diasRestantes: number;
  /** Fecha límite (ISO) o null si el proyecto no define cierre. */
  fechaLimite: string | null;
  empresario: { nombre: string; sector: string };
  estado: EstadoProyecto;
  vencido: boolean;
}

const MS_POR_DIA = 86_400_000;
const ESTADOS_CERRADOS = ['cerrado', 'finalizado', 'adjudicado', 'completado'];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function mapearEstadoProyecto(
  estadoDb: string | null | undefined,
  cierre: Date | null,
): { estado: EstadoProyecto; diasRestantes: number; vencido: boolean } {
  const e = (estadoDb ?? '').toLowerCase().trim();

  let diasRestantes = 0;
  let vencido = false;
  if (cierre) {
    const ms = cierre.getTime() - Date.now();
    diasRestantes = Math.max(0, Math.ceil(ms / MS_POR_DIA));
    vencido = ms <= 0;
  }

  let estado: EstadoProyecto;
  if (e === 'cancelado') estado = 'cancelado';
  else if (vencido || ESTADOS_CERRADOS.includes(e)) estado = 'cerrado';
  else estado = 'abierto';

  return { estado, diasRestantes, vencido };
}

export async function obtenerDetalleProyecto(id: string): Promise<ProyectoDetalleDTO | null> {
  // Un id mal formado (no-UUID) haría que Prisma lance; lo tratamos como "no existe".
  if (!UUID_RE.test(id)) return null;

  const p = await obtenerProyectoConDetalle(id);
  if (!p) return null;

  const { estado, diasRestantes, vencido } = mapearEstadoProyecto(p.estado, p.cierre);

  return {
    id: p.id,
    titulo: p.titulo,
    descripcion: p.descripcion,
    area: p.area_negocio ?? 'General',
    tecnologias: p.proyectos_tecnologias.map((t) => t.tecnologias.nombre),
    diasRestantes,
    fechaLimite: p.cierre ? p.cierre.toISOString() : null,
    empresario: {
      nombre: p.perfiles_empresario?.usuarios?.nombre ?? 'Empresa',
      sector: p.perfiles_empresario?.sector ?? '—',
    },
    estado,
    vencido,
  };
}
