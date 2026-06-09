/**
 * Generador de códigos QR sin dependencias externas.
 *
 * Port compacto (modo byte / UTF-8) del "QR Code generator" de Project Nayuki
 * (https://www.nayuki.io/page/qr-code-generator-library), MIT License.
 * Se incluye en el repo para no agregar dependencias y para NO enviar la URL del
 * perfil a ningún servicio externo: todo el cálculo ocurre en el cliente.
 *
 * Nota: el algoritmo garantiza que los índices de array existen, por eso se usan
 * aserciones `!` (el tsconfig tiene `noUncheckedIndexedAccess`).
 *
 * Uso:
 *   const qr = encodeQrText("https://...", "M");
 *   qr.modules[y][x] === true  // módulo oscuro
 */

export type EccLabel = "L" | "M" | "Q" | "H";

// Ordinal por nivel de corrección (índice en las tablas) y bits de formato.
const ECC_ORDINAL: Record<EccLabel, number> = { L: 0, M: 1, Q: 2, H: 3 };
const ECC_FORMAT_BITS: Record<EccLabel, number> = { L: 1, M: 0, Q: 3, H: 2 };

// Códigos de corrección por bloque, por nivel (L,M,Q,H) y versión 1..40.
const ECC_CODEWORDS_PER_BLOCK: number[][] = [
  [7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  [13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
];

// Número de bloques de corrección, por nivel (L,M,Q,H) y versión 1..40.
const NUM_ERROR_CORRECTION_BLOCKS: number[][] = [
  [1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  [1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  [1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  [1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
];

export interface QrMatrix {
  size: number;
  /** modules[y][x] — true = oscuro. */
  modules: boolean[][];
}

function getNumRawDataModules(ver: number): number {
  let result = (16 * ver + 128) * ver + 64;
  if (ver >= 2) {
    const numAlign = Math.floor(ver / 7) + 2;
    result -= (25 * numAlign - 10) * numAlign - 55;
    if (ver >= 7) result -= 36;
  }
  return result;
}

function getNumDataCodewords(ver: number, ecl: number): number {
  return (
    Math.floor(getNumRawDataModules(ver) / 8) -
    ECC_CODEWORDS_PER_BLOCK[ecl]![ver - 1]! * NUM_ERROR_CORRECTION_BLOCKS[ecl]![ver - 1]!
  );
}

// ---- Reed-Solomon ----------------------------------------------------------

function reedSolomonMultiply(x: number, y: number): number {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z & 0xff;
}

function reedSolomonDivisor(degree: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < degree - 1; i++) result.push(0);
  result.push(1);
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < result.length; j++) {
      result[j] = reedSolomonMultiply(result[j]!, root);
      if (j + 1 < result.length) result[j] = result[j]! ^ result[j + 1]!;
    }
    root = reedSolomonMultiply(root, 0x02);
  }
  return result;
}

function reedSolomonRemainder(data: number[], divisor: number[]): number[] {
  const result = divisor.map(() => 0);
  for (const b of data) {
    const factor = b ^ result.shift()!;
    result.push(0);
    divisor.forEach((coef, i) => {
      result[i] = result[i]! ^ reedSolomonMultiply(coef, factor);
    });
  }
  return result;
}

// ---- Encoder ---------------------------------------------------------------

function utf8Bytes(str: string): number[] {
  // encodeURIComponent es la forma más portable de obtener UTF-8 byte a byte.
  const out: number[] = [];
  const enc = encodeURIComponent(str);
  for (let i = 0; i < enc.length; i++) {
    if (enc[i] === "%") {
      out.push(parseInt(enc.substr(i + 1, 2), 16));
      i += 2;
    } else {
      out.push(enc.charCodeAt(i));
    }
  }
  return out;
}

class QrBuilder {
  readonly size: number;
  readonly modules: boolean[][];
  private readonly isFunction: boolean[][];

  constructor(
    private readonly version: number,
    private readonly eclOrdinal: number,
    private readonly eclFormatBits: number,
    dataCodewords: number[],
  ) {
    this.size = version * 4 + 17;
    this.modules = Array.from({ length: this.size }, () => new Array<boolean>(this.size).fill(false));
    this.isFunction = Array.from({ length: this.size }, () => new Array<boolean>(this.size).fill(false));

    this.drawFunctionPatterns();
    const allCodewords = this.addEccAndInterleave(dataCodewords);
    this.drawCodewords(allCodewords);
    const mask = this.chooseBestMask();
    this.applyMask(mask);
    this.drawFormatBits(mask);
  }

  // --- function patterns ---

  private setFunctionModule(x: number, y: number, isDark: boolean): void {
    this.modules[y]![x] = isDark;
    this.isFunction[y]![x] = true;
  }

  private drawFinderPattern(x: number, y: number): void {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        const xx = x + dx;
        const yy = y + dy;
        if (xx >= 0 && xx < this.size && yy >= 0 && yy < this.size) {
          this.setFunctionModule(xx, yy, dist !== 2 && dist !== 4);
        }
      }
    }
  }

  private drawAlignmentPattern(x: number, y: number): void {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        this.setFunctionModule(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      }
    }
  }

  private getAlignmentPatternPositions(): number[] {
    if (this.version === 1) return [];
    const numAlign = Math.floor(this.version / 7) + 2;
    const step =
      this.version === 32 ? 26 : Math.ceil((this.size - 13) / (numAlign * 2 - 2)) * 2;
    const result: number[] = [6];
    for (let pos = this.size - 7; result.length < numAlign; pos -= step) {
      result.splice(1, 0, pos);
    }
    return result;
  }

  private drawFunctionPatterns(): void {
    // Timing patterns
    for (let i = 0; i < this.size; i++) {
      this.setFunctionModule(6, i, i % 2 === 0);
      this.setFunctionModule(i, 6, i % 2 === 0);
    }
    // Finders
    this.drawFinderPattern(3, 3);
    this.drawFinderPattern(this.size - 4, 3);
    this.drawFinderPattern(3, this.size - 4);
    // Alignment
    const positions = this.getAlignmentPatternPositions();
    const n = positions.length;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (!((i === 0 && j === 0) || (i === 0 && j === n - 1) || (i === n - 1 && j === 0))) {
          this.drawAlignmentPattern(positions[i]!, positions[j]!);
        }
      }
    }
    // Format + version: reservar dibujando placeholders (se sobrescriben luego).
    this.drawFormatBits(0);
    this.drawVersion();
  }

  private drawFormatBits(mask: number): void {
    const data = (this.eclFormatBits << 3) | mask;
    let rem = data;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const bits = ((data << 10) | rem) ^ 0x5412;

    for (let i = 0; i <= 5; i++) this.setFunctionModule(8, i, ((bits >>> i) & 1) !== 0);
    this.setFunctionModule(8, 7, ((bits >>> 6) & 1) !== 0);
    this.setFunctionModule(8, 8, ((bits >>> 7) & 1) !== 0);
    this.setFunctionModule(7, 8, ((bits >>> 8) & 1) !== 0);
    for (let i = 9; i < 15; i++) this.setFunctionModule(14 - i, 8, ((bits >>> i) & 1) !== 0);

    for (let i = 0; i < 8; i++) this.setFunctionModule(this.size - 1 - i, 8, ((bits >>> i) & 1) !== 0);
    for (let i = 8; i < 15; i++) this.setFunctionModule(8, this.size - 15 + i, ((bits >>> i) & 1) !== 0);
    this.setFunctionModule(8, this.size - 8, true); // módulo siempre oscuro
  }

  private drawVersion(): void {
    if (this.version < 7) return;
    let rem = this.version;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const bits = (this.version << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const bit = ((bits >>> i) & 1) !== 0;
      const a = this.size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      this.setFunctionModule(a, b, bit);
      this.setFunctionModule(b, a, bit);
    }
  }

  // --- data ---

  private addEccAndInterleave(data: number[]): number[] {
    const ver = this.version;
    const ecl = this.eclOrdinal;
    const numBlocks = NUM_ERROR_CORRECTION_BLOCKS[ecl]![ver - 1]!;
    const blockEccLen = ECC_CODEWORDS_PER_BLOCK[ecl]![ver - 1]!;
    const rawCodewords = Math.floor(getNumRawDataModules(ver) / 8);
    const numShortBlocks = numBlocks - (rawCodewords % numBlocks);
    const shortBlockLen = Math.floor(rawCodewords / numBlocks);

    const blocks: number[][] = [];
    const rsDiv = reedSolomonDivisor(blockEccLen);
    let k = 0;
    for (let i = 0; i < numBlocks; i++) {
      const datLen = shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1);
      const dat = data.slice(k, k + datLen);
      k += datLen;
      const ecc = reedSolomonRemainder(dat.slice(), rsDiv);
      if (i < numShortBlocks) dat.push(0);
      blocks.push(dat.concat(ecc));
    }

    const result: number[] = [];
    const blockLen = blocks[0]!.length;
    for (let i = 0; i < blockLen; i++) {
      blocks.forEach((block, j) => {
        // saltar la celda de relleno de los bloques cortos
        if (i !== shortBlockLen - blockEccLen || j >= numShortBlocks) {
          result.push(block[i]!);
        }
      });
    }
    return result;
  }

  private drawCodewords(data: number[]): void {
    let i = 0;
    for (let right = this.size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let vert = 0; vert < this.size; vert++) {
        for (let j = 0; j < 2; j++) {
          const x = right - j;
          const upward = ((right + 1) & 2) === 0;
          const y = upward ? this.size - 1 - vert : vert;
          if (!this.isFunction[y]![x] && i < data.length * 8) {
            this.modules[y]![x] = ((data[i >>> 3]! >>> (7 - (i & 7))) & 1) !== 0;
            i++;
          }
        }
      }
    }
  }

  // --- masking ---

  private applyMask(mask: number): void {
    for (let y = 0; y < this.size; y++) {
      const fnRow = this.isFunction[y]!;
      const modRow = this.modules[y]!;
      for (let x = 0; x < this.size; x++) {
        if (fnRow[x]) continue;
        let invert = false;
        switch (mask) {
          case 0: invert = (x + y) % 2 === 0; break;
          case 1: invert = y % 2 === 0; break;
          case 2: invert = x % 3 === 0; break;
          case 3: invert = (x + y) % 3 === 0; break;
          case 4: invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break;
          case 5: invert = ((x * y) % 2) + ((x * y) % 3) === 0; break;
          case 6: invert = (((x * y) % 2) + ((x * y) % 3)) % 2 === 0; break;
          case 7: invert = (((x + y) % 2) + ((x * y) % 3)) % 2 === 0; break;
        }
        if (invert) modRow[x] = !modRow[x];
      }
    }
  }

  private chooseBestMask(): number {
    let bestMask = 0;
    let minPenalty = Infinity;
    for (let mask = 0; mask < 8; mask++) {
      this.applyMask(mask);
      this.drawFormatBits(mask);
      const penalty = this.getPenaltyScore();
      if (penalty < minPenalty) {
        minPenalty = penalty;
        bestMask = mask;
      }
      this.applyMask(mask); // revertir (XOR de nuevo)
    }
    return bestMask;
  }

  private getPenaltyScore(): number {
    let result = 0;
    const size = this.size;
    const mods = this.modules;

    // Filas
    for (let y = 0; y < size; y++) {
      const row = mods[y]!;
      let runColor = false;
      let runX = 0;
      for (let x = 0; x < size; x++) {
        if (row[x] === runColor) {
          runX++;
          if (runX === 5) result += 3;
          else if (runX > 5) result++;
        } else {
          runColor = row[x]!;
          runX = 1;
        }
      }
    }
    // Columnas
    for (let x = 0; x < size; x++) {
      let runColor = false;
      let runY = 0;
      for (let y = 0; y < size; y++) {
        if (mods[y]![x] === runColor) {
          runY++;
          if (runY === 5) result += 3;
          else if (runY > 5) result++;
        } else {
          runColor = mods[y]![x]!;
          runY = 1;
        }
      }
    }
    // Bloques 2x2
    for (let y = 0; y < size - 1; y++) {
      const row = mods[y]!;
      const next = mods[y + 1]!;
      for (let x = 0; x < size - 1; x++) {
        const c = row[x];
        if (c === row[x + 1] && c === next[x] && c === next[x + 1]) {
          result += 3;
        }
      }
    }
    // Proporción oscuro/claro
    let dark = 0;
    for (const row of mods) for (const cell of row) if (cell) dark++;
    const total = size * size;
    const k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
    result += k * 10;

    return result;
  }
}

