import { redirect } from 'next/navigation';
import { getUser } from '@/server/auth/get-user';
import MisNoticias from '@/components/features/noticias/MisNoticias';

// URL: /es/empresario/noticias — gestión de las noticias propias de la empresa.
export default async function NoticiasEmpresarioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getUser();
  if (!user) redirect(`/${locale}/login`);
  if (user.roles.nombre !== 'empresario') redirect(`/${locale}`);

  return (
    <>
      <div className="topbar">
        <div>
          <div className="tb-title">Noticias</div>
          <div className="tb-sub">Tus publicaciones en el foro</div>
        </div>
        <div className="tb-spacer" />
      </div>

      <div className="page fade-in">
        <MisNoticias />
      </div>
    </>
  );
}
