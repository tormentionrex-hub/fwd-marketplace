import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { mismoOrigen } from '@/server/http/request';

// POST /api/estudiante/cv-ia
// Optimiza el resumen y perfil del estudiante en base a un puesto objetivo.
export async function POST(request: Request) {
  if (!mismoOrigen(request)) {
    return NextResponse.json({ error: 'Origen no permitido' }, { status: 403 });
  }

  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: 'La API Key de OpenRouter no está configurada en el servidor (.env).' },
      { status: 500 }
    );
  }

  try {
    const { puesto, resumen, habilidades } = await request.json();

    if (!puesto || puesto.trim().length === 0) {
      return NextResponse.json({ error: 'Debes ingresar el puesto al que deseas aplicar.' }, { status: 400 });
    }

    const systemPrompt = `Eres un experto en reclutamiento técnico y optimización de perfiles profesionales para FWD Costa Rica.
Tu tarea es ayudar al estudiante a optimizar su resumen y habilidades para postularse al puesto de: "${puesto}".
Analiza su resumen actual y sus habilidades, y responde con una evaluación estructurada en formato JSON válido.

IMPORTANTE:
- Tu respuesta debe ser ÚNICAMENTE un objeto JSON válido, sin bloques de código markdown (\`\`\`json) ni texto explicativo adicional.
- No uses emojis en ninguna parte de los textos generados.

El esquema JSON que debes retornar debe ser exactamente:
{
  "compatibilidad": 85,
  "sugerencias": [
    "Sugerencia 1 clara y específica sin emojis",
    "Sugerencia 2 clara y específica sin emojis"
  ],
  "resumenOptimizado": "Una propuesta de redacción profesional optimizada para su resumen, redactada en primera persona, destacando el valor del estudiante para el puesto de ${puesto}. Sin emojis."
}`;

    const userPrompt = `Mi perfil actual:
- Resumen profesional: ${resumen || 'No especificado'}
- Habilidades: ${habilidades && habilidades.length > 0 ? habilidades.join(', ') : 'Ninguna seleccionada'}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'HTTP-Referer': 'https://fwd-marketplace.cr',
        'X-Title': 'FWD Marketplace',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[CV-IA OpenRouter Error]', response.status, errorText);
      return NextResponse.json({ error: 'Error al comunicarse con la IA.' }, { status: 502 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: 'La IA no retornó contenido.' }, { status: 502 });
    }

    try {
      const parsed = JSON.parse(content);
      return NextResponse.json({ result: parsed });
    } catch (e) {
      console.error('[CV-IA JSON Parse Error]', content, e);
      return NextResponse.json({ error: 'La IA no retornó un formato JSON válido.' }, { status: 502 });
    }
  } catch (err) {
    console.error('[CV-IA API Error]', err);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
