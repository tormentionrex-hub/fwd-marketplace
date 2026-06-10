import { z } from "zod";

// Validación de entrada para los endpoints de admin.

// POST /api/admin/invitar — Body: { email }. Se recorta y normaliza a minúsculas
// (igual que antes) y luego se valida el formato de correo.
export const invitarSchema = z.object({
  email: z
    .string()
    .transform((s) => s.trim().toLowerCase())
    .pipe(z.string().email("Ingresá un correo electrónico válido")),
});

export type InvitarInput = z.infer<typeof invitarSchema>;

// PATCH /api/admin/verificaciones — Body: { id } de la fila a aprobar.
export const aprobarVerificacionSchema = z.object({
  id: z.string().min(1, "Falta el id"),
});

export type AprobarVerificacionInput = z.infer<typeof aprobarVerificacionSchema>;
