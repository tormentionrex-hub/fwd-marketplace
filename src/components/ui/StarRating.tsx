import { IconStar } from "@/components/ui/icons";

interface StarRatingProps {
  value: number;
  max?: number;
  showValue?: boolean;
  size?: number;
}

export default function StarRating({
  value,
  max = 5,
  showValue = true,
  size = 18,
}: StarRatingProps) {
  const rounded = Math.round(value);

  return (
    <span
      className="inline-flex items-center gap-1"
      aria-label={`Reputación ${value.toFixed(1)} de ${max}`}
    >
      <span className="inline-flex">
        {Array.from({ length: max }).map((_, index) => (
          <IconStar
            key={index}
            width={size}
            height={size}
            className={
              index < rounded ? "text-amber-400" : "text-slate-300 dark:text-white/15"
            }
          />
        ))}
      </span>
      {showValue && (
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {value.toFixed(1)}
        </span>
      )}
    </span>
  );
}
