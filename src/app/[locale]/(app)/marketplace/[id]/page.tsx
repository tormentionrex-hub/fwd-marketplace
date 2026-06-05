import Link from "next/link";

// Detalle de un elemento del marketplace (ruta dinámica).
// URL: /es/marketplace/123  ->  params.id === "123"
export default async function MarketplaceItemPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  return (
    <section className="flex flex-col gap-6">
      <Link
        href={`/${locale}/marketplace`}
        className="text-sm text-blue-600 hover:underline"
      >
        ← Volver al marketplace
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight">
        Detalle del producto {id}
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Aquí se mostrará la información del producto con id {id}.
      </p>
    </section>
  );
}
