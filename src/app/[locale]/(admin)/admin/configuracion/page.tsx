import { getUser } from "@/server/auth/get-user";
import {
  AdminPageShell,
  AdminPageHeader,
} from "@/components/features/admin/admin-page-header";
import { LogoutButton } from "@/components/features/admin/logout-button";

// URL: /es/admin/configuracion — datos de la cuenta del admin.
export default async function AdminConfiguracionPage() {
  const user = await getUser();

  const campos = [
    { label: "Nombre", valor: user?.nombre ?? "—" },
    { label: "Correo", valor: user?.correo ?? "—" },
    { label: "Rol", valor: user?.roles.nombre ?? "—" },
  ];

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Configuración"
        subtitle="Datos de tu cuenta de administrador."
      />

      <div className="max-w-lg rounded-2xl border border-white/10 bg-white/[0.04] p-6">
        <h2 className="font-display text-lg font-bold text-white">Tu cuenta</h2>
        <dl className="mt-4 flex flex-col divide-y divide-white/[0.07]">
          {campos.map((c) => (
            <div
              key={c.label}
              className="flex items-center justify-between gap-4 py-3"
            >
              <dt className="text-sm text-white/50">{c.label}</dt>
              <dd className="text-sm font-medium capitalize text-white">
                {c.valor}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 border-t border-white/[0.07] pt-5">
          <LogoutButton />
        </div>
      </div>
    </AdminPageShell>
  );
}
