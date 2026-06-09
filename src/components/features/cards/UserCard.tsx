import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import StarRating from "@/components/ui/StarRating";
import { IconShieldCheck } from "@/components/ui/icons";
import type { UsuarioCard as UsuarioCardType } from "@/types/marketplace";

interface UserCardProps {
  usuario: UsuarioCardType;
  locale: string;
}

export default function UserCard({ usuario, locale }: UserCardProps) {
  return (
    <Link
      href={`/${locale}/perfil/${usuario.username}`}
      className="group flex h-full flex-col items-center rounded-2xl border border-border bg-surface p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-300/30 dark:hover:shadow-black/40"
    >
      <Avatar name={usuario.nombre} src={usuario.fotoUrl} size={64} ring />
      <h3 className="mt-3 flex items-center gap-1.5 font-display text-base font-bold text-text">
        {usuario.nombre}
        {usuario.verificadoFwd && (
          <IconShieldCheck width={16} height={16} className="text-fwd-azul" />
        )}
      </h3>
      <p className="text-sm text-text-muted">{usuario.rol}</p>
      <div className="mt-2">
        <StarRating value={usuario.reputacion} size={15} />
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-1.5">
        {usuario.habilidades.slice(0, 3).map((h) => (
          <span
            key={h}
            className="rounded-md bg-surface-2 px-2 py-0.5 text-xs font-medium text-text-muted"
          >
            {h}
          </span>
        ))}
      </div>
    </Link>
  );
}
