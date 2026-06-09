import { cn } from "@/lib/utils/cn";

const TECH_COLORS: Record<string, string> = {
  React: "#20bec6",
  "React Native": "#20bec6",
  "Next.js": "#008fd4",
  TypeScript: "#3178c6",
  JavaScript: "#f7901e",
  "Node.js": "#3c873a",
  Express: "#662d91",
  GraphQL: "#ec008c",
  PostgreSQL: "#008fd4",
  MySQL: "#f7901e",
  Supabase: "#20bec6",
  Prisma: "#662d91",
  AWS: "#f7901e",
  Vercel: "#0f172a",
  Docker: "#008fd4",
  Tailwind: "#20bec6",
  "Tailwind CSS": "#20bec6",
  Stripe: "#662d91",
};

interface TechBadgeProps {
  tech: string;
  className?: string;
}

export default function TechBadge({ tech, className }: TechBadgeProps) {
  const color = TECH_COLORS[tech] ?? "#008fd4";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-2 px-2 py-0.5 text-xs font-medium text-text",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {tech}
    </span>
  );
}
