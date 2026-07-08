import 'server-only';
import { llamarIA } from '@/lib/ia-fallback';

// Agente conversacional de FWD.
// Usa llamarIA: prueba claude-3.5-haiku → gpt-4o-mini de forma transparente.

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

function buildSystemPrompt(turnoUsuario: number): string {
  const instruccion = turnoUsuario >= 10
    ? 'Ya tenes suficiente informacion. DEBES terminar con listo: true y el proyecto completo.'
    : turnoUsuario >= 7
    ? 'Podes cerrar si ya tenes suficiente, o hacer UNA pregunta mas si falta algo clave.'
    : `Hace UNA pregunta de seguimiento. Necesitas ${7 - turnoUsuario} respuesta${7 - turnoUsuario === 1 ? '' : 's'} mas.`;

  return `Sos el asistente de FWD Marketplace (Costa Rica), que conecta empresas con equipos universitarios para proyectos de software.

Tu mision: entender el proyecto del empresario haciendo UNA pregunta por turno.

Info a recolectar: problema a resolver, usuarios finales, funcionalidades principales, area de negocio, tecnologias preferidas, plazo en dias (5-15).

Turno del usuario: ${turnoUsuario}. ${instruccion}

Responde SIEMPRE con JSON valido, sin texto antes ni despues:
- En curso: {"mensaje":"tu pregunta concreta","listo":false}
- Final: {"mensaje":"Perfecto, ya tengo todo lo que necesito.","listo":true,"proyecto":{"titulo":"titulo claro max 150 chars","descripcion":"descripcion para estudiantes universitarios, min 80 chars","areaNegocio":"Logistica|Marketing|Finanzas|Salud|Educacion|Operaciones|Recursos Humanos|Tecnologia|Comunicacion|Comercio","plazoDias":10,"tecnologias":["tech1","tech2"]}}

Estilo: tuteo (vos/tenes/podes), profesional y directo, sin emojis.`;
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

export async function chatAgente(
  historial: MensajeChat[],
  turnoUsuario: number,
): Promise<RespuestaAgente> {
  const systemMsg = { role: 'system', content: buildSystemPrompt(turnoUsuario) };
  const mensajes = [systemMsg, ...historial];

  let respuestaTexto: string;
  try {
    respuestaTexto = await llamarIA(mensajes, {
      temperature: 0.3,
      max_tokens: 600,
      response_format: { type: 'json_object' },
    });
  } catch (err) {
    console.error('[openrouter] Todos los modelos fallaron:', err);
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
      return {
        mensaje: 'Podes darme un poco mas de detalle sobre el proyecto para terminarlo bien?',
        listo: false,
      };
    }
  }

  return { mensaje, listo: false };
}
