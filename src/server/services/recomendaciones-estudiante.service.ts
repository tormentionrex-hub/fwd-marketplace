import 'server-only';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cargarEmpleabilidad } from './preferencias-estudiante.service';
import { listarNombresHabilidadesEstudiante } from '@/server/repositories/perfil-estudiante.repository';
import { listarProyectosPublicados } from '@/server/repositories/proyecto.repository';
import { completitudEmpleabilidad, type Empleabilidad } from '@/lib/empleabilidad';
import { llamarIA, MODELOS_RECOMENDADOR } from '@/lib/ia-fallback';

// ── Tipos de salida ─────────────────────────────────────────────────────────

export interface ProyectoRecomendado {
  id: string;
  titulo: string;
  empresa: string;
  area: string | null;
  plazoDias: number | null;
  usaIa: boolean;
  imagen: string | null;
  tecnologias: string[];
  /** Tecnologías del proyecto que el estudiante ya tiene o le interesan. */
  techCoinciden: string[];
  areaCoincide: boolean;
  score: number; // 0..100 (match determinista)
  /** Explicación de por qué encaja (IA, con fallback determinista). */
  razon: string;
  /** Brecha accionable a reforzar, o null si no hay. */
  faltante: string | null;
}

export type ModoRecomendaciones =
  | 'ok' // hay proyectos que hacen match
  | 'sin-preferencias' // el estudiante no ha configurado empleabilidad
  | 'sin-match' // hay proyectos pero ninguno encaja con las preferencias
  | 'sin-proyectos'; // no hay proyectos publicados

export interface RespuestaRecomendaciones {
  modo: ModoRecomendaciones;
  recomendaciones: ProyectoRecomendado[];
  /** Mensaje tipo mentor para los estados vacíos (fallback humano). */
  mensajeMentor: string | null;
  /** % de completitud de las preferencias (para invitar a completarlas). */
  completitudPrefs: number;
  /** Total de proyectos recomendables (para la carga progresiva por lotes). */
  total: number;
  /** Offset de este lote. */
  offset: number;
  /** ¿Quedan más lotes por cargar? */
  hayMas: boolean;
}

// Carga progresiva: se entrega de a LOTE proyectos. El cliente pide el siguiente
// lote hasta completar `total`.
const LOTE = 5;
const MAX_OK = 24; // hasta 24 recomendaciones con match (5 lotes de 5, aprox)
const MAX_RECIENTES = 10; // en estados vacíos, hasta 10 recientes
// Tope DURO de tiempo para la IA por lote: si no responde a tiempo, el lote sale
// igual con razones deterministas (garantiza respuesta rápida, máx ~15s).
const DEADLINE_IA_MS = 14_000;

const norm = (s: string) => s.trim().toLowerCase();

// ── Scoring determinista ────────────────────────────────────────────────────

type ProyectoPublicado = Awaited<ReturnType<typeof listarProyectosPublicados>>[number];

function techsDe(p: ProyectoPublicado): string[] {
  return p.proyectos_tecnologias
    .map((pt) => pt.tecnologias?.nombre)
    .filter((n): n is string => typeof n === 'string' && n.length > 0);
}

function empresaDe(p: ProyectoPublicado): string {
  return (
    p.perfiles_empresario?.nombre_empresa ||
    p.perfiles_empresario?.usuarios?.nombre ||
    'Empresa'
  );
}

// Puntúa un proyecto contra las preferencias + habilidades del estudiante.
// área (35) + tecnologías (hasta 45) + tipo de proyecto por plazo (10) + un
// pequeño bono si el proyecto usa IA y al estudiante le interesa. Máx 100.
function puntuar(
  p: ProyectoPublicado,
  prefsAreas: Set<string>,
  deseadas: Set<string>,
): { score: number; areaCoincide: boolean; techCoinciden: string[] } {
  const techs = techsDe(p);
  const areaCoincide = !!p.area_negocio && prefsAreas.has(norm(p.area_negocio));
  const techCoinciden = techs.filter((t) => deseadas.has(norm(t)));

  const areaScore = areaCoincide ? 35 : 0;
  const techScore = Math.min(45, techCoinciden.length * 18);
  const total = areaScore + techScore;

  return { score: Math.min(100, total), areaCoincide, techCoinciden };
}

