import { getLocale } from "next-intl/server";
import Button from "@/components/ui/Button";
import AuroraArrows from "@/components/features/landing/AuroraArrows";
import { IconArrowLeft, IconArrowRight } from "@/components/ui/icons";

export default async function NotFound() {
  const locale = await getLocale();

  return (
    <section className="relative isolate flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-6 text-center">
      <AuroraArrows />

      <div className="flex flex-col items-center">
        <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium text-fwd-morado dark:text-fwd-turquesa">
          <span className="h-2 w-2 animate-pulse rounded-full bg-fwd-magenta" />
          Error 404
        </span>

        <h1 className="mt-6 font-display text-7xl font-extrabold tracking-tight sm:text-8xl">
          <span className="text-gradient-fwd">404</span>
        </h1>

        <h2 className="mt-2 font-display text-2xl font-bold text-text sm:text-3xl">
          Esta página no existe
        </h2>
        <p className="mt-3 max-w-md text-text-muted">
          La página que buscas se movió o nunca existió. Sigamos avanzando hacia el futuro desde un
          lugar conocido.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button href={`/${locale}`} size="lg">
            <IconArrowLeft width={18} height={18} />
            Ir al inicio
          </Button>
          <Button href={`/${locale}/marketplace`} size="lg" variant="outline">
            Explorar Marketplace
            <IconArrowRight width={18} height={18} />
          </Button>
        </div>
      </div>
    </section>
  );
}
