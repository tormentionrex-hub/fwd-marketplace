/**
 * Generador de avatares-retrato FWD (estilo vector semirealista).
 *
 * Crea un retrato determinista a partir del nombre: cara ovalada con
 * sombreado, ojos detallados, cejas, labios y peinado con luces/sombras
 * sobre un fondo tipo estudio. Devuelto como data-URI para <img src>.
 * Sin red, sin assets, sin librerías: mismo nombre => mismo retrato.
 */

const FONDOS: readonly (readonly [string, string])[] = [
  ["#1E3A5F", "#0B1F38"],
  ["#3A2357", "#160A2B"],
  ["#0E4D52", "#06262A"],
  ["#3D2B53", "#15182F"],
  ["#5A2347", "#1E0E22"],
  ["#173A63", "#0A1B33"],
];

const PIEL = ["#F4C8A0", "#EAB892", "#DDA37B", "#C98A60", "#AE7149", "#8C5733", "#6E4426"];
const PELO = ["#1A1614", "#2A1B12", "#46291A", "#6B4324", "#8A5A2B", "#A9743A", "#2E2E2E", "#6E6E6E"];
const IRIS = ["#5B3A1E", "#6F4E2A", "#3C6E4F", "#3B6EA5", "#7A5230", "#46352A"];
const ROPA = ["#0E3D8A", "#1E2A78", "#27348B", "#155E63", "#7A1F5C", "#234E70", "#384152", "#7A3B2E"];

/** Hash estable (FNV-like). */
function hashNombre(nombre: string): number {
  let h = 2166136261;
  for (let i = 0; i < nombre.length; i++) {
    h ^= nombre.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** PRNG determinista (mulberry32). */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));

/** Mezcla un color hacia negro (amt<0) o blanco (amt>0). amt ∈ [-1,1]. */
function shade(hex: string, amt: number): string {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  const t = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  const mix = (c: number) => clamp((t - c) * p + c);
  return (
    "#" +
    [mix(r), mix(g), mix(b)]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")
  );
}

/** Iniciales (hasta 2) en mayúscula. */
export function iniciales(nombre: string): string {
  const parts = nombre.trim().split(/\s+/).filter(Boolean);
  return (
    parts
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join("") || "FWD"
  );
}

/**
 * Devuelve un data-URI SVG con un retrato semirealista para `nombre`.
 */
