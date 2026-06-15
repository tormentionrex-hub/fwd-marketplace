'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';

export type ActividadDataPoint = {
  mes: string;
  proyectos: number;
  ofertas: number;
};

interface ActividadChartProps {
  data: ActividadDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: '#fff',
          borderRadius: 8,
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          padding: '12px 16px',
          border: '1px solid var(--line)',
          fontSize: 13,
          fontFamily: 'var(--font-body)',
          whiteSpace: 'nowrap',
          zIndex: 100
        }}
      >
        <div style={{ color: 'var(--ink-900)', fontWeight: 600, marginBottom: 8 }}>{label}</div>
        {payload.map((p) => (
          <div key={p.dataKey} style={{ color: p.color, marginBottom: 4, fontWeight: 500 }}>
            {p.name} : {p.value}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function ActividadChart({ data }: ActividadChartProps) {
  return (
    <div style={{ width: '100%', height: '100%', fontSize: 11, color: 'var(--ink-400)', fontFamily: 'var(--font-body)' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 15, left: -25, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorOfertas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--magenta)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="var(--magenta)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorProyectos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--azul)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="var(--azul)" stopOpacity={0} />
            </linearGradient>
          </defs>
          
          {/* Ejes */}
          <XAxis 
            dataKey="mes" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'var(--ink-400)', fontSize: 11 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'var(--ink-400)', fontSize: 11 }}
            dx={-10}
            tickCount={4}
          />

          {/* Tooltip con línea de cursor punteada/sólida sutil */}
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ stroke: 'var(--ink-300)', strokeWidth: 1 }} 
          />
          
          {/* Áreas (El orden importa para el Z-Index) */}
          <Area
            type="monotone"
            dataKey="proyectos"
            name="Proyectos"
            stroke="var(--azul)"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorProyectos)"
            activeDot={{ r: 5, strokeWidth: 0, fill: 'var(--azul)' }}
          />
          <Area
            type="monotone"
            dataKey="ofertas"
            name="Ofertas"
            stroke="var(--magenta)"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorOfertas)"
            activeDot={{ r: 5, strokeWidth: 0, fill: 'var(--magenta)' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
