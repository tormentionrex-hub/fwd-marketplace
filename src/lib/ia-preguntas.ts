import 'server-only';
import { llamarIA } from '@/lib/ia-fallback';

// Generacion de preguntas de seguimiento para el flujo "Crear con IA".
// Usa llamarIA: prueba claude-3.5-haiku → gpt-4o-mini de forma transparente.

export interface Pregunta {
  texto: string;
  tipo: 'checkbox' | 'radio';
  opciones: string[]; // sin "Otro" — el frontend lo agrega siempre
}

const SISTEMA = `Sos un experto en tecnologia que ayuda a empresarios a definir proyectos para FWD Marketplace, donde empresas publican proyectos para que equipos universitarios los desarrollen.

El empresario escribio su idea. Tu tarea: hacer exactamente 3 preguntas sobre EL PRODUCTO a construir.

Preguntas PERMITIDAS: funcionalidades, plataforma (web/movil/escritorio), usuarios finales, datos o integraciones, problema a resolver, modulos, roles de acceso.
Preguntas PROHIBIDAS: equipo, presupuesto, plazos, datos personales, proceso de contratacion.

Devuelve SOLO este JSON puro (sin markdown):
{"preguntas":[{"texto":"pregunta1","tipo":"checkbox","opciones":["op1","op2","op3"]},{"texto":"pregunta2","tipo":"checkbox","opciones":["op1","op2","op3"]},{"texto":"pregunta3","tipo":"checkbox","opciones":["op1","op2","op3","op4"]}]}

Reglas: exactamente 3 preguntas, todas tipo "checkbox", 3-4 opciones por pregunta (max 60 chars cada una), NUNCA incluyas "Otro" en las opciones, tuteo (vos/tenes/podes), sin emojis.`;

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

export async function generarPreguntasDesdeBrief(brief: string): Promise<Pregunta[]> {
  let texto: string;
  try {
    texto = await llamarIA(
      [
        { role: 'system', content: SISTEMA },
        { role: 'user', content: `Brief del empresario:\n"${brief}"` },
      ],
      { temperature: 0.3, max_tokens: 500 },
    );
  } catch (err) {
    console.error('[ia-preguntas] Todos los modelos fallaron:', err);
    throw new Error('Error al comunicarse con el servicio de IA');
  }

  let datos: unknown;
  try {
    datos = extraerJSON(texto);
  } catch {
    console.error('[ia-preguntas] No se pudo extraer JSON. Respuesta:', texto.slice(0, 300));
    throw new Error('La IA devolvio una respuesta con formato inesperado');
  }

  const lista: unknown = Array.isArray(datos)
    ? datos
    : (datos as Record<string, unknown>).preguntas;

  if (!Array.isArray(lista)) {
    throw new Error('La IA no devolvio preguntas validas');
  }

  return lista.slice(0, 3).map((p: unknown): Pregunta => {
    const q = p as Record<string, unknown>;
    return {
      texto:
        typeof q.texto === 'string' && q.texto.trim()
          ? q.texto.trim().slice(0, 300)
          : 'Contanos mas sobre el proyecto',
      tipo: q.tipo === 'radio' ? 'radio' : 'checkbox',
      opciones: Array.isArray(q.opciones)
        ? q.opciones
            .filter((o): o is string => typeof o === 'string' && o.trim().length > 0)
            .map((o) => o.trim().slice(0, 100))
            .slice(0, 4)
        : [],
    };
  });
}
