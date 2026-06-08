import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FWD Marketplace · Costa Rica",
  description:
    "Conectamos empresarios con talento tecnológico de FWD Costa Rica.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
