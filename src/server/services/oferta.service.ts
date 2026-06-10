import 'server-only';
import {
  buscarProyectoParaOferta,
  buscarOfertaExistente,
  crearOferta,
  listarOfertasDeEstudiante,
  retirarOferta as retirarOfertaRepo,
} from '@/server/repositories/oferta.repository';
import { obtenerVerificacionEstudiante } from '@/server/services/verificacion.service';
import { mapearEstadoProyecto } from '@/server/services/proyecto.service';
import { normalizarEstadoOferta, type EstadoOfertaDetalle } from '@/lib/oferta-estado';
import { calcularEstadisticas } from '@/lib/oferta-estadisticas';
import type { EstadisticasOfertas, MiOfertaDTO } from '@/types/oferta';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ResultadoEnviarOferta =
  | { ok: true; ofertaId: string }
  | 'no_verificado'
  | 'proyecto_no_encontrado'
  | 'proyecto_cerrado'
  | 'ya_oferto'
  | 'sin_prototipo';

// Estados de oferta que siguen "vivos" (sin resolución final del empresario).
const ESTADOS_ACTIVOS: ReadonlySet<EstadoOfertaDetalle> = new Set([
  'enviada',
  'en_revision',
  'preseleccionado',
]);

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
  // Enforcement de verificación FWD en el servidor (no confiar en la UI).
  const verif = await obtenerVerificacionEstudiante(datos.idEstudiante);
  if (!verif.verificado) return 'no_verificado';

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

// Lista las ofertas del estudiante autenticado mapeadas al DTO de "Mis Ofertas".
// El estado de la oferta se normaliza; el badge añade "proyecto_cerrado" cuando
// el proyecto se cerró/venció mientras la oferta seguía activa.
export async function listarMisOfertas(idEstudiante: string): Promise<MiOfertaDTO[]> {
  const filas = await listarOfertasDeEstudiante(idEstudiante);

  return filas.map((o) => {
    const estado = normalizarEstadoOferta(o.estado);
    const p = o.proyectos;
    const { estado: estadoProyecto } = mapearEstadoProyecto(p.estado, p.cierre);
    const badge =
      ESTADOS_ACTIVOS.has(estado) && estadoProyecto === 'cerrado' ? 'proyecto_cerrado' : estado;

    return {
      id: o.id,
      estado,
      badge,
      propuesta: o.propuesta,
      monto: null, // el schema actual no almacena monto (pendiente Fase de datos)
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

// Contadores de "Mis Ofertas". Reutiliza la misma lista + el cálculo puro para
// que los números coincidan exactamente con lo que se muestra en la vista.
export async function estadisticasMisOfertas(idEstudiante: string): Promise<EstadisticasOfertas> {
  const ofertas = await listarMisOfertas(idEstudiante);
  return calcularEstadisticas(ofertas);
}

// Indica si el estudiante ya ofertó a un proyecto y, de ser así, su estado.
export async function estadoOfertaDeEstudiante(
  idProyecto: string,
  idEstudiante: string,
): Promise<{ existe: boolean; estado: EstadoOfertaDetalle | null; enviado: string | null }> {
  // Un idProyecto mal formado (no-UUID) haría que Prisma lance; lo tratamos como "sin oferta".
  if (!UUID_RE.test(idProyecto)) return { existe: false, estado: null, enviado: null };

  const oferta = await buscarOfertaExistente(idProyecto, idEstudiante);
  if (!oferta) return { existe: false, estado: null, enviado: null };
  return {
    existe: true,
    estado: normalizarEstadoOferta(oferta.estado),
    enviado: oferta.enviado.toISOString(),
  };
}
