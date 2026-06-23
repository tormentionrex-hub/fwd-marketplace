import 'server-only';
import { consultarDashboardAdmin } from '@/server/repositories/dashboard-admin.repository';
import { tiempoRelativo } from '@/lib/tiempo';

// ── Tipos (serializables) que consumen la página y los componentes ──────────
export type DashboardKpis = {
  proyectosTotal: number;
  proyectosDeltaPct: number;
  usuariosActivos: number;
  usuariosDeltaPct: number;
  proyectosNuevosMes: number;
  ofertasPendientes: number;
  estudiantesOfertaPendiente: number;
};

export type SerieActividadPunto = {
  mes: string;
  usuarios: number;
  proyectos: number;
  ofertas: number;
};

export type AprobacionItem = {
  id: string;
  titulo: string;
  empresario: string;
  area: string | null;
  estado: string;
  motivo: string | null;
  ofertas: number;
};

export type ActividadItem = {
  id: string;
  tipo: 'usuario' | 'proyecto' | 'oferta' | 'suspension';
  texto: string;
  detalle: string | null;
  fecha: string;
  relativo: string | null;
};

export type ProyectoRecienteItem = {
  id: string;
  titulo: string;
  empresario: string;
  area: string | null;
  ofertas: number;
  publicado: string | null;
  relativo: string | null;
};

export type InvitacionItem = {
  id: string;
  email: string;
  rol: string | null;
  solicitado: string;
  relativo: string | null;
};

export type SolicitudItem = {
  id: string;
  email: string;
  solicitado: string;
  relativo: string | null;
};

export type DashboardAdminData = {
  kpis: DashboardKpis;
  serie: SerieActividadPunto[];
  aprobaciones: AprobacionItem[];
  actividad: ActividadItem[];
  proyectosRecientes: ProyectoRecienteItem[];
  invitaciones: InvitacionItem[];
  solicitudes: SolicitudItem[];
  pendientesValidacion: number;
};

// Variación porcentual entre dos períodos. Si el período anterior fue 0, devuelve
// 100 cuando hay algo este mes (crecimiento desde cero) o 0 si tampoco hay nada.
function deltaPct(actual: number, anterior: number): number {
  if (anterior === 0) return actual > 0 ? 100 : 0;
  return Math.round(((actual - anterior) / anterior) * 100);
}

function iso(fecha: Date | null | undefined): string | null {
  return fecha ? fecha.toISOString() : null;
}

