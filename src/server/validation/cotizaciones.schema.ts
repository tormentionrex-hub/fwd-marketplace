import { z } from "zod";

// Validación de entrada para el formulario y endpoints de cotizaciones.
export const cotizacionSchema = z.object({
  nombreProyecto: z
    .string()
    .trim()
    .min(3, "El nombre del proyecto debe tener al menos 3 caracteres")
    .max(200, "El nombre del proyecto no debe superar los 200 caracteres"),
  descripcion: z.string().trim().optional().nullable(),
  duracionSemanas: z.number().min(0.1, "La duración debe ser mayor a 0"),
  horasEstimadas: z.number().min(1, "Las horas estimadas deben ser al menos 1"),
  complejidad: z.enum(["baja", "media", "alta"]),
  stack: z
    .array(z.string().trim())
    .min(1, "Selecciona al menos una tecnología o herramienta en el stack"),
  funcionalidades: z.array(
    z.object({
      nombre: z.string().trim().min(1, "Escribe el nombre de la funcionalidad o entregable"),
      horas: z.number().min(1, "Las horas estimadas de la funcionalidad deben ser al menos 1"),
    })
  ),
  tarifaBaseHora: z.number().min(1, "La tarifa base por hora debe ser mayor a 0"),
  modalidad: z.enum(["remoto", "hibrido", "presencial"]),
  iva: z.boolean(),
  moneda: z.enum(["USD", "CRC"]),
  idProyecto: z
    .union([z.string().uuid("ID de proyecto inválido"), z.literal(""), z.null()])
    .optional()
    .transform((val) => (val === "" ? null : val)),
  idPostulacion: z
    .union([z.string().uuid("ID de postulación inválido"), z.literal(""), z.null()])
    .optional()
    .transform((val) => (val === "" ? null : val)),
});

export type CotizacionInput = z.infer<typeof cotizacionSchema>;
