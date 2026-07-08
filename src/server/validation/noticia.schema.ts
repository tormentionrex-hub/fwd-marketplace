import { z } from 'zod';

// Categorías del foro de noticias. Se muestran como filtros/etiquetas.
export const CATEGORIAS_NOTICIA = [
  'Inteligencia Artificial',
  'Desarrollo Web',
  'Ciberseguridad',
  'Móvil',
  'Datos y Cloud',
  'Hardware',
  'Startups',
  'Diseño y UX',
  'Marketing Digital',
  'Otro',
] as const;

const urlOpcional = z
  .string()
  .trim()
  .url('URL inválida')
  .max(2000)
  .optional()
  .or(z.literal('').transform(() => undefined));

// Crear una noticia. Solo el título es obligatorio; el resto es opcional pero
// debe haber al menos algo de contenido además del título (texto o enlace o media).
export const crearNoticiaSchema = z
  .object({
    titulo: z.string().trim().min(4, 'El título es muy corto').max(300, 'El título es muy largo'),
    texto: z.string().trim().max(5000, 'El texto es muy largo').optional().or(z.literal('').transform(() => undefined)),
    enlaceUrl: urlOpcional,
    imagenUrl: urlOpcional,
    videoUrl: urlOpcional,
    categoria: z.enum(CATEGORIAS_NOTICIA).optional(),
  })
  .refine((d) => d.texto || d.enlaceUrl || d.imagenUrl || d.videoUrl, {
    message: 'Agregá al menos un texto, un enlace, una imagen o un video',
    path: ['texto'],
  });

export const previewLinkSchema = z.object({
  url: z.string().trim().url('URL inválida').max(2000),
});

export const crearComentarioSchema = z.object({
  texto: z.string().trim().min(1, 'El comentario no puede estar vacío').max(2000, 'El comentario es muy largo'),
  idPadre: z.string().uuid('ID de comentario inválido').optional(),
});

export type CrearNoticiaInput = z.infer<typeof crearNoticiaSchema>;
export type PreviewLinkInput = z.infer<typeof previewLinkSchema>;
export type CrearComentarioInput = z.infer<typeof crearComentarioSchema>;
