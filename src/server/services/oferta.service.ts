import 'server-only';
import {
  buscarProyectoParaOferta,
  buscarOfertaExistente,
  crearOferta,
  retirarOferta as retirarOfertaRepo,
  listarOfertasDeEstudiante,
} from '@/server/repositories/oferta.repository';
import { normalizarEstadoOferta, type EstadoOfertaDetalle } from '@/lib/oferta-estado';
import { calcularEstadisticas } from '@/lib/oferta-estadisticas';
import { mapearEstadoProyecto } from '@/server/services/proyecto.service';
import type { MiOfertaDTO, EstadisticasOfertas, EstadoBadgeOferta } from '@/types/oferta';

export type ResultadoEnviarOferta =
  | { ok: true; ofertaId: string }
  | 'proyecto_no_encontrado'
  | 'proyecto_cerrado'
  | 'ya_oferto'
  | 'sin_prototipo';

// Lógica de negocio para enviar una oferta:
// 1. Verifica que el proyecto existe y está abierto
// 2. Verifica que el estudiante no haya ofertado antes (la BD también lo enforcea con UNIQUE)
// 3. Verifica que haya al menos un prototipo (URL o archivo subido)
// 4. Crea la oferta
export async function enviarOferta(datos: {
  idProyecto: string;
  idEstudiante: string;
  propuesta: string;
  prototipoUrl?: string | null;
  documentacionUrl?: string | null;
}): Promise<ResultadoEnviarOferta> {
  const proyecto = await buscarProyectoParaOferta(datos.idProyecto);
  if (!proyecto) return 'proyecto_no_encontrado';

  const ahora = new Date();
  const vencido = proyecto.cierre !== null && proyecto.cierre < ahora;
  if (proyecto.estado === 'cerrado' || vencido) return 'proyecto_cerrado';

  const existente = await buscarOfertaExistente(datos.idProyecto, datos.idEstudiante);
  if (existente) return 'ya_oferto';

  if (!datos.prototipoUrl?.trim()) return 'sin_prototipo';

  const oferta = await crearOferta(datos);
  return { ok: true, ofertaId: oferta.id };
}

// Lógica de negocio para retirar una oferta.
export async function retirarOfertaService(
  idOferta: string,
  idEstudiante: string
) {
  return retirarOfertaRepo(idOferta, idEstudiante);
}

// ── Dashboard "Mis ofertas" del estudiante ──────────────────────────────────

// Lista las ofertas del estudiante mapeadas al DTO que consume la vista, con el
// estado de oferta normalizado y el badge derivado (proyecto cerrado/vencido).
export async function listarMisOfertas(idEstudiante: string): Promise<MiOfertaDTO[]> {
  const filas = await listarOfertasDeEstudiante(idEstudiante);
  return filas.map((o) => {
    const p = o.proyectos;
    const estadoOferta = normalizarEstadoOferta(o.estado);
    const { estado: estadoProyecto, vencido } = mapearEstadoProyecto(p.estado, p.cierre);
    const ofertaActiva =
      estadoOferta === 'enviada' ||
      estadoOferta === 'en_revision' ||
      estadoOferta === 'preseleccionado';
    const badge: EstadoBadgeOferta =
      ofertaActiva && (estadoProyecto === 'cerrado' || vencido) ? 'proyecto_cerrado' : estadoOferta;
    return {
      id: o.id,
      estado: estadoOferta,
      badge,
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

// Contadores de "Mis ofertas". Reutiliza la lista para que coincidan con la UI.
export async function estadisticasMisOfertas(idEstudiante: string): Promise<EstadisticasOfertas> {
  const ofertas = await listarMisOfertas(idEstudiante);
  return calcularEstadisticas(ofertas);
}

// Indica si el estudiante ya ofertó a un proyecto y, de ser así, el estado.
export async function estadoOfertaDeEstudiante(
  idProyecto: string,
  idEstudiante: string,
): Promise<{ existe: boolean; estado: EstadoOfertaDetalle | null; enviado: string | null }> {
  const oferta = await buscarOfertaExistente(idProyecto, idEstudiante);
  if (!oferta) return { existe: false, estado: null, enviado: null };
  return {
    existe: true,
    estado: normalizarEstadoOferta(oferta.estado),
    enviado: oferta.enviado.toISOString(),
  };
}
