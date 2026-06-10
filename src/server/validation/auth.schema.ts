import { z } from "zod";

// LOGIN — NO transformamos el correo: la búsqueda en DB es exacta
// (findUnique por `correo`, case-sensitive), así que normalizarlo (lowercase)
// podría impedir el login de cuentas ya existentes. Solo exigimos presencia.
export const loginSchema = z.object({
  email: z.string().min(1, "Faltan credenciales"),
  password: z.string().min(1, "Faltan credenciales"),
});
export type LoginInput = z.infer<typeof loginSchema>;

// REGISTRO (empresario y estudiante comparten shape) — validamos presencia y
// formato del correo SIN alterar su valor (sin lowercase), para no desalinear
// con el login. El nombre se arma con los campos ya recortados.
export const registerSchema = z.object({
  firstName: z.string().trim().min(1, "Faltan datos obligatorios"),
  lastName: z.string().trim().min(1, "Faltan datos obligatorios"),
  email: z
    .string()
    .min(1, "Faltan datos obligatorios")
    .email("Ingresá un correo electrónico válido"),
  password: z.string().min(1, "Faltan datos obligatorios"),
});
export type RegisterInput = z.infer<typeof registerSchema>;

// VERIFICAR INVITACIÓN — mantiene la normalización existente (trim + lowercase),
// coherente con cómo admin/invitar guarda el email en pending_verifications.
export const verificarInvitacionSchema = z.object({
  email: z
    .string()
    .transform((s) => s.trim().toLowerCase())
    .pipe(z.string().email("Ingresá un correo electrónico válido")),
});
export type VerificarInvitacionInput = z.infer<typeof verificarInvitacionSchema>;