// Razón determinista (se usa si la IA no está disponible o no cubre este id).
function razonPorDefecto(c: {
  area: string | null;
  areaCoincide: boolean;
  techCoinciden: string[];
}): string {
  const partes: string[] = [];
  if (c.areaCoincide && c.area) partes.push(`está en tu área de interés (${c.area})`);
  if (c.techCoinciden.length > 0)
    partes.push(`usa tecnologías que manejás: ${c.techCoinciden.slice(0, 3).join(', ')}`);
  if (partes.length === 0) return 'Es una oportunidad reciente del marketplace.';
  return `Encaja con vos porque ${partes.join(' y ')}.`;
}

function faltantePorDefecto(techs: string[], deseadas: Set<string>): string | null {
  const brecha = techs.filter((t) => !deseadas.has(norm(t)));
  if (brecha.length === 0) return null;
  return `Podrías reforzar: ${brecha.slice(0, 3).join(', ')}.`;
}

// ── Explicación con IA (LLM solo explica/afina; el filtro ya es determinista) ─

interface ExplicacionIA {
  id: string;
  razon: string;
  faltante: string | null;
}

// Extrae el objeto JSON de la respuesta del modelo, tolerando fences de
// markdown (```json ... ```) o prosa alrededor. Los modelos open-weights a
// veces envuelven el JSON; tomamos desde el primer "{" hasta el último "}".
function extraerJson(texto: string): string {
  const limpio = texto.replace(/```json/gi, '').replace(/```/g, '').trim();
  const ini = limpio.indexOf('{');
  const fin = limpio.lastIndexOf('}');
  if (ini !== -1 && fin !== -1 && fin > ini) return limpio.slice(ini, fin + 1);
  return limpio;
}

// "Skill" compartida por TODOS los modelos de la cadena (principal + salvavidas):
// su instrucción de sistema vive en un archivo .md editable, para poder ajustar
// el comportamiento de los agentes sin tocar código. Se lee una vez y se cachea.
// Si el archivo no se encuentra (p. ej. en un build que no lo incluya), se usa
// un fallback mínimo embebido para que el recomendador nunca se rompa.
const SKILL_FALLBACK =
  'Sos un mentor de carrera de FWD (bootcamp de Costa Rica). Por cada proyecto ' +
  'candidato, explicá en segunda persona (vos), cálido y honesto, por qué encaja ' +
  'con el estudiante y qué reforzar. Usá SOLO los datos entregados (sin inventar). ' +
  'Nunca uses emojis. Respondé ÚNICAMENTE con JSON válido, sin markdown ni texto ' +
  'extra, con esta forma: { "items": [ { "id": "<id>", "razon": "<1-2 frases>", ' +
  '"faltante": "<texto o null>" } ] } (un item por proyecto, con su mismo id).';

let _skillCache: string | null = null;
function cargarSkillRecomendador(): string {
  // En producción se cachea (rendimiento). En desarrollo se relee en cada
  // llamada, para que editar el .md "reentrene" al instante sin reiniciar.
  const enProd = process.env.NODE_ENV === 'production';
  if (enProd && _skillCache !== null) return _skillCache;
  let skill: string;
  try {
    const ruta = join(process.cwd(), 'src', 'server', 'ia', 'recomendador.skill.md');
    const contenido = readFileSync(ruta, 'utf8').trim();
    skill = contenido.length > 0 ? contenido : SKILL_FALLBACK;
  } catch {
    skill = SKILL_FALLBACK;
  }
  _skillCache = skill;
  return skill;
}

