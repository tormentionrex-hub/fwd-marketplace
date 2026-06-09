import type { Metadata } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale, getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { RoleBadge } from '@/components/layout/role-badge';
import { AlertaGlobal } from '@/components/layout/alerta-global';
import WhatsAppButton from '@/components/WhatsAppButton';
import SmoothScroll from '@/components/SmoothScroll';
import AnimationsInit from '@/components/AnimationsInit';
import CursorGlow from '@/components/CursorGlow';
import WelcomeOnboarding from '@/components/WelcomeOnboarding';
import PageLoader from '@/components/PageLoader';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

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

  return (
    <>
      <PageLoader />
      <SmoothScroll />
      <AnimationsInit />
      <CursorGlow />
      <WelcomeOnboarding />
      <NextIntlClientProvider messages={messages}>
        {children}
        <RoleBadge />
        <AlertaGlobal />
      </NextIntlClientProvider>
      <WhatsAppButton />
    </>
  );
}
