import { z } from "zod";

// LOGIN — NO transformamos el correo: la búsqueda en DB es exacta
// (findUnique por `correo`, case-sensitive), así que normalizarlo (lowercase)
// podría impedir el login de cuentas ya existentes. Solo exigimos presencia.
export const loginSchema = z.object({
  email: z
    .string()
    .min(5, "Ingresá un correo electrónico válido")
    .max(254, "Correo demasiado largo")
    .email("Ingresá un correo electrónico válido"),
  password: z.string().min(1, "Faltan credenciales").max(128),
});
export type LoginInput = z.infer<typeof loginSchema>;

// Letras (incluye acentos/ñ), espacios, apóstrofes y guiones. Para nombres.
const NAME_REGEX = /^[\p{L}\s'’\-]+$/u;
const NAME_ERROR = "Solo se permiten letras, espacios y guiones";

// REGISTRO (empresario y estudiante comparten shape) — validamos presencia y
// formato del correo SIN alterar su valor (sin lowercase), para no desalinear
// con el login. El nombre se arma con los campos ya recortados.
export const registerSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "Mínimo 2 caracteres")
    .max(50, "Máximo 50 caracteres")
    .regex(NAME_REGEX, NAME_ERROR),
  lastName: z
    .string()
    .trim()
    .min(2, "Mínimo 2 caracteres")
    .max(50, "Máximo 50 caracteres")
    .regex(NAME_REGEX, NAME_ERROR),
  secondLastName: z
    .string()
    .trim()
    .max(50, "Máximo 50 caracteres")
    .regex(NAME_REGEX, NAME_ERROR)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  generationFwd: z.coerce
    .number({ invalid_type_error: "Debe ser un número" })
    .int("Debe ser un número entero")
    .min(1, "Mínimo 1")
    .max(50, "Máximo 50")
    .optional(),
  identificationNumber: z
    .string()
    .trim()
    .min(8, "Mínimo 8 caracteres")
    .max(20, "Máximo 20 caracteres")
    .regex(/^[A-Za-z0-9\-]+$/, "Solo letras, números y guiones")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  companyName: z
    .string()
    .trim()
    .min(2, "Mínimo 2 caracteres")
    .max(200, "Máximo 200 caracteres")
    .optional()
    .or(z.literal("").transform(() => undefined)),

  age: z.coerce
    .number({ invalid_type_error: "Debe ser un número" })
    .int("Debe ser un número entero")
    .min(18, "Mínimo 18")
    .max(99, "Máximo 99")
    .optional(),
  // ── Datos del estudiante (opcionales a nivel server: el empresario comparte
  // este schema y no los envía; el formulario de estudiante sí los exige). ──
  phone: z
    .string()
    .trim()
    .regex(/^[0-9()+\-\s]{8,20}$/, "Teléfono inválido")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  moduloCompletado: z
    .enum(["Backend", "Frontend", "Full Stack"])
    .optional()
    .or(z.literal("").transform(() => undefined)),
  sede: z
    .enum(["Puntarenas", "San José"])
    .optional()
    .or(z.literal("").transform(() => undefined)),
  provincia: z
    .string()
    .trim()
    .max(100, "Máximo 100 caracteres")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  canton: z
    .string()
    .trim()
    .max(100, "Máximo 100 caracteres")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  distrito: z
    .string()
    .trim()
    .max(100, "Máximo 100 caracteres")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  email: z
    .string()
    .min(5, "Ingresá un correo electrónico válido")
    .max(254, "Correo demasiado largo")
    .email("Ingresá un correo electrónico válido"),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .max(128, "Máximo 128 caracteres")
    .regex(/[A-Z]/, "Debe incluir al menos una mayúscula")
    .regex(/[a-z]/, "Debe incluir al menos una minúscula")
    .regex(/[0-9]/, "Debe incluir al menos un número")
    .regex(/[^A-Za-z0-9]/, "Debe incluir al menos un carácter especial"),
  role: z.enum(["estudiante", "empresario"]).optional(),
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
