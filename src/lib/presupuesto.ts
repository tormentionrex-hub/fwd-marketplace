// Helpers para mostrar el presupuesto de un proyecto (moneda + rango).
// Seguros para cliente y servidor (sin dependencias).

export type MonedaProyecto = "CRC" | "USD";

// Símbolo por moneda (para texto). El ícono visual se pinta aparte con lucide.
const SIMBOLO: Record<string, string> = { CRC: "₡", USD: "$" };

export function simboloMoneda(moneda: string): string {
  return SIMBOLO[moneda] ?? "";
}

function fmtNumero(n: number): string {
  return new Intl.NumberFormat("es-CR", { maximumFractionDigits: 0 }).format(Math.round(n));
}

// Formatea el rango de presupuesto: "₡300.000 – ₡500.000" o "$1.000 – $2.000".
// Si solo hay uno de los dos montos, muestra "Desde ₡X" / "Hasta ₡X".
// Devuelve null si no hay presupuesto definido.
export function formatearPresupuesto(
  min: number | null | undefined,
  max: number | null | undefined,
  moneda: string,
): string | null {
  const s = simboloMoneda(moneda);
  const tieneMin = typeof min === "number" && min > 0;
  const tieneMax = typeof max === "number" && max > 0;

  if (tieneMin && tieneMax) {
    if (min === max) return `${s}${fmtNumero(min!)}`;
    return `${s}${fmtNumero(min!)} – ${s}${fmtNumero(max!)}`;
  }
  if (tieneMin) return `Desde ${s}${fmtNumero(min!)}`;
  if (tieneMax) return `Hasta ${s}${fmtNumero(max!)}`;
  return null;
}
