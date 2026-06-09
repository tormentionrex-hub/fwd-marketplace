import type { Logro } from "@/types/perfil";

export default function Achievements({ items }: { items: Logro[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {items.map((logro) => (
        <div
          key={logro.titulo}
          className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
          <span
            className="grid h-14 w-14 place-items-center rounded-2xl text-3xl ring-1"
            style={{ backgroundColor: `${logro.color}1a`, color: logro.color }}
          >
            <span aria-hidden>{logro.emoji}</span>
          </span>
          <span className="text-sm font-semibold text-text">{logro.titulo}</span>
        </div>
      ))}
    </div>
  );
}
