'use client';

// Selector de estrellas 1-5 reutilizable. Si readOnly, solo muestra (no edita).
export default function StarRating({
  value,
  onChange,
  readOnly = false,
  className = 'text-2xl',
}: {
  value: number;
  onChange?: (valor: number) => void;
  readOnly?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex text-[#F9B233] ${className}`}>
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
}
