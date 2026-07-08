import { cn } from "@/lib/utils/cn";

interface AvatarProps {
  name: string;
  src?: string | undefined;
  size?: number;
  className?: string;
  ring?: boolean;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export default function Avatar({ name, src, size = 44, className, ring }: AvatarProps) {
  return (
    <span
      className={cn(
        "inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-fwd-soft font-semibold text-white",
        ring && "ring-4 ring-bg",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        initials(name)
      )}
    </span>
  );
}
