import SectionHeading from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/motion";
import MarketplaceExplorer from "@/components/features/marketplace/MarketplaceExplorer";
import CategoriesSection from "@/components/features/marketplace/CategoriesSection";
import ProductCard from "@/components/features/cards/ProductCard";
import { PRODUCTOS, PRODUCTOS_DESTACADOS } from "@/lib/marketplace-data";

export default async function MarketplacePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="flex flex-col">
      {/* Hero + buscador + filtros + grid de productos */}
      <MarketplaceExplorer productos={PRODUCTOS} locale={locale} />

      {/* Categorías y destacados en contenedor restringido */}
      <div className="mx-auto w-full max-w-7xl space-y-20 px-6 py-12 sm:px-8">
        {/* Categorías */}
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

        {/* Destacados */}
        <section>
          <Reveal>
            <SectionHeading
              eyebrow="Productos Destacados"
              title="Lo más relevante del marketplace"
              description="Selección curada de lo que está marcando la diferencia."
            />
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCTOS_DESTACADOS.map((producto) => (
              <ProductCard key={producto.id} producto={producto} locale={locale} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
