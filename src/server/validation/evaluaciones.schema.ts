import { z } from 'zod';

export const calificarEmpresaSchema = z.object({
  puntuacion: z.number().int().min(1).max(5),
  comentario: z
    .string()
    .trim()
    .min(10, 'El comentario debe tener al menos 10 caracteres')
    .max(500),
});

export const calificarEstudianteSchema = z.object({
  puntuacion: z.number().int().min(1).max(5),
  comentario: z.string().trim().max(500).nullable().optional(),
});

export type CalificarEmpresaInput = z.infer<typeof calificarEmpresaSchema>;
export type CalificarEstudianteInput = z.infer<typeof calificarEstudianteSchema>;
