import { getUser } from '@/server/auth/get-user';
import { db } from '@/lib/db';
import {
  AdminPageShell,
  AdminPageHeader,
} from '@/components/features/admin/admin-page-header';
import { InvitacionesPanel } from '@/components/features/admin/invitaciones-panel';
import { redirect } from 'next/navigation';

export default async function AdminInvitacionesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getUser();

  if (!user || (user.roles.nombre !== 'admin' && user.roles.nombre !== 'staff')) {
    redirect(`/${locale}/login`);
  }

  // Only General Staff (Super Admins) can manage invitations and staff members
  if (user.tipo_staff === 'moderador') {
    redirect(`/${locale}/admin`);
  }

  const [staffMembersRaw, pendingInvitationsRaw] = await Promise.all([
    db.usuarios.findMany({
      where: {
        roles: {
          nombre: 'staff',
        },
      },
      select: {
        id: true,
        nombre: true,
        correo: true,
        tipo_staff: true,
        creado: true,
        estado: true,
      },
      orderBy: { creado: 'desc' },
    }),
    db.invitaciones_staff.findMany({
      where: { pending: true },
      orderBy: { solicitado: 'desc' },
    }),
  ]);

  // Convert dates to strings to prevent serialization errors
  const staffMembers = staffMembersRaw.map((s) => ({
    ...s,
    creado: s.creado.toISOString(),
  }));

  const pendingInvitations = pendingInvitationsRaw.map((inv) => ({
    id: inv.id,
    email: inv.email,
    tipo_staff: inv.tipo_staff,
    pending: inv.pending,
    solicitado: inv.solicitado.toISOString(),
  }));

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Equipo de Staff"
        subtitle="Administrá los miembros del staff y despachá invitaciones con roles definidos."
      />
      <InvitacionesPanel
        initialStaff={staffMembers}
        initialInvitations={pendingInvitations}
      />
    </AdminPageShell>
  );
}
