// Helpers de formato de tiempo en español. Sin dependencias externas.

const DIVISIONES: Array<{ limite: number; divisor: number; unidad: Intl.RelativeTimeFormatUnit }> = [
  { limite: 60, divisor: 1, unidad: "second" },
  { limite: 3600, divisor: 60, unidad: "minute" },
  { limite: 86_400, divisor: 3600, unidad: "hour" },
  { limite: 604_800, divisor: 86_400, unidad: "day" },
  { limite: 2_629_800, divisor: 604_800, unidad: "week" },
  { limite: 31_557_600, divisor: 2_629_800, unidad: "month" },
  { limite: Infinity, divisor: 31_557_600, unidad: "year" },
];

const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

// Devuelve una frase relativa en español, p. ej. "hace 2 horas", "hace 3 días".
// Si la fecha es null/indefinida devuelve null para que la UI decida el fallback.
export function tiempoRelativo(fecha: Date | string | null | undefined): string | null {
  if (!fecha) return null;
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  const ms = d.getTime();
  if (Number.isNaN(ms)) return null;

  const segundos = Math.round((ms - Date.now()) / 1000);
  const abs = Math.abs(segundos);
  if (abs < 30) return "hace un momento";

  for (const { limite, divisor, unidad } of DIVISIONES) {
    if (abs < limite) {
      return rtf.format(Math.round(segundos / divisor), unidad);
    }
  }
  return null;
}
