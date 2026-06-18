import 'server-only';

// Generacion de preguntas de seguimiento para el flujo "Crear con IA".
// Proveedor: openrouter/free — router que elige entre modelos gratuitos.

export interface Pregunta {
  texto: string;
  tipo: 'checkbox' | 'radio';
  opciones: string[]; // sin "Otro" — el frontend lo agrega siempre
}

const MODEL = 'openrouter/free';
const OR_URL = 'https://openrouter.ai/api/v1/chat/completions';

const SISTEMA = `Sos un experto en tecnologia que ayuda a empresarios a definir proyectos de software para publicarlos en FWD Marketplace, una plataforma costarricense donde empresas y emprendedores publican proyectos tecnologicos para que equipos de estudiantes universitarios los desarrollen.

El empresario ya escribio una idea de lo que quiere construir. Tu trabajo es hacerle exactamente 3 preguntas para entender MEJOR QUE CONSTRUIR, de modo que luego puedas redactar una descripcion clara y completa del proyecto que sirva para que un equipo de estudiantes entienda que tiene que hacer.

CONTEXTO IMPORTANTE: el proyecto sera desarrollado por estudiantes universitarios costarricenses. La descripcion final debe ser lo suficientemente clara para que un equipo de desarrollo universitario pueda entender el alcance y comenzar a trabajar.

OBJETIVO DE LAS PREGUNTAS: entender el PRODUCTO que se va a construir, no quien lo construye ni como se va a contratar.

PREGUNTAS PERMITIDAS — ejemplos del tipo correcto:
- Que funcionalidades principales debe tener la solucion
- En que plataforma debe funcionar (web, movil, escritorio, o combinacion)
- Quienes son los usuarios finales del producto (clientes, empleados, administradores, publico en general)
- Que datos o integraciones externas necesita manejar (pagos, correo, mapas, inventario)
- Que problema especifico resuelve o que proceso quiere automatizar
- Que modulos o secciones debe tener la aplicacion
- Que tipo de acceso o roles de usuario necesita

PREGUNTAS PROHIBIDAS — jamas hagas esto:
- Quien construira el proyecto, quien sera el equipo o con quien trabajaran
- Cuanto tiempo tiene disponible o cual es el presupuesto
- Datos personales del empresario o de su empresa
- Preguntas sobre el proceso de contratacion, plazos de entrega o costos
- Nada sobre el marketplace, los estudiantes, las postulaciones ni el proceso de seleccion

Devuelve UNICAMENTE el siguiente JSON (sin markdown, sin texto antes ni despues, solo JSON puro):
{
  "preguntas": [
    {
      "texto": "primera pregunta sobre el producto a construir",
      "tipo": "checkbox",
      "opciones": ["opcion1", "opcion2", "opcion3"]
    },
    {
      "texto": "segunda pregunta sobre funcionalidades o plataforma",
      "tipo": "checkbox",
      "opciones": ["opcion1", "opcion2", "opcion3"]
    },
    {
      "texto": "tercera pregunta sobre usuarios o integraciones",
      "tipo": "checkbox",
      "opciones": ["opcion1", "opcion2", "opcion3", "opcion4"]
    }
  ]
}

Reglas del JSON:
- Exactamente 3 preguntas en el array "preguntas".
- Todas las preguntas deben tener tipo "checkbox" — el empresario puede elegir todas las opciones que quiera.
- Entre 3 y 4 opciones por pregunta. NUNCA pongas "Otro" en las opciones.
- Opciones cortas y concretas, maximo 60 caracteres.
- Preguntas en espanol, tuteo (vos, tenes, podes).
- Sin emojis. JSON puro sin bloques markdown.`;

// Extrae el primer objeto JSON valido del texto, tolerando markdown
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

async function llamarOR(messages: { role: string; content: string }[]): Promise<Response> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('OPENROUTER_API_KEY no configurada');

  const body = JSON.stringify({ model: MODEL, messages, temperature: 0.5, max_tokens: 1024 });
  const headers = {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.NEXT_PUBLIC_URL ?? 'https://fwd.cr',
    'X-Title': 'FWD Marketplace',
  };

  for (let intento = 0; intento < 2; intento++) {
    try {
      const res = await fetch(OR_URL, { method: 'POST', headers, body });
      if (res.ok || intento === 1) return res;
      await new Promise((r) => setTimeout(r, 1200));
    } catch (err) {
      if (intento === 1) throw err;
      await new Promise((r) => setTimeout(r, 1200));
    }
  }
  throw new Error('No se pudo conectar con el servicio de IA despues de varios intentos');
}

export async function generarPreguntasDesdeBrief(brief: string): Promise<Pregunta[]> {
  let res: Response;
  try {
    res = await llamarOR([
      { role: 'system', content: SISTEMA },
      { role: 'user', content: `Brief del empresario:\n"${brief}"` },
    ]);
  } catch (err) {
    console.error('[ia-preguntas] Error de red:', err);
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('no configurada')) {
      throw err;
    }
    throw new Error('Error al comunicarse con el servicio de IA');
  }

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    console.error('[ia-preguntas] OpenRouter error:', res.status, txt.slice(0, 300));
    throw new Error(`OpenRouter respondio con error ${res.status}`);
  }

  const raw = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const texto = raw.choices?.[0]?.message?.content ?? '';
  if (!texto) throw new Error('Respuesta vacia de OpenRouter');

  let datos: unknown;
  try {
    datos = extraerJSON(texto);
  } catch {
    console.error('[ia-preguntas] No se pudo extraer JSON. Respuesta:', texto.slice(0, 300));
    throw new Error('La IA devolvio una respuesta con formato inesperado');
  }

  // Acepta { preguntas: [...] } o array directo
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
