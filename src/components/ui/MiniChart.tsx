import { cn } from "@/lib/utils/cn";

interface MiniChartProps {
  data: number[];
  color?: string;
  height?: number;
  className?: string;
}

// Gráfico de barras ligero en SVG puro (sin librería de gráficos).
export default function MiniChart({
  data,
  color = "#008fd4",
  height = 64,
  className,
}: MiniChartProps) {
  const max = Math.max(...data, 1);
  const gap = 6;
  const barWidth = 18;
  const width = data.length * (barWidth + gap) - gap;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      className={cn("overflow-visible", className)}
      aria-hidden="true"
    >
      {data.map((value, i) => {
        const barHeight = Math.max((value / max) * height, 3);
        return (
          <rect
            key={i}
            x={i * (barWidth + gap)}
            y={height - barHeight}
            width={barWidth}
            height={barHeight}
            rx={4}
            fill={color}
            opacity={0.25 + (0.75 * value) / max}
          />
        );
      })}
    </svg>
  );
}
