import type { Metadata } from 'next';
import { Inter, Space_Grotesk, Geist_Mono } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale, getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { AdminDashboardButton } from '@/components/layout/admin-dashboard-button';
import { AlertaGlobal } from '@/components/layout/alerta-global';
import SmoothScroll from '@/components/SmoothScroll';
import AnimationsInit from '@/components/AnimationsInit';
import CursorGlow from '@/components/CursorGlow';
import PageLoader from '@/components/PageLoader';
import { getUser } from '@/server/auth/get-user';
import { TabSessionGuard } from '@/components/layout/TabSessionGuard';
import SettingsPanel from '@/components/SettingsPanel';

export const metadata: Metadata = {
  title: 'FWD · Costa Rica — Marketplace',
  description: 'Conectamos talento, innovación, emprendimiento y tecnología para construir el futuro de Costa Rica.',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();
  const user = await getUser();

  return (
    <>
      <PageLoader />
      <SmoothScroll />
      <AnimationsInit />
      <CursorGlow />
      <NextIntlClientProvider messages={messages}>
        <TabSessionGuard hasSession={!!user} />
        {children}
        <AdminDashboardButton userRole={user?.roles.nombre} locale={locale} />
        <AlertaGlobal />
        <SettingsPanel />
      </NextIntlClientProvider>
    </>
  );
}

