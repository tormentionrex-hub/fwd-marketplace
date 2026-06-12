import "server-only";
import { randomInt } from "crypto";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { firmarResetToken, verificarResetToken } from "@/server/auth/reset-token";
import {
  buscarUsuarioPorCorreo,
  buscarUsuarioPorId,
  actualizarHashContrasena,
} from "@/server/repositories/usuario.repository";
import * as repo from "@/server/repositories/password-reset.repository";
import { enviarCodigoOtp, enviarConfirmacionCambio } from "./email.service";

const OTP_TTL_MIN = 15;
const MAX_INTENTOS = 5;

/** Política de contraseña (también validada en el cliente). */
export function esPasswordValida(p: string): boolean {
  return (
    p.length >= 8 &&
    /[A-Z]/.test(p) &&
    /[a-z]/.test(p) &&
    /[0-9]/.test(p) &&
    /[^A-Za-z0-9]/.test(p)
  );
}

// ---- Paso 1: solicitar código ----
// Resultado de la solicitud de recuperación.
//   existe       → si hay una cuenta con ese correo (si es false, no se envió nada).
//   ultimaSesion → fecha del último login de esa cuenta (null si nunca inició sesión).
// Nota: revelar la existencia del correo es por requerimiento explícito del
// producto; tiene el trade-off de permitir enumeración de correos registrados.
export interface ResultadoSolicitud {
  existe: boolean;
  ultimaSesion: Date | null;
}

export async function solicitarRecuperacion(correo: string): Promise<ResultadoSolicitud> {
  const usuario = await buscarUsuarioPorCorreo(correo);
  if (!usuario) {
    console.warn("[seguridad] solicitud de recuperación para correo no registrado");
    return { existe: false, ultimaSesion: null };
  }

  await repo.invalidarResetsDeUsuario(usuario.id);

  const otp = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const expira = new Date(Date.now() + OTP_TTL_MIN * 60_000);
  await repo.crearReset({ idUsuario: usuario.id, codigoHash: hashPassword(otp), expira });

  await enviarCodigoOtp(usuario.correo, otp);
  console.info("[seguridad] OTP de recuperación emitido");
  return { existe: true, ultimaSesion: usuario.ultima_sesion ?? null };
}

// ---- Paso 2: verificar código ----
export interface ResultadoVerificacion {
  ok: boolean;
  error?: string;
  resetToken?: string;
}

export async function verificarCodigo(
  correo: string,
  codigo: string,
): Promise<ResultadoVerificacion> {
  const usuario = await buscarUsuarioPorCorreo(correo);
  if (!usuario) return { ok: false, error: "Código inválido o expirado." };

  const reset = await repo.buscarResetVigentePorUsuario(usuario.id);
  if (!reset) return { ok: false, error: "Código inválido o expirado." };

  if (reset.expira.getTime() < Date.now()) {
    await repo.marcarUsado(reset.id);
    return { ok: false, error: "El código expiró. Solicitá uno nuevo." };
  }
  if (reset.intentos >= MAX_INTENTOS) {
    await repo.marcarUsado(reset.id);
    return { ok: false, error: "Demasiados intentos. Solicitá un código nuevo." };
  }

  await repo.incrementarIntentos(reset.id);

  if (!verifyPassword(codigo, reset.codigo_hash)) {
    console.warn("[seguridad] OTP incorrecto");
    return { ok: false, error: "Código incorrecto." };
  }

  await repo.marcarVerificado(reset.id);
  return { ok: true, resetToken: firmarResetToken(reset.id) };
}

// ---- Paso 3: cambiar contraseña ----
export interface ResultadoCambio {
  ok: boolean;
  error?: string;
}

export async function cambiarPassword(
  resetToken: string,
  password: string,
): Promise<ResultadoCambio> {
  const id = verificarResetToken(resetToken);
  if (!id) return { ok: false, error: "Sesión de recuperación inválida." };

  const reset = await repo.buscarResetPorId(id);
  if (!reset || reset.usado || !reset.verificado) {
    return { ok: false, error: "Sesión de recuperación inválida." };
  }
  if (reset.expira.getTime() < Date.now()) {
    return { ok: false, error: "La sesión expiró. Reiniciá el proceso." };
  }
  if (!esPasswordValida(password)) {
    return { ok: false, error: "La contraseña no cumple los requisitos de seguridad." };
  }

  const actualizado = await actualizarHashContrasena(reset.id_usuario, hashPassword(password));
  await repo.marcarUsado(reset.id);
  await repo.invalidarResetsDeUsuario(reset.id_usuario);

  // Correo de confirmación con fecha/hora en zona Costa Rica.
  const usuario = actualizado ?? (await buscarUsuarioPorId(reset.id_usuario));
  const fechaHora = new Date().toLocaleString("es-CR", {
    timeZone: "America/Costa_Rica",
    dateStyle: "long",
    timeStyle: "short",
  });
  if (usuario?.correo) {
    await enviarConfirmacionCambio(usuario.correo, fechaHora);
  }
  console.info("[seguridad] contraseña cambiada vía recuperación");

  return { ok: true };
}
