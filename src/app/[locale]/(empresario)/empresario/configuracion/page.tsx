import { redirect } from 'next/navigation';
import { getUser } from '@/server/auth/get-user';
import { obtenerPerfilEmpresarioDTO } from '@/server/services/perfil-empresario.service';
import { obtenerPreferencias, obtenerDatosCompletitud } from '@/server/repositories/perfil-empresario.repository';
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

  const [perfil, preferencias, completitud] = await Promise.all([
    obtenerPerfilEmpresarioDTO(user.id),
    obtenerPreferencias(user.id),
    obtenerDatosCompletitud(user.id),
  ]);

  return (
    <ConfiguracionEmpresario
      nombre={user.nombre}
      empresa={perfil?.nombreEmpresaRaw ?? ''}
      correo={user.correo}
      verificado={user.estado === 'activo'}
      preferenciasIniciales={preferencias}
      cedulaJuridica={completitud?.numero_identificacion ?? ''}
    />
  );
}
