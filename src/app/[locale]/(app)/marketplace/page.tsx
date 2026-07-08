import MarketplaceExplorer from "@/components/features/marketplace/MarketplaceExplorer";
import Footer from "@/components/Footer";
import MarketplaceDetailNav from "@/components/features/marketplace/MarketplaceDetailNav";
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
      <MarketplaceDetailNav locale={locale} activo="marketplace" fondo="oscuro" />
      <MarketplaceExplorer proyectos={proyectos} locale={locale} />
      <Footer />
    </div>
  );
}
