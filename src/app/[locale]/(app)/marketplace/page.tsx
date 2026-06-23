import SectionHeading from "@/components/ui/SectionHeading";
import MarketplaceExplorer from "@/components/features/marketplace/MarketplaceExplorer";
import { Reveal } from "@/components/ui/motion";

import CategoriesSection from "@/components/features/marketplace/CategoriesSection";
import ProductCard from "@/components/features/cards/ProductCard";
import Footer from "@/components/Footer";
import HomeButton from "@/components/HomeButton";
import SettingsPanel from "@/components/SettingsPanel";
import { listarProyectosParaMarketplace } from "@/server/services/proyecto.service";

// Cachea la página 60 s y revalida en background — evita el round-trip a Supabase en cada visita.
export const revalidate = 60;

export default async function MarketplacePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const proyectos = await listarProyectosParaMarketplace();

  return (
    <div className="flex flex-col">
      <HomeButton />
      <div className="fixed right-40 top-5 z-50">
        <SettingsPanel />
      </div>
      <MarketplaceExplorer proyectos={proyectos} locale={locale} />
      <Footer />
    </div>
  );
}
