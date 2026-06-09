import type { Metadata } from 'next';
import { Figtree, Outfit, Inter, Space_Grotesk, Geist_Mono } from 'next/font/google';
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
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import ThemeToggle from '@/components/theme/ThemeToggle';
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

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${figtree.variable} ${outfit.variable} ${inter.variable} ${spaceGrotesk.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-bg text-text">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <SmoothScroll />
          <AnimationsInit />
          <CursorGlow />
          <NextIntlClientProvider>
            {children}
            <RoleBadge />
            <AlertaGlobal />
          </NextIntlClientProvider>
          <WhatsAppButton />
          <ThemeToggle variant="floating" />
        </ThemeProvider>
      </body>
    </html>
  );
}
