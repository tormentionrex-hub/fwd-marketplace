import { z } from "zod";

// Validación de entrada para los endpoints de admin.

// POST /api/admin/invitar — Body: { email, rol? }. El correo se recorta y
// normaliza a minúsculas y se valida el formato. `rol` es opcional: si se envía
// debe ser uno de los roles de staff invitables; si se omite, el registro asigna
// 'estudiante' (comportamiento histórico). Mantener en sync con ROLES_INVITABLES
// (src/server/auth/roles.ts).
export const invitarSchema = z.object({
  email: z
    .string()
    .transform((s) => s.trim().toLowerCase())
    .pipe(z.string().email("Ingresá un correo electrónico válido")),
  rol: z
    .enum(["admin", "editor", "moderator", "estudiante", "empresario"])
    .optional(),
});

export type InvitarInput = z.infer<typeof invitarSchema>;

// Body con solo un id (revocar / reenviar invitación).
export const invitacionIdSchema = z.object({
  id: z.string().min(1, "Falta el id"),
});

export type InvitacionIdInput = z.infer<typeof invitacionIdSchema>;

// PATCH /api/admin/verificaciones — Body: { id } de la fila a aprobar.
export const aprobarVerificacionSchema = z.object({
  id: z.string().min(1, "Falta el id"),
});

export type AprobarVerificacionInput = z.infer<typeof aprobarVerificacionSchema>;

// ─── CRUD admin: edición de entidades (PATCH) ────────────────────────────────

// PATCH /api/admin/usuarios/:id — edición de datos básicos de un usuario.
// El estado y el rol NO se editan acá (tienen flujos propios: suspensión,
// validación). Todos los campos son opcionales (se actualiza lo que llega).
export const editarUsuarioSchema = z
  .object({
    nombre: z.string().trim().min(1, "El nombre es obligatorio").max(150).optional(),
    segundo_nombre: z.string().trim().max(150).nullable().optional(),
    segundo_apellido: z.string().trim().max(150).nullable().optional(),
    correo: z.string().trim().toLowerCase().email("Correo inválido").optional(),
    edad: z.number().int().min(0).max(120).nullable().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, "No hay cambios para guardar");

export type EditarUsuarioInput = z.infer<typeof editarUsuarioSchema>;

// PATCH /api/admin/proyectos/:id con accion 'editar' — edición de un proyecto.
export const editarProyectoSchema = z.object({
  titulo: z.string().trim().min(1, "El título es obligatorio").max(200),
  descripcion: z.string().trim().min(1, "La descripción es obligatoria"),
  area_negocio: z.string().trim().max(150).nullable().optional(),
  plazo_dias: z.number().int().positive().max(3650).nullable().optional(),
});

export type EditarProyectoInput = z.infer<typeof editarProyectoSchema>;

// PATCH /api/admin/ofertas/:id — el admin cambia el estado de una oferta.
export const editarOfertaSchema = z.object({
  estado: z.enum([
    "enviada",
    "en_revision",
    "preseleccionado",
    "aceptado",
    "rechazado",
    "cancelado",
  ]),
});

export type EditarOfertaInput = z.infer<typeof editarOfertaSchema>;
