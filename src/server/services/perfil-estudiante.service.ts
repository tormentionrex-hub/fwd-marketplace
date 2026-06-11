import 'server-only';
import { Prisma } from '@prisma/client';
import * as repo from '@/server/repositories/perfil-estudiante.repository';

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