async function explicarConIA(
  emp: Empleabilidad,
  skills: string[],
  candidatos: ProyectoRecomendado[],
): Promise<Map<string, ExplicacionIA>> {
  const perfil = {
    areasInteres: emp.areas,
    tecnologiasInteres: emp.tecnologias,
    habilidades: skills,
    modalidad: emp.modalidad,
    tipoProyecto: emp.tipoProyecto,
  };
  const proyectos = candidatos.map((c) => ({
    id: c.id,
    titulo: c.titulo,
    area: c.area,
    tecnologias: c.tecnologias,
    tecnologiasEnComun: c.techCoinciden,
    plazoDias: c.plazoDias,
  }));

  // La instrucción de sistema es la "skill" compartida (recomendador.skill.md);
  // el mensaje de usuario lleva SOLO los datos de esta petición.
  const system = cargarSkillRecomendador();
  const user = `perfil:\n${JSON.stringify(perfil)}\n\nproyectos:\n${JSON.stringify(proyectos)}`;

  // Cadena de modelos gratuitos (MODELOS_RECOMENDADOR). No forzamos
  // response_format json_object porque varios modelos open-weights no lo
  // soportan (lo rechazarían); pedimos el JSON por prompt (ver skill) y lo
  // parseamos de forma tolerante. Timeout amplio: los free 20B+ son más lentos.
  const texto = await llamarIA(
    [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    { temperature: 0.5, max_tokens: 700 },
    MODELOS_RECOMENDADOR,
    10_000, // timeout por modelo (dentro del tope duro DEADLINE_IA_MS)
  );

  const mapa = new Map<string, ExplicacionIA>();
  try {
    const parsed = JSON.parse(extraerJson(texto)) as { items?: unknown };
    const items = Array.isArray(parsed.items) ? parsed.items : [];
    for (const it of items) {
      if (!it || typeof it !== 'object') continue;
      const o = it as Record<string, unknown>;
      const id = typeof o.id === 'string' ? o.id : null;
      if (!id) continue;
      const razon = typeof o.razon === 'string' && o.razon.trim() ? o.razon.trim() : '';
      const faltante =
        typeof o.faltante === 'string' && o.faltante.trim() && o.faltante.trim() !== 'null'
          ? o.faltante.trim()
          : null;
      if (razon) mapa.set(id, { id, razon, faltante });
    }
  } catch {
    // JSON inválido: el llamador cae al texto determinista.
  }
  return mapa;
}

// Corre la explicación con IA pero con un TOPE DURO de tiempo: si la IA no
// respondió antes de DEADLINE_IA_MS, devuelve un mapa vacío (→ el lote usa
// razones deterministas al instante). Así ningún lote excede ~15s.
async function explicarConTope(
  emp: Empleabilidad,
  skills: string[],
  lote: ProyectoRecomendado[],
): Promise<Map<string, ExplicacionIA>> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const porDeadline = new Promise<Map<string, ExplicacionIA>>((resolve) => {
    timer = setTimeout(() => resolve(new Map()), DEADLINE_IA_MS);
  });
  const porIA = explicarConIA(emp, skills, lote).catch(() => new Map<string, ExplicacionIA>());
  const res = await Promise.race([porIA, porDeadline]);
  if (timer) clearTimeout(timer);
  return res;
}

// ── Punto de entrada ────────────────────────────────────────────────────────

