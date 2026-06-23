import { Link } from "@/i18n/navigation";
import { Bell, LogOut } from "lucide-react";
import { LogoutButton } from "@/components/layout/logout-button";
import Avatar from "@/components/ui/Avatar";

// Barra superior del dashboard admin: título, campana con pendientes, perfil del
// administrador y botón de salir. Componente de servidor; el botón de salir es
// el LogoutButton (cliente) ya existente.
export function DashboardTopbar({
  nombre,
  rolLabel,
  imageUrl,
  pendientes,
}: {
  nombre: string;
  rolLabel: string;
  imageUrl: string | null;
  pendientes: number;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-fwd-turquoise">
          <span className="text-fwd-blue">&#9654;&#9654;</span> FWD · Costa Rica
        </p>
        <h1
          className="font-display text-2xl font-black tracking-tight sm:text-3xl"
          style={{ color: "var(--adm-ink)" }}
        >
          Resumen del panel
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Campana de pendientes */}
        <Link
          href="/admin/validaciones"
          aria-label={`${pendientes} pendientes de revisión`}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70 transition hover:text-white"
        >
          <Bell className="h-[18px] w-[18px]" />
          {pendientes > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-fwd-magenta px-1 text-[11px] font-bold text-white">
              {pendientes > 99 ? "99+" : pendientes}
            </span>
          )}
        </Link>

        {/* Perfil del administrador */}
        <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] py-1.5 pl-1.5 pr-3">
          <Avatar name={nombre} src={imageUrl ?? undefined} size={36} className="!rounded-lg" />
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-semibold text-white">{nombre}</p>
            <p className="flex items-center gap-1 text-xs text-white/45">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {rolLabel}
            </p>
          </div>
        </div>

        {/* Salir */}
        <LogoutButton
          className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs font-semibold text-red-500 transition hover:border-red-500/40 hover:bg-red-500/20 disabled:opacity-60"
          label="Salir"
        >
          <LogOut className="h-4 w-4" />
          Salir
        </LogoutButton>
      </div>
    </header>
  );
}
