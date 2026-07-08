import "server-only";
import { llamarIA } from "@/lib/ia-fallback";
import {
  guardarCotizacion as guardarCotizacionRepo,
  obtenerCotizacionesDeEstudiante,
  eliminarCotizacion as eliminarCotizacionRepo,
} from "@/server/repositories/cotizaciones.repository";
import type { CotizacionInput } from "@/server/validation/cotizaciones.schema";
import type { Prisma } from "@prisma/client";

import { calcularDetalleCotizacion } from "@/lib/cotizaciones";

export interface EstimacionIaResultado {
  horasEstimadas: number;
  complejidad: "baja" | "media" | "alta";
  modalidad: "remoto" | "hibrido" | "presencial";
  funcionalidades: { nombre: string; horas: number }[];
  explicacion: string;
  rangoReferencia: string;
}


/**
 * Servicio para calcular, validar y guardar una cotización en la base de datos.
 */
export async function guardarCotizacionService(idEstudiante: string, input: CotizacionInput) {
  // Calculamos el desglose matemático en el servidor como fuente de verdad
  const desglose = calcularDetalleCotizacion(
    input.horasEstimadas,
    input.tarifaBaseHora,
    input.complejidad,
    input.modalidad,
    input.stack.length,
    input.iva,
    input.moneda
  );

  return guardarCotizacionRepo(idEstudiante, {
    nombreProyecto: input.nombreProyecto,
    descripcion: input.descripcion ?? null,
    duracionSemanas: input.duracionSemanas,
    horasEstimadas: input.horasEstimadas,
    complejidad: input.complejidad,
    stack: input.stack,
    funcionalidades: input.funcionalidades,
    tarifaBaseHora: input.tarifaBaseHora,
    modalidad: input.modalidad,
    iva: input.iva,
    rangoMin: desglose.rangoMin,
    rangoEstimado: desglose.totalEstimado,
    rangoMax: desglose.rangoMax,
    moneda: input.moneda,
    desglose: desglose as unknown as Prisma.InputJsonValue,
    explicacionIa: null, // Rellenado si el cálculo viene por asistente IA
    idProyecto: input.idProyecto ?? null,
    idPostulacion: input.idPostulacion ?? null,
  });
}

/**
 * Lista las cotizaciones de un estudiante.
 */
export async function listarCotizacionesService(idEstudiante: string) {
  const cotizaciones = await obtenerCotizacionesDeEstudiante(idEstudiante);
  
  // Formateamos montos Decimal de Prisma a numbers de JS para que puedan serializarse como JSON
  return cotizaciones.map((c) => ({
    ...c,
    tarifa_base_hora: Number(c.tarifa_base_hora),
    rango_min: Number(c.rango_min),
    rango_estimado: Number(c.rango_estimado),
    rango_max: Number(c.rango_max),
  }));
}

/**
 * Elimina una cotización verificando que pertenezca al estudiante.
 */
export async function eliminarCotizacionService(idCotizacion: string, idEstudiante: string) {
  return eliminarCotizacionRepo(idCotizacion, idEstudiante);
}

/**
 * Servicio que utiliza Gemini para estimar un proyecto a partir de su descripción.
 */
