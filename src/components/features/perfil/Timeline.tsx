import {
  IconAward,
  IconBriefcase,
  IconShieldCheck,
  IconStar,
} from "@/components/ui/icons";
import type { ItemTimeline, TipoTimeline } from "@/types/perfil";

const TIPO_CONFIG: Record<
  TipoTimeline,
  { Icon: typeof IconAward; color: string }
> = {
  proyecto: { Icon: IconBriefcase, color: "#008fd4" },
  certificacion: { Icon: IconAward, color: "#f7901e" },
  logro: { Icon: IconStar, color: "#ffcb05" },
  verificacion: { Icon: IconShieldCheck, color: "#20bec6" },
};

export default function Timeline({ items }: { items: ItemTimeline[] }) {
  return (
    <ol className="flex flex-col">
      {items.map((item, i) => {
        const { Icon, color } = TIPO_CONFIG[item.tipo];
        const last = i === items.length - 1;
        return (
          <li key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white"
                style={{ backgroundColor: color }}
              >
                <Icon width={18} height={18} />
              </span>
              {!last && <span className="w-px flex-1 bg-border" />}
            </div>
            <div className={last ? "" : "pb-6"}>
              <time className="text-xs font-medium uppercase tracking-wide text-text-muted">
                {item.fecha}
              </time>
              <h4 className="mt-0.5 font-display font-bold text-text">{item.titulo}</h4>
              <p className="mt-1 text-sm text-text-muted">{item.descripcion}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
