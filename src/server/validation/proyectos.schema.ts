import { z } from "zod";

// Validación de entrada para los endpoints de proyectos.
// Vive bajo src/server/ para que el cliente nunca importe zod.

// POST /api/proyectos/[id]/cerrar — Body: { puntuacion: 1..5, comentario? }
// `z.coerce.number()` reemplaza el `Number(body.puntuacion)` crudo: rechaza
// "Infinity", "0x10", strings no numéricos, etc., antes de tocar la DB.
export const cerrarProyectoSchema = z.object({
  puntuacion: z.coerce
    .number({ invalid_type_error: "Calificación inválida (1 a 5)" })
    .int("Calificación inválida (1 a 5)")
    .min(1, "Calificación inválida (1 a 5)")
    .max(5, "Calificación inválida (1 a 5)"),
  comentario: z
    .string()
    .max(2000, "El comentario es demasiado largo (máx. 2000)")
    .optional()
    .nullable(),
});

export type CerrarProyectoInput = z.infer<typeof cerrarProyectoSchema>;