export async function estimarCotizacionConIA(
  descripcion: string,
  stack: string[]
): Promise<EstimacionIaResultado> {
  const userMsg = `Descripción del proyecto:\n"${descripcion}"\n\nStack tecnológico deseado:\n${
    stack.length > 0 ? stack.join(", ") : "No especificado"
  }`;

  const promptSistema = `Sos un estimador experto de proyectos de desarrollo de software para programadores junior de FWD Costa Rica (comunidad talentosa en formación tecnológica).
Analizás la descripción de un proyecto freelance y su stack tecnológico, y sugerís estimaciones realistas basadas en el mercado costarricense.

Reglas obligatorias:
- NUNCA uses emojis en tus justificaciones o explicaciones. Está terminantemente prohibido usar emojis.
- Devuelve la respuesta en formato JSON puro. No agregues bloques de markdown, texto introductorio ni explicaciones fuera del JSON.
- Sugerí una lista de funcionalidades recomendadas con un estimado de horas realista para cada una.
- El total de horas de las funcionalidades debe sumar exactamente el valor del campo "horasEstimadas".
- La complejidad debe ser una de las siguientes opciones: "baja", "media", "alta".
- La modalidad recomendada debe ser una de las siguientes opciones: "remoto", "hibrido", "presencial".
- Justifica de manera simple y clara por qué estimas esa cantidad de horas y complejidad (máximo 400 caracteres) enfocado a un perfil junior.

El JSON de salida debe tener exactamente este formato (sin rodeos, solo el JSON):
{
  "horasEstimadas": number,
  "complejidad": "baja" | "media" | "alta",
  "modalidad": "remoto" | "hibrido" | "presencial",
  "funcionalidades": [
    { "nombre": "Nombre de la funcionalidad", "horas": number }
  ],
  "explicacion": "Explicación simple y clara sin emojis sobre por qué se estima este precio y complejidad.",
  "rangoReferencia": "Rango de mercado de referencia en Costa Rica para un junior (ej: $15 - $25/hora)"
}`;

  let texto: string;
  try {
    const apiKeyCal = process.env.OPENROUTER_API_KEY_CALCULADORA;
    const modelosCalculadora = apiKeyCal
      ? ["google/gemini-2.5-flash", "openai/gpt-4o-mini"]
      : undefined;

    texto = await llamarIA(
      [
        { role: "system", content: promptSistema },
        { role: "user", content: userMsg },
      ],
      { temperature: 0.2, max_tokens: 800 },
      modelosCalculadora,
      undefined,
      apiKeyCal
    );
  } catch (err) {
    console.error("[cotizaciones-ia] Falló la llamada a la IA:", err);
    throw new Error("No se pudo conectar con el servicio de IA. Inténtalo de nuevo.");
  }

  try {
    const datos = extraerJSON(texto) as {
      horasEstimadas?: number;
      complejidad?: string;
      modalidad?: string;
      funcionalidades?: Array<{ nombre?: string; horas?: number }>;
      explicacion?: string;
      rangoReferencia?: string;
    };
    return {
      horasEstimadas: Number(datos.horasEstimadas) || 10,
      complejidad:
        typeof datos.complejidad === "string" && ["baja", "media", "alta"].includes(datos.complejidad)
          ? (datos.complejidad as "baja" | "media" | "alta")
          : "media",
      modalidad:
        typeof datos.modalidad === "string" && ["remoto", "hibrido", "presencial"].includes(datos.modalidad)
          ? (datos.modalidad as "remoto" | "hibrido" | "presencial")
          : "remoto",
      funcionalidades: Array.isArray(datos.funcionalidades)
        ? datos.funcionalidades.map((f) => ({
            nombre: String(f?.nombre || "Funcionalidad general"),
            horas: Number(f?.horas) || 4,
          }))
        : [],
      explicacion: String(datos.explicacion || "Estimación generada por el asistente IA de FWD."),
      rangoReferencia: String(datos.rangoReferencia || "Mercado Junior: $10 - $20/hora"),
    };
  } catch (err) {
    console.error("[cotizaciones-ia] Error al parsear JSON de la IA. Respuesta:", texto);
    throw new Error("La IA no devolvió un formato de respuesta legible. Inténtalo de nuevo.");
  }
}

/**
 * Helper para extraer JSON de una respuesta de texto libre.
 */
function extraerJSON(texto: string): unknown {
  try {
    return JSON.parse(texto.trim());
  } catch {}

  const bloque = texto.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (bloque?.[1]) {
    try {
      return JSON.parse(bloque[1].trim());
    } catch {}
  }

  const objeto = texto.match(/\{[\s\S]*\}/);
  if (objeto?.[0]) {
    try {
      return JSON.parse(objeto[0]);
    } catch {}
  }

  throw new Error("No se encontró JSON válido en la respuesta");
}
