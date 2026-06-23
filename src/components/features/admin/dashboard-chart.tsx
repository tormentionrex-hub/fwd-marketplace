'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts';

interface TooltipEntry {
  dataKey?: string | number;
  color?: string;
  name?: string;
  value?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}

export type DashboardChartDataPoint = {
  mes: string;
  estudiantes: number;
  empresarios: number;
  proyectos: number;
};

interface DashboardChartProps {
  data: DashboardChartDataPoint[];
  height?: number;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-xl border border-white/10 p-3 shadow-xl backdrop-blur-md"
        style={{
          background: 'rgba(15, 23, 42, 0.9)',
          fontSize: 13,
          fontFamily: 'var(--font-body)',
          whiteSpace: 'nowrap',
          zIndex: 100,
        }}
      >
        <div className="mb-2 font-semibold text-white/90">{label}</div>
        {payload.map((p) => (
          <div key={p.dataKey} className="flex items-center gap-2 text-xs font-medium" style={{ color: p.color }}>
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span>{p.name}:</span>
            <span className="font-bold tabular-nums">{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function DashboardChart({ data, height = 300 }: DashboardChartProps) {
  return (
    <div style={{ width: '100%', fontSize: 11, fontFamily: 'var(--font-body)' }}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorEstudiantes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#008fd4" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#008fd4" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorEmpresarios" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#662d91" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#662d91" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorProyectos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ec008c" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#ec008c" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
          
          <XAxis 
            dataKey="mes" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 11 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 11 }}
            dx={-10}
          />

          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ stroke: 'rgba(255, 255, 255, 0.1)', strokeWidth: 1 }} 
          />
          
          <Legend 
            verticalAlign="top" 
            height={36} 
            iconType="circle" 
            iconSize={8}
            wrapperStyle={{ fontSize: 12, opacity: 0.8 }}
          />

          <Area
            type="monotone"
            dataKey="estudiantes"
            name="Estudiantes"
            stroke="#008fd4"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorEstudiantes)"
            activeDot={{ r: 5, strokeWidth: 0, fill: '#008fd4' }}
          />
          <Area
            type="monotone"
            dataKey="empresarios"
            name="Empresarios"
            stroke="#662d91"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorEmpresarios)"
            activeDot={{ r: 5, strokeWidth: 0, fill: '#662d91' }}
          />
          <Area
            type="monotone"
            dataKey="proyectos"
            name="Proyectos"
            stroke="#ec008c"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorProyectos)"
            activeDot={{ r: 5, strokeWidth: 0, fill: '#ec008c' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
