import type { Metadata } from 'next';
import { Figtree, Outfit } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { RoleBadge } from '@/components/layout/role-badge';
import { AlertaGlobal } from '@/components/layout/alerta-global';
import WhatsAppButton from '@/components/WhatsAppButton';
import SmoothScroll from '@/components/SmoothScroll';
import AnimationsInit from '@/components/AnimationsInit';
import CursorGlow from '@/components/CursorGlow';
import '../globals.css';

// Figtree — titulares y destacados (pesos 400 / 600 / 700 / 900)
const figtree = Figtree({
  variable: '--font-figtree',
  subsets: ['latin'],
  weight: ['400', '600', '700', '900'],
});

// Outfit — texto y párrafos (pesos 300 / 400 / 500 / 700)
const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'FWD · Costa Rica — Marketplace',
  description: 'Avancemos hacia el futuro juntos.',
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

  return (
    <html
      lang={locale}
      className={`${figtree.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <SmoothScroll />
        <AnimationsInit />
        <CursorGlow />
        <NextIntlClientProvider>
          {children}
          <RoleBadge />
          <AlertaGlobal />
        </NextIntlClientProvider>
        <WhatsAppButton />
      </body>
    </html>
  );
}
