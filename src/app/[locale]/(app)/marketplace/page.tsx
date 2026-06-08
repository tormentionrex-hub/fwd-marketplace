import Link from "next/link";

// Listado del marketplace.
// URL: /es/marketplace
export default async function MarketplacePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Datos de ejemplo. Aquí más adelante consultarás Supabase.
  const items = [
    { id: "1", title: "Producto de ejemplo 1" },
    { id: "2", title: "Producto de ejemplo 2" },
    { id: "3", title: "Producto de ejemplo 3" },
  ];

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold tracking-tight">Marketplace</h1>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-lg border border-black/[.08] p-5 dark:border-white/[.145]"
          >
            <h2 className="font-medium">{item.title}</h2>
            <Link
              href={`/${locale}/marketplace/${item.id}`}
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Ver detalle →
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
