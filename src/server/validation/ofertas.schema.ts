import { z } from "zod";

// Validación de entrada para los endpoints de ofertas.

// URL opcional: acepta un URL válido, cadena vacía o null/ausente. El frontend
// ya valida el formato con `new URL()` y manda null cuando no hay prototipo/doc;
// aceptar '' / null evita rechazar flujos legítimos. Se normaliza a null en el route.
const urlOpcional = z
  .union([
    z.string().trim().url("La URL no tiene un formato válido (debe incluir https://)"),
    z.literal(""),
    z.null(),
  ])
  .optional();

// POST /api/ofertas — el estudiante envía una oferta.
// `propuesta` se recorta y se valida no-vacía (equivale al `!propuesta?.trim()` previo).
export const crearOfertaSchema = z.object({
  idProyecto: z.string().min(1, "Faltan datos obligatorios: idProyecto y propuesta"),
  propuesta: z
    .string()
    .transform((s) => s.trim())
    .refine((s) => s.length > 0, {
      message: "Faltan datos obligatorios: idProyecto y propuesta",
    })
    .refine((s) => s.length <= 5000, {
      message: "La propuesta es demasiado larga (máx. 5000)",
    }),
  prototipoUrl: urlOpcional,
  documentacionUrl: urlOpcional,
});

export type CrearOfertaInput = z.infer<typeof crearOfertaSchema>;
