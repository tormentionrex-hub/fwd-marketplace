import type { Metadata } from "next";
import { Figtree, Outfit } from "next/font/google";
import "./globals.css";

// Figtree — titulares y destacados (pesos 400 / 600 / 700 / 900)
const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

// Outfit — texto y párrafos (pesos 300 / 400 / 500 / 700)
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "FWD · Costa Rica — Marketplace",
  description: "Avancemos hacia el futuro juntos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${figtree.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
