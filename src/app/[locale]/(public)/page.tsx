import Link from "next/link";

// Página de inicio / landing pública.
// URL: /es  (o /en, según el locale)
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-4xl font-semibold tracking-tight">
        Bienvenido a FWD Marketplace
      </h1>
      <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
        Encuentra y publica oportunidades en un solo lugar.
      </p>
      <div>
        <Link
          href={`/${locale}/marketplace`}
          className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-6 text-background transition-colors hover:opacity-90"
        >
          Explorar marketplace
        </Link>
      </div>
    </section>
  );
}