export function generarAvatar(nombre: string): string {
  const rnd = mulberry32(hashNombre(nombre || "FWD"));
  const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rnd() * arr.length)]!;

  const [b1, b2] = pick(FONDOS);
  const piel = pick(PIEL);
  const pelo = pick(PELO);
  const iris = pick(IRIS);
  const ropa = pick(ROPA);
  const estilo = Math.floor(rnd() * 4); // 0 corto · 1 largo · 2 recogido · 3 rizado
  const gafas = rnd() < 0.25;
  const sonrisa = rnd() < 0.55;

  const pielLuz = shade(piel, 0.14);
  const pielSombra = shade(piel, -0.16);
  const labio = shade(piel, -0.28);
  const labioLuz = shade(piel, -0.14);
  const peloLuz = shade(pelo, 0.22);
  const peloSombra = shade(pelo, -0.22);

  // ── Contornos ────────────────────────────────────────────────────
  const caraPath =
    "M100 56 C123 56 140 74 140 101 C140 123 131 140 115 150 C110 153 105 154 100 154 " +
    "C95 154 90 153 85 150 C69 140 60 123 60 101 C60 74 77 56 100 56 Z";

  // Pelo trasero según estilo (detrás de la cabeza).
  let peloAtras = "";
  if (estilo === 3) {
    // Afro / rizado: nube de círculos texturizada.
    const pts: [number, number, number][] = [
      [100, 52, 26], [70, 62, 22], [130, 62, 22], [54, 88, 20],
      [146, 88, 20], [62, 112, 17], [138, 112, 17], [86, 50, 18], [114, 50, 18],
    ];
    peloAtras =
      pts.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#pelo)"/>`).join("") +
      pts.slice(0, 5).map(([x, y, r]) => `<circle cx="${x - 4}" cy="${y - 4}" r="${r * 0.5}" fill="${peloSombra}" opacity="0.35"/>`).join("");
  } else {
    // Casquete superior (corto/largo/recogido).
    peloAtras =
      `<path d="M50 120 C46 72 72 48 100 48 C128 48 154 72 150 120 C150 100 132 72 100 72 C68 72 50 100 50 120 Z" fill="url(#pelo)"/>`;
    if (estilo === 1) {
      // Largo: melena cayendo a los hombros.
      peloAtras =
        `<path d="M52 104 C46 140 56 168 70 182 L88 182 C74 160 70 130 72 108 Z" fill="url(#pelo)"/>` +
        `<path d="M148 104 C154 140 144 168 130 182 L112 182 C126 160 130 130 128 108 Z" fill="url(#pelo)"/>` +
        peloAtras;
    } else if (estilo === 2) {
      // Recogido: moño detrás-arriba.
      peloAtras += `<circle cx="100" cy="46" r="15" fill="url(#pelo)"/><circle cx="100" cy="46" r="15" fill="${peloSombra}" opacity="0.25"/>`;
    }
  }

  // Flequillo / nacimiento del pelo al frente (todos menos rizado).
  const flequillo =
    estilo !== 3
      ? `<path d="M60 88 C64 68 82 60 100 66 C118 60 136 68 140 88 C128 76 116 74 100 78 C84 74 72 76 60 88 Z" fill="url(#pelo)"/>`
      : "";

  // ── Ojos ─────────────────────────────────────────────────────────
  const ojo = (cx: number) =>
    `<ellipse cx="${cx}" cy="105" rx="9" ry="5.6" fill="#f6f1ea"/>` +
    `<circle cx="${cx}" cy="105" r="4.6" fill="url(#iris)"/>` +
    `<circle cx="${cx}" cy="105" r="2.1" fill="#15110d"/>` +
    `<circle cx="${cx - 1.6}" cy="103" r="1.3" fill="#ffffff"/>` +
    `<path d="M${cx - 9} 102 Q${cx} 97 ${cx + 9} 102" stroke="${peloSombra}" stroke-width="1.8" fill="none" stroke-linecap="round"/>` +
    `<path d="M${cx - 9} 105 Q${cx} 111 ${cx + 9} 105" stroke="${pielSombra}" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.6"/>`;

  const ceja = (cx: number) =>
    `<path d="M${cx - 10} 93 Q${cx} 86 ${cx + 10} 92 Q${cx} 90 ${cx - 10} 95 Z" fill="${peloSombra}"/>`;

  // ── Boca ─────────────────────────────────────────────────────────
  const boca = sonrisa
    ? `<path d="M86 128 Q100 132 114 128 Q108 140 100 140 Q92 140 86 128 Z" fill="${labio}"/>` +
      `<path d="M88 129 Q100 133 112 129 Q100 136 88 129 Z" fill="${labioLuz}"/>` +
      `<path d="M86 128 Q100 131 114 128" stroke="${shade(piel, -0.4)}" stroke-width="1" fill="none"/>`
    : `<path d="M88 130 Q100 127 112 130 Q100 133 88 130 Z" fill="${labio}"/>` +
      `<path d="M88 134 Q100 138 112 134 Q100 136 88 134 Z" fill="${labioLuz}"/>` +
      `<line x1="89" y1="131" x2="111" y2="131" stroke="${shade(piel, -0.4)}" stroke-width="1"/>`;

  const gafasSvg = gafas
    ? `<g stroke="#222a36" stroke-width="3" fill="rgba(255,255,255,0.06)">` +
      `<rect x="73" y="98" width="22" height="16" rx="6"/><rect x="105" y="98" width="22" height="16" rx="6"/>` +
      `<line x1="95" y1="105" x2="105" y2="105"/></g>`
    : "";

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img" aria-label="${iniciales(nombre)}">` +
    `<defs>` +
    `<radialGradient id="bg" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="${shade(b1, 0.12)}"/><stop offset="1" stop-color="${b2}"/></radialGradient>` +
    `<radialGradient id="piel" cx="42%" cy="34%" r="75%"><stop offset="0" stop-color="${pielLuz}"/><stop offset="0.7" stop-color="${piel}"/><stop offset="1" stop-color="${pielSombra}"/></radialGradient>` +
    `<linearGradient id="pelo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${peloLuz}"/><stop offset="1" stop-color="${peloSombra}"/></linearGradient>` +
    `<radialGradient id="iris" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="${shade(iris, 0.25)}"/><stop offset="1" stop-color="${shade(iris, -0.2)}"/></radialGradient>` +
    `<linearGradient id="ropa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(ropa, 0.12)}"/><stop offset="1" stop-color="${shade(ropa, -0.18)}"/></linearGradient>` +
    `</defs>` +
    `<rect width="200" height="200" fill="url(#bg)"/>` +
    `<ellipse cx="100" cy="96" rx="92" ry="92" fill="#ffffff" opacity="0.04"/>` +
    // Hombros / ropa
    `<path d="M34 200 C34 168 60 150 100 150 C140 150 166 168 166 200 Z" fill="url(#ropa)"/>` +
    `<path d="M86 152 Q100 166 114 152 L114 150 L86 150 Z" fill="${shade(piel, -0.22)}"/>` +
    // Cuello
    `<path d="M86 134 L86 152 Q100 160 114 152 L114 134 Z" fill="${piel}"/>` +
    `<path d="M86 134 L86 144 Q100 150 114 144 L114 134 Z" fill="${pielSombra}" opacity="0.55"/>` +
    // Pelo trasero
    peloAtras +
    // Orejas
    `<ellipse cx="59" cy="108" rx="7" ry="10" fill="${piel}"/><ellipse cx="141" cy="108" rx="7" ry="10" fill="${piel}"/>` +
    `<ellipse cx="59" cy="108" rx="3" ry="5" fill="${pielSombra}" opacity="0.6"/><ellipse cx="141" cy="108" rx="3" ry="5" fill="${pielSombra}" opacity="0.6"/>` +
    // Cara
    `<path d="${caraPath}" fill="url(#piel)"/>` +
    // Mejillas y sombra de mandíbula
    `<ellipse cx="78" cy="120" rx="9" ry="6" fill="${shade(piel, -0.05)}" opacity="0.5"/>` +
    `<ellipse cx="122" cy="120" rx="9" ry="6" fill="${shade(piel, -0.05)}" opacity="0.5"/>` +
    // Nariz
    `<path d="M100 104 C97 112 95 118 100 121 C103 121 106 120 107 118" fill="none" stroke="${pielSombra}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<ellipse cx="96" cy="121" rx="1.6" ry="1.2" fill="${shade(piel, -0.35)}"/><ellipse cx="104" cy="121" rx="1.6" ry="1.2" fill="${shade(piel, -0.35)}"/>` +
    ceja(82) +
    ceja(118) +
    ojo(82) +
    ojo(118) +
    boca +
    flequillo +
    gafasSvg +
    `</svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
