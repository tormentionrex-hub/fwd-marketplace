import 'server-only';
import { buscarProyectoActivoDeEstudiante } from '@/server/repositories/oferta.repository';
import { mapearEstadoProyecto } from '@/server/services/proyecto.service';
import type { EstadoProyecto } from '@/types/sefora';

export interface ProyectoActivoDTO {
  ofertaId: string;
  proyectoId: string;
  titulo: string;
  empresario: string;
  sector: string;
  estado: EstadoProyecto;
  fechaInicio: string | null;
  fechaFin: string | null;
  /** Progreso 0-100 estimado por tiempo transcurrido (o 100 si ya cerró). */
  progreso: number;
}

// Devuelve el proyecto adjudicado en curso del estudiante, o null si no tiene.
export async function obtenerProyectoActivo(
  idEstudiante: string,
): Promise<ProyectoActivoDTO | null> {
  const fila = await buscarProyectoActivoDeEstudiante(idEstudiante);
  if (!fila) return null;

  const p = fila.proyectos;
  const { estado } = mapearEstadoProyecto(p.estado, p.cierre);

  let progreso = 0;
  if (estado !== 'abierto') {
    progreso = 100;
  } else if (p.publicado && p.cierre) {
    const ini = p.publicado.getTime();
    const fin = p.cierre.getTime();
    if (fin > ini) {
      progreso = Math.min(100, Math.max(0, Math.round(((Date.now() - ini) / (fin - ini)) * 100)));
    }
  }

  return {
    ofertaId: fila.id,
    proyectoId: p.id,
    titulo: p.titulo,
    empresario: p.perfiles_empresario?.usuarios?.nombre ?? 'Empresa',
    sector: p.perfiles_empresario?.sector ?? '—',
    estado,
    fechaInicio: p.publicado ? p.publicado.toISOString() : null,
    fechaFin: p.cierre ? p.cierre.toISOString() : null,
    progreso,
  };
}
