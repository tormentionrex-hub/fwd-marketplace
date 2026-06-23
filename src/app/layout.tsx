import type { Metadata } from "next";
import { Figtree, Outfit, Inter, Space_Grotesk, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./globals.css";
import AnalyticsTracker from "./AnalyticsTracker";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FWD Marketplace · Costa Rica",
  description: "Conectamos empresarios con talento tecnológico de FWD Costa Rica.",
  openGraph: {
    title: "FWD Marketplace – Inteligencia Digital",
    description: "Dashboard de audiencias y tendencias de marketing en Costa Rica.",
    url: "https://fwd-marketplace.vercel.app",
    siteName: "FWD Marketplace",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "FWD Marketplace" }],
    locale: "es_CR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      className={`${figtree.variable} ${outfit.variable} ${inter.variable} ${spaceGrotesk.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="flex flex-col font-body min-h-screen" suppressHydrationWarning>
        <AnalyticsTracker />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
