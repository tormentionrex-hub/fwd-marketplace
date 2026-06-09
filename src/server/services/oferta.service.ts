import 'server-only';
import {
  buscarOfertaDeEstudiante,
  crearOferta,
  listarOfertasDeEstudiante,
} from '@/server/repositories/oferta.repository';
import { obtenerProyectoConDetalle } from '@/server/repositories/proyecto.repository';
import { mapearEstadoProyecto } from '@/server/services/proyecto.service';
import { normalizarEstadoOferta, type EstadoOfertaDetalle } from '@/lib/oferta-estado';
import { calcularEstadisticas } from '@/lib/oferta-estadisticas';
import type { EstadisticasOfertas, EstadoBadgeOferta, MiOfertaDTO } from '@/types/oferta';
import type { EstadoProyecto } from '@/types/sefora';

// Lógica de negocio de las ofertas: consultar el estado de la oferta de un
// estudiante y crear una oferta aplicando todas las reglas de negocio.

export interface EstadoOfertaResultado {
  existe: boolean;
  estado: EstadoOfertaDetalle | null;
  enviado: string | null;
}

export async function estadoOfertaDeEstudiante(
  idProyecto: string,
  idEstudiante: string,
): Promise<EstadoOfertaResultado> {
  const oferta = await buscarOfertaDeEstudiante(idProyecto, idEstudiante);
  if (!oferta) return { existe: false, estado: null, enviado: null };
  return {
    existe: true,
    estado: normalizarEstadoOferta(oferta.estado),
    enviado: oferta.enviado.toISOString(),
  };
}

export type CrearOfertaError =
  | 'propuesta_requerida'
  | 'proyecto_no_encontrado'
  | 'proyecto_cancelado'
  | 'proyecto_cerrado'
  | 'proyecto_vencido'
  | 'oferta_duplicada';

export type CrearOfertaResultado =
  | { ok: true; oferta: { id: string; estado: EstadoOfertaDetalle } }
  | { ok: false; error: CrearOfertaError };

const ESTADOS_CERRADOS = ['cerrado', 'finalizado', 'adjudicado', 'completado'];

export async function crearOfertaValidada(datos: {
  idProyecto: string;
  idEstudiante: string;
  propuesta: string;
  prototipoUrl?: string | null;
}): Promise<CrearOfertaResultado> {
  const propuesta = datos.propuesta?.trim();
  if (!propuesta) return { ok: false, error: 'propuesta_requerida' };

  // El proyecto debe existir y estar activo (no cancelado, no cerrado, no vencido).
  const proyecto = await obtenerProyectoConDetalle(datos.idProyecto);
  if (!proyecto) return { ok: false, error: 'proyecto_no_encontrado' };

  const estado = (proyecto.estado ?? '').toLowerCase().trim();
  if (estado === 'cancelado') return { ok: false, error: 'proyecto_cancelado' };

  const vencido = proyecto.cierre ? proyecto.cierre.getTime() - Date.now() <= 0 : false;
  if (vencido) return { ok: false, error: 'proyecto_vencido' };
  if (ESTADOS_CERRADOS.includes(estado)) return { ok: false, error: 'proyecto_cerrado' };

  // Regla clave: un estudiante solo puede enviar una oferta por proyecto.
  const previa = await buscarOfertaDeEstudiante(datos.idProyecto, datos.idEstudiante);
  if (previa) return { ok: false, error: 'oferta_duplicada' };

  const oferta = await crearOferta({
    idProyecto: datos.idProyecto,
    idEstudiante: datos.idEstudiante,
    propuesta,
    prototipoUrl: datos.prototipoUrl ?? null,
  });

  return { ok: true, oferta: { id: oferta.id, estado: normalizarEstadoOferta(oferta.estado) } };
}

// Estado visible en la tarjeta: si la oferta sigue activa pero el proyecto se
// canceló/cerró/venció, se refleja ese hecho en el badge.
function computarBadge(
  estadoOferta: EstadoOfertaDetalle,
  estadoProyecto: EstadoProyecto,
): EstadoBadgeOferta {
  const finalizada =
    estadoOferta === 'aceptado' || estadoOferta === 'rechazado' || estadoOferta === 'cancelado';
  if (finalizada) return estadoOferta;
  if (estadoProyecto === 'cancelado') return 'cancelado';
  if (estadoProyecto === 'cerrado') return 'proyecto_cerrado';
  return estadoOferta;
}

export async function listarMisOfertas(idEstudiante: string): Promise<MiOfertaDTO[]> {
  const filas = await listarOfertasDeEstudiante(idEstudiante);

  return filas.map((o) => {
    const p = o.proyectos;
    const { estado: estadoProyecto } = mapearEstadoProyecto(p.estado, p.cierre);
    const estadoOferta = normalizarEstadoOferta(o.estado);

    return {
      id: o.id,
      estado: estadoOferta,
      badge: computarBadge(estadoOferta, estadoProyecto),
      propuesta: o.propuesta,
      monto: null,
      fechaEnvio: o.enviado.toISOString(),
      proyecto: {
        id: p.id,
        titulo: p.titulo,
        area: p.area_negocio ?? 'General',
        empresario: p.perfiles_empresario?.usuarios?.nombre ?? 'Empresa',
        sector: p.perfiles_empresario?.sector ?? '—',
        tecnologias: p.proyectos_tecnologias.map((t) => t.tecnologias.nombre),
        estado: estadoProyecto,
        fechaLimite: p.cierre ? p.cierre.toISOString() : null,
      },
    };
  });
}

export async function estadisticasMisOfertas(idEstudiante: string): Promise<EstadisticasOfertas> {
  const ofertas = await listarMisOfertas(idEstudiante);
  return calcularEstadisticas(ofertas);
}
