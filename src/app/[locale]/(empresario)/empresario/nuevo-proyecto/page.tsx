import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getUser } from '@/server/auth/get-user';
import { IconSpark } from '@/components/ui/fwd-icons';

// Placeholder de "Crear proyecto con IA" (Página 13). La construye el equipo de IA;
// existe para que los enlaces de "Publicar nuevo proyecto" / "Crear con IA" no den 404.
export default async function NuevoProyectoPage({
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
          <div className="tb-title">Crear proyecto con IA</div>
          <div className="tb-sub">Próximamente</div>
        </div>
      </div>

      <div className="page fade-in">
        <div className="card card-pad" style={{ textAlign: 'center', padding: 48, maxWidth: 620, margin: '0 auto' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              margin: '0 auto 18px',
              display: 'grid',
              placeItems: 'center',
              background: 'color-mix(in srgb, var(--morado) 12%, transparent)',
              color: 'var(--morado)',
            }}
          >
            <IconSpark size={30} />
          </div>
          <h3 style={{ fontSize: 19, fontWeight: 700, marginBottom: 8 }}>
            Asistente de IA — en construcción
          </h3>
          <p className="muted" style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 22 }}>
            Esta pantalla (describir tu idea en lenguaje natural y publicarla como proyecto
            estructurado) está a cargo del equipo de IA. Pronto vas a poder crearlo desde acá.
          </p>
          <Link href="/empresario" className="btn btn-ghost">
            Volver al dashboard
          </Link>
        </div>
      </div>
    </>
  );
}
