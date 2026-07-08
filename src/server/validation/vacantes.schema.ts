import { z } from "zod";

// Validación de entrada para los endpoints de vacantes.
// Vive bajo src/server/ para que el cliente nunca importe zod.

const modalidad = z.enum(["remoto", "presencial", "hibrido"]);
const tipoEmpleo = z.enum([
  "tiempo_completo",
  "medio_tiempo",
  "por_proyecto",
  "pasantia",
  "freelance",
]);
const nivel = z.enum(["sin_experiencia", "junior", "semi_senior", "senior"]);
const periodo = z.enum(["mensual", "por_hora", "por_proyecto"]);

// Documento adjunto: { nombre, url } (URL de Cloudinary). Máx 5 por vacante.
const documentos = z
  .array(
    z.object({
      nombre: z.string().trim().min(1).max(120),
      url: z.string().url(),
    }),
  )
  .max(5);

// POST /api/vacantes — crea una vacante nueva (queda en borrador).
export const crearVacanteSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(3, "El puesto debe tener al menos 3 caracteres")
    .max(200, "El puesto no puede superar 200 caracteres"),
  descripcion: z
    .string()
    .trim()
    .min(20, "La descripción debe tener al menos 20 caracteres")
    .max(5000, "La descripción no puede superar 5000 caracteres"),
  area: z.string().trim().max(150).optional().nullable(),
  modalidad: modalidad.optional().nullable(),
  tipoEmpleo: tipoEmpleo.optional().nullable(),
  nivelExperiencia: nivel.optional().nullable(),
  ubicacion: z.string().trim().max(200).optional().nullable(),
  salarioMin: z.coerce.number().nonnegative().max(1_000_000_000).optional().nullable(),
  salarioMax: z.coerce.number().nonnegative().max(1_000_000_000).optional().nullable(),
  salarioMoneda: z.string().trim().max(10).optional().default("CRC"),
  salarioPeriodo: periodo.optional().nullable(),
  salarioVisible: z.boolean().optional().default(true),
  responsabilidades: z.string().trim().max(5000).optional().nullable(),
  requisitos: z.string().trim().max(5000).optional().nullable(),
  beneficios: z.string().trim().max(5000).optional().nullable(),
  plazas: z.coerce.number().int().positive().max(1000).optional().default(1),
  fechaCierre: z
    .union([z.string().datetime(), z.string().length(0), z.null()])
    .optional(),
  tecnologias: z.array(z.string().trim().min(1).max(80)).max(20).optional().default([]),
  imagenes: z.array(z.string().url()).max(5).optional().default([]),
  documentos: documentos.optional().default([]),
});

export type CrearVacanteInput = z.infer<typeof crearVacanteSchema>;

// PATCH /api/vacantes/[id] — todos los campos opcionales; solo se actualiza lo enviado.
export const actualizarVacanteSchema = z.object({
  titulo: z.string().trim().min(3).max(200).optional(),
  descripcion: z.string().trim().min(20).max(5000).optional(),
  area: z.string().trim().max(150).optional().nullable(),
  modalidad: modalidad.optional().nullable(),
  tipoEmpleo: tipoEmpleo.optional().nullable(),
  nivelExperiencia: nivel.optional().nullable(),
  ubicacion: z.string().trim().max(200).optional().nullable(),
  salarioMin: z.coerce.number().nonnegative().max(1_000_000_000).optional().nullable(),
  salarioMax: z.coerce.number().nonnegative().max(1_000_000_000).optional().nullable(),
  salarioMoneda: z.string().trim().max(10).optional(),
  salarioPeriodo: periodo.optional().nullable(),
  salarioVisible: z.boolean().optional(),
  responsabilidades: z.string().trim().max(5000).optional().nullable(),
  requisitos: z.string().trim().max(5000).optional().nullable(),
  beneficios: z.string().trim().max(5000).optional().nullable(),
  plazas: z.coerce.number().int().positive().max(1000).optional(),
  fechaCierre: z
    .union([z.string().datetime(), z.string().length(0), z.null()])
    .optional(),
  tecnologias: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
  imagenes: z.array(z.string().url()).max(5).optional(),
  documentos: documentos.optional(),
});

export type ActualizarVacanteInput = z.infer<typeof actualizarVacanteSchema>;
