'use client';

// Selector de estrellas 1-5 reutilizable. Si readOnly, solo muestra (no edita).
// `size` (px) fija el tamaño de las estrellas; `showValue` muestra el valor numérico.
export default function StarRating({
  value,
  onChange,
  readOnly = false,
  className = 'text-2xl',
  size,
  showValue = false,
}: {
  value: number;
  onChange?: (valor: number) => void;
  readOnly?: boolean;
  className?: string;
  size?: number;
  showValue?: boolean;
}) {
  const estrellas = (
    <div
      className={`flex text-[#F9B233] ${className}`}
      style={size ? { fontSize: size } : undefined}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(n)}
          aria-label={`${n} ${n === 1 ? 'estrella' : 'estrellas'}`}
          className={readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'}
        >
          {n <= value ? '★' : '☆'}
        </button>
      ))}
    </div>
  );

  if (!showValue) return estrellas;

  return (
    <span className="inline-flex items-center gap-1.5">
      {estrellas}
      <span className="text-sm font-semibold">{value.toFixed(1)}</span>
    </span>
  );
}
