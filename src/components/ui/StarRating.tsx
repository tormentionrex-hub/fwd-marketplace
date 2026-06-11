'use client';

// Selector de estrellas 1-5 reutilizable. Si readOnly, solo muestra (no edita).
// - `size` (px) fija el tamaño de las estrellas vía fontSize; si no se pasa, se
//   usa el tamaño tipográfico de `className` (por defecto text-2xl).
// - `showValue` añade el número (x.x) junto a las estrellas.
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
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`flex text-[#F9B233] ${className}`}
        style={size ? { fontSize: `${size}px` } : undefined}
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
      {showValue && (
        <span className="text-sm font-semibold text-text-muted">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}
