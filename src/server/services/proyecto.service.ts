import 'server-only';
import { after } from 'next/server';
import {
  listarProyectosDeEmpresario,
  listarProyectosPublicados,
  obtenerProyectoConDetalle,
  ofertasRecientesDeEmpresario,
  entregablesRecientesDeEmpresario,
  proyectosCerradosDeEmpresario,
  contarOfertasDesde,
  buscarProyectoActivo,
  listarTecnologias,
  crearProyecto,
  actualizarProyecto,
  publicarProyecto,
  deshabilitarProyecto,
  eliminarProyecto,
  guardarEmbedding,
  obtenerDatosParaEmbedding,
  buscarProyectosPorSimilitud,
  obtenerActividadSeisMeses,
} from '@/server/repositories/proyecto.repository';
import { generarEmbedding, textoParaEmbedding } from '@/lib/embeddings';
import type { ProyectoMarketplace } from '@/types/marketplace';
import type { EstadoProyecto } from '@/types/sefora';

// ── Marketplace público ─────────────────────────────────────────────────────
// Devuelve todos los proyectos con estado 'publicado', mapeados al DTO que
// consume MarketplaceExplorer (fechas ya en ISO, empresa + tecnologías aplanadas).

export async function listarProyectosParaMarketplace(): Promise<ProyectoMarketplace[]> {
  const filas = await listarProyectosPublicados();
  return filas.map((p) => ({
    id: p.id,
    titulo: p.titulo,
    descripcion: p.descripcion,
    areaNegocio: p.area_negocio,
    plazoDias: p.plazo_dias,
    publicado: p.publicado?.toISOString() ?? null,
    usaIA: p.usa_ia,
    imagenes: [],
    tecnologias: p.proyectos_tecnologias.map((pt) => pt.tecnologias.nombre),
    empresario: {
      nombre: p.perfiles_empresario?.usuarios?.nombre ?? 'Empresa',
      nombreEmpresa: p.perfiles_empresario?.nombre_empresa ?? null,
      sector: p.perfiles_empresario?.sector ?? null,
    },
  }));
}

// ── CRUD empresario ─────────────────────────────────────────────────────────

export async function listarTecnologiasService() {
  const techs = await listarTecnologias();
  return techs.map((t) => ({ id: t.id.toString(), nombre: t.nombre }));
}

export async function crearProyectoService(
  idEmpresario: string,
  data: {
    titulo: string;
    descripcion: string;
    areaNegocio: string | null;
    plazoDias: number | null;
    tecnologias: string[];
    imagenes: string[];
  },
) {
  const proyecto = await crearProyecto({ idEmpresario, ...data });
  return { id: proyecto.id };
}

export async function actualizarProyectoService(
  idProyecto: string,
  idEmpresario: string,
  data: {
    titulo?: string | undefined;
    descripcion?: string | undefined;
    areaNegocio?: string | null | undefined;
    plazoDias?: number | null | undefined;
    tecnologias?: string[] | undefined;
    imagenes?: string[] | undefined;
  },
): Promise<'ok' | 'no_autorizado' | 'no_encontrado'> {
  const proyecto = await buscarProyectoActivo(idProyecto);
  if (!proyecto) return 'no_encontrado';
  if (proyecto.id_empresario !== idEmpresario) return 'no_autorizado';
  await actualizarProyecto(idProyecto, data);
  return 'ok';
}

export async function publicarProyectoService(
  idProyecto: string,
  idEmpresario: string,
): Promise<'ok' | 'no_autorizado' | 'no_encontrado' | 'ya_publicado'> {
  const proyecto = await buscarProyectoActivo(idProyecto);
  if (!proyecto) return 'no_encontrado';
  if (proyecto.id_empresario !== idEmpresario) return 'no_autorizado';
  if (proyecto.estado === 'publicado') return 'ya_publicado';

  await publicarProyecto(idProyecto);

  // Genera y guarda el embedding DESPUÉS de responder al cliente (no bloquea).
  after(async () => {
    try {
      const datos = await obtenerDatosParaEmbedding(idProyecto);
      if (!datos) return;
      const texto = textoParaEmbedding({
        titulo: datos.titulo,
        descripcion: datos.descripcion,
        areaNegocio: datos.area_negocio ?? null,
        tecnologias: datos.proyectos_tecnologias.map((pt) => pt.tecnologias.nombre),
      });
      const embedding = await generarEmbedding(texto);
      if (embedding) await guardarEmbedding(idProyecto, embedding);
    } catch (err) {
      console.error('[publicar] Error generando embedding:', err);
    }
  });

  return 'ok';
}

