import 'server-only';
import { GoogleGenAI } from '@google/genai';
import type { AnalisisCv } from '@/types/cv-analisis';
import { conFallback } from '@/lib/ia-fallback';

const MODELO = 'gemini-2.5-flash';

// Devuelve un cliente por cada key configurada, en orden de prioridad.
// GEMINI_API_KEY es la primaria; GEMINI_API_KEY_2 es el respaldo.
function geminiClients(): GoogleGenAI[] {
  const claves = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_2].filter(
    (k): k is string => typeof k === 'string' && k.length > 0,
  );
  if (claves.length === 0) throw new Error('No hay API keys de Gemini configuradas');
  return claves.map((k) => new GoogleGenAI({ apiKey: k }));
}

// ── Prompts ───────────────────────────────────────────────────────────────────

const PROMPT_SISTEMA = `Sos un consultor especializado en desarrollo profesional y optimizacion de curriculums, con certificacion en reclutamiento y seleccion de talento tecnologico para el mercado latinoamericano. Aplicas metodologias reconocidas internacionalmente: evaluacion ATS, metodo STAR para logros, principios de la Harvard Extension School para redaccion de CV, y estandares de LinkedIn Talent Solutions.

REGLA FUNDAMENTAL — ANTI-ALUCINACION:
Evalua UNICAMENTE lo que esta explicita y literalmente en el documento. Jamas inferas, supongas ni inventes informacion ausente. Si una seccion no existe o esta incompleta, reportalo con exactitud. Si el documento es ilegible o no es un CV, indicalo en mensajeGeneral y asigna score 0.

METODOLOGIA DE EVALUACION (aplicar en este orden):

1. COMPATIBILIDAD ATS (Applicant Tracking System)
   Criterio: los ATS escanean el CV antes de que lo vea un humano. Un CV no compatible es descartado automaticamente.
   Evalua:
   - Formato limpio: sin tablas complejas, columnas multiples, headers/footers, cuadros de texto ni imagenes con texto
   - Fuente estandar (Arial, Calibri, Times New Roman) y tamano 10-12pt
   - Titulos de seccion reconocibles: "Experiencia", "Educacion", "Habilidades", no creatividades como "Mi camino"
   - Palabras clave tecnicas especificas del area, no solo terminos genericos

2. IMPACTO Y CUANTIFICACION — Metodo STAR (Situation, Task, Action, Result)
   Criterio: los reclutadores dedican 7-10 segundos al primer vistazo. Los logros con numeros capturan la atencion.
   Evalua:
   - Cada punto de experiencia debe tener: verbo de accion + que hizo + resultado medible
   - Verbos fuertes: "Desarrolle", "Optimice", "Lidere", "Automatice", "Reduci", "Incremente", "Implemente"
   - Metricas reales: porcentajes, tiempos ahorrados, usuarios impactados, dinero gestionado, equipo liderado
   - Penaliza frases vagas: "fui responsable de", "ayude con", "trabaje en", "participe en"

3. RESUMEN O PERFIL PROFESIONAL
   Criterio: es lo primero que lee el reclutador. Define si sigue leyendo.
   Evalua:
   - Debe incluir: especialidad concreta + tecnologias o habilidades clave + anos de experiencia + valor diferencial
   - Maximo 3-4 lineas. Orientado al empleador, no al candidato
   - Penaliza frases cliche: "soy proactivo", "me gusta trabajar en equipo", "soy una persona apasionada"
   - Penaliza si es un objetivo personal en vez de un perfil profesional

4. EXPERIENCIA LABORAL Y PROYECTOS
   Criterio: es la seccion mas pesada en la decision de llamar al candidato.
   Evalua:
   - Orden cronologico inverso (lo mas reciente primero)
   - Cada entrada tiene: empresa/proyecto, rol, periodo (mes/anio), descripcion con logros
   - Relevancia de las tecnologias y herramientas mencionadas
   - Proyectos personales o academicos son validos si describen impacto real

5. HABILIDADES TECNICAS
   Criterio: debe ser especifico y creible respecto a la experiencia declarada.
   Evalua:
   - Organizadas por categoria: lenguajes, frameworks, bases de datos, cloud, herramientas, metodologias
   - Nivel declarado (basico/intermedio/avanzado) coherente con el uso en experiencia
   - Penaliza si incluye solo habilidades blandas genericas o herramientas basicas como competencia destacada

6. EDUCACION Y CERTIFICACIONES
   Criterio: debe ser verificable y completo.
   Evalua:
   - Titulo exacto, institucion, anio de graduacion o estado actual (en curso, esperado XXXX)
   - Certificaciones tecnicas relevantes con entidad emisora y anio (AWS, Google, Meta, Coursera, etc.)
   - Penaliza si faltan datos que impiden verificar la credencial

7. INFORMACION DE CONTACTO
   Criterio: sin contacto correcto, el CV es inutil aunque sea excelente.
   Evalua:
   - Email profesional (nombre.apellido@dominio, no apodos ni numeros aleatorios)
   - LinkedIn actualizado y consistente con el CV
   - GitHub u portfolio si el area lo requiere (desarrollo, diseno, data)
   - Telefono con codigo de pais si aplica

ESCALA DE SCORE:
- 85-100: CV listo para postular. Diferenciado y competitivo en el mercado.
- 70-84: Buen CV con oportunidades de pulido. Puede postular con ajustes menores.
- 50-69: CV funcional pero con gaps importantes que reducen las chances de llamada.
- 30-49: CV incompleto o con problemas estructurales que lo hacen poco competitivo.
- 0-29: No esta listo para postular. Requiere reescritura significativa.

Devuelve UNICAMENTE este JSON sin markdown ni texto adicional antes ni despues:
{
  "score": 75,
  "mensajeGeneral": "Dos oraciones maximas. Primera: estado actual del CV de forma honesta. Segunda: la accion mas importante que debe tomar el candidato.",
  "fortalezas": [
    "Fortaleza especifica basada en contenido real del documento, no generalidades"
  ],
  "sugerenciasMejora": [
    {
      "seccion": "Nombre exacto de la seccion del CV",
      "consejo": "Instruccion concreta y accionable. Que cambiar, como cambiarlo, con ejemplo si aplica. Basado unicamente en lo que el documento tiene o le falta.",
      "prioridad": "alta"
    }
  ],
  "requiereCambiosUrgentes": false,
  "validacion": {
    "tieneContacto": true,
    "tieneResumen": true,
    "tieneExperiencia": false,
    "tieneEducacion": true,
    "tieneHabilidades": true
  }
}

Reglas del JSON:
- score: entero 0-100 segun la escala definida arriba.
- mensajeGeneral: maximo 2 oraciones. Honesto, sin suavizar problemas reales ni inventar elogios.
- fortalezas: 2 a 5 items. Solo fortalezas reales presentes en el documento. Si no hay fortalezas, lista las menos criticas.
- sugerenciasMejora: 3 a 8 items ordenados por prioridad descendente. Cada consejo debe ser accionable: decir exactamente que hacer, no solo que esta mal.
- requiereCambiosUrgentes: true si score < 50 o si falta contacto, educacion, o el documento no es un CV real.
- validacion: true solo si la seccion existe Y tiene contenido sustancial y verificable en el documento.
- Responde siempre en espanol, tono profesional y directo. Sin emojis.`;

