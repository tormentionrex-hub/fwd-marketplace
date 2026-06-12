import { redirect } from 'next/navigation';
import { getUser } from '@/server/auth/get-user';
import { obtenerPerfilEmpresarioDTO } from '@/server/services/perfil-empresario.service';
import ConfiguracionEmpresario from '@/components/features/empresario/configuracion';

// "Configuración" del empresario (pantalla del prototipo FWD). RSC: valida sesión
// y rol, trae los datos reales de identidad (nombre, empresa, correo, sello de
// verificación) y monta el panel de preferencias (cliente).
export default async function ConfiguracionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const user = await getUser();
  if (!user) redirect(`/${locale}/login`);
  if (user.roles.nombre !== 'empresario') redirect(`/${locale}`);

  const perfil = await obtenerPerfilEmpresarioDTO(user.id);

  return (
    <ConfiguracionEmpresario
      nombre={user.nombre}
      empresa={perfil?.empresa ?? user.nombre}
      correo={user.correo}
      verificado={user.estado === 'activo'}
    />
  );
}
