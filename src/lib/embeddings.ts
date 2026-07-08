import 'server-only';
import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL = 'text-embedding-004';

function cliente() {
  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!key) throw new Error('GOOGLE_GENERATIVE_AI_API_KEY no configurada');
  return new GoogleGenerativeAI(key);
}

/**
 * Genera un embedding de 768 dimensiones para el texto dado.
 * Devuelve null si la API falla (para no bloquear el flujo principal).
 */
export async function generarEmbedding(texto: string): Promise<number[] | null> {
  try {
    const model = cliente().getGenerativeModel({ model: MODEL });
    const result = await model.embedContent(texto.slice(0, 8000));
    return result.embedding.values;
  } catch (err) {
    console.error('[embeddings] Error generando embedding:', err);
    return null;
  }
}

/**
 * Construye el texto que se va a embeber a partir de los campos del proyecto.
 * Cuanto más rico el texto, mejores los resultados semánticos.
 */
export function textoParaEmbedding(p: {
  titulo: string;
  descripcion: string;
  areaNegocio: string | null;
  tecnologias: string[];
}): string {
  const partes = [p.titulo, p.descripcion];
  if (p.areaNegocio) partes.push(`Área: ${p.areaNegocio}`);
  if (p.tecnologias.length > 0) partes.push(`Tecnologías: ${p.tecnologias.join(', ')}`);
  return partes.join('\n\n');
}