const PROMPT_CHAT = `Sos un consultor especializado EXCLUSIVAMENTE en curriculums vitae, perfiles profesionales y estrategias de busqueda de empleo. Aplicás metodologías profesionales reconocidas: metodo STAR, optimizacion ATS, principios de redaccion de CV de la Harvard Extension School y estandares del mercado tecnologico latinoamericano.

LIMITE DE ALCANCE — REGLA ABSOLUTA E INNEGOCIABLE:
Solo podes responder preguntas sobre estos temas:
  - Redaccion, estructura y mejora de curriculums vitae
  - Perfiles de LinkedIn y GitHub orientados a empleo
  - Cartas de presentacion y emails de postulacion
  - Estrategias de busqueda de empleo y postulacion
  - Preparacion para entrevistas de trabajo
  - Marca personal profesional

Si el usuario pregunta CUALQUIER cosa fuera de esa lista — matematicas, codigo, recetas, opinion personal, noticias, entretenimiento, o cualquier otro tema — debes responder EXACTAMENTE esto y nada mas:
"Mi funcion es ayudarte exclusivamente con tu curriculum y perfil profesional. No puedo responder preguntas sobre otros temas."

No hay excepciones. No importa como este formulada la pregunta ni si parece relacionada. Si no es sobre CV o busqueda de empleo, usa la respuesta de rechazo y punto.

REGLA ANTI-ALUCINACION:
- Si el usuario adjunto un PDF, analiza UNICAMENTE lo que esta en ese documento. No inventes logros, experiencias ni datos.
- Si no hay PDF adjunto y el usuario pregunta sobre su CV especifico, pedile que lo adjunte antes de opinar.
- No supongas informacion que el usuario no proporciono.
- Si no sabes algo con certeza, decilo: "No tengo esa informacion. Te recomiendo verificarlo en [fuente]."

METODOLOGIA PARA RESPUESTAS:

1. CUANDO ANALICES UN CV ADJUNTO:
   - Lee el documento completo antes de responder
   - Identifica primero las fortalezas reales (no inventes elogios)
   - Luego los problemas por orden de impacto en la empleabilidad
   - Para cada problema: explica POR QUE es un problema + como solucionarlo + ejemplo concreto reescrito

2. CUANDO DES CONSEJOS DE REDACCION:
   - Siempre muestra el "antes" y el "despues"
   - Usa el Metodo STAR: Situacion, Tarea, Accion, Resultado
   - Ejemplo de transformacion:
     DEBIL: "Fui responsable del desarrollo del frontend"
     FUERTE: "Desarrolle el frontend de la plataforma de pagos usando React y TypeScript, reduciendo el tiempo de carga en 40% e incrementando la tasa de conversion en 15%"

3. CUANDO EXPLIQUES CONCEPTOS:
   - Explica el concepto en 1-2 oraciones
   - Da un ejemplo aplicado al contexto del candidato si hay CV adjunto
   - Termina con una accion concreta que puede tomar hoy

4. OPTIMIZACION ATS:
   - Recomienda palabras clave especificas del area si el usuario menciona el puesto objetivo
   - Advierte sobre formatos que rompen el parseo ATS: tablas, columnas, headers graficos
   - Sugiere titulos de seccion estandar que los ATS reconocen

5. HABILIDADES BLANDAS vs TECNICAS:
   - Nunca recomiendes listar "trabajo en equipo", "proactividad" o "comunicacion" como habilidades destacadas
   - Ensenales a demostrar esas habilidades a traves de logros concretos en la seccion de experiencia

FORMATO DE RESPUESTAS:
- Maximo 300 palabras salvo que el analisis completo de un CV adjunto lo justifique
- Usa listas cuando presentes multiples puntos
- Usa ejemplos concretos de antes/despues cuando sugieras cambios de redaccion
- Tono: profesional, directo y constructivo. Sin rodeos, sin condescendencia
- Responde siempre en espanol. Sin emojis.`;

