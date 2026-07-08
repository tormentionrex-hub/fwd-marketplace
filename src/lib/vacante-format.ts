// Helpers de presentación de vacantes (formato de salario y etiquetas).
// Módulo compartido server + cliente (sin `server-only`).

import {
  TIPO_EMPLEO_LABEL,
  NIVEL_LABEL,
  PERIODO_SALARIO_LABEL,
  type TipoEmpleo,
  type NivelExperiencia,
  type PeriodoSalario,
} from "@/types/vacante";
import { MODALIDAD_LABEL, type Modalidad } from "@/lib/empleabilidad";

export function labelModalidad(v: string | null): string | null {
  if (!v) return null;
  return MODALIDAD_LABEL[v as Modalidad] ?? v;
}

export function labelTipoEmpleo(v: string | null): string | null {
  if (!v) return null;
  return TIPO_EMPLEO_LABEL[v as TipoEmpleo] ?? v;
}

export function labelNivel(v: string | null): string | null {
  if (!v) return null;
  return NIVEL_LABEL[v as NivelExperiencia] ?? v;
}

export function labelPeriodo(v: string | null): string | null {
  if (!v) return null;
  return PERIODO_SALARIO_LABEL[v as PeriodoSalario] ?? v;
}

// Formatea el rango salarial en texto legible, o null si no se debe mostrar.
export function formatearSalario(v: {
  salarioMin: number | null;
  salarioMax: number | null;
  salarioMoneda: string;
  salarioPeriodo: string | null;
  salarioVisible: boolean;
}): string | null {
  if (!v.salarioVisible) return null;
  if (v.salarioMin == null && v.salarioMax == null) return null;

  const fmt = (n: number) => {
    try {
      return new Intl.NumberFormat("es-CR", {
        style: "currency",
        currency: v.salarioMoneda || "CRC",
        maximumFractionDigits: 0,
      }).format(n);
    } catch {
      return `${v.salarioMoneda} ${n.toLocaleString("es-CR")}`;
    }
  };

  const periodo = labelPeriodo(v.salarioPeriodo);
  let monto: string;
  if (v.salarioMin != null && v.salarioMax != null) {
    monto = `${fmt(v.salarioMin)} - ${fmt(v.salarioMax)}`;
  } else {
    monto = fmt((v.salarioMin ?? v.salarioMax) as number);
    if (v.salarioMin != null) monto = `Desde ${monto}`;
    else monto = `Hasta ${monto}`;
  }

  return periodo ? `${monto} ${periodo}` : monto;
}
