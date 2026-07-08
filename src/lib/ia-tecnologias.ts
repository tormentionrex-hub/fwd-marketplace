import 'server-only';
import { llamarIA, MODELOS_RECOMENDADOR } from '@/lib/ia-fallback';

// Búsqueda y validación de tecnologías vía OpenRouter, restringida ESTRICTAMENTE
// al dominio de la programación/tecnología. El LLM actúa como un "diccionario"
// de lenguajes, frameworks, librerías, bases de datos, herramientas, plataformas,
// paradigmas y conceptos de software. Cualquier término que no sea de ese dominio
// (personajes, comida, deportes, etc.) devuelve lista vacía.

const SYSTEM_BUSCAR = `Sos un normalizador de tecnologías para un marketplace de talento tech.
Recibís un término de búsqueda escrito por un estudiante y devolvés tecnologías REALES
del mundo de la programación y el software cuyo nombre empiece o se relacione con ese término.

Dominio PERMITIDO (y SOLO este): lenguajes de programación, frameworks, librerías,
runtimes, bases de datos, ORMs, herramientas de build/devops, plataformas cloud,
sistemas operativos, protocolos, formatos, paradigmas, metodologías y conceptos de
ingeniería de software, diseño de producto/UX y ciencia de datos/IA.

REGLAS DURAS:
- Si el término NO pertenece a ese dominio (ej: "Goku", "pizza", "fútbol", nombres de
  personas, animales, lugares, marcas no-tecnológicas), devolvé exactamente {"tecnologias":[]}.
- Nunca inventes tecnologías que no existan.
- Devolvé nombres canónicos y bien escritos (ej: "JavaScript", "Node.js", "PostgreSQL",
  "React Native", "Tailwind CSS", "Kubernetes").
- Máximo 8 resultados, ordenados por relevancia respecto al término.
- Respondé ÚNICAMENTE con JSON válido: {"tecnologias": ["...", "..."]}. Sin texto extra.`;

const SYSTEM_VALIDAR = `Sos un clasificador binario. Decidís si un término es el nombre de
una tecnología REAL del mundo de la programación/software (lenguaje, framework, librería,
base de datos, herramienta, plataforma, paradigma o concepto de ingeniería de software,
UX o ciencia de datos/IA).
Respondé ÚNICAMENTE con JSON: {"valida": true, "nombre": "<nombre canónico>"} si lo es,
o {"valida": false} si NO pertenece a ese dominio (personajes, comida, deportes, personas, etc.).`;

// Extrae el primer objeto JSON de la respuesta del LLM (tolerante a fences ```json).
function extraerJson(texto: string): unknown {
  const limpio = texto.replace(/```json/gi, '').replace(/```/g, '').trim();
  const ini = limpio.indexOf('{');
  const fin = limpio.lastIndexOf('}');
  if (ini === -1 || fin === -1 || fin < ini) return null;
  try {
    return JSON.parse(limpio.slice(ini, fin + 1));
  } catch {
    return null;
  }
}

/**
 * Devuelve tecnologías reales relacionadas con `query`. Vacío si el término no es
 * del dominio de programación/tecnología o si la IA no está disponible.
 */
export async function buscarTecnologias(query: string): Promise<string[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  try {
    const texto = await llamarIA(
      [
        { role: 'system', content: SYSTEM_BUSCAR },
        { role: 'user', content: `Término: "${q}"` },
      ],
      { temperature: 0, max_tokens: 200, response_format: { type: 'json_object' } },
      MODELOS_RECOMENDADOR,
      9000,
    );
    const data = extraerJson(texto) as { tecnologias?: unknown } | null;
    if (!data || !Array.isArray(data.tecnologias)) return [];
    return data.tecnologias
      .filter((t): t is string => typeof t === 'string')
      .map((t) => t.trim())
      .filter((t) => t.length > 0 && t.length <= 80)
      .slice(0, 8);
  } catch {
    // La IA es un extra: si falla, el buscador local sigue funcionando.
    return [];
  }
}

/**
 * Valida un nombre puntual y devuelve su forma canónica si es una tecnología real.
 * `null` si no pertenece al dominio de programación/tecnología.
 */
export async function validarTecnologia(nombre: string): Promise<string | null> {
  const n = nombre.trim();
  if (n.length < 1 || n.length > 80) return null;

  try {
    const texto = await llamarIA(
      [
        { role: 'system', content: SYSTEM_VALIDAR },
        { role: 'user', content: `Término: "${n}"` },
      ],
      { temperature: 0, max_tokens: 60, response_format: { type: 'json_object' } },
      MODELOS_RECOMENDADOR,
      9000,
    );
    const data = extraerJson(texto) as { valida?: unknown; nombre?: unknown } | null;
    if (!data || data.valida !== true) return null;
    const canonico = typeof data.nombre === 'string' && data.nombre.trim() ? data.nombre.trim() : n;
    return canonico.slice(0, 80);
  } catch {
    return null;
  }
}