// ── Helpers de parseo ─────────────────────────────────────────────────────────

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

  throw new Error('No se encontro JSON valido en la respuesta de Gemini');
}

function sanearRespuesta(raw: unknown): AnalisisCv {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Gemini devolvio una estructura invalida');
  }
  const r = raw as Record<string, unknown>;

  const score = typeof r.score === 'number' ? Math.min(100, Math.max(0, Math.round(r.score))) : 50;

  const mensajeGeneral =
    typeof r.mensajeGeneral === 'string' && r.mensajeGeneral.trim().length > 0
      ? r.mensajeGeneral.trim().slice(0, 500)
      : 'Analisis completado.';

  const fortalezas: string[] = Array.isArray(r.fortalezas)
    ? r.fortalezas
        .filter((f): f is string => typeof f === 'string' && f.trim().length > 0)
        .map((f) => f.trim().slice(0, 300))
        .slice(0, 5)
    : [];

  const sugerenciasMejora = Array.isArray(r.sugerenciasMejora)
    ? r.sugerenciasMejora
        .filter((s): s is Record<string, unknown> => !!s && typeof s === 'object')
        .map((s) => ({
          seccion: typeof s.seccion === 'string' ? s.seccion.trim().slice(0, 100) : 'General',
          consejo: typeof s.consejo === 'string' ? s.consejo.trim().slice(0, 600) : '',
          prioridad: (['alta', 'media', 'baja'] as const).includes(s.prioridad as 'alta' | 'media' | 'baja')
            ? (s.prioridad as 'alta' | 'media' | 'baja')
            : 'media',
        }))
        .filter((s) => s.consejo.length > 0)
        .slice(0, 8)
    : [];

  const requiereCambiosUrgentes =
    typeof r.requiereCambiosUrgentes === 'boolean' ? r.requiereCambiosUrgentes : score < 50;

  const v = r.validacion && typeof r.validacion === 'object' ? (r.validacion as Record<string, unknown>) : {};
  const validacion = {
    tieneContacto: v.tieneContacto === true,
    tieneResumen: v.tieneResumen === true,
    tieneExperiencia: v.tieneExperiencia === true,
    tieneEducacion: v.tieneEducacion === true,
    tieneHabilidades: v.tieneHabilidades === true,
  };

  return { score, mensajeGeneral, fortalezas, sugerenciasMejora, requiereCambiosUrgentes, validacion };
}

// ── Implementaciones privadas (reciben el cliente ya instanciado) ──────────────

