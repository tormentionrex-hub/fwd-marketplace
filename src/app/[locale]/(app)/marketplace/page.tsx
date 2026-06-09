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
    <div className="mx-auto w-full max-w-7xl space-y-20 px-6 py-12 sm:px-8">
      {/* Encabezado */}
      <Reveal className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-fwd-azul/10 px-4 py-1.5 text-sm font-medium text-fwd-azul">
          <span className="h-2 w-2 animate-pulse rounded-full bg-fwd-azul" />
          Marketplace FWD
        </span>
        <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-text sm:text-5xl">
          Explora el <span className="text-gradient-fwd">Marketplace</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
          Descubre herramientas, servicios y oportunidades para impulsar tu crecimiento y avanzar
          hacia el futuro.
        </p>
      </Reveal>

      {/* Explorador */}
      <MarketplaceExplorer productos={PRODUCTOS} locale={locale} />

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
  );
}
