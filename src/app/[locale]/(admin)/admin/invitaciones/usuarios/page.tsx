import {
  AdminPageShell,
  AdminPageHeader,
} from "@/components/features/admin/admin-page-header";
import { InvitarPanel } from "@/components/features/admin/invitar-panel";
import { listarInvitacionesPendientes } from "@/server/repositories/pending-verification.repository";
import { tiempoRelativo } from "@/lib/tiempo";

const ROLES_USUARIO = ["estudiante", "empresario"];
const ETIQUETA: Record<string, string> = {
  estudiante: "Estudiante",
  empresario: "Empresario",
};

// URL: /es/admin/invitaciones/usuarios — invitar usuarios normales
// (estudiantes / empresarios) por correo. El invitado completa su registro en
// /unirse con el enlace de token firmado.
export default async function InvitarUsuariosPage() {
  const pendientes = await listarInvitacionesPendientes();
  const invitaciones = pendientes
    // estudiante/empresario, o invitaciones sin rol (estudiante por defecto).
    .filter((v) => !v.rol || ROLES_USUARIO.includes(v.rol))
    .map((v) => ({
      id: v.id,
      email: v.email,
      rol: v.rol,
      relativo: tiempoRelativo(v.solicitado),
    }));

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Invitaciones de usuarios"
        subtitle="Invitá estudiantes o empresarios por correo. Reciben un enlace para completar su registro."
      />
      <InvitarPanel
        roles={[
          { value: "estudiante", label: "Estudiante" },
          { value: "empresario", label: "Empresario" },
        ]}
        rolDefault="estudiante"
        etiquetaRol={ETIQUETA}
        invitaciones={invitaciones}
      />
    </AdminPageShell>
  );
}
