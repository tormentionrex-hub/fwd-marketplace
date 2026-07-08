import 'server-only';
import { Prisma } from '@prisma/client';
import * as repo from '@/server/repositories/perfil-estudiante.repository';
import { buscarTecnologias, validarTecnologia } from '@/lib/ia-tecnologias';

export interface HabilidadCatalogo {
  id: string;
  nombre: string;
}
export interface HabilidadSeleccionada {
  id: string;
  nivel: string;
}
export interface ProyectoCompletado {
  id: string;
  titulo: string;
  calificacion: number;
}

export interface PortafolioItem {
  id: string;
  titulo: string;
  descripcion: string;
  tecnologias: string;
  /** Fecha en formato YYYY-MM-DD (para <input type="date">). */
  fecha: string;
  repoUrl: string;
  demoUrl: string;
  esPublico: boolean;
}

export interface PerfilEditable {
  nombre: string;
  correo: string;
  fotoUrl: string;
  resumen: string;
  catalogo: HabilidadCatalogo[];
  habilidades: HabilidadSeleccionada[];
  completados: ProyectoCompletado[];
  portafolio: PortafolioItem[];
}

// Carga el perfil del estudiante para precargar el formulario.
export async function cargarPerfilEditable(idUsuario: string): Promise<PerfilEditable> {
  const [usuario, perfil, catalogo, seleccionadas, completados, portafolio] = await Promise.all([
    repo.obtenerUsuarioBasico(idUsuario),
    repo.obtenerPerfilEstudianteCampos(idUsuario),
    repo.listarCatalogoHabilidades(),
    repo.listarHabilidadesEstudiante(idUsuario),
    repo.listarProyectosCompletados(idUsuario),
    repo.listarPortafolio(idUsuario),
  ]);

  return {
    nombre: usuario?.nombre ?? '',
    correo: usuario?.correo ?? '',
    fotoUrl: usuario?.image_url ?? '',
    resumen: perfil?.descripcion ?? '',
    catalogo: catalogo.map((h) => ({ id: h.id.toString(), nombre: h.nombre })),
    habilidades: seleccionadas.map((s) => ({
      id: s.id_habilidad.toString(),
      nivel: s.nivel ?? 'básico',
    })),
    completados: completados.map((e) => ({
      id: e.proyectos.id,
      titulo: e.proyectos.titulo,
      calificacion: e.puntuacion,
    })),
    portafolio: portafolio.map((p) => ({
      id: p.id,
      titulo: p.titulo,
      descripcion: p.descripcion ?? '',
      tecnologias: p.tecnologias ?? '',
      fecha: p.fecha ? p.fecha.toISOString().slice(0, 10) : '',
      repoUrl: p.repo_url ?? '',
      demoUrl: p.demo_url ?? '',
      esPublico: p.es_publico,
    })),
  };
}

export type ResultadoGuardar = { ok: true } | 'datos_invalidos' | 'correo_en_uso';

