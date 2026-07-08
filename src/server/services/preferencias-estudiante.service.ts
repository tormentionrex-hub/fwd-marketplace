import 'server-only';
import {
  MODALIDADES,
  DEFAULT_EMPLEABILIDAD,
  DEFAULT_NOTIF,
  DEFAULT_PRIV,
  DEFAULT_CONEXIONES,
  type Modalidad,
  type Empleabilidad,
  type NotifPrefs,
  type PrivPrefs,
  type Conexiones,
} from '@/lib/empleabilidad';
import {
  leerPreferenciasEstudiante,
  escribirPreferenciasEstudiante,
} from '@/server/repositories/usuario.repository';

// Preferencias de empleabilidad del estudiante. Se guardan en el JSON
// perfiles_estudiante.preferencias bajo la clave `empleabilidad` (dejando espacio
// para `notif` y `priv` en fases futuras). Alimentará el matching más adelante.
// El tipo Empleabilidad y los catálogos viven en @/lib/empleabilidad (compartido).

function strArr(v: unknown, max = 40): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === 'string' && x.trim().length > 0).map((s) => s.slice(0, 80)).slice(0, max);
}
function numOrNull(v: unknown, min = 0, max = 100_000_000): number | null {
  if (typeof v !== 'number' || !Number.isFinite(v)) return null;
  return Math.min(max, Math.max(min, Math.round(v)));
}

// Normaliza un objeto (venga del cliente o de la DB) a un Empleabilidad válido.
export function normalizarEmpleabilidad(entrada: unknown): Empleabilidad {
  if (!entrada || typeof entrada !== 'object' || Array.isArray(entrada)) return { ...DEFAULT_EMPLEABILIDAD };
  const e = entrada as Record<string, unknown>;
  return {
    areas: strArr(e.areas),
    tecnologias: strArr(e.tecnologias),
    modalidad: MODALIDADES.includes(e.modalidad as Modalidad) ? (e.modalidad as Modalidad) : 'indistinto',
    disponibilidadHoras: numOrNull(e.disponibilidadHoras, 1, 168),
    fechaInicio: typeof e.fechaInicio === 'string' && e.fechaInicio.length <= 30 ? e.fechaInicio : null,
    tipoProyecto: strArr(e.tipoProyecto),
    pagoMin: numOrNull(e.pagoMin),
    pagoMax: numOrNull(e.pagoMax),
    pagoMoneda: e.pagoMoneda === 'USD' ? 'USD' : 'CRC',
  };
}

// Extrae empleabilidad del JSON crudo de preferencias.
function empleabilidadDesdeRaw(raw: unknown): Empleabilidad {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ...DEFAULT_EMPLEABILIDAD };
  return normalizarEmpleabilidad((raw as Record<string, unknown>).empleabilidad);
}

export async function cargarEmpleabilidad(idUsuario: string): Promise<Empleabilidad> {
  const raw = await leerPreferenciasEstudiante(idUsuario);
  return empleabilidadDesdeRaw(raw);
}

// Guarda la empleabilidad preservando otras claves del JSON (notif/priv).
export async function guardarEmpleabilidad(idUsuario: string, entrada: unknown): Promise<Empleabilidad> {
  const raw = await leerPreferenciasEstudiante(idUsuario);
  const base = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const empleabilidad = normalizarEmpleabilidad(entrada);
  await escribirPreferenciasEstudiante(idUsuario, { ...base, empleabilidad });
  return empleabilidad;
}

// ── Notificaciones y Privacidad (Fase 2) ──

function soloBooleanos<T extends object>(entrada: unknown, defaults: T): T {
  const out = { ...defaults };
  if (entrada && typeof entrada === 'object' && !Array.isArray(entrada)) {
    const e = entrada as Record<string, unknown>;
    for (const k of Object.keys(defaults as object)) {
      if (typeof e[k] === 'boolean') (out as Record<string, unknown>)[k] = e[k];
    }
  }
  return out;
}

function seccionDesdeRaw<T extends object>(raw: unknown, clave: string, defaults: T): T {
  const r = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  return soloBooleanos(r[clave], defaults);
}

// Igual que soloBooleanos pero para strings (trim + límite de longitud).
function soloStrings<T extends object>(entrada: unknown, defaults: T): T {
  const out = { ...defaults };
  if (entrada && typeof entrada === 'object' && !Array.isArray(entrada)) {
    const e = entrada as Record<string, unknown>;
    for (const k of Object.keys(defaults as object)) {
      if (typeof e[k] === 'string') (out as Record<string, unknown>)[k] = (e[k] as string).trim().slice(0, 200);
    }
  }
  return out;
}

function conexionesDesdeRaw(raw: unknown): Conexiones {
  const r = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  return soloStrings(r['conexiones'], DEFAULT_CONEXIONES);
}

export interface PreferenciasEstudiante {
  empleabilidad: Empleabilidad;
  notif: NotifPrefs;
  priv: PrivPrefs;
  conexiones: Conexiones;
}

// Parsea el JSON crudo de preferencias (SIN tocar la DB). Reutilizable para
// procesar muchos estudiantes en lote (p. ej. matching al publicar un proyecto)
// sin hacer una query por cada uno.
export function parsearPreferencias(raw: unknown): PreferenciasEstudiante {
  return {
    empleabilidad: empleabilidadDesdeRaw(raw),
    notif: seccionDesdeRaw(raw, 'notif', DEFAULT_NOTIF),
    priv: seccionDesdeRaw(raw, 'priv', DEFAULT_PRIV),
    conexiones: conexionesDesdeRaw(raw),
  };
}

export async function cargarPreferencias(idUsuario: string): Promise<PreferenciasEstudiante> {
  const raw = await leerPreferenciasEstudiante(idUsuario);
  return parsearPreferencias(raw);
}

export async function guardarNotif(idUsuario: string, entrada: unknown): Promise<NotifPrefs> {
  const raw = await leerPreferenciasEstudiante(idUsuario);
  const base = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const notif = soloBooleanos(entrada, DEFAULT_NOTIF);
  await escribirPreferenciasEstudiante(idUsuario, { ...base, notif });
  return notif;
}

export async function guardarPriv(idUsuario: string, entrada: unknown): Promise<PrivPrefs> {
  const raw = await leerPreferenciasEstudiante(idUsuario);
  const base = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const priv = soloBooleanos(entrada, DEFAULT_PRIV);
  await escribirPreferenciasEstudiante(idUsuario, { ...base, priv });
  return priv;
}

export async function guardarConexiones(idUsuario: string, entrada: unknown): Promise<Conexiones> {
  const raw = await leerPreferenciasEstudiante(idUsuario);
  const base = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const conexiones = soloStrings(entrada, DEFAULT_CONEXIONES);
  await escribirPreferenciasEstudiante(idUsuario, { ...base, conexiones });
  return conexiones;
}
