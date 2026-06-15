import { redirect } from 'next/navigation';
import { getUser } from '@/server/auth/get-user';
import { obtenerPerfilEmpresarioDTO } from '@/server/services/perfil-empresario.service';
import { obtenerPreferencias } from '@/server/repositories/perfil-empresario.repository';
import ConfiguracionEmpresario from '@/components/features/empresario/configuracion';

export default async function ConfiguracionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const user = await getUser();
  if (!user) redirect(`/${locale}/login`);
  if (user.roles.nombre !== 'empresario') redirect(`/${locale}`);

  const [perfil, preferencias] = await Promise.all([
    obtenerPerfilEmpresarioDTO(user.id),
    obtenerPreferencias(user.id),
  ]);

  return (
    <ConfiguracionEmpresario
      nombre={user.nombre}
      empresa={perfil?.empresa ?? user.nombre}
      correo={user.correo}
      verificado={user.estado === 'activo'}
      preferenciasIniciales={preferencias}
    />
  );
}