export async function deshabilitarProyectoService(
  idProyecto: string,
  idEmpresario: string,
): Promise<'ok' | 'no_autorizado' | 'no_encontrado' | 'no_publicado'> {
  const proyecto = await buscarProyectoActivo(idProyecto);
  if (!proyecto) return 'no_encontrado';
  if (proyecto.id_empresario !== idEmpresario) return 'no_autorizado';
  if (proyecto.estado !== 'publicado') return 'no_publicado';
  await deshabilitarProyecto(idProyecto);
  return 'ok';
}

// Búsqueda semántica: genera embedding de la query y devuelve proyectos
// ordenados por similitud coseno. Soporta búsquedas como "turismo" que
// devuelven proyectos relacionados aunque no contengan esa palabra exacta.
export async function buscarProyectosSemantico(
  query: string,
  limite = 20,
): Promise<{ id: string; similitud: number }[]> {
  const embedding = await generarEmbedding(query);
  if (!embedding) return [];
  return buscarProyectosPorSimilitud(embedding, limite);
}

export async function eliminarProyectoService(
  idProyecto: string,
  idEmpresario: string,
): Promise<'ok' | 'no_autorizado' | 'no_encontrado' | 'no_borrador'> {
  const proyecto = await buscarProyectoActivo(idProyecto);
  if (!proyecto) return 'no_encontrado';
  if (proyecto.id_empresario !== idEmpresario) return 'no_autorizado';
  if (proyecto.estado !== 'borrador') return 'no_borrador';
  await eliminarProyecto(idProyecto);
  return 'ok';
}

// ── Dashboard del empresario (Página 12) ────────────────────────────────────
// Agrega y mapea los datos que consume la UI. Devuelve formas planas (fechas ya
// en ISO) listas para el RSC.

export type ResumenEmpresario = {
  activos: number;
  ofertasRecibidas: number;
  enDesarrollo: number;
  cerrados: number;
  // Deltas reales "esta semana" (últimos 7 días) para los chips de tendencia
  // del dashboard. 0 si no hubo novedad — la UI oculta el chip en ese caso.
  nuevosActivosSemana: number;
  nuevasOfertasSemana: number;
};

export type FilaProyectoEmpresario = {
  id: string;
  titulo: string;
  estado: string;
  candidatos: number;
  fechaLimite: string | null; // ISO; null si el proyecto no tiene plazo definido
  adjudicadoA: string | null; // nombre del estudiante adjudicado, o null
  publicado: string | null;
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
  chartData: { mes: string; proyectos: number; ofertas: number }[];
}> {
  const hace7Dias = new Date(Date.now() - 7 * 86400000);
  const [filas, nuevasOfertasSemana, [proyectos6M, ofertas6M]] = await Promise.all([
    listarProyectosDeEmpresario(idEmpresario),
    contarOfertasDesde(idEmpresario, hace7Dias),
    obtenerActividadSeisMeses(idEmpresario),
  ]);

  const proyectos: FilaProyectoEmpresario[] = filas.map((p) => ({
    id: p.id,
    titulo: p.titulo,
    estado: p.estado,
    candidatos: p._count.ofertas,
    fechaLimite: calcularFechaLimite(p),
    adjudicadoA: p.ofertas[0]?.perfiles_estudiante?.usuarios?.nombre ?? null,
    publicado: p.publicado ? p.publicado.toISOString() : null,
  }));

  const resumen: ResumenEmpresario = {
    activos: filas.filter((p) => p.estado === 'publicado').length,
    enDesarrollo: filas.filter((p) => p.estado === 'en_desarrollo').length,
    cerrados: filas.filter((p) => p.estado === 'cerrado').length,
    ofertasRecibidas: filas.reduce((acc, p) => acc + p._count.ofertas, 0),
    nuevosActivosSemana: filas.filter(
      (p) =>
        p.estado === 'publicado' &&
        p.publicado != null &&
        p.publicado.getTime() >= hace7Dias.getTime(),
    ).length,
    nuevasOfertasSemana,
  };

  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'] as const;
  const chartDataMap = new Map<string, { mes: string; proyectos: number; ofertas: number }>();
  
  // Rellenar con los últimos 6 meses
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    chartDataMap.set(key, { mes: meses[d.getMonth()] ?? '—', proyectos: 0, ofertas: 0 });
  }

  for (const p of proyectos6M) {
    if (!p.publicado) continue;
    const key = `${p.publicado.getFullYear()}-${p.publicado.getMonth()}`;
    const entry = chartDataMap.get(key);
    if (entry) entry.proyectos++;
  }

  for (const o of ofertas6M) {
    if (!o.enviado) continue;
    const key = `${o.enviado.getFullYear()}-${o.enviado.getMonth()}`;
    const entry = chartDataMap.get(key);
    if (entry) entry.ofertas++;
  }

  const chartData = Array.from(chartDataMap.values());

  return { resumen, proyectos, chartData };
}