/** Codifica `text` en una matriz QR (modo byte, UTF-8). */
export function encodeQrText(text: string, ecc: EccLabel = "M"): QrMatrix {
  const eclOrdinal = ECC_ORDINAL[ecc];
  const bytes = utf8Bytes(text);

  // Elegir la versión más pequeña que entre.
  let version = 1;
  for (; version <= 40; version++) {
    const ccBits = version <= 9 ? 8 : 16;
    const capacityBits = getNumDataCodewords(version, eclOrdinal) * 8;
    if (4 + ccBits + bytes.length * 8 <= capacityBits) break;
  }
  if (version > 40) throw new Error("Texto demasiado largo para un código QR");

  // Construir el bit buffer.
  const ccBits = version <= 9 ? 8 : 16;
  const bits: number[] = [];
  const appendBits = (value: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) bits.push((value >>> i) & 1);
  };
  appendBits(0x4, 4); // modo byte
  appendBits(bytes.length, ccBits);
  for (const b of bytes) appendBits(b, 8);

  // Terminador + relleno a múltiplo de 8.
  const dataCapacityBits = getNumDataCodewords(version, eclOrdinal) * 8;
  appendBits(0, Math.min(4, dataCapacityBits - bits.length));
  while (bits.length % 8 !== 0) bits.push(0);

  // Bytes de datos.
  const dataCodewords: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j]!;
    dataCodewords.push(byte);
  }
  // Bytes de relleno.
  for (let pad = 0xec; dataCodewords.length < dataCapacityBits / 8; pad ^= 0xec ^ 0x11) {
    dataCodewords.push(pad);
  }

  const builder = new QrBuilder(version, eclOrdinal, ECC_FORMAT_BITS[ecc], dataCodewords);
  return { size: builder.size, modules: builder.modules };
}
