import { getTranslations } from 'next-intl/server';

// TEMPORAL: reemplazar cuando el equipo de (public) haga la landing real.
export default async function Home() {
  const t = await getTranslations('Common');
  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <h1 className="text-2xl font-semibold">{t('appName')}</h1>
    </main>
  );
}
