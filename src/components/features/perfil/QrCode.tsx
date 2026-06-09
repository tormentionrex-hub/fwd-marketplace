"use client";

import { useMemo } from "react";
import { encodeQrText, type EccLabel } from "@/lib/qrcodegen";

interface QrCodeProps {
  value: string;
  /** Tamaño en px del lado del QR renderizado. */
  size?: number;
  /** Módulos de borde claro (quiet zone). El estándar pide 4. */
  margin?: number;
  ecc?: EccLabel;
  className?: string;
  /** Color de los módulos oscuros. */
  dark?: string;
  /** Color del fondo. */
  light?: string;
}

/**
 * Renderiza un código QR como SVG nítido (escala vectorial). El cálculo es 100%
 * local — no se envía la URL a ningún servicio externo (ver lib/qrcodegen.ts).
 */
export default function QrCode({
  value,
  size = 200,
  margin = 4,
  ecc = "M",
  className,
  dark = "#0F172A",
  light = "#FFFFFF",
}: QrCodeProps) {
  const { path, dim } = useMemo(() => {
    const qr = encodeQrText(value, ecc);
    const dimension = qr.size + margin * 2;
    let d = "";
    for (let y = 0; y < qr.size; y++) {
      const row = qr.modules[y]!;
      for (let x = 0; x < qr.size; x++) {
        if (row[x]) {
          d += `M${x + margin},${y + margin}h1v1h-1z`;
        }
      }
    }
    return { path: d, dim: dimension };
  }, [value, ecc, margin]);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${dim} ${dim}`}
      className={className}
      shapeRendering="crispEdges"
      role="img"
      aria-label={`Código QR de ${value}`}
    >
      <rect width={dim} height={dim} fill={light} />
      <path d={path} fill={dark} />
    </svg>
  );
}

/** Construye un data-URL PNG del QR para descarga. Solo en cliente. */
export function qrToPngDataUrl(value: string, pixelSize = 1024, ecc: EccLabel = "M"): string {
  const qr = encodeQrText(value, ecc);
  const margin = 4;
  const dim = qr.size + margin * 2;
  const scale = Math.max(1, Math.floor(pixelSize / dim));
  const px = dim * scale;

  const canvas = document.createElement("canvas");
  canvas.width = px;
  canvas.height = px;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, px, px);
  ctx.fillStyle = "#0F172A";
  for (let y = 0; y < qr.size; y++) {
    const row = qr.modules[y]!;
    for (let x = 0; x < qr.size; x++) {
      if (row[x]) {
        ctx.fillRect((x + margin) * scale, (y + margin) * scale, scale, scale);
      }
    }
  }
  return canvas.toDataURL("image/png");
}
