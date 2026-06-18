import { PRODUCTOS } from "@/lib/marketplace-data";
import MarketplaceItemView from "@/components/features/marketplace/MarketplaceItemView";
import Button from "@/components/ui/Button";

export default async function MarketplaceItemPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const producto = PRODUCTOS.find((p) => p.id === id);

  if (!producto) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-text">Producto no encontrado</h1>
        <p className="mt-2 text-text-muted">El producto que buscas no está disponible.</p>
        <Button href={`/${locale}/marketplace`} className="mt-6">
          Volver al marketplace
        </Button>
      </div>
    );
  }

  return <MarketplaceItemView producto={producto} locale={locale} />;
}
