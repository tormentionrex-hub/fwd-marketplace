import Badge from "@/components/ui/Badge";
import { IconBriefcase, IconShieldCheck } from "@/components/ui/icons";
import type { EmpresaCard as EmpresaCardType } from "@/types/marketplace";

interface CompanyCardProps {
  empresa: EmpresaCardType;
}

export default function CompanyCard({ empresa }: CompanyCardProps) {
  return (
    <div className="group flex h-full flex-col items-center rounded-2xl border border-border bg-surface p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-300/30 dark:hover:shadow-black/40">
      <span
        className="grid h-14 w-14 place-items-center rounded-2xl font-display text-xl font-bold text-white"
        style={{ backgroundColor: empresa.color }}
      >
        {empresa.nombre.charAt(0)}
      </span>
      <h3 className="mt-4 flex items-center gap-1.5 font-display text-base font-bold text-text">
        {empresa.nombre}
        {empresa.verificada && (
          <IconShieldCheck width={16} height={16} className="text-fwd-azul" />
        )}
      </h3>
      <p className="mt-0.5 text-sm text-text-muted">{empresa.sector}</p>
      <Badge variant="neutral" className="mt-4">
        <IconBriefcase width={13} height={13} />
        {empresa.proyectos} proyectos
      </Badge>
    </div>
  );
}