const NIVELES = new Set(['básico', 'intermedio', 'avanzado']);
const RE_CORREO = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function esUrlValida(v: string): boolean {
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

// Guarda datos personales + habilidades + portafolio. Valida y normaliza.
export async function guardarPerfilEditable(
  idUsuario: string,
  entrada: {
    nombre?: string;
    correo?: string;
    fotoUrl?: string | null;
    resumen?: string;
    habilidades?: { id?: string; nivel?: string }[];
    portafolio?: {
      titulo?: string;
      descripcion?: string;
      tecnologias?: string;
      fecha?: string;
      repoUrl?: string;
      demoUrl?: string;
      esPublico?: boolean;
    }[];
  },
): Promise<ResultadoGuardar> {
  const nombre = (entrada.nombre ?? '').trim();
  const correo = (entrada.correo ?? '').trim().toLowerCase();
  if (!nombre || !RE_CORREO.test(correo)) return 'datos_invalidos';

  const habilidades: { idHabilidad: bigint; nivel: string }[] = [];
  for (const h of entrada.habilidades ?? []) {
    if (!h?.id) continue;
    let idHabilidad: bigint;
    try {
      idHabilidad = BigInt(h.id);
    } catch {
      return 'datos_invalidos';
    }
    const nivel = NIVELES.has(h.nivel ?? '') ? (h.nivel as string) : 'básico';
    habilidades.push({ idHabilidad, nivel });
  }

  const portafolio: repo.PortafolioPersistencia[] = [];
  for (const p of entrada.portafolio ?? []) {
    const titulo = (p?.titulo ?? '').trim();
    if (!titulo) continue;
    const repoUrl = (p?.repoUrl ?? '').trim();
    const demoUrl = (p?.demoUrl ?? '').trim();
    if (repoUrl && !esUrlValida(repoUrl)) return 'datos_invalidos';
    if (demoUrl && !esUrlValida(demoUrl)) return 'datos_invalidos';
    let fecha: Date | null = null;
    if (p?.fecha) {
      const d = new Date(p.fecha);
      if (!Number.isNaN(d.getTime())) fecha = d;
    }
    portafolio.push({
      titulo: titulo.slice(0, 200),
      descripcion: (p?.descripcion ?? '').trim() || null,
      tecnologias: (p?.tecnologias ?? '').trim() || null,
      fecha,
      repoUrl: repoUrl || null,
      demoUrl: demoUrl || null,
      esPublico: p?.esPublico ?? true,
    });
  }

  try {
    await repo.guardarPerfilCompleto(idUsuario, {
      nombre,
      correo,
      fotoUrl: entrada.fotoUrl?.trim() ? entrada.fotoUrl.trim() : null,
      resumen: (entrada.resumen ?? '').trim(),
      habilidades,
      portafolio,
    });
    return { ok: true };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return 'correo_en_uso';
    }
    throw e;
  }
}

// ── Buscador de tecnologías (autocompletado + IA) ───────────────────────────

// Sugiere tecnologías reales relacionadas con `query`, combinando el catálogo
// de la BD (match instantáneo) con sugerencias de la IA (restringidas al dominio
// de programación/tecnología). Excluye las que el estudiante ya tenga o ya estén
// en el catálogo con el mismo nombre. Devuelve solo NOMBRES (el alta ocurre aparte).
export async function sugerirTecnologiasService(
  query: string,
): Promise<{ enCatalogo: HabilidadCatalogo[]; nuevas: string[] }> {
  const q = query.trim();
  if (q.length < 2) return { enCatalogo: [], nuevas: [] };

  const catalogo = await repo.listarCatalogoHabilidades();
  const qLower = q.toLowerCase();

  const enCatalogo = catalogo
    .filter((h) => h.nombre.toLowerCase().includes(qLower))
    .slice(0, 8)
    .map((h) => ({ id: h.id.toString(), nombre: h.nombre }));

  const sugeridas = await buscarTecnologias(q);
  const nombresExistentes = new Set(catalogo.map((h) => h.nombre.toLowerCase()));
  const nuevas = sugeridas
    .filter((n) => !nombresExistentes.has(n.toLowerCase()))
    .slice(0, 8);

  return { enCatalogo, nuevas };
}

export type ResultadoAgregarHabilidad =
  | { ok: true; id: string; nombre: string }
  | 'no_es_tecnologia'
  | 'nombre_invalido';

// Agrega una tecnología al catálogo global (para que el estudiante la seleccione).
// Si ya existe (por nombre), reutiliza la fila. Si es nueva, valida con IA que
// pertenezca al dominio de la programación antes de crearla (gate de dominio
// server-side: nadie puede meter "Goku" ni términos ajenos a la tecnología).
export async function agregarHabilidadAlCatalogo(
  nombreEntrada: string,
): Promise<ResultadoAgregarHabilidad> {
  const nombre = nombreEntrada.trim();
  if (nombre.length < 1 || nombre.length > 80) return 'nombre_invalido';

  const existente = await repo.buscarHabilidadPorNombre(nombre);
  if (existente) {
    return { ok: true, id: existente.id.toString(), nombre: existente.nombre };
  }

  const canonico = await validarTecnologia(nombre);
  if (!canonico) return 'no_es_tecnologia';

  // Reintenta la búsqueda con el nombre canónico (evita duplicar "reactjs"/"React").
  const yaExiste = await repo.buscarHabilidadPorNombre(canonico);
  if (yaExiste) {
    return { ok: true, id: yaExiste.id.toString(), nombre: yaExiste.nombre };
  }

  const creada = await repo.crearHabilidadCatalogo(canonico);
  return { ok: true, id: creada.id.toString(), nombre: creada.nombre };
}
