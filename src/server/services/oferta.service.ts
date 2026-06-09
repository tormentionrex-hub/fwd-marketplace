import 'server-only';
import {
  buscarProyectoParaOferta,
  buscarOfertaExistente,
  crearOferta,
  retirarOferta as retirarOfertaRepo,
  listarOfertasDeEstudiante,
} from '@/server/repositories/oferta.repository';
import { normalizarEstadoOferta } from '@/lib/oferta-estado';
import { calcularEstadisticas } from '@/lib/oferta-estadisticas';
import type { MiOfertaDTO, EstadisticasOfertas } from '@/types/oferta';

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

// Lista y normaliza las ofertas de un estudiante
export async function listarMisOfertas(idEstudiante: string): Promise<MiOfertaDTO[]> {
  const ofertasRepo = await listarOfertasDeEstudiante(idEstudiante);
  const ahora = new Date();

  return ofertasRepo.map((o) => {
    const estadoCanonico = normalizarEstadoOferta(o.estado);
    const proyecto = o.proyectos;
    const cerrado = proyecto.estado === 'cerrado' || (proyecto.cierre !== null && proyecto.cierre < ahora);

    // Si el proyecto se cerró y la oferta aún no tiene resolución final (aceptada, rechazada, cancelada)
    const resolucionFinal = estadoCanonico === 'aceptado' || estadoCanonico === 'rechazado' || estadoCanonico === 'cancelado';
    const badge = (cerrado && !resolucionFinal) ? 'proyecto_cerrado' : estadoCanonico;

    return {
      id: o.id,
      estado: estadoCanonico,
      badge,
      propuesta: o.propuesta,
      monto: null,
      fechaEnvio: o.enviado.toISOString(),
      proyecto: {
        id: proyecto.id,
        titulo: proyecto.titulo,
        area: proyecto.area_negocio ?? '',
        empresario: proyecto.perfiles_empresario?.usuarios?.nombre ?? '',
        sector: proyecto.perfiles_empresario?.sector ?? '',
        tecnologias: proyecto.proyectos_tecnologias.map((t) => t.tecnologias.nombre),
        estado: proyecto.estado as any,
        fechaLimite: proyecto.cierre ? proyecto.cierre.toISOString() : null,
      },
    };
  });
}

// Obtiene estadísticas de ofertas de un estudiante
export async function estadisticasMisOfertas(idEstudiante: string): Promise<EstadisticasOfertas> {
  const ofertas = await listarMisOfertas(idEstudiante);
  return calcularEstadisticas(ofertas);
}

// Obtiene el estado actual de la oferta de un estudiante para un proyecto específico
export async function estadoOfertaDeEstudiante(idProyecto: string, idEstudiante: string) {
  const oferta = await buscarOfertaExistente(idProyecto, idEstudiante);
  if (!oferta) {
    return { yaOferto: false, estado: null, idOferta: null };
  }
  return {
    yaOferto: true,
    estado: normalizarEstadoOferta(oferta.estado),
    idOferta: oferta.id,
  };
}
