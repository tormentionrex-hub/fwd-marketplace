import 'server-only';
import {
  buscarProyectoParaOferta,
  buscarOfertaExistente,
  crearOferta,
  retirarOferta as retirarOfertaRepo,
} from '@/server/repositories/oferta.repository';

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
