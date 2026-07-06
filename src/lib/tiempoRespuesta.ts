// ─────────────────────────────────────────────────────────────────────────────
// Skill: cálculo de disponibilidad y tiempo de respuesta según la zona horaria
// del dueño del proyecto.
//
// La idea: cada cuenta tendrá un país (campo a agregar en el schema). A partir
// del país se deriva una zona horaria IANA y con la hora local de esa persona
// se estima:
//   - si probablemente está activa (horario diurno) o dormida (madrugada)
//   - un tiempo de respuesta promedio aproximado
//   - la nota del encabezado ("Son las HH:MM para {nombre}...")
//
// Mientras el campo país no exista en la cuenta, se usa una zona horaria base
// (Costa Rica) para que la funcionalidad ya muestre datos reales de la hora.
// ─────────────────────────────────────────────────────────────────────────────

/** Mapa país -> zona horaria IANA. Ampliar a medida que se agreguen países. */
const PAIS_TZ: Record<string, string> = {
  // América
  "Costa Rica": "America/Costa_Rica",
  "México": "America/Mexico_City",
  "Mexico": "America/Mexico_City",
  "Guatemala": "America/Guatemala",
  "El Salvador": "America/El_Salvador",
  "Honduras": "America/Tegucigalpa",
  "Nicaragua": "America/Managua",
  "Panamá": "America/Panama",
  "Panama": "America/Panama",
  "Colombia": "America/Bogota",
  "Venezuela": "America/Caracas",
  "Ecuador": "America/Guayaquil",
  "Perú": "America/Lima",
  "Peru": "America/Lima",
  "Bolivia": "America/La_Paz",
  "Chile": "America/Santiago",
  "Argentina": "America/Argentina/Buenos_Aires",
  "Uruguay": "America/Montevideo",
  "Paraguay": "America/Asuncion",
  "Brasil": "America/Sao_Paulo",
  "Estados Unidos": "America/New_York",
  "Canadá": "America/Toronto",
  "Canada": "America/Toronto",
  // Europa
  "España": "Europe/Madrid",
  "Espana": "Europe/Madrid",
  "Portugal": "Europe/Lisbon",
  "Francia": "Europe/Paris",
  "Alemania": "Europe/Berlin",
  "Italia": "Europe/Rome",
  "Reino Unido": "Europe/London",
  "Países Bajos": "Europe/Amsterdam",
  "Paises Bajos": "Europe/Amsterdam",
  "Bélgica": "Europe/Brussels",
  "Belgica": "Europe/Brussels",
  "Suiza": "Europe/Zurich",
  "Polonia": "Europe/Warsaw",
  "Rusia": "Europe/Moscow",
};

/** Zona horaria por defecto mientras la cuenta no tenga país definido. */
const TZ_BASE = "America/Costa_Rica";

export interface EstadoContacto {
  /** Zona horaria IANA usada para el cálculo. */
  tz: string;
  /** Hora local formateada "HH:MM" (24h) del dueño del proyecto. */
  horaLocal: string;
  /** Hora en formato 24h (0-23). */
  hora24: number;
  /** true si es de noche/madrugada en su país. */
  esNoche: boolean;
  /** true si probablemente está activo (horario diurno 07:00-22:59). */
  activo: boolean;
  /** "Cerca" o "Lejos" según la diferencia horaria con quien mira. */
  lejania: "Cerca" | "Lejos";
  /** Estimación textual del tiempo de respuesta promedio. */
  respuestaPromedio: string;
  /** Nota para el encabezado del chat. */
  notaHeader: string;
}

function horaEnZona(fecha: Date, tz: string): { hh: number; mm: string } {
  try {
    const partes = new Intl.DateTimeFormat("es-CR", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(fecha);
    const hh = Number(partes.find((p) => p.type === "hour")?.value ?? "0") % 24;
    const mm = partes.find((p) => p.type === "minute")?.value ?? "00";
    return { hh, mm };
  } catch {
    return { hh: fecha.getHours(), mm: String(fecha.getMinutes()).padStart(2, "0") };
  }
}

/**
 * Calcula el estado de contacto del dueño del proyecto.
 * @param nombre  Nombre del dueño (para armar la nota del encabezado).
 * @param pais    País de la cuenta (opcional, aún no persistido en el schema).
 */
export function calcularEstadoContacto(nombre: string, pais?: string): EstadoContacto {
  const tz = (pais && PAIS_TZ[pais]) || TZ_BASE;
  const ahora = new Date();

  const { hh, mm } = horaEnZona(ahora, tz);
  const horaLocal = `${String(hh).padStart(2, "0")}:${mm}`;

  const activo = hh >= 7 && hh < 23;
  const esNoche = !activo;

  // Diferencia horaria respecto a quien está mirando la página.
  let hhViewer = hh;
  try {
    const vtz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    hhViewer = horaEnZona(ahora, vtz).hh;
  } catch {
    /* sin zona del visor */
  }
  let diff = Math.abs(hh - hhViewer);
  if (diff > 12) diff = 24 - diff;
  const lejania: "Cerca" | "Lejos" = diff >= 4 ? "Lejos" : "Cerca";

  const respuestaPromedio = activo
    ? "1 hora"
    : hh < 7
      ? "varias horas"
      : "un par de horas";

  const notaHeader = activo
    ? `Son las ${horaLocal} para ${nombre}. Suele responder en poco tiempo.`
    : `Son las ${horaLocal} para ${nombre}. Puede que tardemos un poco en obtener una respuesta.`;

  return {
    tz,
    horaLocal,
    hora24: hh,
    esNoche,
    activo,
    lejania,
    respuestaPromedio,
    notaHeader,
  };
}
