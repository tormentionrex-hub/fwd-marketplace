import { z } from "zod";

// Validación de entrada para los endpoints de postulaciones.

// URL opcional: acepta URL válida, cadena vacía o null/ausente. Se normaliza a null en el route.
const urlOpcional = z
  .union([
    z.string().trim().url("La URL del CV no tiene un formato válido"),
    z.literal(""),
    z.null(),
  ])
  .optional();

// POST /api/postulaciones — el estudiante se postula a una vacante.
export const crearPostulacionSchema = z.object({
  idVacante: z.string().min(1, "Falta la vacante"),
  mensaje: z
    .string()
    .transform((s) => s.trim())
    .refine((s) => s.length > 0, { message: "Escribí un mensaje de presentación" })
    .refine((s) => s.length <= 3000, {
      message: "El mensaje es demasiado largo (máx. 3000)",
    }),
  cvUrl: urlOpcional,
});

export type CrearPostulacionInput = z.infer<typeof crearPostulacionSchema>;

// PATCH /api/postulaciones/[id]/estado — el empresario cambia el estado.
export const cambiarEstadoPostulacionSchema = z.object({
  estado: z.enum(["pendiente", "en_revision", "aceptado", "rechazado"]),
});

export type CambiarEstadoPostulacionInput = z.infer<
  typeof cambiarEstadoPostulacionSchema
>;
