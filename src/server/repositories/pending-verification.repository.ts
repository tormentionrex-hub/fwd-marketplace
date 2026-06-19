import 'server-only';
import { db } from '@/lib/db';

// ─── FLUJO A: Admin invita un email ──────────────────────────────────────────
// El admin escribe el email → se crea la fila (pending=true, id_usuario=null).
// El estudiante aún no existe en usuarios. Cuando se registre con ese email
// la fila se completa con su id_usuario y pending pasa a false.

export function crearInvitacion(email: string) {
  return db.pending_verifications.create({
    data: { email, pending: true, tipo: 'invitacion' },
  });
}

// ─── FLUJO B: Estudiante solicita acceso ─────────────────────────────────────
// El estudiante llena un form de "quiero acceder" → se crea la fila
// (pending=true, id_usuario=null, tipo='solicitud').
// El admin la ve en su panel y puede aprobarla enviándole el email de invitación.

export function crearSolicitud(email: string) {
  return db.pending_verifications.create({
    data: { email, pending: true, tipo: 'solicitud' },
  });
}

// ─── Consultas ───────────────────────────────────────────────────────────────

// Verifica si un email fue invitado Y todavía está pendiente de registro.
export function buscarInvitacionPendientePorEmail(email: string) {
  return db.pending_verifications.findUnique({
    where: { email },
  });
}

// Lista TODAS las solicitudes/invitaciones pendientes para el panel admin.
export function listarPendingVerifications() {
  return db.pending_verifications.findMany({
    where: { pending: true },
    orderBy: { solicitado: 'asc' },
  });
}

// ─── Resolución ──────────────────────────────────────────────────────────────

// Marca como resuelta y asocia el usuario que se acaba de registrar.
// Se llama justo después de crear el usuario en la BD.
export function marcarRegistrado(email: string, idUsuario: string) {
  return db.pending_verifications.update({
    where: { email },
    data: { pending: false, id_usuario: idUsuario, resuelto: new Date() },
  });
}

// Admin aprueba una solicitud que llegó sin invitación previa.
// Deja pending=false y pone el timestamp; el service luego envía el email
// de invitación para que el estudiante complete el registro.
export function aprobarSolicitud(id: string) {
  return db.pending_verifications.update({
    where: { id },
    data: { tipo: 'invitacion', resuelto: new Date() },
    select: { id: true, email: true },
  });
}

// Admin rechaza una solicitud de invitación (la borra de la BD).
export function rechazarSolicitud(id: string) {
  return db.pending_verifications.delete({
    where: { id },
    select: { id: true, email: true },
  });
}

// ─── Compatibilidad con código anterior ──────────────────────────────────────
// (el service de auth lo usaba con este nombre)
export const crearPendingVerification = crearInvitacion;
