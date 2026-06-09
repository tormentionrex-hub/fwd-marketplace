import 'server-only';
import {
  listarProyectosDeEmpresario,
  obtenerProyectoConDetalle,
} from '@/server/repositories/proyecto.repository';
import type { EstadoProyecto } from '@/types/sefora';

// ── Dashboard del empresario (Página 12) ────────────────────────────────────
// Agrega y mapea los datos que consume la UI. Devuelve formas planas (fechas ya
// en ISO) listas para el RSC.

export type ResumenEmpresario = {
  activos: number;
  ofertasRecibidas: number;
  enDesarrollo: number;
  cerrados: number;
};

export type FilaProyectoEmpresario = {
  id: string;
  titulo: string;
  estado: string;
  candidatos: number;
  fechaLimite: string | null; // ISO; null si el proyecto no tiene plazo definido
};

// Deriva la fecha límite a partir de `cierre`, o de `publicado` + `plazo_dias`
// (mismo criterio que la Página 10 ya migrada).
function calcularFechaLimite(p: {
  cierre: Date | null;
  publicado: Date | null;
  plazo_dias: number | null;
}): string | null {
  if (p.cierre) return p.cierre.toISOString();
  if (p.publicado && p.plazo_dias != null) {
    return new Date(p.publicado.getTime() + p.plazo_dias * 86400000).toISOString();
  }
  return null;
}

export async function dashboardEmpresario(idEmpresario: string): Promise<{
  resumen: ResumenEmpresario;
  proyectos: FilaProyectoEmpresario[];
}> {
  const filas = await listarProyectosDeEmpresario(idEmpresario);

  const proyectos: FilaProyectoEmpresario[] = filas.map((p) => ({
    id: p.id,
    titulo: p.titulo,
    estado: p.estado,
    candidatos: p._count.ofertas,
    fechaLimite: calcularFechaLimite(p),
  }));

  const resumen: ResumenEmpresario = {
    activos: filas.filter((p) => p.estado === 'publicado').length,
    enDesarrollo: filas.filter((p) => p.estado === 'en_desarrollo').length,
    cerrados: filas.filter((p) => p.estado === 'cerrado').length,
    ofertasRecibidas: filas.reduce((acc, p) => acc + p._count.ofertas, 0),
  };

  return { resumen, proyectos };
}

// ── Ficha pública del proyecto ──────────────────────────────────────────────
// Mapea la fila de la DB al DTO que consume la ficha pública (estado
// normalizado, días restantes, empresario y tecnologías).

export interface ProyectoDetalleDTO {
  id: string;
  titulo: string;
  descripcion: string;
  area: string;
  tecnologias: string[];
  diasRestantes: number;
  empresario: { nombre: string; sector: string };
  estado: EstadoProyecto;
  vencido: boolean;
}

const MS_POR_DIA = 86_400_000;
const ESTADOS_CERRADOS = ['cerrado', 'finalizado', 'adjudicado', 'completado'];

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
    empresario: {
      nombre: p.perfiles_empresario?.usuarios?.nombre ?? 'Empresa',
      sector: p.perfiles_empresario?.sector ?? '—',
    },
    estado,
    vencido,
  };
}
