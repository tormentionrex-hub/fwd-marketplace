import { Suspense } from "react";
import Footer from "@/components/Footer";
import MarketplaceDetailNav from "@/components/features/marketplace/MarketplaceDetailNav";
import NoticiasHero from "@/components/features/noticias/NoticiasHero";
import ForoNoticias from "@/components/features/noticias/ForoNoticias";

export const dynamic = "force-dynamic";

export default async function NoticiasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <div className="flex min-h-screen flex-col bg-[#F7F9FC] dark:bg-[#0b1437]">
      <MarketplaceDetailNav locale={locale} activo="noticias" />
      <NoticiasHero />
      <main className="flex-1">
        <Suspense fallback={null}>
          <ForoNoticias />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
