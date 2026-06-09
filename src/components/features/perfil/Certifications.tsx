import { IconAward } from "@/components/ui/icons";
import type { Certificacion } from "@/types/perfil";

export default function Certifications({ items }: { items: Certificacion[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((cert) => (
        <div
          key={cert.nombre}
          className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
        >
          <span
            className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white"
            style={{ backgroundColor: cert.color }}
          >
            <IconAward width={22} height={22} />
          </span>
          <div className="min-w-0">
            <h4 className="truncate font-semibold text-text">{cert.nombre}</h4>
            <p className="truncate text-sm text-text-muted">
              {cert.institucion} · {cert.fecha}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
