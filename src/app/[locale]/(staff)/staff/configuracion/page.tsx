import { getUser } from "@/server/auth/get-user";
import { buscarPerfilAdminPorId } from "@/server/repositories/usuario.repository";
import {
  AdminPageShell,
  AdminPageHeader,
} from "@/components/features/admin/admin-page-header";
import { EditarPerfilPanel } from "@/components/features/admin/editar-perfil-panel";
import { LogoutButton } from "@/components/features/admin/logout-button";

export const dynamic = "force-dynamic";

export default async function StaffConfiguracionPage() {
  const user = await getUser();
  const perfil = user ? await buscarPerfilAdminPorId(user.id) : null;

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Configuracion"
        subtitle="Datos de tu cuenta de staff."
      />

      <div className="flex flex-col gap-8">
        <EditarPerfilPanel
          nombre={perfil?.nombre ?? ""}
          segundoApellido={perfil?.segundo_apellido ?? null}
          correo={perfil?.correo ?? ""}
          imageUrl={perfil?.image_url ?? null}
          rol={user?.roles.nombre ?? "staff"}
        />

        <div className="max-w-sm">
          <LogoutButton />
        </div>
      </div>
    </AdminPageShell>
  );
}
