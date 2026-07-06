import { z } from 'zod';

export const enviarMensajeSchema = z.object({
  contenido: z.string().trim().max(2000).optional(),
  documentUrl: z.string().url('URL de documento inválida').nullable().optional(),
}).refine(
  (d) => d.contenido || d.documentUrl,
  { message: 'El mensaje debe tener contenido o un documento adjunto' },
);

export const crearChatSchema = z.object({
  idProyecto: z.string().uuid('ID de proyecto inválido').optional(),
  idEstudianteDestino: z.string().uuid('ID de estudiante inválido').optional(),
});

// Un estudiante inicia (o recupera) el chat con el empresario dueño de un proyecto.
// crear=false → solo recupera el chat existente (no lo crea): evita chats vacíos
// cuando solo se abre el modal. crear=true → create-or-get (al enviar el 1er mensaje).
export const iniciarChatSchema = z.object({
  idProyecto: z.string().uuid('ID de proyecto inválido'),
  crear: z.boolean().optional(),
});

export type EnviarMensajeInput = z.infer<typeof enviarMensajeSchema>;
export type CrearChatInput = z.infer<typeof crearChatSchema>;
export type IniciarChatInput = z.infer<typeof iniciarChatSchema>;
