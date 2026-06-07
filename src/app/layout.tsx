import type { Metadata } from "next";
import { Figtree, Outfit } from "next/font/google";
import "./globals.css";
import WhatsAppButton from "@/components/WhatsAppButton";

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

export const metadata: Metadata = {
  title: "FWD Marketplace · Costa Rica",
  description:
    "Conectamos empresarios con talento tecnológico de FWD Costa Rica. Publicá tu proyecto, recibí prototipos y elegí el mejor.",
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
      <body className="min-h-full flex flex-col font-body">
        {children}
        <WhatsAppButton />
      </body>
    </html>
  );
}
