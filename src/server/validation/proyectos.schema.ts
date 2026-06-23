import { z } from "zod";

// Validación de entrada para los endpoints de proyectos.
// Vive bajo src/server/ para que el cliente nunca importe zod.

// POST /api/proyectos — Body para crear un proyecto nuevo (queda en borrador).
export const crearProyectoSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(200, "El título no puede superar 200 caracteres"),
  descripcion: z
    .string()
    .trim()
    .min(20, "La descripción debe tener al menos 20 caracteres")
    .max(5000, "La descripción no puede superar 5000 caracteres"),
  areaNegocio: z.string().trim().max(100).optional().nullable(),
  plazoDias: z.coerce
    .number()
    .int("El plazo debe ser un número entero de días")
    .positive("El plazo debe ser positivo")
    .max(365, "El plazo no puede superar 365 días")
    .optional()
    .nullable(),
  tecnologias: z.array(z.string().trim().min(1).max(80)).max(20).optional().default([]),
  imagenes: z.array(z.string().url()).max(5).optional().default([]),
});

export type CrearProyectoInput = z.infer<typeof crearProyectoSchema>;

// PATCH /api/proyectos/[id] — Todos los campos son opcionales; solo se actualizan los enviados.
export const actualizarProyectoSchema = z.object({
  titulo: z.string().trim().min(3).max(200).optional(),
  descripcion: z.string().trim().min(20).max(5000).optional(),
  areaNegocio: z.string().trim().max(100).optional().nullable(),
  plazoDias: z.coerce.number().int().positive().max(365).optional().nullable(),
  tecnologias: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
  imagenes: z.array(z.string().url()).max(5).optional(),
});

export type ActualizarProyectoInput = z.infer<typeof actualizarProyectoSchema>;

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

// POST /api/proyectos/preguntas-ia — Brief libre, devuelve preguntas de seguimiento generadas por IA.
export const preguntasIaSchema = z.object({
  brief: z
    .string()
    .trim()
    .min(10, 'El brief debe tener al menos 10 caracteres')
    .max(2000, 'El brief no puede superar 2000 caracteres'),
});

export type PreguntasIaInput = z.infer<typeof preguntasIaSchema>;

// POST /api/proyectos/generar-ia — Brief + respuestas opcionales de preguntas guiadas.
export const generarProyectoIaSchema = z.object({
  brief: z
    .string()
    .trim()
    .min(10, 'El brief debe tener al menos 10 caracteres')
    .max(2000, 'El brief no puede superar 2000 caracteres'),
  contexto: z
    .array(
      z.object({
        pregunta: z.string().max(500),
        respuestas: z.array(z.string().max(300)).max(10),
      }),
    )
    .max(10)
    .optional(),
});

export type GenerarProyectoIaInput = z.infer<typeof generarProyectoIaSchema>;

// POST /api/proyectos/chat-ia — Historial del chat con el agente conversacional.
export const chatProyectoIaSchema = z.object({
  historial: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(5000),
      }),
    )
    .min(2)
    .max(24),
  turnoUsuario: z.number().int().min(1).max(15),
});

export type ChatProyectoIaInput = z.infer<typeof chatProyectoIaSchema>;
