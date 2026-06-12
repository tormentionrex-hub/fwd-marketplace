import { z } from "zod";

// Validación de entrada para los endpoints de entregables.

// POST /api/entregables — el estudiante adjudicado sube un entregable.
// `archivoUrl` siempre proviene de /api/upload/archivo (URL pública de Storage),
// por eso exigir un URL completo es seguro y no rechaza flujos legítimos.
export const crearEntregableSchema = z.object({
  idProyecto: z.string().min(1, "Faltan datos"),
  tipo: z.string().optional().nullable(),
  archivoUrl: z
    .string()
    .min(1, "Faltan datos")
    .url("La URL del archivo no es válida"),
});

export type CrearEntregableInput = z.infer<typeof crearEntregableSchema>;

// PATCH /api/entregables/[id] — el empresario aprueba o pide cambios.
// La obligatoriedad del comentario cuando accion='cambios' la sigue resolviendo
// el service (devuelve 'comentario_requerido' → 422), para no duplicar la regla.
export const gestionEntregableSchema = z.object({
  accion: z.enum(["aprobar", "cambios"], {
    errorMap: () => ({ message: "Acción inválida" }),
  }),
  comentario: z
    .string()
    .max(2000, "El comentario es demasiado largo (máx. 2000)")
    .optional()
    .nullable(),
});

export type GestionEntregableInput = z.infer<typeof gestionEntregableSchema>;
