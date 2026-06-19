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
        {/* Fondo blanco base */}
        <div className="absolute inset-0 bg-white" />

        {/* Difuminados de color FWD */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: [
              "radial-gradient(ellipse 60% 50% at 0% 0%, rgba(32,190,198,0.13) 0%, transparent 60%)",
              "radial-gradient(ellipse 50% 55% at 100% 0%, rgba(102,45,145,0.10) 0%, transparent 60%)",
              "radial-gradient(ellipse 45% 40% at 50% 100%, rgba(237,0,140,0.09) 0%, transparent 55%)",
              "radial-gradient(ellipse 35% 30% at 100% 100%, rgba(0,143,213,0.08) 0%, transparent 50%)",
            ].join(", "),
          }}
        />

        {/* Partículas encima de los difuminados */}
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
