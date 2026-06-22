import 'server-only';

// Cliente OpenRouter para el agente conversacional de FWD.
// Primario: anthropic/claude-3.5-haiku  (rapido, excelente en español y JSON)
// Respaldo:  openai/gpt-4o-mini         (muy confiable, buen JSON)
// OpenRouter gestiona el fallback automaticamente con { models: [...], route: 'fallback' }.

export interface MensajeChat {
  role: 'user' | 'assistant';
  content: string;
}

export interface ProyectoGeneradoOR {
  titulo: string;
  descripcion: string;
  areaNegocio: string | null;
  plazoDias: number | null;
  tecnologias: string[];
}

export interface RespuestaAgente {
  mensaje: string;
  listo: boolean;
  proyecto?: ProyectoGeneradoOR;
}

const MODELOS = ['anthropic/claude-3.5-haiku', 'openai/gpt-4o-mini'] as const;

function buildSystemPrompt(turnoUsuario: number): string {
  const puedeTerminar = turnoUsuario >= 7;
  const debeTerminar = turnoUsuario >= 10;

  const instruccionTurno = debeTerminar
    ? 'Ya tenés suficiente informacion. DEBES responder con listo: true y el proyecto estructurado.'
    : puedeTerminar
    ? 'Podes cerrar la conversacion si ya tenes suficiente informacion, o hacer UNA pregunta mas si falta algo clave.'
    : `Hace UNA pregunta de seguimiento. Necesitas al menos ${7 - turnoUsuario} respuesta${7 - turnoUsuario === 1 ? '' : 's'} mas antes de poder estructurar el proyecto.`;

  return `Sos el asistente de FWD Marketplace, una plataforma que conecta empresas costarricenses con talento universitario para proyectos reales de software.

Tu mision es entender el proyecto que necesita el empresario mediante preguntas de a UNA por vez, de forma conversacional y profesional.

Aspectos clave que debes entender antes de generar el proyecto:
1. Que problema concreto quieren resolver
2. Quienes usaran la solucion y que deberan poder hacer
3. Funcionalidades o modulos principales
4. Area de negocio (Logistica, Marketing, Finanzas, Salud, Educacion, Operaciones, Recursos Humanos, Tecnologia, etc.)
5. Tecnologias preferidas o con las que ya trabajan (si tienen preferencia)
6. Cuantos dias quieren dejar abierta la recepcion de propuestas (entre 5 y 15 dias)
7. Cualquier restriccion, integracion o detalle tecnico importante

Estado actual: turno ${turnoUsuario} del usuario.
${instruccionTurno}

IMPORTANTE — Responde SIEMPRE con un JSON valido, sin texto antes ni despues:
- Conversacion en curso: {"mensaje": "tu pregunta o comentario", "listo": false}
- Cuando tengas toda la informacion: {"mensaje": "Perfecto, ya tengo todo lo necesario para estructurar tu proyecto.", "listo": true, "proyecto": {"titulo": "titulo claro del proyecto (min 5, max 150 chars)", "descripcion": "descripcion detallada y atractiva para estudiantes universitarios (min 80 chars, max 1000)", "areaNegocio": "area de negocio o null", "plazoDias": numero entre 5 y 15 o null, "tecnologias": ["tech1", "tech2"]}}

Reglas de estilo:
- Sin emojis en ningun campo.
- Tuteo (vos, tenes, podes).
- Tono profesional y cercano.
- Las preguntas deben ser especificas y concretas para el contexto de desarrollo de software.
- El proyecto debe ser claro, profesional y motivador para que estudiantes universitarios quieran postularse.`;
}

function sanearProyecto(raw: unknown): ProyectoGeneradoOR {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Estructura de proyecto invalida recibida de la IA');
  }

  const r = raw as Record<string, unknown>;

  const titulo = typeof r.titulo === 'string' ? r.titulo.trim().slice(0, 200) : '';
  if (titulo.length < 3) throw new Error('La IA no genero un titulo valido');

  const descRaw = typeof r.descripcion === 'string' ? r.descripcion.trim().slice(0, 5000) : '';
  const descripcion =
    descRaw.length >= 20
      ? descRaw
      : (descRaw + ' Proyecto estructurado por FWD IA.').slice(0, 5000);

  const areaNegocio =
    typeof r.areaNegocio === 'string' && r.areaNegocio.trim().length > 0
      ? r.areaNegocio.trim().slice(0, 100)
      : null;

  let plazoDias: number | null = null;
  if (typeof r.plazoDias === 'number' && Number.isInteger(r.plazoDias) && r.plazoDias > 0) {
    plazoDias = Math.min(Math.max(r.plazoDias, 1), 365);
  }

  const tecnologias: string[] = Array.isArray(r.tecnologias)
    ? r.tecnologias
        .filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
        .map((t) => t.trim().slice(0, 80))
        .slice(0, 20)
    : [];

  return { titulo, descripcion, areaNegocio, plazoDias, tecnologias };
}

/**
 * Llama al agente conversacional via OpenRouter.
 * Devuelve el siguiente mensaje del agente y, cuando tiene suficiente info,
 * tambien el proyecto estructurado listo para crearProyectoService.
 */
export async function chatAgente(
  historial: MensajeChat[],
  turnoUsuario: number,
): Promise<RespuestaAgente> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('OPENROUTER_API_KEY no configurada');

  const systemMsg = { role: 'system', content: buildSystemPrompt(turnoUsuario) };
  const mensajes = [systemMsg, ...historial];

  let respuestaTexto: string;
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_URL ?? 'https://fwd.cr',
        'X-Title': 'FWD Marketplace',
      },
      body: JSON.stringify({
        models: MODELOS,
        route: 'fallback',
        messages: mensajes,
        response_format: { type: 'json_object' },
        temperature: 0.5,
        max_tokens: 1024,
      }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`OpenRouter ${res.status}: ${txt.slice(0, 200)}`);
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    respuestaTexto = data.choices?.[0]?.message?.content ?? '';
    if (!respuestaTexto) throw new Error('Respuesta vacia de OpenRouter');
  } catch (err) {
    console.error('[openrouter] Error en fetch:', err);
    throw new Error('Error al comunicarse con el agente de IA');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(respuestaTexto);
  } catch {
    console.error('[openrouter] JSON invalido:', respuestaTexto.slice(0, 300));
    throw new Error('El agente devolvio una respuesta con formato inesperado');
  }

  const p = parsed as Record<string, unknown>;
  const mensaje =
    typeof p.mensaje === 'string' && p.mensaje.trim()
      ? p.mensaje.trim()
      : 'Podes contarme mas sobre ese punto?';
  const listo = p.listo === true;

  if (listo && p.proyecto) {
    try {
      const proyecto = sanearProyecto(p.proyecto);
      return { mensaje, listo: true, proyecto };
    } catch (e) {
      console.error('[openrouter] Error saneando proyecto:', e);
      // Si el saneamiento falla, continuar la conversacion en lugar de romper
      return {
        mensaje: 'Podes darme un poco mas de detalle sobre el proyecto para terminarlo bien?',
        listo: false,
      };
    }
  }

  return { mensaje, listo: false };
}
