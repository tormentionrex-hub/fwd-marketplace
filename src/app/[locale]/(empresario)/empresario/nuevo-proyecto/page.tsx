import { redirect } from 'next/navigation';
import { getUser } from '@/server/auth/get-user';
import CrearConIA from '@/components/features/empresario/crear-con-ia';

// "Crear proyecto con IA" (Página 13). Pantalla VISUAL/demo del asistente FWD:
// reproduce el diseño (chat guiado -> propuesta estructurada) pero no crea
// proyectos reales todavía. La lógica real la conecta el equipo de IA.
export default async function NuevoProyectoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const user = await getUser();
  if (!user) redirect(`/${locale}/login`);
  if (user.roles.nombre !== 'empresario') redirect(`/${locale}`);

  return <CrearConIA nombre={user.nombre} />;
}