// ── Actividad reciente del empresario (Dashboard, Página 12) ────────────────
// Mezcla ofertas, entregas y cierres en un feed ordenado por fecha. La hora se
// resuelve a un texto relativo en el servidor (RSC), listo para la UI.

export type ActividadTipo = 'oferta' | 'entrega' | 'cierre';

export type ActividadItem = {
  id: string;
  tipo: ActividadTipo;
  titulo: string; // p. ej. "Nueva oferta de Valeria Mora"
  proyecto: string; // título del proyecto (subtítulo)
  cuando: string; // texto relativo, p. ej. "hace 2 h"
  idProyecto: string; // para enlazar a la gestión del proyecto
};

function tiempoRelativo(fecha: Date): string {
  const min = Math.floor((Date.now() - fecha.getTime()) / 60_000);
  if (min < 1) return 'hace un momento';
  if (min < 60) return `hace ${min} min`;
  const horas = Math.floor(min / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  if (dias === 1) return 'ayer';
  if (dias < 7) return `hace ${dias} días`;
  const semanas = Math.floor(dias / 7);
  if (semanas < 5) return `hace ${semanas} sem`;
  const meses = Math.floor(dias / 30);
  return `hace ${meses} ${meses === 1 ? 'mes' : 'meses'}`;
}

export async function actividadRecienteEmpresario(
  idEmpresario: string,
  limite = 5,
): Promise<ActividadItem[]> {
  const [ofertas, entregas, cerrados] = await Promise.all([
    ofertasRecientesDeEmpresario(idEmpresario, limite),
    entregablesRecientesDeEmpresario(idEmpresario, limite),
    proyectosCerradosDeEmpresario(idEmpresario, limite),
  ]);

  const eventos: { orden: number; item: ActividadItem }[] = [];

  for (const o of ofertas) {
    const nombre = o.perfiles_estudiante?.usuarios?.nombre ?? 'Un estudiante';
    eventos.push({
      orden: o.enviado.getTime(),
      item: {
        id: `oferta-${o.id}`,
        tipo: 'oferta',
        titulo: `Nueva oferta de ${nombre}`,
        proyecto: o.proyectos?.titulo ?? 'Proyecto',
        cuando: tiempoRelativo(o.enviado),
        idProyecto: o.id_proyecto,
      },
    });
  }

  for (const e of entregas) {
    const nombre = e.perfiles_estudiante?.usuarios?.nombre ?? 'Un estudiante';
    eventos.push({
      orden: e.creado.getTime(),
      item: {
        id: `entrega-${e.id}`,
        tipo: 'entrega',
        titulo: `${nombre} subió una entrega`,
        proyecto: e.proyectos?.titulo ?? 'Proyecto',
        cuando: tiempoRelativo(e.creado),
        idProyecto: e.id_proyecto,
      },
    });
  }

  for (const c of cerrados) {
    if (!c.cierre) continue;
    eventos.push({
      orden: c.cierre.getTime(),
      item: {
        id: `cierre-${c.id}`,
        tipo: 'cierre',
        titulo: 'Proyecto cerrado y evaluado',
        proyecto: c.titulo,
        cuando: tiempoRelativo(c.cierre),
        idProyecto: c.id,
      },
    });
  }

  return eventos.sort((a, b) => b.orden - a.orden).slice(0, limite).map((e) => e.item);
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
  imagenes: string[];
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
    imagenes: [],
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
