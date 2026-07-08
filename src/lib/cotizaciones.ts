export const TIPO_CAMBIO_USD_CRC = 520; // 1 USD = 520 CRC (tasa de referencia para conversiones cruzadas)

export interface DesgloseCalculo {
  costoBase: number;
  ajusteComplejidad: number;
  ajusteModalidad: number;
  ajusteStack: number;
  subtotal: number;
  montoIva: number;
  totalEstimado: number;
  rangoMin: number;
  rangoMax: number;
  // Conversión cruzada para mostrar en UI
  montoIvaAlternativo: number;
  totalEstimadoAlternativo: number;
  rangoMinAlternativo: number;
  rangoMaxAlternativo: number;
  tasaCambio: number;
}

/**
 * Realiza el cálculo matemático transparente de la cotización.
 * Seguro para importar tanto en cliente (para actualizaciones en vivo) como en servidor.
 */
export function calcularDetalleCotizacion(
  horas: number,
  tarifaBase: number,
  complejidad: "baja" | "media" | "alta",
  modalidad: "remoto" | "hibrido" | "presencial",
  numTecnologias: number,
  aplicarIva: boolean,
  moneda: "USD" | "CRC"
): DesgloseCalculo {
  // Multiplicadores
  const multComplejidad = complejidad === "alta" ? 1.4 : complejidad === "media" ? 1.2 : 1.0;
  const multModalidad = modalidad === "presencial" ? 1.15 : modalidad === "hibrido" ? 1.05 : 1.0;
  
  // Ajuste por stack tecnológico (0.02 extra por cada tecnología, tope en 1.15 para integrar)
  const multStack = Math.min(1.0 + numTecnologias * 0.02, 1.15);

  // Cálculos base
  const costoBase = horas * tarifaBase;
  const ajusteComplejidad = costoBase * (multComplejidad - 1.0);
  const ajusteModalidad = costoBase * (multModalidad - 1.0);
  const ajusteStack = costoBase * (multStack - 1.0);

  const subtotal = costoBase + ajusteComplejidad + ajusteModalidad + ajusteStack;
  const montoIva = aplicarIva ? subtotal * 0.13 : 0.0;
  const totalEstimado = subtotal + montoIva;

  // Rangos: Mínimo (-15% si todo fluye perfecto) y Máximo (+20% margen de riesgo/scope creep)
  const rangoMin = totalEstimado * 0.85;
  const rangoMax = totalEstimado * 1.20;

  // Conversiones a la otra moneda
  let montoIvaAlternativo = 0;
  let totalEstimadoAlternativo = 0;
  let rangoMinAlternativo = 0;
  let rangoMaxAlternativo = 0;

  if (moneda === "USD") {
    montoIvaAlternativo = montoIva * TIPO_CAMBIO_USD_CRC;
    totalEstimadoAlternativo = totalEstimado * TIPO_CAMBIO_USD_CRC;
    rangoMinAlternativo = rangoMin * TIPO_CAMBIO_USD_CRC;
    rangoMaxAlternativo = rangoMax * TIPO_CAMBIO_USD_CRC;
  } else {
    montoIvaAlternativo = montoIva / TIPO_CAMBIO_USD_CRC;
    totalEstimadoAlternativo = totalEstimado / TIPO_CAMBIO_USD_CRC;
    rangoMinAlternativo = rangoMin / TIPO_CAMBIO_USD_CRC;
    rangoMaxAlternativo = rangoMax / TIPO_CAMBIO_USD_CRC;
  }

  return {
    costoBase,
    ajusteComplejidad,
    ajusteModalidad,
    ajusteStack,
    subtotal,
    montoIva,
    totalEstimado,
    rangoMin,
    rangoMax,
    montoIvaAlternativo,
    totalEstimadoAlternativo,
    rangoMinAlternativo,
    rangoMaxAlternativo,
    tasaCambio: TIPO_CAMBIO_USD_CRC,
  };
}
