import 'server-only';

// Generacion de proyectos estructurados desde un brief libre.
// Proveedor: openrouter/free — router que elige entre modelos gratuitos.

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

const MODEL = 'openrouter/free';
const OR_URL = 'https://openrouter.ai/api/v1/chat/completions';

const PROMPT_SISTEMA = `Sos un asistente especializado en transformar solicitudes de proyectos empresariales en descripciones claras y profesionales para FWD Marketplace, una plataforma costarricense donde empresas y emprendedores publican proyectos tecnologicos para que equipos de estudiantes universitarios los desarrollen.

CONTEXTO DE LA PLATAFORMA: el proyecto que describas sera leido por equipos de estudiantes universitarios de tecnologia en Costa Rica que van a postularse para desarrollarlo. La descripcion debe ser clara, motivadora y suficientemente detallada para que un equipo de desarrollo pueda entender exactamente que tiene que construir.

Tu tarea: leer el brief del empresario y sus respuestas, y redactar una descripcion escrita COMO SI FUERA EL MISMO EMPRESARIO explicando que necesita construir, que problema quiere resolver y que espera obtener.

REGLAS DE REDACCION (obligatorias):
- Escribe en primera persona del plural: "Nuestro negocio busca...", "Queremos desarrollar...", "Necesitamos una solucion que...".
- Tono profesional pero humano, como si un empresario real explicara su idea a un equipo de desarrollo.
- Redaccion narrativa y fluida: usa conectores ("ademas", "por otro lado", "para ello", "de esta forma"), no listas ni viñetas.
- Cero guiones largos, cero separadores, cero bullets, cero formato de documentacion tecnica fria.
- Incluye toda la informacion importante del proyecto pero integrada en parrafos naturales.
- No repitas palabras. Varia el vocabulario.
- Minimo 200 palabras, pero que fluya como texto continuo, no como un checklist.
- Sin emojis.

ESTRUCTURA DEL CONTENIDO (debe estar presente, pero integrada en la narracion, no como secciones visibles):
- El contexto del negocio y el problema que se quiere resolver.
- Que se quiere construir: funcionalidades y modulos principales.
- Quienes van a usar la solucion y de que forma.
- Integraciones o servicios que se necesitaran (si aplica).
- Que se espera lograr al finalizar el proyecto.

SOBRE EL TITULO:
- Debe ser original, especifico y adaptado a lo que pide el empresario.
- No uses titulos genericos como "Sistema de gestion" o "Plataforma web".
- Nombre que refleje el rubro y el valor que aporta. Ejemplo: "App de turnos y citas para clinica odontologica" o "Portal de ventas con catalogo QR para restaurantes" o "Sistema de rastreo de flota en tiempo real para logistica".
- Maximo 150 caracteres.

REGLA PRINCIPAL: aunque el empresario haya escrito algo muy corto o sin terminos tecnicos, VOS debes inferir los detalles necesarios basandote en el contexto del negocio. Nunca digas "no hay informacion suficiente". Toma decisiones inteligentes y reflejalas en la descripcion.

Devuelve UNICAMENTE el siguiente JSON (sin markdown, sin texto antes ni despues, solo el JSON puro):
{
  "titulo": "Titulo original y especifico del proyecto, maximo 150 caracteres",
  "descripcion": "Descripcion narrativa escrita como si fuera el empresario, minimo 200 palabras, sin listas ni viñetas",
  "areaNegocio": "Una de: Logistica, Marketing, Finanzas, Salud, Educacion, Operaciones, Tecnologia, Recursos Humanos, Comunicacion, Comercio. Nunca null.",
  "plazoDias": 10,
  "tecnologias": ["tecnologia1", "tecnologia2", "tecnologia3", "tecnologia4"]
}

Reglas del JSON:
- plazoDias: numero entero entre 5 y 15 segun la complejidad estimada del proyecto.
- tecnologias: entre 3 y 6 tecnologias reales y especificas (React, Node.js, PostgreSQL, Flutter, etc.), elegidas segun lo que el proyecto realmente necesita.
- JSON puro sin bloques markdown ni texto adicional.`;

// Extrae el primer objeto JSON valido del texto, tolerando markdown y texto alrededor
function extraerJSON(texto: string): unknown {
  // Intento directo
  try { return JSON.parse(texto.trim()); } catch {}

  // Bloque ```json ... ```
  const bloque = texto.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (bloque?.[1]) {
    try { return JSON.parse(bloque[1].trim()); } catch {}
  }

  // Primer objeto JSON en el texto
  const objeto = texto.match(/\{[\s\S]*\}/);
  if (objeto?.[0]) {
    try { return JSON.parse(objeto[0]); } catch {}
  }

  throw new Error('No se encontro JSON valido en la respuesta de la IA');
}

async function llamarOR(messages: { role: string; content: string }[]): Promise<Response> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('OPENROUTER_API_KEY no configurada');

  const body = JSON.stringify({ model: MODEL, messages, temperature: 0.5, max_tokens: 2048 });
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
      userMsg += `\n\nRespuestas del empresario a las preguntas de seguimiento:\n${ctx}`;
    }
  }

  let res: Response;
  try {
    res = await llamarOR([
      { role: 'system', content: PROMPT_SISTEMA },
      { role: 'user', content: userMsg },
    ]);
  } catch (err) {
    console.error('[ia-proyecto] Error de red:', err);
    throw new Error('Error al comunicarse con el servicio de IA');
  }

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    console.error('[ia-proyecto] OpenRouter error:', res.status, txt.slice(0, 500));
    throw new Error(`OpenRouter respondio con error ${res.status}`);
  }

  const raw = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const texto = raw.choices?.[0]?.message?.content ?? '';
  if (!texto) throw new Error('Respuesta vacia de OpenRouter');

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