export async function recomendarProyectos(
  idUsuario: string,
  offset = 0,
  limit = LOTE,
): Promise<RespuestaRecomendaciones> {
  const [emp, habilidadesRaw, publicados] = await Promise.all([
    cargarEmpleabilidad(idUsuario),
    listarNombresHabilidadesEstudiante(idUsuario),
    listarProyectosPublicados(),
  ]);

  const skills = habilidadesRaw
    .map((h) => h.habilidades?.nombre)
    .filter((n): n is string => typeof n === 'string' && n.length > 0);

  const completitudPrefs = completitudEmpleabilidad(emp);
  const tienePrefs = emp.areas.length > 0 || emp.tecnologias.length > 0;

  // Sin proyectos publicados: no hay nada que recomendar.
  if (publicados.length === 0) {
    return {
      modo: 'sin-proyectos',
      recomendaciones: [],
      mensajeMentor:
        'Por ahora no hay proyectos abiertos en el marketplace. Aprovechá para pulir tu ' +
        'perfil y tu CV: cuando entren nuevos proyectos, vas a estar listo para postularte.',
      completitudPrefs,
      total: 0,
      offset: 0,
      hayMas: false,
    };
  }

  const prefsAreas = new Set(emp.areas.map(norm));
  // "Deseadas" = tecnologías que le interesan (preferencias) + las que ya domina.
  const deseadas = new Set([...emp.tecnologias.map(norm), ...skills.map(norm)]);

  // Construye candidatos con score determinista.
  const candidatos: ProyectoRecomendado[] = publicados.map((p) => {
    const { score, areaCoincide, techCoinciden } = puntuar(p, prefsAreas, deseadas);
    const techs = techsDe(p);
    return {
      id: p.id,
      titulo: p.titulo,
      empresa: empresaDe(p),
      area: p.area_negocio,
      plazoDias: p.plazo_dias,
      usaIa: p.usa_ia ?? false,
      imagen: Array.isArray(p.imagenes) && p.imagenes.length > 0 ? String(p.imagenes[0]) : null,
      tecnologias: techs,
      techCoinciden,
      areaCoincide,
      score,
      razon: '',
      faltante: null,
    };
  });

  const conMatch = candidatos.filter((c) => c.score > 0).sort((a, b) => b.score - a.score);

  // Determina el modo y la lista COMPLETA ordenada (que luego se pagina).
  let modo: ModoRecomendaciones;
  let completa: ProyectoRecomendado[];
  let mensajeMentor: string | null = null;

  if (!tienePrefs) {
    // No configuró preferencias: mostramos lo más reciente e invitamos a configurar.
    modo = 'sin-preferencias';
    completa = candidatos.slice(0, MAX_RECIENTES); // ordenados por fecha (publicado desc)
    mensajeMentor =
      'Todavía no nos contaste qué te interesa. Configurá tus preferencias de empleabilidad ' +
      '(áreas y tecnologías) y las recomendaciones se van a personalizar para vos. Mientras ' +
      'tanto, estos son los proyectos más recientes.';
  } else if (conMatch.length === 0) {
    // Tiene preferencias pero nada encaja: mostramos recientes como exploración.
    modo = 'sin-match';
    completa = candidatos.slice(0, MAX_RECIENTES);
    mensajeMentor =
      'Ahora mismo no hay proyectos que encajen exactamente con tus preferencias. Te dejamos ' +
      'los más recientes por si querés explorar, y considerá ampliar tus áreas o tecnologías ' +
      'en tus preferencias para ver más opciones.';
  } else {
    modo = 'ok';
    completa = conMatch.slice(0, MAX_OK);
  }

  // Pagina: solo este lote se explica con IA (rápido). En los estados vacíos se
  // usan razones deterministas (no gastamos IA sin señal).
  const total = completa.length;
  const lote = completa.slice(offset, offset + limit);

  let explicaciones = new Map<string, ExplicacionIA>();
  if (modo === 'ok' && lote.length > 0) {
    explicaciones = await explicarConTope(emp, skills, lote);
  }

  const recomendaciones: ProyectoRecomendado[] = lote.map((c) => {
    const ia = explicaciones.get(c.id);
    const razon = ia?.razon || razonPorDefecto(c);
    const faltante =
      ia !== undefined ? ia.faltante : faltantePorDefecto(c.tecnologias, deseadas);
    return { ...c, razon, faltante };
  });

  return {
    modo,
    recomendaciones,
    mensajeMentor,
    completitudPrefs,
    total,
    offset,
    hayMas: offset + limit < total,
  };
}
