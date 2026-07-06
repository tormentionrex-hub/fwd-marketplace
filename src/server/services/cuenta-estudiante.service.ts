import 'server-only';
import {
  buscarUsuarioPorCorreo,
  actualizarNombreUsuario,
  actualizarCorreoUsuario,
  actualizarTelefonoEstudiante,
  cambiarEstadoUsuario,
  eliminarUsuario,
  cargarDatosCuentaEstudiante,
  cargarExportEstudiante,
  obtenerHashContrasena,
  actualizarHashContrasena,
} from '@/server/repositories/usuario.repository';
import { listarEvaluacionesRecibidas } from '@/server/repositories/perfil-estudiante.repository';
import { verifyPassword, hashPassword } from '@/server/auth/password';

// Lógica del apartado Configuración > Cuenta del estudiante.

export interface CuentaEstudiante {
  nombre: string;
  correo: string;
  telefono: string | null;
  reputacion: number;
}

export async function cargarCuentaEstudiante(id: string): Promise<CuentaEstudiante | null> {
  const u = await cargarDatosCuentaEstudiante(id);
  if (!u) return null;
  return {
    nombre: u.nombre,
    correo: u.correo,
    telefono: u.perfiles_estudiante?.telefono ?? null,
    reputacion: u.perfiles_estudiante?.reputacion ?? 0,
  };
}

const NAME_RE = /^[\p{L}\s'’\-]{2,80}$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9()+\-\s]{8,20}$/;

export type ResultadoActualizarCuenta = 'ok' | 'invalido' | 'correo_en_uso';

export async function actualizarNombre(id: string, nombre: string): Promise<ResultadoActualizarCuenta> {
  const v = nombre.trim();
  if (!NAME_RE.test(v)) return 'invalido';
  await actualizarNombreUsuario(id, v);
  return 'ok';
}

export async function actualizarCorreo(id: string, correo: string): Promise<ResultadoActualizarCuenta> {
  const v = correo.trim();
  if (!EMAIL_RE.test(v) || v.length > 254) return 'invalido';
  const existente = await buscarUsuarioPorCorreo(v);
  if (existente && existente.id !== id) return 'correo_en_uso';
  await actualizarCorreoUsuario(id, v);
  return 'ok';
}

export async function actualizarTelefono(id: string, telefono: string): Promise<ResultadoActualizarCuenta> {
  const v = telefono.trim();
  if (v && !PHONE_RE.test(v)) return 'invalido';
  await actualizarTelefonoEstudiante(id, v || null);
  return 'ok';
}

export type ResultadoContrasena = 'ok' | 'incorrecta' | 'invalida';

export async function cambiarContrasena(id: string, actual: string, nueva: string): Promise<ResultadoContrasena> {
  if (nueva.length < 8) return 'invalida';
  const hash = await obtenerHashContrasena(id);
  if (!hash || !verifyPassword(actual, hash)) return 'incorrecta';
  await actualizarHashContrasena(id, hashPassword(nueva));
  return 'ok';
}

export async function deshabilitarCuenta(id: string): Promise<void> {
  await cambiarEstadoUsuario(id, 'inactivo');
}

export async function eliminarCuenta(id: string): Promise<void> {
  await eliminarUsuario(id);
}

// ── Reputación: evaluaciones recibidas ──
export interface EvaluacionRecibida {
  id: string;
  puntuacion: number;
  comentario: string | null;
  creado: string;
  proyecto: string | null;
  empresa: string;
}

export async function listarEvaluaciones(id: string): Promise<EvaluacionRecibida[]> {
  const rows = await listarEvaluacionesRecibidas(id);
  return rows.map((r) => ({
    id: r.id,
    puntuacion: r.puntuacion,
    comentario: r.comentario,
    creado: r.creado.toISOString(),
    proyecto: r.proyectos?.titulo ?? null,
    empresa: r.perfiles_empresario?.nombre_empresa ?? r.perfiles_empresario?.usuarios?.nombre ?? 'Empresa',
  }));
}

// ── Export de datos (Ley 8968) ──
export async function exportarDatosEstudiante(id: string): Promise<object | null> {
  const u = await cargarExportEstudiante(id);
  if (!u) return null;
  const p = u.perfiles_estudiante;
  return {
    cuenta: {
      nombre: u.nombre,
      segundoApellido: u.segundo_apellido,
      correo: u.correo,
      edad: u.edad,
      creado: u.creado.toISOString(),
    },
    perfil: p
      ? {
          tituloProfesional: p.titulo_profesional,
          descripcion: p.descripcion,
          generacionFwd: p.generacion_fwd,
          telefono: p.telefono,
          moduloCompletado: p.modulo_completado,
          sede: p.sede,
          provincia: p.provincia,
          canton: p.canton,
          distrito: p.distrito,
          reputacion: p.reputacion,
        }
      : null,
    preferencias: p?.preferencias ?? null,
  };
}
