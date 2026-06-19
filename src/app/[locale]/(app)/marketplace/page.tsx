import SectionHeading from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/motion";
import MarketplaceExplorer from "@/components/features/marketplace/MarketplaceExplorer";
import CategoriesSection from "@/components/features/marketplace/CategoriesSection";
import ProductCard from "@/components/features/cards/ProductCard";
import Footer from "@/components/Footer";
import HomeButton from "@/components/HomeButton";
import ParticleBackground from "@/components/ParticleBackground";
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

      {/* Hero + buscador + filtros + grid */}
      <MarketplaceExplorer proyectos={proyectos} locale={locale} />

      {/* Categorías y destacados */}
      <div className="relative overflow-hidden">
        <ParticleBackground />
        <div className="relative z-10 mx-auto w-full max-w-7xl space-y-20 px-6 py-12 sm:px-8">
        <section>
          <Reveal>
            <SectionHeading
              eyebrow="Categorías Populares"
              title="Explora por área de interés"
              description="Cada categoría reúne productos y servicios para impulsarte hacia adelante."
            />
          </Reveal>
          <div className="mt-8">
            <CategoriesSection />
          </div>
        </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