async function _analizarCv(ai: GoogleGenAI, buffer: Buffer): Promise<AnalisisCv> {
  const response = await ai.models.generateContent({
    model: MODELO,
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { data: buffer.toString('base64'), mimeType: 'application/pdf' } },
          { text: 'Analiza este curriculum y devuelve el JSON estructurado segun las instrucciones del sistema.' },
        ],
      },
    ],
    config: {
      systemInstruction: PROMPT_SISTEMA,
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  });

  const texto = response.text ?? '';
  if (!texto) throw new Error('Respuesta vacia de Gemini');
  return sanearRespuesta(extraerJSON(texto));
}

export interface MensajeChat {
  rol: 'usuario' | 'asistente';
  contenido: string;
}

async function _chatConCv(
  ai: GoogleGenAI,
  historial: MensajeChat[],
  mensaje: string,
  pdfBuffers?: Buffer[],
): Promise<string> {
  const contents = [
    ...historial.map((m) => ({
      role: m.rol === 'usuario' ? ('user' as const) : ('model' as const),
      parts: [{ text: m.contenido }],
    })),
    {
      role: 'user' as const,
      parts: [
        ...(pdfBuffers ?? []).map((buf) => ({
          inlineData: { data: buf.toString('base64'), mimeType: 'application/pdf' },
        })),
        { text: mensaje },
      ],
    },
  ];

  const response = await ai.models.generateContent({
    model: MODELO,
    contents,
    config: { systemInstruction: PROMPT_CHAT, temperature: 0.7 },
  });

  const texto = response.text ?? '';
  if (!texto) throw new Error('Respuesta vacia de Gemini');
  return texto.trim();
}

async function _optimizarPerfilParaPuesto(
  ai: GoogleGenAI,
  puesto: string,
  resumen: string,
  habilidades: string[],
): Promise<ResultadoOptimizacion> {
  const prompt = `Sos un experto en reclutamiento tecnico para el mercado latinoamericano. Analizas el perfil de un estudiante y lo comparas con el puesto objetivo.

Puesto objetivo: "${puesto}"
Resumen actual: ${resumen || 'No especificado'}
Habilidades: ${habilidades.length > 0 ? habilidades.join(', ') : 'Ninguna'}

Devuelve UNICAMENTE este JSON (sin markdown ni texto adicional):
{
  "compatibilidad": 85,
  "sugerencias": [
    "Sugerencia concreta 1",
    "Sugerencia concreta 2"
  ],
  "resumenOptimizado": "Propuesta de resumen profesional en primera persona, orientado al puesto."
}

Reglas:
- compatibilidad: entero 0-100 que refleja que tan bien encaja el perfil con el puesto.
- sugerencias: entre 2 y 5 acciones concretas para mejorar la candidatura.
- resumenOptimizado: resumen reescrito que destaque el valor del candidato para ese puesto especifico.
- Responde en espanol, sin emojis, tono profesional.`;

  const response = await ai.models.generateContent({
    model: MODELO,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { temperature: 0.3, responseMimeType: 'application/json' },
  });

  const texto = response.text ?? '';
  if (!texto) throw new Error('Respuesta vacia de Gemini');

  const datos = extraerJSON(texto) as Record<string, unknown>;

  return {
    compatibilidad:
      typeof datos.compatibilidad === 'number'
        ? Math.min(100, Math.max(0, Math.round(datos.compatibilidad)))
        : 50,
    sugerencias: Array.isArray(datos.sugerencias)
      ? datos.sugerencias
          .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
          .map((s) => s.trim())
          .slice(0, 5)
      : [],
    resumenOptimizado:
      typeof datos.resumenOptimizado === 'string' ? datos.resumenOptimizado.trim() : '',
  };
}

// ── API pública — usa conFallback con todas las keys disponibles ───────────────

export interface ResultadoOptimizacion {
  compatibilidad: number;
  sugerencias: string[];
  resumenOptimizado: string;
}

export async function analizarCv(buffer: Buffer): Promise<AnalisisCv> {
  return conFallback(geminiClients().map((ai) => () => _analizarCv(ai, buffer)));
}

export async function chatConCv(
  historial: MensajeChat[],
  mensaje: string,
  pdfBuffers?: Buffer[],
): Promise<string> {
  return conFallback(geminiClients().map((ai) => () => _chatConCv(ai, historial, mensaje, pdfBuffers)));
}

export async function optimizarPerfilParaPuesto(
  puesto: string,
  resumen: string,
  habilidades: string[],
): Promise<ResultadoOptimizacion> {
  return conFallback(geminiClients().map((ai) => () => _optimizarPerfilParaPuesto(ai, puesto, resumen, habilidades)));
}
