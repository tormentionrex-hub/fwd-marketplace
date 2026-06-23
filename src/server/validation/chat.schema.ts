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

export type EnviarMensajeInput = z.infer<typeof enviarMensajeSchema>;
export type CrearChatInput = z.infer<typeof crearChatSchema>;