function capitalizar(s: string): string {
  return s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

const ETIQUETA_ROL: Record<string, string> = {
  estudiante: 'Estudiante',
  empresario: 'Empresario',
  admin: 'Admin',
  owner: 'Owner',
  editor: 'Editor',
  moderator: 'Moderador',
};

// Devuelve TODOS los datos del dashboard ya con forma y serializables.
export async function obtenerDashboardAdmin(): Promise<DashboardAdminData> {
  const d = await consultarDashboardAdmin();

  // ── Serie de actividad: 6 buckets mensuales (mes actual incluido) ─────────
  const buckets: Array<{ year: number; month: number } & SerieActividadPunto> = [];
  for (let i = 0; i < 6; i++) {
    const fecha = new Date(d.inicioSerie.getFullYear(), d.inicioSerie.getMonth() + i, 1);
    buckets.push({
      year: fecha.getFullYear(),
      month: fecha.getMonth(),
      mes: capitalizar(fecha.toLocaleDateString('es-CR', { month: 'short' }).replace('.', '')),
      usuarios: 0,
      proyectos: 0,
      ofertas: 0,
    });
  }
  const indiceBucket = (fecha: Date) =>
    buckets.findIndex((b) => b.year === fecha.getFullYear() && b.month === fecha.getMonth());

  for (const u of d.usuariosSerie) {
    const idx = indiceBucket(u.creado);
    if (idx >= 0) buckets[idx]!.usuarios += 1;
  }
  for (const p of d.proyectosSerie) {
    if (!p.publicado) continue;
    const idx = indiceBucket(p.publicado);
    if (idx >= 0) buckets[idx]!.proyectos += 1;
  }
  for (const o of d.ofertasSerie) {
    const idx = indiceBucket(o.enviado);
    if (idx >= 0) buckets[idx]!.ofertas += 1;
  }
  const serie: SerieActividadPunto[] = buckets.map((b) => ({
    mes: b.mes,
    usuarios: b.usuarios,
    proyectos: b.proyectos,
    ofertas: b.ofertas,
  }));

  // ── Aprobaciones (proyectos pendientes de revisión) ───────────────────────
  const aprobaciones: AprobacionItem[] = d.aprobaciones.map((p) => ({
    id: p.id,
    titulo: p.titulo,
    empresario: p.perfiles_empresario?.usuarios?.nombre ?? '—',
    area: p.area_negocio,
    estado: p.estado,
    motivo: p.motivo_estado,
    ofertas: p._count.ofertas,
  }));

  // ── Feed de actividad reciente (mezcla de eventos) ────────────────────────
  type Evento = { id: string; tipo: ActividadItem['tipo']; texto: string; detalle: string | null; fecha: Date };
  const eventos: Evento[] = [];

  for (const u of d.usuariosRecientes) {
    eventos.push({
      id: `u-${u.id}`,
      tipo: 'usuario',
      texto: `Nuevo registro: ${u.nombre}`,
      detalle: ETIQUETA_ROL[u.roles.nombre] ?? capitalizar(u.roles.nombre),
      fecha: u.creado,
    });
  }
  for (const p of d.proyectosRecientes) {
    if (!p.publicado) continue;
    eventos.push({
      id: `p-${p.id}`,
      tipo: 'proyecto',
      texto: `Proyecto publicado: ${p.titulo}`,
      detalle: p.perfiles_empresario?.usuarios?.nombre ?? null,
      fecha: p.publicado,
    });
  }
  for (const o of d.ofertasRecientes) {
    eventos.push({
      id: `o-${o.id}`,
      tipo: 'oferta',
      texto: `Nueva oferta de ${o.perfiles_estudiante?.usuarios?.nombre ?? 'un estudiante'}`,
      detalle: o.proyectos?.titulo ?? null,
      fecha: o.enviado,
    });
  }
  for (const s of d.suspensionesRecientes) {
    eventos.push({
      id: `s-${s.id}`,
      tipo: 'suspension',
      texto: `${s.accion === 'suspender' ? 'Suspensión' : 'Reactivación'}: ${s.usuarios?.nombre ?? 'una cuenta'}`,
      detalle: `por ${s.nombre_admin}`,
      fecha: s.creado,
    });
  }

  const actividad: ActividadItem[] = eventos
    .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
    .slice(0, 6)
    .map((e) => ({
      id: e.id,
      tipo: e.tipo,
      texto: e.texto,
      detalle: e.detalle,
      fecha: e.fecha.toISOString(),
      relativo: tiempoRelativo(e.fecha),
    }));

  // ── Proyectos recientes (sección lateral) ─────────────────────────────────
  const proyectosRecientes: ProyectoRecienteItem[] = d.proyectosRecientes.map((p) => ({
    id: p.id,
    titulo: p.titulo,
    empresario: p.perfiles_empresario?.usuarios?.nombre ?? '—',
    area: p.area_negocio,
    ofertas: p._count.ofertas,
    publicado: iso(p.publicado),
    relativo: tiempoRelativo(p.publicado),
  }));

  // ── Invitaciones y solicitudes ────────────────────────────────────────────
  const invitaciones: InvitacionItem[] = d.invitaciones.map((v) => ({
    id: v.id,
    email: v.email,
    rol: v.rol,
    solicitado: v.solicitado.toISOString(),
    relativo: tiempoRelativo(v.solicitado),
  }));
  const solicitudes: SolicitudItem[] = d.solicitudes.map((v) => ({
    id: v.id,
    email: v.email,
    solicitado: v.solicitado.toISOString(),
    relativo: tiempoRelativo(v.solicitado),
  }));

  return {
    kpis: {
      proyectosTotal: d.proyectosPublicadosTotal,
      proyectosDeltaPct: deltaPct(d.proyectosPubMes, d.proyectosPubMesPasado),
      usuariosActivos: d.usuariosActivos,
      usuariosDeltaPct: deltaPct(d.usuariosNuevosMes, d.usuariosNuevosMesPasado),
      proyectosNuevosMes: d.proyectosPubMes,
      ofertasPendientes: d.ofertasPendientes,
      estudiantesOfertaPendiente: d.estudiantesOfertaPendiente,
    },
    serie,
    aprobaciones,
    actividad,
    proyectosRecientes,
    invitaciones,
    solicitudes,
    pendientesValidacion: d.usuariosPendientes + solicitudes.length,
  };
}
