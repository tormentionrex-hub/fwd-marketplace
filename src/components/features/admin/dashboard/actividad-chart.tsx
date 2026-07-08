"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { SerieActividadPunto } from "@/server/services/dashboard-admin.service";

// Colores de marca para cada serie (iguales en claro/oscuro).
const SERIES = [
  { key: "proyectos", nombre: "Proyectos", color: "#008FD4" },
  { key: "ofertas", nombre: "Ofertas", color: "#EC008C" },
  { key: "usuarios", nombre: "Usuarios", color: "#20BEC6" },
] as const;

interface TooltipEntry {
  dataKey?: string | number;
  color?: string;
  name?: string;
  value?: number;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      style={{
        background: "var(--adm-modal)",
        border: "1px solid var(--adm-modal-bd)",
        borderRadius: 12,
        boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
        padding: "10px 14px",
        fontSize: 13,
      }}
    >
      <div style={{ color: "var(--adm-ink)", fontWeight: 700, marginBottom: 6 }}>
        {label}
      </div>
      {payload.map((p) => (
        <div
          key={p.dataKey}
          style={{ color: p.color, marginBottom: 2, fontWeight: 600 }}
        >
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
}

export function ActividadChart({ data }: { data: SerieActividadPunto[] }) {
  // El gráfico se renderiza solo en cliente: ResponsiveContainer necesita medir
  // el contenedor (no existe en SSR), lo que evita la advertencia width/height.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="w-full">
      {/* Leyenda */}
      <div className="mb-3 flex flex-wrap items-center gap-4">
        {SERIES.map((s) => (
          <span
            key={s.key}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-white/55"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: s.color }}
              aria-hidden
            />
            {s.nombre}
          </span>
        ))}
      </div>

      <div style={{ width: "100%", height: 240 }}>
        {!mounted ? null : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              {SERIES.map((s) => (
                <linearGradient
                  key={s.key}
                  id={`grad-${s.key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={s.color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--adm-line)"
              vertical={false}
            />
            <XAxis
              dataKey="mes"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--adm-ink-faint)", fontSize: 12 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--adm-ink-faint)", fontSize: 12 }}
              allowDecimals={false}
              width={36}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "var(--adm-line)", strokeWidth: 1 }}
            />

            {SERIES.map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.nombre}
                stroke={s.color}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={`url(#grad-${s.key})`}
                activeDot={{ r: 4, strokeWidth: 0, fill: s.color }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
