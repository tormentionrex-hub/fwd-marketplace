import 'server-only';
import { llamarIA } from '@/lib/ia-fallback';

// Generacion de proyectos estructurados desde un brief libre.
// Usa llamarIA con MODELOS_RAPIDOS (solo modelos GRATUITOS de OpenRouter, ya que
// la cuenta no tiene creditos): prueba gpt-oss-20b -> laguna -> gemma -> ... en
// cadena de forma transparente.

export interface ProyectoGenerado {
  titulo: string;
  descripcion: string;
  areaNegocio: string | null;
  plazoDias: number | null;
  tecnologias: string[];
}

export interface ContextoIA {
  pregunta: string;
  respuestas: string[];
}

const PROMPT_SISTEMA = `Sos un asistente de FWD Marketplace que transforma solicitudes empresariales en proyectos claros para que estudiantes universitarios costarricenses los desarrollen.

Lee el brief del empresario y sus respuestas, y redacta la descripcion COMO SI FUERA EL MISMO EMPRESARIO explicando que necesita.

Redaccion obligatoria:
- Primera persona plural: "Nuestro negocio busca...", "Queremos desarrollar...", "Necesitamos una solucion que..."
- Tono profesional pero humano, narrativa fluida, sin listas ni viñetas ni bullets
- Minimo 200 palabras, que fluya como texto continuo
- Sin emojis

Titulo: original y especifico del negocio (max 150 chars). Evita genericos como "Sistema de gestion" o "Plataforma web". Ejemplo bueno: "App de turnos y citas para clinica odontologica".

Devuelve SOLO este JSON puro (sin markdown):
{"titulo":"titulo especifico del proyecto","descripcion":"descripcion narrativa en primera persona, min 200 palabras","areaNegocio":"Logistica|Marketing|Finanzas|Salud|Educacion|Operaciones|Tecnologia|Recursos Humanos|Comunicacion|Comercio","plazoDias":10,"tecnologias":["tech1","tech2","tech3"]}

Reglas: plazoDias entre 5 y 15 segun complejidad, 3-6 tecnologias reales y especificas (React, Node.js, PostgreSQL, etc.), JSON puro sin texto adicional.`;

function extraerJSON(texto: string): unknown {
  try { return JSON.parse(texto.trim()); } catch {}

  const bloque = texto.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (bloque?.[1]) {
    try { return JSON.parse(bloque[1].trim()); } catch {}
  }

  const objeto = texto.match(/\{[\s\S]*\}/);
  if (objeto?.[0]) {
    try { return JSON.parse(objeto[0]); } catch {}
  }

  throw new Error('No se encontro JSON valido en la respuesta de la IA');
}

export async function generarProyectoDesdeBrief(
  brief: string,
  contexto?: ContextoIA[],
): Promise<ProyectoGenerado> {
  let userMsg = `Brief del empresario:\n"${brief}"`;

  if (contexto && contexto.length > 0) {
    const ctx = contexto
      .filter((c) => c.respuestas.length > 0)
      .map((c) => `- ${c.pregunta}: ${c.respuestas.join(', ')}`)
      .join('\n');
    if (ctx) {
      userMsg += `\n\nRespuestas del empresario:\n${ctx}`;
    }
  }

  let texto: string;
  try {
    texto = await llamarIA(
      [
        { role: 'system', content: PROMPT_SISTEMA },
        { role: 'user', content: userMsg },
      ],
      { temperature: 0.3, max_tokens: 900 },
    );
  } catch (err) {
    console.error('[ia-proyecto] Todos los modelos fallaron:', err);
    throw new Error('Error al comunicarse con el servicio de IA');
  }

  let datos: unknown;
  try {
    datos = extraerJSON(texto);
  } catch {
    console.error('[ia-proyecto] No se pudo extraer JSON. Respuesta:', texto.slice(0, 500));
    throw new Error('La IA devolvio una respuesta con formato inesperado');
  }

  return sanearRespuesta(datos);
}

function sanearRespuesta(raw: unknown): ProyectoGenerado {
  if (!raw || typeof raw !== 'object') {
    throw new Error('La IA devolvio una estructura invalida');
  }

  const r = raw as Record<string, unknown>;

  const titulo = typeof r.titulo === 'string' ? r.titulo.trim().slice(0, 200) : '';
  if (titulo.length < 3) throw new Error('La IA no genero un titulo valido');

  const descRaw = typeof r.descripcion === 'string' ? r.descripcion.trim().slice(0, 5000) : '';
  const descripcion =
    descRaw.length >= 20 ? descRaw : (descRaw + ' Proyecto estructurado por FWD IA.').slice(0, 5000);

  const areaNegocio =
    typeof r.areaNegocio === 'string' && r.areaNegocio.trim().length > 0
      ? r.areaNegocio.trim().slice(0, 100)
      : null;

  let plazoDias: number | null = null;
  const rawPlazo = r.plazoDias;
  const numPlazo = typeof rawPlazo === 'string' ? parseInt(rawPlazo, 10) : Number(rawPlazo);
  if (Number.isFinite(numPlazo) && numPlazo > 0) {
    plazoDias = Math.min(Math.max(Math.round(numPlazo), 1), 365);
  }

  const tecnologias: string[] = Array.isArray(r.tecnologias)
    ? r.tecnologias
        .filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
        .map((t) => t.trim().slice(0, 80))
        .slice(0, 20)
    : [];

  return { titulo, descripcion, areaNegocio, plazoDias, tecnologias };
}
