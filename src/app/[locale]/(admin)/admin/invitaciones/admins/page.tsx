import {
  AdminPageShell,
  AdminPageHeader,
} from "@/components/features/admin/admin-page-header";
import { InvitarPanel } from "@/components/features/admin/invitar-panel";
import { listarInvitacionesPendientes } from "@/server/repositories/pending-verification.repository";
import { tiempoRelativo } from "@/lib/tiempo";

const ROLES_STAFF = ["admin", "editor", "moderator"];
const ETIQUETA: Record<string, string> = {
  admin: "Administrador",
  editor: "Editor",
  moderator: "Moderador",
};

// URL: /es/admin/invitaciones/admins — invitar staff (admin/editor/moderator).
// El owner NO se invita (rol exclusivo). El invitado recibe un enlace con token
// firmado y completa su registro en /unirse.
export default async function InvitarAdminsPage() {
  const pendientes = await listarInvitacionesPendientes();
  const invitaciones = pendientes
    .filter((v) => v.rol && ROLES_STAFF.includes(v.rol))
    .map((v) => ({
      id: v.id,
      email: v.email,
      rol: v.rol,
      relativo: tiempoRelativo(v.solicitado),
    }));

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Invitar admins"
        subtitle="Invitá miembros del staff por correo. Solo owner y admin acceden al panel; editor y moderador se crean para uso futuro."
      />
      <InvitarPanel
        roles={[
          { value: "admin", label: "Administrador" },
          { value: "editor", label: "Editor" },
          { value: "moderator", label: "Moderador" },
        ]}
        rolDefault="admin"
        etiquetaRol={ETIQUETA}
        invitaciones={invitaciones}
      />
    </AdminPageShell>
  );
}
